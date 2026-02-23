// ========================================
// FILE: app/api/provider-setup/route.js
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

export async function POST(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = decoded.userId;
    const body = await request.json();
    const { businessInfo, services, availability, portfolio = [] } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!businessInfo?.businessName?.trim())
      return NextResponse.json({ message: 'Business name is required.' }, { status: 400 });
    if (!businessInfo?.bio?.trim() || businessInfo.bio.trim().length < 20)
      return NextResponse.json({ message: 'Bio must be at least 20 characters.' }, { status: 400 });
    if (!businessInfo?.location?.trim())
      return NextResponse.json({ message: 'Location is required.' }, { status: 400 });
    if (!businessInfo?.phone?.trim())
      return NextResponse.json({ message: 'Phone number is required.' }, { status: 400 });
    if (!businessInfo?.languages?.length)
      return NextResponse.json({ message: 'At least one language is required.' }, { status: 400 });
    if (businessInfo.bookingFee != null && businessInfo.bookingFee < 0)
      return NextResponse.json({ message: 'Booking fee cannot be negative.' }, { status: 400 });
    if (!services?.length || services.some(s => !s.name?.trim() || !s.categoryId || !s.price))
      return NextResponse.json({ message: 'Each service requires a name, category, and price.' }, { status: 400 });
    if (services.some(s => parseFloat(s.price) <= 0))
      return NextResponse.json({ message: 'Service price must be greater than 0.' }, { status: 400 });
    if (!availability?.length)
      return NextResponse.json({ message: 'At least one availability slot is required.' }, { status: 400 });
    if (availability.some(s => s.startTime >= s.endTime))
      return NextResponse.json({ message: 'End time must be after start time for each slot.' }, { status: 400 });
    if (portfolio.length > 4)
      return NextResponse.json({ message: 'Maximum 4 portfolio images allowed.' }, { status: 400 });

    // ── Pre-fetch everything needed BEFORE the transaction ────────────────────
    // Doing reads inside the transaction burns time on the clock — move them out.

    // 1. Verify categories exist
    const categoryIds = [...new Set(services.map(s => s.categoryId))];
    const validCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (validCategories.length !== categoryIds.length)
      return NextResponse.json({ message: 'One or more selected categories are invalid.' }, { status: 400 });

    // 2. Get the providerProfile id — we need this for all related writes
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!providerProfile)
      return NextResponse.json({ message: 'Provider profile not found.' }, { status: 404 });

    const providerId = providerProfile.id;

    // ── Clear old related data BEFORE the transaction ─────────────────────────
    // Deletes are the slowest part. Running them outside shrinks the transaction
    // window dramatically — these don't need to be atomic with the writes below
    // because a failed re-setup just means the provider runs setup again.
    await prisma.service.deleteMany({ where: { providerId } });
    await prisma.availability.deleteMany({ where: { providerId } });
    await prisma.portfolioItem.deleteMany({ where: { providerId } });

    // ── Pre-build all create data arrays (CPU work, not DB work) ──────────────
    const servicesData = services.map(s => ({
      providerId,
      categoryId:      s.categoryId,
      name:            s.name.trim(),
      description:     s.description?.trim() || '',
      price:           parseFloat(s.price),
      durationMinutes: parseInt(s.durationMinutes) || 60,
      active:          true,
    }));

    const availabilityData = availability.map(slot => ({
      providerId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime:   slot.endTime,
    }));

    const portfolioData = portfolio.map(item => ({
      providerId,
      imageUrl:    item.imageUrl,
      publicId:    item.publicId ?? null,
      title:       item.title || 'Portfolio Image',
      description: null,
      category:    null,
    }));

    // ── Transaction: ONLY writes, no reads, no deletes ────────────────────────
    // Using the array form ($transaction([...])) which is faster than the
    // interactive callback form — Prisma sends all queries in a single batch.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          phone: businessInfo.phone.trim(),
          ...(businessInfo.profileImageUrl && { avatar: businessInfo.profileImageUrl }),
        },
      }),
      prisma.providerProfile.update({
        where: { userId },
        data: {
          businessName:      businessInfo.businessName.trim(),
          bio:               businessInfo.bio.trim(),
          location:          businessInfo.location.trim(),
          experienceYears:   businessInfo.experienceYears ?? null,
          responseTimeHours: businessInfo.responseTimeHours ?? 24,
          bookingFee:        businessInfo.bookingFee ?? 0,
          languages:         businessInfo.languages,
          coverImage:        businessInfo.profileImageUrl ?? undefined,
          setupCompleted:    true,
          active:            true,
        },
      }),
      prisma.service.createMany({ data: servicesData }),
      prisma.availability.createMany({ data: availabilityData }),
      ...(portfolioData.length > 0 ? [prisma.portfolioItem.createMany({ data: portfolioData })] : []),
    ]);

    return NextResponse.json({ message: 'Provider profile saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('[provider-setup] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}