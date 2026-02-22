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

// ── GET: fetch all dashboard data ─────────────────────────────────────────────
export async function GET(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = decoded.userId;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        businessName: true,
        bio: true,
        location: true,
        coverImage: true,
        experienceYears: true,
        responseTimeHours: true,
        bookingFee: true,
        languages: true,
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

    if (!providerProfile) return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    if (!providerProfile.setupCompleted) {
      return NextResponse.json({ error: 'Setup incomplete', redirect: '/provider-setup' }, { status: 403 });
    }

    const providerId = providerProfile.id;

    // Upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: { providerId, status: { in: ['PENDING', 'CONFIRMED'] }, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 10,
      select: {
        id: true, date: true, time: true, durationMinutes: true,
        price: true, status: true, customerName: true, customerEmail: true,
        customer: { select: { avatar: true } },
        service: { select: { name: true } },
      },
    });

    // Services
    const services = await prisma.service.findMany({
      where: { providerId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, name: true, description: true, price: true,
        durationMinutes: true, active: true,
        category: { select: { name: true } },
        bookings: { select: { id: true } },
      },
    });

    // Reviews
    const reviews = await prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, rating: true, comment: true, createdAt: true,
        customer: { select: { name: true, avatar: true } },
      },
    });
    const totalReviews = await prisma.review.count({ where: { providerId } });

    // Portfolio
    const portfolio = await prisma.portfolioItem.findMany({
      where: { providerId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, imageUrl: true, title: true, description: true, category: true },
    });

    // Analytics — last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const last7DaysBookings = await prisma.booking.findMany({
      where: { providerId, status: 'COMPLETED', date: { gte: sevenDaysAgo } },
      select: { date: true, price: true },
    });

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

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await prisma.booking.aggregate({
      where: { providerId, status: 'COMPLETED', date: { gte: startOfMonth } },
      _sum: { price: true },
    });

    return NextResponse.json({
      // Full profile for the Profile tab
      provider: {
        name:              providerProfile.user.name,
        email:             providerProfile.user.email,
        phone:             providerProfile.user.phone ?? '',
        avatar:            providerProfile.user.avatar ?? '',
        businessName:      providerProfile.businessName,
        bio:               providerProfile.bio,
        location:          providerProfile.location,
        coverImage:        providerProfile.coverImage ?? '',
        experienceYears:   providerProfile.experienceYears ?? '',
        responseTimeHours: providerProfile.responseTimeHours,
        bookingFee:        providerProfile.bookingFee ?? 0,
        languages:         providerProfile.languages,
        active:            providerProfile.active,
      },
      stats: {
        monthlyRevenue:  monthlyRevenue._sum.price ?? 0,
        totalBookings:   providerProfile.totalBookings,
        averageRating:   providerProfile.averageRating ?? 0,
        totalReviews,
        upcomingCount:   upcomingBookings.length,
      },
      upcomingBookings: upcomingBookings.map(b => ({
        id:             b.id,
        customerName:   b.customerName,
        customerAvatar: b.customer.avatar ?? '',
        service:        b.service.name,
        date:           new Date(b.date).toISOString().split('T')[0],
        time:           b.time,
        duration:       `${b.durationMinutes} min`,
        price:          b.price,
        status:         b.status.toLowerCase(),
      })),
      services: services.map(s => ({
        id:          s.id,
        name:        s.name,
        description: s.description,
        price:       s.price,
        duration:    `${s.durationMinutes} min`,
        durationMinutes: s.durationMinutes,
        category:    s.category.name,
        active:      s.active,
        bookings:    s.bookings.length,
      })),
      reviews: reviews.map(r => ({
        id:             r.id,
        rating:         r.rating,
        comment:        r.comment,
        createdAt:      r.createdAt,
        customerName:   r.customer.name,
        customerAvatar: r.customer.avatar ?? '',
      })),
      portfolio,
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

// ── PATCH: update business profile ───────────────────────────────────────────
export async function PATCH(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = decoded.userId;
    const body = await request.json();
    const { name, phone, businessName, bio, location, experienceYears, responseTimeHours, bookingFee, languages, avatarUrl } = body;

    // Validate required fields
    if (!businessName?.trim()) return NextResponse.json({ message: 'Business name is required.' }, { status: 400 });
    if (!bio?.trim() || bio.trim().length < 20) return NextResponse.json({ message: 'Bio must be at least 20 characters.' }, { status: 400 });
    if (!location?.trim()) return NextResponse.json({ message: 'Location is required.' }, { status: 400 });
    if (!languages?.length) return NextResponse.json({ message: 'At least one language is required.' }, { status: 400 });
    if (bookingFee != null && bookingFee < 0) return NextResponse.json({ message: 'Booking fee cannot be negative.' }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(name?.trim()  && { name: name.trim() }),
          ...(phone?.trim() && { phone: phone.trim() }),
          ...(avatarUrl     && { avatar: avatarUrl }),
        },
      }),
      prisma.providerProfile.update({
        where: { userId },
        data: {
          businessName:      businessName.trim(),
          bio:               bio.trim(),
          location:          location.trim(),
          experienceYears:   experienceYears ? parseInt(experienceYears) : null,
          responseTimeHours: responseTimeHours ? parseInt(responseTimeHours) : 24,
          bookingFee:        bookingFee != null ? parseFloat(bookingFee) : 0,
          languages:         languages,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Profile updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('[provider/dashboard] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}