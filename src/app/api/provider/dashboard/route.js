// ========================================
// FILE: app/api/provider/dashboard/route.js
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
    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = decoded.userId;

    // 2. Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        businessName: true,
        bio: true,
        location: true,
        averageRating: true,
        totalBookings: true,
        totalRevenue: true,
        setupCompleted: true,
        active: true,
        user: {
          select: { name: true, email: true, phone: true, avatar: true }
        },
      },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Redirect to setup if not completed
    if (!providerProfile.setupCompleted) {
      return NextResponse.json({ error: 'Setup incomplete', redirect: '/provider-setup' }, { status: 403 });
    }

    const providerId = providerProfile.id;

    // 3. Upcoming bookings (PENDING or CONFIRMED, future dates)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 10,
      select: {
        id: true,
        date: true,
        time: true,
        durationMinutes: true,
        price: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customer: {
          select: { avatar: true }
        },
        service: {
          select: { name: true }
        },
      },
    });

    // 4. Recent completed bookings (for overview + analytics)
    const recentBookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: 'COMPLETED',
      },
      orderBy: { date: 'desc' },
      take: 50,
      select: {
        id: true,
        date: true,
        price: true,
        status: true,
      },
    });

    // 5. Services with their booking counts
    const services = await prisma.service.findMany({
      where: { providerId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        durationMinutes: true,
        active: true,
        category: {
          select: { name: true }
        },
        bookings: {
          select: { id: true }
        },
      },
    });

    // 6. Reviews
    const reviews = await prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        customer: {
          select: { name: true, avatar: true }
        },
      },
    });

    const totalReviews = await prisma.review.count({ where: { providerId } });

    // 7. Revenue analytics — last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const last7DaysBookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: 'COMPLETED',
        date: { gte: sevenDaysAgo },
      },
      select: { date: true, price: true },
    });

    // Build day-by-day revenue map
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const revenue = last7DaysBookings
        .filter(b => new Date(b.date).toISOString().split('T')[0] === dayStr)
        .reduce((sum, b) => sum + b.price, 0);
      revenueByDay.push({ day: label, revenue });
    }

    // 8. This month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        providerId,
        status: 'COMPLETED',
        date: { gte: startOfMonth },
      },
      _sum: { price: true },
    });

    // 9. Shape and return
    return NextResponse.json({
      provider: {
        name: providerProfile.user.name,
        businessName: providerProfile.businessName,
        email: providerProfile.user.email,
        phone: providerProfile.user.phone ?? '',
        avatar: providerProfile.user.avatar ?? '',
        location: providerProfile.location,
        bio: providerProfile.bio,
        active: providerProfile.active,
      },
      stats: {
        monthlyRevenue: monthlyRevenue._sum.price ?? 0,
        totalBookings: providerProfile.totalBookings,
        averageRating: providerProfile.averageRating ?? 0,
        totalReviews,
        upcomingCount: upcomingBookings.length,
      },
      upcomingBookings: upcomingBookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        customerAvatar: b.customer.avatar ?? '',
        service: b.service.name,
        date: new Date(b.date).toISOString().split('T')[0],
        time: b.time,
        duration: `${b.durationMinutes} min`,
        price: b.price,
        status: b.status.toLowerCase(),
      })),
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: `${s.durationMinutes} min`,
        durationMinutes: s.durationMinutes,
        category: s.category.name,
        active: s.active,
        bookings: s.bookings.length,
      })),
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        customerName: r.customer.name,
        customerAvatar: r.customer.avatar ?? '',
      })),
      analytics: {
        revenueByDay,
        maxDayRevenue: Math.max(...revenueByDay.map(d => d.revenue), 1),
      },
    });

  } catch (error) {
    console.error('[provider/dashboard] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}