// ============================================================
// FILE: app/api/checkout/route.js
//
// Creates a PENDING booking then initialises a Paystack
// Standard checkout session. Returns an authorization_url
// which the client redirects to.
//
// PAYSTACK FLOW:
//   1. POST https://api.paystack.co/transaction/initialize
//      → returns { data: { authorization_url, reference } }
//   2. Client redirects to authorization_url
//   3. Customer pays on Paystack-hosted page
//   4. Paystack redirects to callback_url with ?reference=xxx
//   5. Paystack fires charge.success webhook (separate file)
//
// IMPORTANT — amounts:
//   Paystack requires amounts in KOBO (ZAR cents), not Rands.
//   R150.00 → 15000 kobo. Always multiply by 100, use Math.round.
//
// ENV VARS NEEDED (.env.local):
//   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
//   NEXT_PUBLIC_APP_URL=http://localhost:3000
// ============================================================

import { NextResponse } from 'next/server';
import crypto          from 'crypto';
import jwt             from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// ── Fee config — edit ONLY here ───────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.08;  // 8% Hired Hands cut
const PLATFORM_FEE_MIN  = 10.00; // R10 minimum platform fee

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
}

function sanitise(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');
}

function rnd(n) {
  return Math.round(n * 100) / 100;
}

function calculateFees(servicePrice, bookingFee, paymentType) {
  const subtotal     = paymentType === 'full'
    ? rnd(servicePrice + bookingFee)
    : rnd(bookingFee);
  const platformFee  = rnd(Math.max(rnd(subtotal * PLATFORM_FEE_RATE), PLATFORM_FEE_MIN));
  const totalCharged = rnd(subtotal + platformFee);
  // Paystack fee 2.9% + R1 — stored for audit, absorbed as cost of business
  const gatewayFee   = rnd(totalCharged * 0.029 + 1.00);
  return { subtotal, platformFee, gatewayFee, totalCharged };
}

