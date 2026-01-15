'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, MapPin, Filter, Grid2x2 as Grid, List, ChevronDown } from 'lucide-react';

export default function SearchResultsClient() {
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

  const filteredProviders = providers.filter((p) => {
    if (category && p.category !== category) return false;
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (query && !p.service.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  
  return (
    <div className="min-h-screen pt-16 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Search Header */}
      <div className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {category ? `${category} Services` : 'Search Results'}
              </h1>
              <p className="text-white/70 mt-2 text-sm sm:text-base">
                {query && `Results for "${query}"`} {location && `in ${location}`}
                <span className="ml-2">• Found {providers.length} providers</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 sm:p-3 rounded-xl smooth-transition ${
                    viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'text-white/60 hover:text-white/80 border border-white/20'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 sm:p-3 rounded-xl smooth-transition ${
                    viewMode === 'list' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'text-white/60 hover:text-white/80 border border-white/20'
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 text-white text-sm sm:text-base focus:bg-white/15 focus:border-white/40 focus:outline-none"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-white/15 smooth-transition text-sm sm:text-base"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 sm:p-6 glass-dark-card rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`grid gap-4 sm:gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`glass-dark-card rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 smooth-transition hover:shadow-2xl group ${
                viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
              }`}
              onClick={() => router.push(`/provider/${provider.id}`)}
            >
              <img
                src={provider.image}
                alt={provider.service}
                className={`object-cover group-hover:scale-110 smooth-transition ${
                  viewMode === 'list' ? 'w-full sm:w-48 h-48' : 'w-full h-48 sm:h-56'
                }`}
              />
              <div className="p-4 sm:p-6 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 sm:w-14 h-12 sm:h-14 rounded-full object-cover shrink-0 border-2 border-white/30"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-white truncate">{provider.name}</h3>
                    <p className="text-white/80 text-xs sm:text-sm truncate">{provider.service}</p>
                  </div>
                </div>

                <p className="text-white/80 mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm">{provider.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-white/15 text-white/90 text-xs rounded-full backdrop-blur-sm border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current shrink-0" />
                      <span className="font-semibold text-white">{provider.rating}</span>
                      <span className="text-white/70">({provider.reviews})</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-emerald-400">
                      R{provider.startingPrice}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-white/70">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{provider.location}</span>
                    </div>
                    <span className="hidden sm:inline text-white/50">•</span>
                    <span className="text-emerald-400 font-medium">{provider.availability}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
