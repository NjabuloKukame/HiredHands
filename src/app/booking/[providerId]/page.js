'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, Clock, CreditCard, Check, ArrowLeft, 
  ArrowRight, User, MapPin, Star, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function BookingFlow() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: searchParams.get('service') || '',
    date: '',
    time: '',
    notes: '',
    customerInfo: { name: '', email: '', phone: '' },
    paymentMethod: 'card'
  });

  const provider = {
    name: 'Ntombi Dlamini',
    title: 'Professional Hair Stylist',
    rating: 4.9,
    reviews: 127,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    services: [
      { id: '1', name: 'Haircut & Style', duration: '60 min', price: 650 },
      { id: '2', name: 'Full Color', duration: '120 min', price: 1200 },
      { id: '3', name: 'Highlights', duration: '90 min', price: 950 },
    ]
  };

  const selectedService = useMemo(() => 
    provider.services.find(s => s.id === bookingData.serviceId) || provider.services[0],
    [bookingData.serviceId, provider.services]
  );

  const availableDates = [
    { date: '2026-02-18', day: 'Wed', dayNum: '18' },
    { date: '2026-02-19', day: 'Thu', dayNum: '19' },
    { date: '2026-02-20', day: 'Fri', dayNum: '20' },
    { date: '2026-02-21', day: 'Sat', dayNum: '21' },
    { date: '2026-02-23', day: 'Mon', dayNum: '23' },
  ];

  const availableTimes = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

  const handleNext = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tighter">Choose a service</h2>
            <div className="grid gap-3">
              {provider.services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setBookingData({ ...bookingData, serviceId: s.id })}
                  className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${
                    bookingData.serviceId === s.id ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold">{s.name}</p>
                    <p className={`text-xs ${bookingData.serviceId === s.id ? 'text-gray-400' : 'text-gray-500'}`}>{s.duration}</p>
                  </div>
                  <span className="font-black">R{s.price}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-4">Select Date</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {availableDates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setBookingData({ ...bookingData, date: d.date })}
                    className={`shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                      bookingData.date === d.date ? 'border-black bg-black text-white' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black mb-1">{d.day}</span>
                    <span className="text-lg font-black">{d.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            {bookingData.date && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <h2 className="text-2xl font-black tracking-tighter mb-4">Available Times</h2>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setBookingData({ ...bookingData, time: t })}
                      className={`py-4 rounded-xl font-bold border-2 transition-all ${
                        bookingData.time === t ? 'border-black bg-black text-white' : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Your Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                <input 
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                  placeholder="e.g. Jane Doe"
                  value={bookingData.customerInfo.name}
                  onChange={(e) => setBookingData({...bookingData, customerInfo: {...bookingData.customerInfo, name: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                <input 
                  type="tel"
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                  placeholder="081 234 5678"
                  value={bookingData.customerInfo.phone}
                  onChange={(e) => setBookingData({...bookingData, customerInfo: {...bookingData.customerInfo, phone: e.target.value}})}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Confirm & Pay</h2>
            <div className="p-6 rounded-4xl bg-gray-50 border-2 border-gray-100 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="font-bold">{selectedService.name}</span>
                <span className="font-black text-xl">R{selectedService.price}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Date</p>
                  <p className="font-black">{bookingData.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Time</p>
                  <p className="font-black">{bookingData.time}</p>
                </div>
              </div>
            </div>
            
            <button className="w-full p-5 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
              <ShieldCheck className="w-5 h-5" />
              Pay R{selectedService.price} Now
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-10">
      {/* 1. Slim Header */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5"/></button>
          <span className="font-black tracking-tighter">BOOKING</span>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-xl mx-auto">
        {/* 2. Step Progress (Mobile Friendly) */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Step {currentStep} of 4</span>
            <span className="text-sm font-black">{currentStep === 4 ? 'Ready!' : 'Almost there'}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-full flex-1 transition-all duration-500 ${currentStep >= s ? 'bg-black' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* 3. Provider Summary Card (Minimized) */}
        <div className="flex items-center gap-4 mb-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <img src={provider.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
          <div>
            <h3 className="font-black text-sm">{provider.name}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{provider.title}</p>
          </div>
        </div>

        {/* 4. Content Area */}
        <div className="min-h-100">
          {renderStepContent()}
        </div>

        {/* 5. Navigation Bottom Bar */}
        <div className="mt-12 flex gap-3">
          {currentStep > 1 && (
            <button 
              onClick={handlePrevious}
              className="px-8 py-5 rounded-2xl border-2 border-gray-100 font-black text-sm hover:border-black transition-all"
            >
              Back
            </button>
          )}
          {currentStep < 4 && (
            <button 
              onClick={handleNext}
              disabled={(currentStep === 1 && !bookingData.serviceId) || (currentStep === 2 && !bookingData.time)}
              className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:bg-gray-200"
            >
              Continue <ChevronRight className="w-4 h-4"/>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}