// ========================================
// FILE: app/api/provider/services/route.js
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

    const { name, description, categoryId, price, durationMinutes } = await request.json();

    if (!name?.trim()) return NextResponse.json({ message: 'Service name is required.' }, { status: 400 });
    if (!categoryId)   return NextResponse.json({ message: 'Category is required.' }, { status: 400 });
    if (!price || parseFloat(price) <= 0) return NextResponse.json({ message: 'A valid price is required.' }, { status: 400 });

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, name: true } });
    if (!category) return NextResponse.json({ message: 'Invalid category.' }, { status: 400 });

    // Get providerProfile id
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });
    if (!providerProfile) return NextResponse.json({ error: 'Provider profile not found.' }, { status: 404 });

    const service = await prisma.service.create({
      data: {
        providerId:      providerProfile.id,
        categoryId,
        name:            name.trim(),
        description:     description?.trim() ?? '',
        price:           parseFloat(price),
        durationMinutes: parseInt(durationMinutes) || 60,
        active:          true,
      },
      select: {
        id: true, name: true, description: true,
        price: true, durationMinutes: true, active: true,
        category: { select: { name: true } },
        bookings: { select: { id: true } },
      },
    });

    // Shape to match what the dashboard expects
    return NextResponse.json({
      service: {
        id:          service.id,
        name:        service.name,
        description: service.description,
        price:       service.price,
        duration:    `${service.durationMinutes} min`,
        durationMinutes: service.durationMinutes,
        category:    service.category.name,
        active:      service.active,
        bookings:    0,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[provider/services] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}