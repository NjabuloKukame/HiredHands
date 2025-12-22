'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Filter, Grid2x2 as Grid, List, ChevronDown } from 'lucide-react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('top-rated');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    availability: ''
  });

  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';

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

  const categories = ['Hair Styling', 'Photography', 'Personal Training', 'Home Repair', 'Tutoring', 'Cleaning'];
  const sortOptions = [
    { value: 'top-rated', label: 'Top Rated' },
    { value: 'nearest', label: 'Nearest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'most-reviewed', label: 'Most Reviewed' }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Search Header */}
      <div className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {category ? `${category} Services` : 'Search Results'}
              </h1>
              <p className="text-white/70 mt-2">
                {query && `Results for "${query}"`} {location && `in ${location}`}
                <span className="ml-2">• Found {providers.length} providers</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl smooth-transition ${
                    viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'text-white/60 hover:text-white/80 border border-white/20'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl smooth-transition ${
                    viewMode === 'list' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'text-white/60 hover:text-white/80 border border-white/20'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-white/60 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/15 smooth-transition"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 glass-dark-card rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  >
                    <option value="" className="bg-slate-800">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  >
                    <option value="" className="bg-slate-800">Any Price</option>
                    <option value="0-50" className="bg-slate-800">$0 - $50</option>
                    <option value="50-100" className="bg-slate-800">$50 - $100</option>
                    <option value="100-200" className="bg-slate-800">$100 - $200</option>
                    <option value="200+" className="bg-slate-800">$200+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  >
                    <option value="" className="bg-slate-800">Any Rating</option>
                    <option value="4.5+" className="bg-slate-800">4.5+ Stars</option>
                    <option value="4.0+" className="bg-slate-800">4.0+ Stars</option>
                    <option value="3.5+" className="bg-slate-800">3.5+ Stars</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  >
                    <option value="" className="bg-slate-800">Any Time</option>
                    <option value="today" className="bg-slate-800">Available Today</option>
                    <option value="week" className="bg-slate-800">This Week</option>
                    <option value="month" className="bg-slate-800">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`glass-dark-card rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 smooth-transition hover:shadow-2xl group ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => router.push(`/provider/${provider.id}`)}
            >
              <img
                src={provider.image}
                alt={provider.service}
                className={`object-cover group-hover:scale-110 smooth-transition ${
                  viewMode === 'list' ? 'w-48 h-48' : 'w-full h-56'
                }`}
              />
              <div className="p-6 flex-1">
                <div className="flex items-center mb-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{provider.name}</h3>
                    <p className="text-white/80 text-sm">{provider.service}</p>
                  </div>
                </div>
                
                <p className="text-white/80 mb-4 line-clamp-2 leading-relaxed text-sm">{provider.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/15 text-white/90 text-xs rounded-full backdrop-blur-sm border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-white">{provider.rating}</span>
                    <span className="text-white/70 ml-1 text-sm">({provider.reviews} reviews)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      Starting at R{provider.startingPrice}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-white/70">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location} • {provider.distance}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">{provider.availability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}