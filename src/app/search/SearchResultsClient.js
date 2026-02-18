'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, MapPin, Filter, Grid2x2 as Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use the same provider data from your snippet
    const providers = [

    {

      id: 1,

      name: 'Ntombi Dlamini',

      service: 'Hair Styling & Coloring',

      category: 'Hair Styling',

      rating: 4.9,

      reviews: 127,

      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',

      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',

      location: 'Nelspruit, Mpumalanga',

      distance: '0.8 miles',

      startingPrice: 45,

      availability: 'Available today',

      description: 'Professional hair stylist with 8+ years of experience in cuts, coloring, and styling.',

      tags: ['Color Specialist', 'Wedding Hair', 'Highlights']

    },

    {

      id: 2,

      name: 'Mike van der Merwe',

      service: 'Wedding & Event Photography',

      category: 'Photography',

      rating: 4.8,

      reviews: 89,

      image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',

      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',

      location: 'Sandton, Johannesburg',

      distance: '2.1 miles',

      startingPrice: 150,

      availability: 'Available this week',

      description: 'Award-winning photographer specializing in weddings, portraits, and corporate events.',

      tags: ['Wedding', 'Portrait', 'Corporate']

    },

    {

      id: 3,

      name: 'Thabile Nkosi',

      service: 'Personal Training & Fitness',

      category: 'Personal Training',

      rating: 4.9,

      reviews: 156,

      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',

      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',

      location: 'Bloemfontein, Free State',

      distance: '1.3 miles',

      startingPrice: 60,

      availability: 'Available tomorrow',

      description: 'Certified personal trainer helping clients achieve their fitness goals for over 6 years.',

      tags: ['Weight Loss', 'Strength Training', 'Nutrition']

    },

    {

      id: 4,

      name: 'David Wilson',

      service: 'Home Repair & Maintenance',

      category: 'Home Repair',

      rating: 4.7,

      reviews: 203,

      image: 'https://images.pexels.com/photos/5691569/pexels-photo-5691569.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',

      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',

      location: 'Port Elizabeth, Eastern Cape',

      distance: '3.2 miles',

      startingPrice: 75,

      availability: 'Available next week',

      description: 'Licensed contractor with 15+ years experience in home repairs and renovations.',

      tags: ['Plumbing', 'Electrical', 'Carpentry']

    }

  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 1. Dynamic Header */}
      <header className={`fixed top-16 left-0 right-0 z-30 bg-white transition-all duration-300 ${scrolled ? 'py-4 border-b border-gray-100 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                {query || 'Top Professionals'}
              </h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">
                {providers.length} Verified Experts near {location || 'South Africa'}
              </p>
            </div>

            {/* Mobile-Friendly Toolbar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button 
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              
              <div className="h-10 w-[1px] bg-gray-100 mx-2 hidden md:block" />
              
              <div className="hidden md:flex bg-gray-50 p-1 rounded-2xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Results Grid */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 pt-56 pb-20">
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {providers.map((p) => (
            <div 
              key={p.id} 
              onClick={() => router.push(`/provider/${p.id}`)}
              className="group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={p.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="" 
                />
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-black" />
                  <span className="text-xs font-black">{p.rating}</span>
                </div>
                {/* Availability Badge */}
                <div className="absolute bottom-6 left-6">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    {p.availability}
                  </span>
                </div>
              </div>

              {/* Info Container */}
              <div className="flex items-start justify-between px-2">
                <div className="flex gap-4">
                  <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt="" />
                  <div>
                    <h3 className="text-xl font-black tracking-tight group-hover:underline decoration-2">{p.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">{p.service}</p>
                    <div className="flex items-center gap-1 text-gray-400 mt-1 text-xs font-bold">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase">Starting</p>
                  <p className="text-xl font-black">R{p.startingPrice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative bg-white w-full max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] p-8 md:p-10 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter">Sort & Filter</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Sort By</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Top Rated', 'Price: Low', 'Nearest', 'Reviews'].map((opt) => (
                    <button key={opt} className="py-3 px-4 rounded-2xl border border-gray-100 text-sm font-bold hover:border-black transition-all">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}