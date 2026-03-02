// ========================================
// FILE: app/api/providers/[id]/route.js
// ========================================

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      select: {
        id:                true,
        businessName:      true,
        bio:               true,
        location:          true,
        coverImage:        true,
        experienceYears:   true,
        responseTimeHours: true,
        bookingFee:        true,
        languages:         true,
        averageRating:     true,
        totalBookings:     true,
        active:            true,
        setupCompleted:    true,
        user: {
          select: { name: true, avatar: true },
        },
        services: {
          where:   { active: true },
          orderBy: { price: 'asc' },
          select: {
            id:              true,
            name:            true,
            description:     true,
            price:           true,
            durationMinutes: true,
            category:        { select: { name: true } },
          },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
          select: {
            id:        true,
            dayOfWeek: true,
            startTime: true,
            endTime:   true,
          },
        },
        portfolio: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, imageUrl: true, title: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take:    10,
          select: {
            id:        true,
            rating:    true,
            comment:   true,
            createdAt: true,
            customer:  { select: { name: true, avatar: true } },
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (!provider.active || !provider.setupCompleted) {
      return NextResponse.json({ error: 'Provider not available' }, { status: 404 });
    }

    // Day name map
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Build today + tomorrow availability slots
    const now       = new Date();
    const today     = now.getDay();
    const tomorrow  = (today + 1) % 7;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaySlots    = provider.availability.filter(a => a.dayOfWeek === today);
    const tomorrowSlots = provider.availability.filter(a => a.dayOfWeek === tomorrow);

    // Generate time slots from startTime–endTime in 1hr increments
    function generateSlots(slots, isToday = false) {
      const times = [];
      for (const slot of slots) {
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        let current = sh * 60 + sm;
        const end   = eh * 60 + em;
        while (current + 60 <= end) {
          if (!isToday || current > currentMinutes) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
          }
          current += 60;
        }
      }
      return times;
    }

    return NextResponse.json({
      id:                provider.id,
      businessName:      provider.businessName,
      ownerName:         provider.user.name,
      avatar:            provider.user.avatar ?? null,
      coverImage:        provider.coverImage ?? null,
      bio:               provider.bio,
      location:          provider.location,
      experienceYears:   provider.experienceYears ?? null,
      responseTimeHours: provider.responseTimeHours,
      bookingFee:        provider.bookingFee ?? 0,
      languages:         provider.languages,
      rating:            provider.averageRating ?? 0,
      totalReviews:      provider.reviews.length,
      totalBookings:     provider.totalBookings,
      services:          provider.services.map(s => ({
        id:          s.id,
        name:        s.name,
        description: s.description,
        price:       s.price,
        duration:    `${s.durationMinutes} min`,
        category:    s.category.name,
      })),
      portfolio: provider.portfolio.map(p => ({
        id:       p.id,
        imageUrl: p.imageUrl,
        title:    p.title,
      })),
      availability: {
        today:    { label: 'Today',    slots: generateSlots(todaySlots, true) },
        tomorrow: { label: 'Tomorrow', slots: generateSlots(tomorrowSlots, false) },
        weekly:   provider.availability.map(a => ({
          day:       DAY_NAMES[a.dayOfWeek],
          startTime: a.startTime,
          endTime:   a.endTime,
        })),
      },
      reviews: provider.reviews.map(r => ({
        id:        r.id,
        rating:    r.rating,
        comment:   r.comment,
        date:      new Date(r.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
        customer: {
          name:   r.customer.name,
          avatar: r.customer.avatar ?? null,
        },
      })),
    });

  } catch (error) {
    console.error('[providers/[id]] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}