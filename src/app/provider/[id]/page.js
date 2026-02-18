'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, MapPin, Clock, Calendar, Heart, Share2, 
  ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, ShieldCheck 
} from 'lucide-react';

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock data preserved from your snippet
  const provider = {
    name: 'Ntombi Dlamini',
    title: 'Professional Hair Stylist & Colorist',
    rating: 4.9,
    totalReviews: 127,
    location: 'Nelspruit, Mpumalanga',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'With over 8 years of experience in the beauty industry, I specialize in modern cuts, creative coloring, and special occasion styling. I believe every client deserves to feel confident and beautiful.',
    portfolio: [
      'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    services: [
      { id: 1, name: 'Haircut & Style', duration: '60 min', price: 650, description: 'Precision cutting and styling.' },
      { id: 2, name: 'Full Color', duration: '120 min', price: 1200, description: 'Complete color transformation.' },
    ],
    availability: { today: ['14:00', '16:30'], tomorrow: ['10:00', '13:00', '15:30'] }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-20">
      {/* 1. Hero Gallery Section */}
      <section className="relative pt-20 md:pt-24 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[50vh] md:h-[70vh]">
          {/* Main Large Image */}
          <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group">
            <img 
              src={provider.portfolio[selectedImageIndex]} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Work" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-8 left-8 flex gap-2">
              <button onClick={() => setIsFavorited(!isFavorited)} className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`} />
              </button>
              <button className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Side thumbnails */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-6">
            {provider.portfolio.slice(1, 3).map((img, i) => (
              <div key={i} className="flex-1 rounded-[2.5rem] overflow-hidden relative group cursor-pointer" onClick={() => setSelectedImageIndex(i + 1)}>
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Header */}
          <div className="border-b border-gray-100 pb-12">
            <div className="flex items-center gap-6 mb-6">
              <img src={provider.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50" alt="" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-4xl font-black tracking-tighter">{provider.name}</h1>
                  <ShieldCheck className="w-6 h-6 text-blue-500 fill-blue-50/50" />
                </div>
                <p className="text-xl text-gray-400 font-medium">{provider.title}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> {provider.rating}
                </div>
                <span className="text-sm font-bold text-gray-400">{provider.totalReviews} reviews</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-widest">
                <MapPin className="w-4 h-4" /> {provider.location}
              </div>
            </div>
          </div>

          {/* About */}
          <section>
            <h2 className="text-2xl font-black tracking-tighter mb-6">The Professional</h2>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              {provider.bio}
            </p>
          </section>

          {/* Services Menu */}
          <section>
            <h2 className="text-2xl font-black tracking-tighter mb-8">Service Menu</h2>
            <div className="space-y-4">
              {provider.services.map((s) => (
                <div key={s.id} className="group flex justify-between items-center p-8 rounded-[2rem] bg-gray-50 hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
                  <div className="max-w-md">
                    <h3 className="text-xl font-black mb-2">{s.name}</h3>
                    <p className="text-sm opacity-60 font-medium">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black mb-1">R{s.price}</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">{s.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
            <h3 className="text-xl font-black tracking-tighter mb-6">Secure a Slot</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Available Today</p>
                <div className="grid grid-cols-2 gap-2">
                  {provider.availability.today.map((time) => (
                    <button key={time} className="py-3 rounded-2xl border border-gray-100 text-sm font-black hover:border-black transition-all">
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <button onClick={() => router.push(`/booking/${params.id}`)} className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5" /> Book Session
                </button>
                <button className="w-full mt-3 bg-gray-50 text-black py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Message Ntombi
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