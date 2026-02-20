// ========================================
// FILE: app/api/customer/dashboard/route.js
// ========================================

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    // 1. Auth
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (decoded.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = decoded.userId;

    // 2. Fetch user + customer profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        customerProfile: {
          select: {
            location: true,
            preferredLanguages: true,
            favoriteProviders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Fetch upcoming bookings (PENDING or CONFIRMED, date in the future)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        customerId: userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        time: true,
        durationMinutes: true,
        price: true,
        status: true,
        notes: true,
        service: {
          select: { name: true }
        },
        provider: {
          select: {
            id: true,
            location: true,
            user: {
              select: { name: true, avatar: true }
            },
            averageRating: true,
          },
        },
      },
    });

    // 4. Fetch past bookings (COMPLETED or CANCELLED)
    const pastBookings = await prisma.booking.findMany({
      where: {
        customerId: userId,
        status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      },
      orderBy: { date: 'desc' },
      take: 20, // cap to last 20
      select: {
        id: true,
        date: true,
        time: true,
        durationMinutes: true,
        price: true,
        status: true,
        service: {
          select: { name: true }
        },
        provider: {
          select: {
            id: true,
            location: true,
            user: {
              select: { name: true, avatar: true }
            },
            averageRating: true,
          },
        },
        review: {
          select: { id: true } // just need to know if a review exists
        },
      },
    });

    // 5. Fetch favourite providers (stored as array of provider IDs on CustomerProfile)
    const favoriteProviderIds = user.customerProfile?.favoriteProviders ?? [];
    const favoriteProviders = favoriteProviderIds.length > 0
      ? await prisma.providerProfile.findMany({
          where: { id: { in: favoriteProviderIds }, active: true },
          select: {
            id: true,
            location: true,
            averageRating: true,
            user: {
              select: { name: true, avatar: true }
            },
            services: {
              where: { active: true },
              orderBy: { price: 'asc' },
              take: 1,
              select: { name: true, price: true, category: { select: { name: true } } },
            },
            reviews: {
              select: { id: true }, // count only
            },
          },
        })
      : [];

    // 6. Compute stats
    const totalSpent = pastBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.price, 0);

    // 7. Shape the response to match what the frontend expects
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        avatar: user.avatar ?? '',
        location: user.customerProfile?.location ?? '',
        preferredLanguages: user.customerProfile?.preferredLanguages ?? [],
        joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
      stats: {
        upcomingCount: upcomingBookings.length,
        completedCount: pastBookings.filter(b => b.status === 'COMPLETED').length,
        favoritesCount: favoriteProviders.length,
        totalSpent,
      },
      upcomingBookings: upcomingBookings.map(b => ({
        id: b.id,
        service: b.service.name,
        date: new Date(b.date).toISOString().split('T')[0],
        time: b.time,
        duration: `${b.durationMinutes} min`,
        price: b.price,
        status: b.status.toLowerCase(),
        location: b.provider.location,
        provider: {
          id: b.provider.id,
          name: b.provider.user.name,
          avatar: b.provider.user.avatar ?? '',
          rating: b.provider.averageRating ?? 0,
        },
      })),
      pastBookings: pastBookings.map(b => ({
        id: b.id,
        service: b.service.name,
        date: new Date(b.date).toISOString().split('T')[0],
        time: b.time,
        duration: `${b.durationMinutes} min`,
        price: b.price,
        status: b.status.toLowerCase(),
        location: b.provider.location,
        reviewed: !!b.review,
        provider: {
          id: b.provider.id,
          name: b.provider.user.name,
          avatar: b.provider.user.avatar ?? '',
          rating: b.provider.averageRating ?? 0,
        },
      })),
      favoriteProviders: favoriteProviders.map(p => ({
        id: p.id,
        name: p.user.name,
        avatar: p.user.avatar ?? '',
        rating: p.averageRating ?? 0,
        reviewCount: p.reviews.length,
        location: p.location,
        service: p.services[0]?.category?.name ?? 'General',
        startingPrice: p.services[0]?.price ?? 0,
      })),
    });

  } catch (error) {
    console.error('[customer/dashboard] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}