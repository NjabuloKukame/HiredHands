'use client';

// ============================================================
// FILE: app/booking/success/page.jsx
//
// Paystack redirects here after payment with:
//   ?booking_id=...&reference=...&trxref=...
//
// We poll /api/checkout/status for up to 36 seconds.
// If the webhook hasn't fired yet (e.g. no ngrok locally),
// the status route will also verify directly with Paystack
// using the reference from the URL as a fallback.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter }  from 'next/navigation';
import {
  Check, Loader2, AlertCircle,
  Calendar, Clock, User, Phone, ShieldCheck
} from 'lucide-react';

function fmtExact(amount) {
  if (!amount && amount !== 0) return 'R0.00';
  return `R${Number(amount).toFixed(2)}`;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const bookingId = searchParams.get('booking_id');
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [state,   setState]   = useState('loading');
  const [booking, setBooking] = useState(null);
  const pollCount             = useRef(0);
  const MAX_POLLS             = 18;
  const POLL_INTERVAL         = 2000;

  useEffect(() => {
    if (!bookingId) { setState('error'); return; }

    async function checkBooking() {
      try {
        // Pass reference so the status route can do a direct Paystack verify fallback
        const url = `/api/checkout/status?booking_id=${bookingId}${reference ? `&reference=${reference}` : ''}`;
        const res  = await fetch(url);
        const data = await res.json();

        if (!res.ok) { setState('error'); return; }

        if (data.booking.paymentStatus === 'PAID') {
          setBooking(data.booking);
          setState('success');
          return true; // stop polling
        }

        if (data.booking.status === 'CANCELLED') {
          setState('cancelled');
          return true;
        }

        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setBooking(data.booking);
          setState('pending');
          return true;
        }
      } catch {
        setState('error');
        return true;
      }
      return false;
    }

    checkBooking().then(done => {
      if (done) return;
      const interval = setInterval(async () => {
        const done = await checkBooking();
        if (done) clearInterval(interval);
      }, POLL_INTERVAL);
      return () => clearInterval(interval);
    });
  }, [bookingId, reference]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (state === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-bold">Confirming your payment...</p>
      </div>
    </div>
  );

  // ── Cancelled ─────────────────────────────────────────────────────────────
  if (state === 'cancelled') return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="p-4 bg-gray-100 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <h2 className="text-xl font-black mb-2">Payment Cancelled</h2>
          <p className="text-gray-400 font-medium text-sm">
            No payment was taken. You can try again whenever you're ready.
          </p>
        </div>
        <button onClick={() => router.back()}
          className="px-6 py-3 bg-black text-white rounded-2xl font-black text-sm hover:bg-gray-900 transition-all">
          Try Again
        </button>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (state === 'error') return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="p-4 bg-red-50 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-black mb-2">Something went wrong</h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            If your payment went through, your booking will be confirmed within a few minutes.
            Check your dashboard or contact support.
          </p>
        </div>
        <button onClick={() => router.push('/customer-dashboard')}
          className="px-6 py-3 bg-black text-white rounded-2xl font-black text-sm hover:bg-gray-900 transition-all">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // ── Pending ───────────────────────────────────────────────────────────────
  if (state === 'pending') return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="p-4 bg-amber-50 rounded-2xl">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-black mb-2">Payment Processing</h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            Your payment is being processed. Your booking will be confirmed within a few minutes
            and you'll receive a confirmation email shortly.
          </p>
        </div>
        <button onClick={() => router.push('/customer-dashboard')}
          className="px-6 py-3 bg-black text-white rounded-2xl font-black text-sm hover:bg-gray-900 transition-all">
          View My Bookings
        </button>
      </div>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="max-w-sm w-full space-y-8">

        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 font-medium text-sm">
            Confirmation sent to {booking?.customerEmail}
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
          <div className="pb-4 border-b border-gray-200">
            <p className="font-black">{booking?.serviceName}</p>
            <p className="text-xs text-gray-400 font-bold mt-0.5">{booking?.providerName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                <p className="font-black">{booking?.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Time</p>
                <p className="font-black">{booking?.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Name</p>
                <p className="font-black truncate">{booking?.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                <p className="font-black">{booking?.customerPhone}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Payment Breakdown
            </p>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">
                {booking?.paymentType === 'full' ? 'Service + booking fee' : 'Booking fee'}
              </span>
              <span className="font-bold">{fmtExact(booking?.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                Platform fee
                <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">8%</span>
              </span>
              <span className="font-bold">{fmtExact(booking?.platformFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-black">Total paid</span>
              <span className="font-black text-lg">{fmtExact(booking?.totalCharged)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">What happens next</p>
          </div>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Your payment is held securely until the day of your appointment.
            When the provider arrives, they'll show you a verification PIN — enter it in your app
            to confirm the service is underway. Payment is only released to the provider at that point.
          </p>
        </div>

        {booking?.id && (
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Ref: {booking.id.slice(-8).toUpperCase()}
          </p>
        )}

        <button
          onClick={() => router.push('/customer-dashboard')}
          className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-gray-900 transition-all">
          View My Bookings
        </button>
      </div>
    </div>
  );
}