// Idempotency token — same booking intent always produces same reference
function makeReference(userId, providerId, serviceId, date, time, paymentType) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${providerId}:${serviceId}:${date}:${time}:${paymentType}`)
    .digest('hex')
    .slice(0, 48); // Paystack reference max length is 100 but keep it short
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const decoded = getUserFromToken(request);
    if (!decoded)
      return NextResponse.json({ message: 'Please log in to make a booking.' }, { status: 401 });
    if (decoded.role !== 'CUSTOMER')
      return NextResponse.json({ message: 'Only customers can make bookings.' }, { status: 403 });

    const userId = decoded.userId;
    const body   = await request.json();

    // ── Sanitise inputs ───────────────────────────────────────────────────────
    const providerId    = sanitise(body.providerId);
    const serviceId     = sanitise(body.serviceId);
    const date          = sanitise(body.date);          // "YYYY-MM-DD"
    const time          = sanitise(body.time);          // "HH:MM"
    const notes         = sanitise(body.notes ?? '');
    const paymentType   = sanitise(body.paymentType);   // "full" | "booking_fee"
    const customerName  = sanitise(body.customerName);
    const customerPhone = sanitise(body.customerPhone);

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!providerId || !serviceId || !date || !time)
      return NextResponse.json({ message: 'Missing required booking details.' }, { status: 400 });
    if (!customerName || customerName.length < 2)
      return NextResponse.json({ message: 'Your full name is required.' }, { status: 400 });
    if (!customerPhone || !/^\+?[\d\s\-()]{7,15}$/.test(customerPhone))
      return NextResponse.json({ message: 'Please enter a valid phone number.' }, { status: 400 });
    if (!['full', 'booking_fee'].includes(paymentType))
      return NextResponse.json({ message: 'Invalid payment type.' }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
      return NextResponse.json({ message: 'Invalid date or time format.' }, { status: 400 });
    if (notes.length > 500)
      return NextResponse.json({ message: 'Notes must be under 500 characters.' }, { status: 400 });

    // Timezone-safe date parsing (avoids UTC shift on SA UTC+2)
    const [year, month, day] = date.split('-').map(Number);
    const bookingDateTime    = new Date(year, month - 1, day);
    if (isNaN(bookingDateTime.getTime()) || bookingDateTime < new Date())
      return NextResponse.json({ message: 'Please select a future date and time.' }, { status: 400 });

    // ── Verify provider + service — NEVER trust client amounts ────────────────
    const provider = await prisma.providerProfile.findUnique({
      where:  { id: providerId },
      select: { id: true, bookingFee: true, businessName: true, active: true, setupCompleted: true },
    });
    if (!provider?.active || !provider?.setupCompleted)
      return NextResponse.json({ message: 'Provider not available.' }, { status: 404 });

    const service = await prisma.service.findUnique({
      where:  { id: serviceId },
      select: { id: true, name: true, price: true, durationMinutes: true, providerId: true, active: true },
    });
    if (!service?.active || service.providerId !== providerId)
      return NextResponse.json({ message: 'Service not available.' }, { status: 404 });

    const customer = await prisma.user.findUnique({
      where:  { id: userId },
      select: { email: true },
    });
    if (!customer)
      return NextResponse.json({ message: 'Customer not found.' }, { status: 404 });

    // ── Calculate fees server-side ────────────────────────────────────────────
    const { subtotal, platformFee, gatewayFee, totalCharged } = calculateFees(
      service.price,
      provider.bookingFee ?? 0,
      paymentType
    );

    // ── Idempotency — reuse pending booking on retry/double-click ─────────────
    const reference = makeReference(userId, providerId, serviceId, date, time, paymentType);

    const existing = await prisma.booking.findFirst({
      where: {
        customerId:     userId,
        pfPaymentToken: reference,  // pfPaymentToken = our idempotency column
        status:         'PENDING',
        paymentStatus:  'PENDING',
      },
      select: { id: true, pfPaymentId: true },
    });

    let bookingId;
    let paystackAuthUrl;

    if (existing) {
      bookingId = existing.id;
    } else {
      const newBooking = await prisma.booking.create({
        data: {
          customerId:      userId,
          providerId,
          serviceId,
          date:            bookingDateTime,
          time,
          durationMinutes: service.durationMinutes,
          price:           totalCharged,   // legacy field — keep in sync
          subtotal,
          platformFee,
          gatewayFee,
          totalCharged,
          paymentType,
          notes:           notes || null,
          status:          'PENDING',
          paymentStatus:   'PENDING',
          customerName,
          customerEmail:   customer.email,
          customerPhone,
          pfPaymentToken:  reference,      // idempotency token
        },
        select: { id: true },
      });
      bookingId = newBooking.id;
    }

    // ── Initialise Paystack transaction ───────────────────────────────────────
    // Amount must be in kobo (cents) — multiply rands by 100
    const amountKobo = Math.round(totalCharged * 100);
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        email:        customer.email,
        amount:       amountKobo,
        currency:     'ZAR',
        reference,                          // our idempotency token doubles as the Paystack reference
        callback_url: `${appUrl}/booking/success?booking_id=${bookingId}`,
        metadata: {
          bookingId,
          paymentType,
          subtotal,
          platformFee,
          customerName,
          customerPhone,
          serviceName:  service.name,
          providerName: provider.businessName,
          cancel_action: `${appUrl}/booking/${providerId}`, // Paystack uses this on their cancel button
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || !paystackData.data?.authorization_url) {
      console.error('[checkout] Paystack init error:', paystackData);
      // Clean up orphaned pending booking
      await prisma.booking.updateMany({
        where: { id: bookingId, status: 'PENDING' },
        data:  { status: 'CANCELLED' },
      });
      return NextResponse.json(
        { message: 'Payment gateway error. Please try again.' },
        { status: 502 }
      );
    }

    paystackAuthUrl = paystackData.data.authorization_url;

    // Store Paystack's access_code for reference (pfPaymentId = gateway's tx ID)
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { pfPaymentId: paystackData.data.access_code },
    });

    return NextResponse.json({
      url:       paystackAuthUrl,
      bookingId,
      breakdown: { subtotal, platformFee, gatewayFee, totalCharged, paymentType },
    }, { status: 200 });

  } catch (error) {
    console.error('[checkout] POST error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}