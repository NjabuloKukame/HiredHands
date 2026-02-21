// ========================================
// FILE: app/api/provider/services/[serviceId]/route.js
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

export async function DELETE(request, { params }) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { serviceId } = params;

    // Confirm the service belongs to this provider before deleting
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });
    if (!providerProfile) return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, providerId: true },
    });

    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    if (service.providerId !== providerProfile.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await prisma.service.delete({ where: { id: serviceId } });

    return NextResponse.json({ message: 'Service deleted.' }, { status: 200 });

  } catch (error) {
    console.error('[provider/services/[serviceId]] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}