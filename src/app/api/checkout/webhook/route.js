// ============================================================
// FILE: app/api/checkout/webhook/route.js
//
// Receives Paystack webhook events.
//
// RENAME: your current file is api/checkout/notify/route.js
// Delete that folder and create api/checkout/webhook/route.js
//
// PAYSTACK WEBHOOK SECURITY MODEL:
//   1. Paystack sends header: x-paystack-signature
//   2. Value is HMAC-SHA512 of raw request body using your secret key
//   3. We recompute and compare — if mismatch, ignore silently
//   4. On charge.success: cross-check amount against DB (max 1 kobo tolerance)
//   5. Idempotency: only process if paymentStatus is still PENDING
//
// ALWAYS return 200 — Paystack retries on any non-200 response.
// Log errors internally, never expose them in the response body.
//
// EVENT WE CARE ABOUT: charge.success
// Others (charge.failed etc.) are ignored — the booking stays
// PENDING and will be cleaned up by the cron job.
// ============================================================

import { NextResponse }  from 'next/server';
import crypto            from 'crypto';
import { PrismaClient }  from '@/generated/prisma';

const prisma = new PrismaClient();

// ── POST /api/checkout/webhook ────────────────────────────────────────────────
export async function POST(request) {
  try {
    // ── Read raw body — must be raw string for signature verification ─────────
    const rawBody  = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // ── SECURITY CHECK: Verify HMAC-SHA512 signature ──────────────────────────
    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      console.error('[webhook] Missing signature or secret key');
      return new Response('OK', { status: 200 });
    }

    const expectedSig = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigValid = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSig, 'hex'),
          Buffer.from(signature,   'hex')
        );
      } catch {
        return false;
      }
    })();

    if (!sigValid) {
      console.error('[webhook] Signature mismatch — ignoring');
      return new Response('OK', { status: 200 });
    }

    // ── Parse event ───────────────────────────────────────────────────────────
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error('[webhook] Failed to parse JSON body');
      return new Response('OK', { status: 200 });
    }

    const eventType = event.event;
    const data      = event.data;

    console.log('[webhook] Paystack event:', eventType, data?.reference);

    // ── Only handle charge.success ─────────────────────────────────────────
    // All other events (charge.failed, transfer.success etc.) are ignored here.
    // Transfer events for provider payouts are handled in the PIN verify route.
    if (eventType !== 'charge.success') {
      return new Response('OK', { status: 200 });
    }

    // ── Extract our reference (= pfPaymentToken = idempotency token) ──────────
    const reference = data?.reference;
    if (!reference) {
      console.error('[webhook] No reference in event data');
      return new Response('OK', { status: 200 });
    }

    // ── Also try to get bookingId from metadata ───────────────────────────────
    const metaBookingId = data?.metadata?.bookingId;

    // ── Find the booking ──────────────────────────────────────────────────────
    const booking = await prisma.booking.findFirst({
      where: metaBookingId
        ? { id: metaBookingId }
        : { pfPaymentToken: reference },
      select: {
        id:            true,
        status:        true,
        paymentStatus: true,
        totalCharged:  true,
        price:         true,
        providerId:    true,
      },
    });

    if (!booking) {
      console.error(`[webhook] Booking not found for reference: ${reference}`);
      return new Response('OK', { status: 200 });
    }

    // ── SECURITY CHECK: Amount cross-check ────────────────────────────────────
    // Paystack sends amount in kobo — convert back to rands for comparison
    const expectedRands  = booking.totalCharged > 0 ? booking.totalCharged : booking.price;
    const receivedRands  = (data?.amount ?? 0) / 100;

    if (Math.abs(receivedRands - expectedRands) > 0.01) {
      console.error(
        `[webhook] Amount mismatch on booking ${booking.id}:`,
        `expected R${expectedRands}, got R${receivedRands}`
      );
      return new Response('OK', { status: 200 });
    }

    // ── Idempotency guard — only confirm once ─────────────────────────────────
    if (booking.paymentStatus === 'PAID') {
      console.log(`[webhook] Booking ${booking.id} already PAID — skipping`);
      return new Response('OK', { status: 200 });
    }

    // ── Confirm the booking ───────────────────────────────────────────────────
    const paystackTxId = String(data?.id ?? reference);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status:        'CONFIRMED',
          paymentStatus: 'PAID',
          pfPaymentId:   paystackTxId,
        },
      }),
      prisma.payment.create({
        data: {
          bookingId:      booking.id,
          amount:         receivedRands,
          currency:       'ZAR',
          paymentMethod:  data?.channel ?? 'card',  // "card" | "bank" | "ussd" etc.
          transactionId:  paystackTxId,
          paymentIntentId: reference,
          status:         'PAID',
          paidAt:         new Date(),
        },
      }),
      prisma.providerProfile.update({
        where: { id: booking.providerId },
        data:  { totalBookings: { increment: 1 } },
      }),
    ]);

    console.log(`[webhook] ✓ Booking ${booking.id} confirmed — R${receivedRands}`);
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('[webhook] Handler error:', error);
    // Always 200 — Paystack will retry on non-200
    return new Response('OK', { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}