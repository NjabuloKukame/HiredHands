// ========================================
// FILE: app/api/bookings/route.js
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

// Sanitise a plain string — trim + collapse whitespace + strip control chars
function sanitise(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');
}

export async function POST(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) return NextResponse.json({ message: 'Please log in to make a booking.' }, { status: 401 });
    if (decoded.role !== 'CUSTOMER') return NextResponse.json({ message: 'Only customers can make bookings.' }, { status: 403 });

    const userId = decoded.userId;
    const body = await request.json();

    // ── Sanitise all inputs ───────────────────────────────────────────────────
    const providerId  = sanitise(body.providerId);
    const serviceId   = sanitise(body.serviceId);
    const date        = sanitise(body.date);        // "YYYY-MM-DD"
    const time        = sanitise(body.time);        // "HH:MM"
    const notes       = sanitise(body.notes ?? '');
    const paymentType = sanitise(body.paymentType); // "full" | "booking_fee"
    const customerName  = sanitise(body.customerName);
    const customerPhone = sanitise(body.customerPhone);

    // ── Required field validation ─────────────────────────────────────────────
    if (!providerId)    return NextResponse.json({ message: 'Provider is required.' }, { status: 400 });
    if (!serviceId)     return NextResponse.json({ message: 'Please select a service.' }, { status: 400 });
    if (!date)          return NextResponse.json({ message: 'Please select a date.' }, { status: 400 });
    if (!time)          return NextResponse.json({ message: 'Please select a time.' }, { status: 400 });
    if (!customerName)  return NextResponse.json({ message: 'Your name is required.' }, { status: 400 });
    if (!customerPhone) return NextResponse.json({ message: 'Your phone number is required.' }, { status: 400 });
    if (!['full', 'booking_fee'].includes(paymentType)) {
      return NextResponse.json({ message: 'Invalid payment type.' }, { status: 400 });
    }

    // ── Format validation ─────────────────────────────────────────────────────
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: 'Invalid date format.' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ message: 'Invalid time format.' }, { status: 400 });
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(customerPhone)) {
      return NextResponse.json({ message: 'Please enter a valid phone number.' }, { status: 400 });
    }

    // Date must not be in the past
    const bookingDate = new Date(`${date}T${time}:00`);
    if (isNaN(bookingDate.getTime()) || bookingDate < new Date()) {
      return NextResponse.json({ message: 'Please select a future date and time.' }, { status: 400 });
    }

    // Notes length cap
    if (notes.length > 500) {
      return NextResponse.json({ message: 'Notes must be under 500 characters.' }, { status: 400 });
    }

    // ── Verify provider + service exist ───────────────────────────────────────
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { id: true, bookingFee: true, active: true, setupCompleted: true },
    });
    if (!provider || !provider.active || !provider.setupCompleted) {
      return NextResponse.json({ message: 'Provider not found or unavailable.' }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, price: true, durationMinutes: true, providerId: true, active: true },
    });
    if (!service || !service.active || service.providerId !== providerId) {
      return NextResponse.json({ message: 'Service not found or unavailable.' }, { status: 404 });
    }

    // ── Get customer email (stored on booking for record-keeping) ─────────────
    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!customer) return NextResponse.json({ message: 'Customer not found.' }, { status: 404 });

    // ── Calculate price ───────────────────────────────────────────────────────
    const bookingFee = provider.bookingFee ?? 0;
    const price = paymentType === 'full'
      ? service.price + bookingFee
      : bookingFee;

    // ── Create booking ────────────────────────────────────────────────────────
    const booking = await prisma.booking.create({
      data: {
        customerId:      userId,
        providerId:      providerId,
        serviceId:       serviceId,
        date:            bookingDate,
        time:            time,
        durationMinutes: service.durationMinutes,
        price:           price,
        notes:           notes || null,
        status:          'PENDING',
        paymentStatus:   'PENDING',
        customerName:    customerName,
        customerEmail:   customer.email,
        customerPhone:   customerPhone,
      },
      select: { id: true, status: true, date: true, time: true, price: true },
    });

    return NextResponse.json({
      message: 'Booking created successfully.',
      booking: {
        id:    booking.id,
        date:  date,
        time:  booking.time,
        price: booking.price,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[bookings] POST error:', error);
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}