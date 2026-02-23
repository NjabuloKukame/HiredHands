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

// ── GET: full dashboard data ──────────────────────────────────────────────────
export async function GET(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'CUSTOMER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = decoded.userId;

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
            address: true,
            preferredLanguages: true,
            favoriteProviders: true,
            emailNotifications: true,
            smsNotifications: true,
            reminders: true,
            newProviders: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const upcomingBookings = await prisma.booking.findMany({
      where: { customerId: userId, status: { in: ['PENDING', 'CONFIRMED'] }, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      select: {
        id: true, date: true, time: true, durationMinutes: true, price: true, status: true, notes: true,
        service: { select: { name: true } },
        provider: {
          select: { id: true, location: true, averageRating: true, user: { select: { name: true, avatar: true } } },
        },
      },
    });

    const pastBookings = await prisma.booking.findMany({
      where: { customerId: userId, status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
      orderBy: { date: 'desc' },
      take: 20,
      select: {
        id: true, date: true, time: true, durationMinutes: true, price: true, status: true,
        service: { select: { name: true } },
        provider: {
          select: { id: true, location: true, averageRating: true, user: { select: { name: true, avatar: true } } },
        },
        review: { select: { id: true } },
      },
    });

    const favoriteProviderIds = user.customerProfile?.favoriteProviders ?? [];
    const favoriteProviders = favoriteProviderIds.length > 0
      ? await prisma.providerProfile.findMany({
          where: { id: { in: favoriteProviderIds }, active: true },
          select: {
            id: true, location: true, averageRating: true,
            user: { select: { name: true, avatar: true } },
            services: { where: { active: true }, orderBy: { price: 'asc' }, take: 1, select: { name: true, price: true, category: { select: { name: true } } } },
            reviews: { select: { id: true } },
          },
        })
      : [];

    const totalSpent = pastBookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + b.price, 0);

    return NextResponse.json({
      user: {
        id:                 user.id,
        name:               user.name,
        email:              user.email,
        phone:              user.phone ?? '',
        avatar:             user.avatar ?? '',
        location:           user.customerProfile?.location ?? '',
        address:            user.customerProfile?.address ?? '',
        preferredLanguages: user.customerProfile?.preferredLanguages ?? [],
        joinDate:           new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        notifications: {
          emailNotifications: user.customerProfile?.emailNotifications ?? true,
          smsNotifications:   user.customerProfile?.smsNotifications ?? false,
          reminders:          user.customerProfile?.reminders ?? true,
          newProviders:       user.customerProfile?.newProviders ?? false,
        },
      },
      stats: {
        upcomingCount:  upcomingBookings.length,
        completedCount: pastBookings.filter(b => b.status === 'COMPLETED').length,
        favoritesCount: favoriteProviders.length,
        totalSpent,
      },
      upcomingBookings: upcomingBookings.map(b => ({
        id: b.id, service: b.service.name,
        date: new Date(b.date).toISOString().split('T')[0],
        time: b.time, duration: `${b.durationMinutes} min`, price: b.price,
        status: b.status.toLowerCase(), location: b.provider.location,
        provider: { id: b.provider.id, name: b.provider.user.name, avatar: b.provider.user.avatar ?? '', rating: b.provider.averageRating ?? 0 },
      })),
      pastBookings: pastBookings.map(b => ({
        id: b.id, service: b.service.name,
        date: new Date(b.date).toISOString().split('T')[0],
        time: b.time, duration: `${b.durationMinutes} min`, price: b.price,
        status: b.status.toLowerCase(), location: b.provider.location, reviewed: !!b.review,
        provider: { id: b.provider.id, name: b.provider.user.name, avatar: b.provider.user.avatar ?? '', rating: b.provider.averageRating ?? 0 },
      })),
      favoriteProviders: favoriteProviders.map(p => ({
        id: p.id, name: p.user.name, avatar: p.user.avatar ?? '',
        rating: p.averageRating ?? 0, reviewCount: p.reviews.length,
        location: p.location, service: p.services[0]?.category?.name ?? 'General',
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

// ── PATCH: update customer profile ────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'CUSTOMER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = decoded.userId;
    const body = await request.json();
    const { name, phone, location, address, preferredLanguages, avatarUrl, notifications } = body;

    // Validate
    if (!name?.trim()) return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ message: 'Phone number is required.' }, { status: 400 });
    if (!location?.trim()) return NextResponse.json({ message: 'City/Region is required.' }, { status: 400 });
    if (!preferredLanguages?.length) return NextResponse.json({ message: 'At least one language is required.' }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          name:  name.trim(),
          phone: phone.trim(),
          ...(avatarUrl && { avatar: avatarUrl }),
        },
      }),
      prisma.customerProfile.update({
        where: { userId },
        data: {
          location:           location.trim(),
          address:            address?.trim() ?? '',
          preferredLanguages: preferredLanguages,
          // Notification settings
          ...(notifications && {
            emailNotifications: notifications.emailNotifications ?? true,
            smsNotifications:   notifications.smsNotifications ?? false,
            reminders:          notifications.reminders ?? true,
            newProviders:       notifications.newProviders ?? false,
          }),
        },
      }),
    ]);

    return NextResponse.json({ message: 'Profile updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('[customer/dashboard] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}