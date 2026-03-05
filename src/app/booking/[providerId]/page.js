'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, Check, ArrowLeft, User,
  ShieldCheck, ChevronRight, Loader2, AlertCircle,
  CreditCard, Wallet, Phone, FileText, Briefcase
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Round up float → int for display (99.99 → R100)
function fmt(amount) {
  return `R${Math.ceil(amount).toLocaleString('en-ZA')}`;
}

// Sanitise text input on the client side before sending
function sanitise(value) {
  return (value ?? '').trim().replace(/\s+/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');
}

// Generate next 14 days that match the provider's available days
function generateAvailableDates(weeklySlots) {
  const days = [];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const availableDayNumbers = new Set(
    (weeklySlots ?? []).map(s => {
      const idx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(s.day);
      return idx;
    }).filter(n => n >= 0)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (availableDayNumbers.size === 0 || availableDayNumbers.has(d.getDay())) {
      days.push({
        date:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
        day:    DAY_NAMES[d.getDay()],
        dayNum: String(d.getDate()),
      });
    }
    if (days.length >= 7) break;
  }
  return days;
}

// Generate time slots for a selected date from the weekly schedule
function generateTimeSlotsForDate(dateStr, weeklySlots) {
  if (!dateStr || !weeklySlots?.length) return [];
  // Parse date parts directly to avoid UTC-vs-local timezone shift
  // new Date("2026-03-04") is UTC midnight which in UTC+2 becomes the previous day
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day); // local midnight — no timezone shift
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  const slot = weeklySlots.find(s => s.day === dayName);
  if (!slot) return [];

  const times = [];
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end   = eh * 60 + em;
  while (current + 60 <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += 60;
  }
  return times;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current, total }) {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Step {current} of {total}
        </span>
        <span className="text-sm font-black">
          {current === total ? 'Ready!' : 'Almost there'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i}
            className={`h-full flex-1 transition-all duration-500 rounded-full ${current > i ? 'bg-black' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

// ── Provider summary card ─────────────────────────────────────────────────────
function ProviderCard({ provider }) {
  return (
    <div className="flex items-center gap-4 mb-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      {provider.avatar
        ? <img src={provider.avatar} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
        : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-gray-400" />
          </div>}
      <div className="min-w-0">
        <h3 className="font-black text-sm truncate">{provider.businessName}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          {provider.rating > 0 && (
            <span className="text-xs font-bold text-gray-500">★ {provider.rating.toFixed(1)}</span>
          )}
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{provider.location}</span>
        </div>
      </div>
      <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 ml-auto" />
    </div>
  );
}

// ── Inline field error ────────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {message}
    </p>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingFlow() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.providerId;

  const [provider, setProvider]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [confirmed, setConfirmed]     = useState(null); // { id, date, time, price }

  const [bookingData, setBookingData] = useState({
    serviceId: '',
    date:      '',
    time:      '',
    notes:     '',
    customerInfo: { name: '', phone: '' },
  });

  // Per-field validation errors (only shown after user tries to proceed)
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch provider ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/providers/${providerId}`);
        if (!res.ok) throw new Error('Provider not found');
        const data = await res.json();
        setProvider(data);
        // Pre-select first service
        if (data.services?.length) {
          setBookingData(b => ({ ...b, serviceId: data.services[0].id }));
        }
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const selectedService = useMemo(() =>
    provider?.services?.find(s => s.id === bookingData.serviceId) ?? provider?.services?.[0] ?? null,
  [bookingData.serviceId, provider]);

  const availableDates = useMemo(() =>
    provider ? generateAvailableDates(provider.availability?.weekly) : [],
  [provider]);

  const availableTimes = useMemo(() =>
    generateTimeSlotsForDate(bookingData.date, provider?.availability?.weekly),
  [bookingData.date, provider]);

  const bookingFee    = provider?.bookingFee ?? 0;
  const servicePrice  = selectedService?.price ?? 0;
  const totalPrice    = servicePrice + bookingFee;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep = (step) => {
    const errors = {};
    if (step === 1 && !bookingData.serviceId) errors.serviceId = 'Please select a service.';
    if (step === 2) {
      if (!bookingData.date) errors.date = 'Please select a date.';
      if (!bookingData.time) errors.time = 'Please select a time.';
    }
    if (step === 3) {
      const name  = sanitise(bookingData.customerInfo.name);
      const phone = sanitise(bookingData.customerInfo.phone);
      if (!name)  errors.name  = 'Your name is required.';
      else if (name.length < 2) errors.name = 'Please enter your full name.';
      if (!phone) errors.phone = 'Your phone number is required.';
      else if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) errors.phone = 'Please enter a valid phone number.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(s => s + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(s => s - 1);
    setFieldErrors({});
    setSubmitError('');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (paymentType) => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          serviceId:     bookingData.serviceId,
          date:          bookingData.date,
          time:          bookingData.time,
          notes:         sanitise(bookingData.notes),
          paymentType,   // "full" | "booking_fee"
          customerName:  sanitise(bookingData.customerInfo.name),
          customerPhone: sanitise(bookingData.customerInfo.phone),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setSubmitError(data.message || 'Something went wrong.'); return; }

      setConfirmed(data.booking);
      setCurrentStep(5); // confirmation screen
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-bold text-slate-600">{fetchError}</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold">Go Back</button>
      </div>
    </div>
  );

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (currentStep === 5 && confirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500 font-medium">Your booking request has been sent to the provider.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">Service</span>
              <span className="font-black">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">Date</span>
              <span className="font-black">{confirmed.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">Time</span>
              <span className="font-black">{confirmed.time}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="text-gray-500 font-bold">Amount charged</span>
              <span className="font-black text-lg">{fmt(confirmed.price)}</span>
            </div>
          </div>
          <button onClick={() => router.push('/customer-dashboard')}
            className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-gray-900 transition-all">
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // ── Step content ───────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {

      // ── Step 1: Select service ─────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tighter">Choose a service</h2>
            {fieldErrors.serviceId && <FieldError message={fieldErrors.serviceId} />}
            <div className="grid gap-3">
              {provider.services.map(s => (
                <button key={s.id}
                  onClick={() => { setBookingData(b => ({ ...b, serviceId: s.id })); setFieldErrors({}); }}
                  className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${
                    bookingData.serviceId === s.id ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}>
                  <div className="text-left">
                    <p className="font-bold">{s.name}</p>
                    <p className={`text-xs font-medium ${bookingData.serviceId === s.id ? 'text-gray-400' : 'text-gray-500'}`}>
                      {s.duration} · {s.category}
                    </p>
                  </div>
                  <span className="font-black shrink-0 ml-4">{fmt(s.price)}</span>
                </button>
              ))}
            </div>
            {bookingFee > 0 && (
              <p className="text-xs text-gray-400 font-medium text-center pt-2">
                + {fmt(bookingFee)} booking fee applies
              </p>
            )}
          </div>
        );

      // ── Step 2: Select date + time ─────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-4">Select Date</h2>
              {fieldErrors.date && <FieldError message={fieldErrors.date} />}
              {availableDates.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {availableDates.map(d => (
                    <button key={d.date}
                      onClick={() => { setBookingData(b => ({ ...b, date: d.date, time: '' })); setFieldErrors(e => ({ ...e, date: '' })); }}
                      className={`shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                        bookingData.date === d.date ? 'border-black bg-black text-white' : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}>
                      <span className="text-[10px] uppercase font-black mb-1">{d.day}</span>
                      <span className="text-lg font-black">{d.dayNum}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-medium py-4">No available dates found. Contact the provider directly.</p>
              )}
            </div>

            {bookingData.date && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <h2 className="text-2xl font-black tracking-tighter mb-4">Available Times</h2>
                {fieldErrors.time && <FieldError message={fieldErrors.time} />}
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(t => (
                      <button key={t}
                        onClick={() => { setBookingData(b => ({ ...b, time: t })); setFieldErrors(e => ({ ...e, time: '' })); }}
                        className={`py-4 rounded-xl font-bold border-2 transition-all ${
                          bookingData.time === t ? 'border-black bg-black text-white' : 'border-gray-100 bg-white hover:border-gray-300'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-medium">No time slots available for this day.</p>
                )}
              </div>
            )}
          </div>
        );

      // ── Step 3: Customer info + notes ──────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Your Information</h2>
            <div className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    className={`w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 border-2 transition-all outline-none ${
                      fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-black focus:bg-white'
                    }`}
                    placeholder="e.g. Sipho Dlamini"
                    maxLength={80}
                    value={bookingData.customerInfo.name}
                    onChange={e => {
                      setBookingData(b => ({ ...b, customerInfo: { ...b.customerInfo, name: e.target.value } }));
                      if (fieldErrors.name) setFieldErrors(er => ({ ...er, name: '' }));
                    }}
                  />
                </div>
                <FieldError message={fieldErrors.name} />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="tel"
                    className={`w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 border-2 transition-all outline-none ${
                      fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-black focus:bg-white'
                    }`}
                    placeholder="081 234 5678"
                    maxLength={20}
                    value={bookingData.customerInfo.phone}
                    onChange={e => {
                      // Only allow digits, spaces, +, -, (, )
                      const cleaned = e.target.value.replace(/[^\d\s+\-()]/g, '');
                      setBookingData(b => ({ ...b, customerInfo: { ...b.customerInfo, phone: cleaned } }));
                      if (fieldErrors.phone) setFieldErrors(er => ({ ...er, phone: '' }));
                    }}
                  />
                </div>
                <FieldError message={fieldErrors.phone} />
              </div>

              {/* Notes — optional */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Notes <span className="text-gray-300 font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                  <textarea
                    rows={3}
                    maxLength={500}
                    className="w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none resize-none text-sm"
                    placeholder="Any special requests or details for the provider..."
                    value={bookingData.notes}
                    onChange={e => setBookingData(b => ({ ...b, notes: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium text-right">{bookingData.notes.length}/500</p>
              </div>
            </div>
          </div>
        );

      // ── Step 4: Review + pay ───────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Confirm & Pay</h2>

            {/* Booking summary */}
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <p className="font-black">{selectedService?.name}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{selectedService?.duration}</p>
                </div>
                <span className="font-black text-xl shrink-0 ml-4">{fmt(servicePrice)}</span>
              </div>

              {bookingFee > 0 && (
                <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-500 font-bold">Booking fee</span>
                  <span className="font-black">{fmt(bookingFee)}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Date</p>
                  <p className="font-black">{bookingData.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Time</p>
                  <p className="font-black">{bookingData.time}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Name</p>
                  <p className="font-black truncate">{sanitise(bookingData.customerInfo.name)}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Phone</p>
                  <p className="font-black">{bookingData.customerInfo.phone}</p>
                </div>
              </div>

              {bookingData.notes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Notes</p>
                  <p className="text-sm text-gray-600 font-medium">{sanitise(bookingData.notes)}</p>
                </div>
              )}
            </div>

            {/* Global submit error */}
            {submitError && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {submitError}
              </div>
            )}

            {/* Payment buttons */}
            <div className="space-y-3">
              {/* Primary: pay full total (service + booking fee) */}
              <button
                onClick={() => handleSubmit('full')}
                disabled={submitting}
                className="w-full p-5 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <CreditCard className="w-5 h-5" />}
                Pay {fmt(totalPrice)} Now
                {bookingFee > 0 && (
                  <span className="text-emerald-200 text-xs font-bold ml-1">(incl. booking fee)</span>
                )}
              </button>

              {/* Secondary: pay booking fee only (only shown if bookingFee > 0) */}
              {bookingFee > 0 && (
                <button
                  onClick={() => handleSubmit('booking_fee')}
                  disabled={submitting}
                  className="w-full p-5 bg-white border-2 border-gray-200 text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:border-black active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Wallet className="w-5 h-5" />}
                  Pay Booking Fee Only · {fmt(bookingFee)}
                </button>
              )}
            </div>

            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Secure booking · No hidden charges
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-10">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={currentStep === 1 ? () => router.back() : handlePrevious}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-black tracking-tighter">BOOKING</span>
          <div className="w-9" />
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-xl mx-auto">
        <StepBar current={currentStep} total={4} />
        <ProviderCard provider={provider} />

        <div className="min-h-96">
          {renderStep()}
        </div>

        {/* Bottom nav — hidden on step 4 (payment buttons handle submission) */}
        {currentStep < 4 && (
          <div className="mt-12 flex gap-3">
            {currentStep > 1 && (
              <button onClick={handlePrevious}
                className="px-8 py-5 rounded-2xl border-2 border-gray-100 font-black text-sm hover:border-black transition-all">
                Back
              </button>
            )}
            <button onClick={handleNext}
              className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back button on step 4 */}
        {currentStep === 4 && (
          <button onClick={handlePrevious}
            className="mt-4 w-full px-8 py-4 rounded-2xl border-2 border-gray-100 font-black text-sm hover:border-black transition-all">
            ← Back
          </button>
        )}
      </main>
    </div>
  );
}