// ========================================
// FILE: app/api/customer-setup/route.js
// ========================================

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// ── Helper: get the logged-in user from the auth cookie ──────────────────────
function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ── POST /api/customer-setup ─────────────────────────────────────────────────
export async function POST(request) {
  try {
    // 1. Auth check
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Only customers should hit this route
    if (decoded.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = decoded.userId;

    // 3. Parse body
    const body = await request.json();
    const { personalInfo, preferences, preferredLanguages, notifications } = body;

    // 4. Server-side validation
    if (!personalInfo?.fullName?.trim()) {
      return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalInfo?.email?.trim() || !emailRegex.test(personalInfo.email)) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }

    if (!personalInfo?.phone?.trim()) {
      return NextResponse.json({ message: 'Phone number is required.' }, { status: 400 });
    }

    if (!preferredLanguages?.length) {
      return NextResponse.json({ message: 'At least one language preference is required.' }, { status: 400 });
    }

    // 5. If the email changed, make sure it isn't taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: personalInfo.email.toLowerCase() },
      select: { id: true }
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json({ message: 'That email is already in use.' }, { status: 409 });
    }

    // 6. Run both updates in a transaction so they succeed or fail together
    await prisma.$transaction([
      // Update the User row (name, email, phone, avatar)
      prisma.user.update({
        where: { id: userId },
        data: {
          name:  personalInfo.fullName.trim(),
          email: personalInfo.email.toLowerCase().trim(),
          phone: personalInfo.phone.trim(),
          // Only overwrite avatar if the user uploaded a new one
          ...(personalInfo.profileImageUrl && { avatar: personalInfo.profileImageUrl }),
        },
      }),

      // Update the CustomerProfile row
      prisma.customerProfile.update({
        where: { userId },
        data: {
          location:           personalInfo.location?.trim() || null,
          preferredLanguages: preferredLanguages,
        },
      }),
    ]);

    // 7. Return success — the frontend will redirect to /dashboard
    return NextResponse.json(
      { message: 'Profile saved successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[customer-setup] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}