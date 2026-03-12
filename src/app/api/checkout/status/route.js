// ============================================================
// FILE: app/api/checkout/status/route.js
//
// Polled by the success page. If the booking is still PENDING
// and a Paystack reference is provided, we verify directly
// with Paystack as a fallback (handles the case where the
// webhook couldn't reach localhost during local development).
// ============================================================

import { NextResponse }  from 'next/server';
import jwt               from 'jsonwebtoken';
import { PrismaClient }  from '@/generated/prisma';

const prisma = new PrismaClient();

function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
}

function resolveAmount(booking) {
  return booking.totalCharged > 0 ? booking.totalCharged : booking.price;
}

export async function GET(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded)
      return NextResponse.json({ message: 'Unauthorised.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookingId  = searchParams.get('booking_id');
    const reference  = searchParams.get('reference'); // Paystack reference from redirect URL

    if (!bookingId)
      return NextResponse.json({ message: 'Missing booking_id.' }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        id:            true,
        customerId:    true,
        status:        true,
        paymentStatus: true,
        date:          true,
        time:          true,
        subtotal:      true,
        platformFee:   true,
        gatewayFee:    true,
        totalCharged:  true,
        price:         true,
        paymentType:   true,
        pfPaymentToken: true,
        customerName:  true,
        customerEmail: true,
        customerPhone: true,
        providerId:    true,
        service:       { select: { name: true } },
        provider:      { select: { businessName: true } },
      },
    });

    if (!booking)
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });

    if (booking.customerId !== decoded.userId)
      return NextResponse.json({ message: 'Not authorised.' }, { status: 403 });

    // ── Paystack direct verify fallback ───────────────────────────────────────
    // If booking is still PENDING and we have a reference, verify with Paystack
    // directly. This handles local dev where webhook can't reach localhost.
    if (booking.paymentStatus !== 'PAID' && reference) {
      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );
        const verifyData = await verifyRes.json();

        if (verifyData.status && verifyData.data?.status === 'success') {
          const expectedAmount = resolveAmount(booking);
          const receivedAmount = (verifyData.data.amount ?? 0) / 100;

          // Amount cross-check — same security rule as webhook
          if (Math.abs(receivedAmount - expectedAmount) <= 0.01) {
            const txId = String(verifyData.data.id ?? reference);

            // Confirm the booking directly (webhook already might have failed)
            await prisma.$transaction([
              prisma.booking.update({
                where: { id: bookingId },
                data: {
                  status:        'CONFIRMED',
                  paymentStatus: 'PAID',
                  pfPaymentId:   txId,
                },
              }),
              // Only create payment record if it doesn't already exist
              prisma.payment.upsert({
                where:  { bookingId },
                update: {},  // don't overwrite if already exists
                create: {
                  bookingId,
                  amount:          receivedAmount,
                  currency:        'ZAR',
                  paymentMethod:   verifyData.data.channel ?? 'card',
                  transactionId:   txId,
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

            // Update local booking object to reflect new state
            booking.status        = 'CONFIRMED';
            booking.paymentStatus = 'PAID';
          }
        }
      } catch (verifyError) {
        // Verify failed — not fatal, just return current DB state
        console.error('[status] Paystack verify error:', verifyError);
      }
    }

    // ── Return booking data ───────────────────────────────────────────────────
    const totalCharged = resolveAmount(booking);
    const subtotal     = booking.subtotal     > 0 ? booking.subtotal    : booking.price;
    const platformFee  = booking.platformFee  > 0 ? booking.platformFee : 0;

    return NextResponse.json({
      booking: {
        id:            booking.id,
        status:        booking.status,
        paymentStatus: booking.paymentStatus,
        date:          new Date(booking.date).toLocaleDateString('en-ZA', {
                         weekday: 'long', day: 'numeric',
                         month:   'long', year: 'numeric',
                       }),
        time:          booking.time,
        serviceName:   booking.service.name,
        providerName:  booking.provider.businessName,
        customerName:  booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        paymentType:   booking.paymentType,
        subtotal,
        platformFee,
        gatewayFee:    booking.gatewayFee ?? 0,
        totalCharged,
      },
    });

  } catch (error) {
    console.error('[checkout/status] GET error:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}