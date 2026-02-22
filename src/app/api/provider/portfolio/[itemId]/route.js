// ========================================
// FILE: app/api/provider/portfolio/[itemId]/route.js
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

export async function DELETE(request, { params }) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { itemId } = params;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });
    if (!providerProfile) return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });

    // Verify ownership before deleting
    const item = await prisma.portfolioItem.findUnique({
      where: { id: itemId },
      select: { id: true, providerId: true },
    });
    if (!item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    if (item.providerId !== providerProfile.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    await prisma.portfolioItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: 'Portfolio item deleted.' }, { status: 200 });

  } catch (error) {
    console.error('[provider/portfolio/[itemId]] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}