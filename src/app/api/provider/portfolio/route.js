// ========================================
// FILE: app/api/provider/portfolio/route.js
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
  } catch { return null; }
}

// POST: add a portfolio image
export async function POST(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { imageUrl, title } = await request.json();
    if (!imageUrl) return NextResponse.json({ message: 'Image URL is required.' }, { status: 400 });

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true, _count: { select: { portfolio: true } } },
    });
    if (!providerProfile) return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });

    if (providerProfile._count.portfolio >= 4) {
      return NextResponse.json({ message: 'Maximum 4 portfolio images allowed.' }, { status: 400 });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        providerId: providerProfile.id,
        imageUrl,
        title: title?.trim() || 'Portfolio Image',
      },
      select: { id: true, imageUrl: true, title: true, description: true, category: true },
    });

    return NextResponse.json({ item }, { status: 201 });

  } catch (error) {
    console.error('[provider/portfolio] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}