// ============================================================
// FILE: app/api/checkout/webhook/route.js
// ============================================================

import { NextResponse }  from 'next/server';
import crypto            from 'crypto';
import { PrismaClient }  from '@/generated/prisma';
import { sendBookingConfirmation, sendProviderBookingAlert } from '@/app/lib/email';

const prisma = new PrismaClient();

const SUCCESS_CODES = new Set(['000.000.000', '000.100.110']);
const PENDING_CODES = /^(000\.200\.|000\.400\.)/;

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const rawBody   = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      console.error('[webhook] Missing signature or secret key');
      return new Response('OK', { status: 200 });
    }

    if (!verifySignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY)) {
      console.error('[webhook] Signature mismatch — ignoring');
      return new Response('OK', { status: 200 });
    }

    let event;
    try { event = JSON.parse(rawBody); }
    catch { return new Response('OK', { status: 200 }); }

    const eventType = event.event;
    const data      = event.data;

    console.log('[webhook] Paystack event:', eventType, data?.reference);

    if (eventType !== 'charge.success') {
      return new Response('OK', { status: 200 });
    }

    const reference     = data?.reference;
    const metaBookingId = data?.metadata?.bookingId;

    if (!reference) {
      console.error('[webhook] No reference in event data');
      return new Response('OK', { status: 200 });
    }

    // Fetch booking with all data needed for emails
    const booking = await prisma.booking.findFirst({
      where: metaBookingId
        ? { id: metaBookingId }
        : { pfPaymentToken: reference },
      select: {
        id:            true,
        status:        true,
        paymentStatus: true,
        totalCharged:  true,
        subtotal:      true,
        platformFee:   true,
        price:         true,
        paymentType:   true,
        notes:         true,
        date:          true,
        time:          true,
        providerId:    true,
        customerName:  true,
        customerEmail: true,
        customerPhone: true,
        service:       { select: { name: true } },
        provider: {
          select: {
            businessName: true,
            user:         { select: { email: true } },
          },
        },
      },
    });

    if (!booking) {
      console.error(`[webhook] Booking not found for reference: ${reference}`);
      return new Response('OK', { status: 200 });
    }

    // Amount cross-check
    const expectedRands = booking.totalCharged > 0 ? booking.totalCharged : booking.price;
    const receivedRands = (data?.amount ?? 0) / 100;

    if (Math.abs(receivedRands - expectedRands) > 0.01) {
      console.error(`[webhook] Amount mismatch on booking ${booking.id}: expected R${expectedRands}, got R${receivedRands}`);
      return new Response('OK', { status: 200 });
    }

    // Idempotency — only process once
    if (booking.paymentStatus === 'PAID') {
      console.log(`[webhook] Booking ${booking.id} already PAID — skipping`);
      return new Response('OK', { status: 200 });
    }

    const paystackTxId = String(data?.id ?? reference);

    // Confirm booking in DB
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
          bookingId:       booking.id,
          amount:          receivedRands,
          currency:        'ZAR',
          paymentMethod:   data?.channel ?? 'card',
          transactionId:   paystackTxId,
          paymentIntentId: reference,
          status:          'PAID',
          paidAt:          new Date(),
        },
      }),
      prisma.providerProfile.update({
        where: { id: booking.providerId },
        data:  { totalBookings: { increment: 1 } },
      }),
    ]);

    console.log(`[webhook] ✓ Booking ${booking.id} confirmed — R${receivedRands}`);

    // ── Send emails — after DB commit, non-blocking ───────────────────────────
    // Format date for emails
    const formattedDate = new Date(booking.date).toLocaleDateString('en-ZA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const totalCharged = booking.totalCharged > 0 ? booking.totalCharged : booking.price;
    const subtotal     = booking.subtotal     > 0 ? booking.subtotal     : booking.price;
    const platformFee  = booking.platformFee  > 0 ? booking.platformFee  : 0;

    // Fire both emails in parallel — don't await, don't block the webhook response
    Promise.all([
      sendBookingConfirmation({
        bookingId:     booking.id,
        customerName:  booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName:   booking.service.name,
        providerName:  booking.provider.businessName,
        date:          formattedDate,
        time:          booking.time,
        subtotal,
        platformFee,
        totalCharged,
        paymentType:   booking.paymentType ?? 'booking_fee',
      }),
      sendProviderBookingAlert({
        bookingId:     booking.id,
        providerEmail: booking.provider.user.email,
        providerName:  booking.provider.businessName,
        customerName:  booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceName:   booking.service.name,
        date:          formattedDate,
        time:          booking.time,
        subtotal,
        paymentType:   booking.paymentType ?? 'booking_fee',
        notes:         booking.notes ?? null,
      }),
    ]).catch(err => console.error('[webhook] Email send error:', err));

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('[webhook] Handler error:', error);
    return new Response('OK', { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}