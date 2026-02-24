// ========================================
// FILE: app/api/search/route.js
// ========================================
//
// GET /api/search?q=hair&location=johannesburg&sort=rating&minPrice=0&maxPrice=500&category=...
//
// Query params:
//   q          - text search (matches businessName, bio, service names)
//   location   - filters by provider location (case-insensitive contains)
//   category   - category name filter
//   sort       - "rating" | "price_asc" | "price_desc" | "reviews" (default: rating)
//   minPrice   - minimum starting price (bookingFee or cheapest service)
//   maxPrice   - maximum starting price
//   page       - page number (default: 1)
//   limit      - results per page (default: 12)
// ========================================

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q         = searchParams.get('q')?.trim() || '';
    const location  = searchParams.get('location')?.trim() || '';
    const category  = searchParams.get('category')?.trim() || '';
    const sort      = searchParams.get('sort') || 'rating';
    const minPrice  = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice  = parseFloat(searchParams.get('maxPrice') || '999999');
    const page      = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit     = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip      = (page - 1) * limit;

    // ── Build where clause ────────────────────────────────────────────────────
    const where = {
      active:         true,
      setupCompleted: true,
      // Location filter
      ...(location && {
        location: { contains: location, mode: 'insensitive' },
      }),
      // Text search — match businessName or bio
      ...(q && {
        OR: [
          { businessName: { contains: q, mode: 'insensitive' } },
          { bio:          { contains: q, mode: 'insensitive' } },
          // Also match providers who have a service with this name
          { services: { some: { name: { contains: q, mode: 'insensitive' }, active: true } } },
        ],
      }),
      // Category filter — match providers who have a service in this category
      ...(category && {
        services: {
          some: {
            active: true,
            category: { name: { contains: category, mode: 'insensitive' } },
          },
        },
      }),
    };

    // ── Determine sort order ──────────────────────────────────────────────────
    let orderBy = {};
    if (sort === 'rating')     orderBy = { averageRating: 'desc' };
    if (sort === 'reviews')    orderBy = { totalBookings: 'desc' };
    if (sort === 'price_asc')  orderBy = { bookingFee: 'asc' };
    if (sort === 'price_desc') orderBy = { bookingFee: 'desc' };

    // ── Fetch providers ───────────────────────────────────────────────────────
    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:               true,
          businessName:     true,
          bio:              true,
          location:         true,
          coverImage:       true,
          averageRating:    true,
          totalBookings:    true,
          bookingFee:       true,
          responseTimeHours: true,
          languages:        true,
          user: {
            select: { name: true, avatar: true },
          },
          services: {
            where:   { active: true },
            orderBy: { price: 'asc' },
            take:    3,
            select: {
              id:    true,
              name:  true,
              price: true,
              durationMinutes: true,
              category: { select: { name: true } },
            },
          },
          reviews: {
            select: { id: true },
            take:   999,
          },
          portfolio: {
            orderBy: { createdAt: 'asc' },
            take:    1,
            select:  { imageUrl: true },
          },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    // ── Post-filter by price ──────────────────────────────────────────────────
    // "Starting price" = cheapest service price (not bookingFee)
    // We filter in JS because Prisma can't easily filter on a relation aggregate
    const filtered = providers.filter(p => {
      const cheapest = p.services[0]?.price ?? 0;
      return cheapest >= minPrice && cheapest <= maxPrice;
    });

    // ── Fetch all unique categories for the filter UI ─────────────────────────
    const categories = await prisma.category.findMany({
      where: {
        services: { some: { active: true, provider: { active: true, setupCompleted: true } } },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // ── Shape response ────────────────────────────────────────────────────────
    return NextResponse.json({
      providers: filtered.map(p => {
        const cheapestService = p.services[0];
        const coverPhoto      = p.coverImage || p.portfolio[0]?.imageUrl || null;

        return {
          id:               p.id,
          businessName:     p.businessName,
          ownerName:        p.user.name,
          avatar:           p.user.avatar ?? null,
          coverImage:       coverPhoto,
          bio:              p.bio,
          location:         p.location,
          rating:           p.averageRating ?? 0,
          reviewCount:      p.reviews.length,
          totalBookings:    p.totalBookings,
          bookingFee:       p.bookingFee ?? 0,
          startingPrice:    cheapestService?.price ?? null,
          primaryService:   cheapestService?.name ?? null,
          primaryCategory:  cheapestService?.category?.name ?? null,
          responseTimeHours: p.responseTimeHours,
          languages:        p.languages,
          // All services for tooltip / expanded view
          services:         p.services.map(s => ({
            id:       s.id,
            name:     s.name,
            price:    s.price,
            duration: s.durationMinutes,
            category: s.category.name,
          })),
        };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      categories: categories.map(c => c.name),
    });

  } catch (error) {
    console.error('[search] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}