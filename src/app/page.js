'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Star, MapPin, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
  };

  const categories = [
    { name: 'Hair Styling', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600', span: 'md:col-span-1', count: '1.2k Providers' },
    { name: 'Photography', image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=600', span: 'md:col-span-2', count: '850 Providers' },
    { name: 'Home Repair', image: 'https://images.pexels.com/photos/5691569/pexels-photo-5691569.jpeg?auto=compress&cs=tinysrgb&w=600', span: 'md:col-span-1', count: '2.1k Providers' },
    { name: 'Personal Training', image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=600', span: 'md:col-span-2', count: '420 Providers' },
  ];

  const featuredProviders = [
    { id: 1, name: 'Sarah Johnson', service: 'Hair Styling', rating: 4.9, image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', location: 'Johannesburg, SA', startingPrice: 'R45' },
    { id: 2, name: 'Sipho Mokoena', service: 'Photography', rating: 4.8, image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=600', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', location: 'Nelspruit, SA', startingPrice: 'R150' },
    { id: 3, name: 'Lisa van Wyk', service: 'Personal Training', rating: 4.9, image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=600', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', location: 'Cape Town, SA', startingPrice: 'R300' }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Hero Section */}
      <section className="pt-28 md:pt-40 pb-16 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-left md:text-center mb-12">
            <h1 className="text-[2.5rem] md:text-8xl font-black tracking-tighter leading-none mb-6">
              Connect Every <br />
              <span className="text-gray-300">Service</span> Easily
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl md:mx-auto font-medium leading-snug">
              Trusted by 10k+ users. We bring world-class professionals right to your doorstep.
            </p>
          </div>

          {/* Mobile-First Search Form */}
          <form onSubmit={handleSearch} className="relative z-10 max-w-4xl mx-auto mb-16">
            <div className="flex flex-col md:flex-row bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-2 md:p-3">
              <div className="flex items-center px-4 py-3 md:flex-1 border-b md:border-b-0 md:border-r border-gray-50">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Service..." 
                  className="w-full bg-transparent focus:outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center px-4 py-3 md:flex-1">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Location..." 
                  className="w-full bg-transparent focus:outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-[#1a1a1a] text-white p-4 md:px-10 rounded-4xl font-black hover:bg-black transition-all flex items-center justify-center gap-2">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Bento Grid - Stacks on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className={`relative overflow-hidden rounded-[2.5rem] h-75 md:h-100 group cursor-pointer ${cat.span}`}>
                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60 mb-1 block">{cat.count}</span>
                  <h3 className="text-2xl font-black text-white">{cat.name}</h3>
                </div>
                <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                  <ArrowUpRight className="text-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="bg-gray-50/50 py-20 px-5 md:px-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Featured Pros</h2>
              <p className="text-gray-500 font-medium">Top-rated experts in your area.</p>
            </div>
            <button className="text-sm font-black border-b-2 border-black pb-1 w-fit">View All Providers</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((p) => (
              <div key={p.id} className="bg-white rounded-[2.5rem] p-4 border border-gray-100 group">
                <div className="relative h-64 md:h-72 rounded-4xl overflow-hidden mb-6">
                  <Image src={p.image} alt="" fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    <span className="text-xs font-black">{p.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-2 pb-2">
                  <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-gray-50" alt="" />
                  <div className="flex-1">
                    <h4 className="font-black text-lg leading-tight">{p.name}</h4>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{p.service}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">From</span>
                    <span className="font-black text-lg">{p.startingPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-[3rem] py-20 px-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">Join thousands of satisfied customers who found their perfect service provider today.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform">
                Find a Service
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                Become a Provider
              </button>
            </div>
          </div>
          {/* Subtle background flair */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}