'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, MapPin, Clock, Calendar, Heart, Share2,
  ChevronLeft, ChevronRight, CheckCircle2, MessageCircle,
  ShieldCheck, Loader2, AlertCircle, Globe, Briefcase, User
} from 'lucide-react';

// ── Price: round up float → int (99.99 → R100, 450.0 → R450) ─────────────────
function fmt(amount) {
  return `R${Math.ceil(amount).toLocaleString('en-ZA')}`;
}

// ── Mobile-only carousel (auto-advances + swipe + dots) ──────────────────────
function MobileCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const dragStart = useRef(null);
  const count = images.length;

  const goTo = useCallback((idx) => setCurrent((idx + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => goTo(current + 1), 4000);
    return () => clearInterval(timerRef.current);
  }, [current, count, goTo]);

  const onStart = (x) => { clearInterval(timerRef.current); dragStart.current = x; };
  const onEnd   = (x) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - x;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
    dragStart.current = null;
  };

  return (
    <div className="relative w-full h-full select-none"
      onMouseDown={e => onStart(e.clientX)} onMouseUp={e => onEnd(e.clientX)}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchEnd={e => onEnd(e.changedTouches[0].clientX)}>
      {images.map((img, i) => (
        <div key={img.id ?? i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={img.imageUrl} className="w-full h-full object-cover" alt={img.title || ''} draggable={false} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      {count > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="relative pt-20 md:pt-24 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[50vh] md:h-[70vh]">
          <div className="md:col-span-8 rounded-[2.5rem] bg-gray-100 animate-pulse" />
          <div className="hidden md:flex md:col-span-4 flex-col gap-6">
            <div className="flex-1 rounded-[2.5rem] bg-gray-100 animate-pulse" />
            <div className="flex-1 rounded-[2.5rem] bg-gray-100 animate-pulse" />
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-5 md:px-10 mt-12 space-y-6">
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [provider, setProvider]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited]   = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDay, setSelectedDay]   = useState('today');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/providers/${params.id}`);
        if (res.status === 404) { router.push('/search'); return; }
        if (!res.ok) throw new Error('Failed to load provider');
        setProvider(await res.json());
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <div className="p-4 bg-red-50 rounded-2xl"><AlertCircle className="h-8 w-8 text-red-400" /></div>
        <p className="font-bold text-slate-600">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold">Go Back</button>
      </div>
    </div>
  );

  // Portfolio — fall back to coverImage, then empty
  const portfolioImages = provider.portfolio?.length > 0
    ? provider.portfolio
    : provider.coverImage
      ? [{ id: 'cover', imageUrl: provider.coverImage, title: provider.businessName }]
      : [];

  const activeSlots = (selectedDay === 'today'
    ? provider.availability?.today?.slots
    : provider.availability?.tomorrow?.slots) ?? [];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-20">

      {/* ── 1. Hero Gallery ── */}
      <section className="relative pt-20 md:pt-24 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[50vh] md:h-[70vh]">

          {/* Main image */}
          <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group">
            {/* Mobile: auto-advancing carousel */}
            <div className="md:hidden w-full h-full">
              {portfolioImages.length > 0
                ? <MobileCarousel images={portfolioImages} />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-[2.5rem]">
                    <Briefcase className="w-16 h-16 text-gray-200" />
                  </div>}
            </div>

            {/* Desktop: static with thumbnail switching */}
            <div className="hidden md:block w-full h-full">
              {portfolioImages[selectedImageIndex]?.imageUrl
                ? <img src={portfolioImages[selectedImageIndex].imageUrl}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Work" />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Briefcase className="w-16 h-16 text-gray-200" />
                  </div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Favourite + share */}
            <div className="absolute bottom-8 left-8 flex gap-2 z-10">
              <button onClick={() => setIsFavorited(!isFavorited)}
                className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`} />
              </button>
              <button className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Side thumbnails — desktop only, original layout */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-6">
            {portfolioImages.slice(1, 3).map((img, i) => (
              <div key={img.id ?? i}
                className="flex-1 rounded-[2.5rem] overflow-hidden relative group cursor-pointer"
                onClick={() => setSelectedImageIndex(i + 1)}>
                <img src={img.imageUrl}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className={`absolute inset-0 transition-colors ${selectedImageIndex === i + 1 ? 'bg-black/10' : 'bg-black/20 group-hover:bg-transparent'}`} />
              </div>
            ))}
            {portfolioImages.length < 2 && <div className="flex-1 rounded-[2.5rem] bg-gray-50" />}
            {portfolioImages.length < 3 && <div className="flex-1 rounded-[2.5rem] bg-gray-50" />}
          </div>
        </div>
      </section>

      {/* ── 2. Content Grid ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left Column */}
        <div className="lg:col-span-8 space-y-16">

          {/* Header */}
          <div className="border-b border-gray-100 pb-12">
            <div className="flex items-center gap-6 mb-6">
              {provider.avatar
                ? <img src={provider.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50" alt="" />
                : <div className="w-24 h-24 rounded-full bg-gray-100 ring-4 ring-gray-50 flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-4xl font-black tracking-tighter">{provider.businessName}</h1>
                  <ShieldCheck className="w-6 h-6 text-blue-500 fill-blue-50/50" />
                </div>
                <p className="text-xl text-gray-400 font-medium">{provider.ownerName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                </div>
                {provider.totalReviews > 0 && (
                  <span className="text-sm font-bold text-gray-400">{provider.totalReviews} reviews</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-widest">
                <MapPin className="w-4 h-4" /> {provider.location}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Responds in {provider.responseTimeHours <= 1 ? '1hr' : `${provider.responseTimeHours}hrs`}
              </div>
              {provider.experienceYears && (
                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-widest">
                  <Briefcase className="w-4 h-4" /> {provider.experienceYears}+ yrs exp
                </div>
              )}
            </div>

            {provider.languages?.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Globe className="w-4 h-4 text-gray-400" />
                {provider.languages.map(lang => (
                  <span key={lang} className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold rounded-full">{lang}</span>
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <section>
            <h2 className="text-2xl font-black tracking-tighter mb-6">Business Description</h2>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">{provider.bio}</p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-black tracking-tighter mb-8">Service Menu</h2>
            <div className="space-y-4">
              {provider.services.map(s => (
                <div key={s.id}
                  className="group flex justify-between items-center p-8 rounded-[2rem] bg-gray-50 hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
                  <div className="max-w-md">
                    <h3 className="text-xl font-black mb-2">{s.name}</h3>
                    <p className="text-sm opacity-60 font-medium">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black mb-1">{fmt(s.price)}</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">{s.duration}</p>
                  </div>
                </div>
              ))}

              {/* Booking fee — only if > 0 */}
              {provider.bookingFee > 0 && (
                <div className="flex justify-between items-center p-6 rounded-[2rem] border border-dashed border-gray-200 text-gray-500">
                  <div>
                    <p className="font-black text-sm text-gray-700">Booking Fee</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Charged per booking, on top of service price</p>
                  </div>
                  <p className="text-2xl font-black text-gray-700">{fmt(provider.bookingFee)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Weekly schedule */}
          {provider.availability?.weekly?.length > 0 && (
            <section>
              <h2 className="text-2xl font-black tracking-tighter mb-6">Weekly Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.availability.weekly.map((slot, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 bg-gray-50 rounded-2xl">
                    <span className="font-black text-sm">{slot.day}</span>
                    <span className="text-sm font-bold text-gray-500">{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {provider.reviews?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black tracking-tighter">Reviews</h2>
                <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-black flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" /> {provider.rating.toFixed(1)}
                </div>
              </div>
              <div className="space-y-4">
                {provider.reviews.map(r => (
                  <div key={r.id} className="p-6 bg-gray-50 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-3">
                      {r.customer.avatar
                        ? <img src={r.customer.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>}
                      <div>
                        <p className="font-black text-sm">{r.customer.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{r.date}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-black text-black' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: Booking Widget — sticky top-32, original style ── */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
            <h3 className="text-xl font-black tracking-tighter mb-6">Secure a Slot</h3>

            <div className="space-y-6">

              {/* Booking fee notice */}
              {provider.bookingFee > 0 ? (
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl text-sm">
                  <span className="text-gray-500 font-medium">Booking fee</span>
                  <span className="font-black">{fmt(provider.bookingFee)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-black">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> No booking fee
                </div>
              )}

              {/* Day toggle */}
              <div className="flex gap-2">
                {['today', 'tomorrow'].map(day => (
                  <button key={day}
                    onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-black capitalize transition-all ${
                      selectedDay === day ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {provider.availability?.[day]?.label ?? day}
                  </button>
                ))}
              </div>

              {/* Time slots */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Available {selectedDay === 'today' ? 'Today' : 'Tomorrow'}
                </p>
                {activeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeSlots.map(time => (
                      <button key={time} onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-2xl border text-sm font-black transition-all ${
                          selectedTime === time
                            ? 'bg-black border-black text-white'
                            : 'border-gray-100 hover:border-black'
                        }`}>
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400 font-medium py-2">
                    No slots available — book a custom time below.
                  </p>
                )}
              </div>

              {/* CTA — original style */}
              <div className="pt-6 border-t border-gray-50">
                <button onClick={() => router.push(`/booking/${params.id}`)}
                  className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5" /> Book Session
                </button>
                <button className="w-full mt-3 bg-gray-50 text-black py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Message {provider.ownerName?.split(' ')[0]}
                </button>
              </div>

              <div className="flex items-center gap-3 justify-center text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">No upfront payment required</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}