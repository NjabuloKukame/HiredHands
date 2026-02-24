'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Star, MapPin, Filter, Grid2x2 as Grid, List, X,
  SlidersHorizontal, Loader2, AlertCircle, Clock,
  ChevronDown, Search, User, Briefcase
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `R${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
}

function PriceBadge({ bookingFee, startingPrice }) {
  // Priority: show starting price if exists, fall back to booking fee, then "Free to book"
  
  if (bookingFee > 0) {
    return (
      <div className="text-right">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Booking fee</p>
        <p className="text-xl font-black">{formatCurrency(Math.round(bookingFee))}</p>
      </div>
    );
  }
  if (startingPrice != null) {
    return (
      <div className="text-right">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">From</p>
        <p className="text-xl font-black">{formatCurrency(Math.round(startingPrice))}</p>
      </div>
    );
  }
  return (
    <div className="text-right">
      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">Free</p>
      <p className="text-sm font-black text-emerald-600">to book</p>
    </div>
  );
}

function ProviderCard({ provider, viewMode, onClick }) {
  if (viewMode === 'list') {
    return (
      <div onClick={onClick}
        className="group flex gap-6 bg-white border border-gray-100 rounded-3xl p-5 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer">
        {/* Cover / Avatar */}
        <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
          {provider.coverImage
            ? <img src={provider.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
            : <div className="w-full h-full flex items-center justify-center"><Briefcase className="h-10 w-10 text-gray-200" /></div>}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {provider.avatar
                  ? <img src={provider.avatar} className="w-9 h-9 rounded-full border-2 border-white shadow-sm shrink-0 object-cover" alt="" />
                  : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-gray-300" /></div>}
                <div className="min-w-0">
                  <h3 className="font-black text-lg tracking-tight truncate group-hover:underline decoration-2">{provider.businessName}</h3>
                  <p className="text-gray-500 text-sm font-medium truncate">{provider.primaryCategory || provider.primaryService ||  'Professional Services'}</p>
                </div>
              </div>
              <PriceBadge bookingFee={provider.bookingFee} startingPrice={provider.startingPrice} />
            </div>

            <p className="text-gray-400 text-sm mt-3 line-clamp-2">{provider.bio}</p>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-black" />
              <span className="text-sm font-black">{provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}</span>
              {provider.reviewCount > 0 && <span className="text-xs text-gray-400 font-bold">({provider.reviewCount})</span>}
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
              <MapPin className="w-3 h-3" /> {provider.location}
            </div>
            {provider.responseTimeHours <= 4 && (
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <Clock className="w-3 h-3" /> Fast response
              </div>
            )}
            {provider.languages?.slice(0, 2).map(l => (
              <span key={l} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full border border-gray-100">{l}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div onClick={onClick} className="group cursor-pointer">
      {/* Cover image */}
      <div className="relative aspect-4/3 rounded-[2.5rem] overflow-hidden bg-gray-100 mb-6">
        {provider.coverImage ? (
          <img src={provider.coverImage}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
            <Briefcase className="h-16 w-16 text-gray-200" />
          </div>
        )}

        {/* Rating pill */}
        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <Star className="w-3 h-3 fill-black" />
          <span className="text-xs font-black">
            {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
          </span>
        </div>

        {/* Category pill */}
        {provider.primaryCategory && (
          <div className="absolute bottom-5 left-5">
            <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
              {provider.primaryCategory}
            </span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-start justify-between px-1">
        <div className="flex gap-3 min-w-0">
          {provider.avatar ? (
            <img src={provider.avatar} className="w-11 h-11 rounded-full border-2 border-white shadow-md shrink-0 object-cover" alt="" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-300" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight group-hover:underline decoration-2 truncate">{provider.businessName}</h3>
            {/* <p className="text-gray-500 text-sm font-medium truncate">{provider.primaryService || 'Professional Services'}</p> */}
            <div className="flex items-center gap-1 text-gray-400 mt-0.5 text-xs font-bold">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{provider.location}</span>
            </div>
          </div>
        </div>
        <PriceBadge bookingFee={provider.bookingFee} startingPrice={provider.startingPrice} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'reviews',    label: 'Most Booked' },
  { value: 'price_asc',  label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
];

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [viewMode, setViewMode]       = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [scrolled, setScrolled]       = useState(false);

  // Data state
  const [providers, setProviders]     = useState([]);
  const [categories, setCategories]   = useState([]);
  const [pagination, setPagination]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Filter state — initialised from URL params
  const [filters, setFilters] = useState({
    q:        searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort') || 'rating',
    minPrice: searchParams.get('minPrice') || '0',
    maxPrice: searchParams.get('maxPrice') || '5000',
  });

  // Draft filters — edited in the drawer, applied on "Apply"
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  // ── Scroll detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch providers ────────────────────────────────────────────────────────
  const fetchProviders = useCallback(async (f) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (f.q)        params.set('q', f.q);
      if (f.location) params.set('location', f.location);
      if (f.category) params.set('category', f.category);
      if (f.sort)     params.set('sort', f.sort);
      if (f.minPrice) params.set('minPrice', f.minPrice);
      if (f.maxPrice) params.set('maxPrice', f.maxPrice);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load providers');
      const data = await res.json();

      setProviders(data.providers);
      setPagination(data.pagination);
      if (data.categories?.length) setCategories(data.categories);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and whenever filters change
  useEffect(() => {
    fetchProviders(filters);
  }, [filters, fetchProviders]);

  // ── Apply filters from drawer ──────────────────────────────────────────────
  const handleApplyFilters = () => {
    setFilters({ ...draftFilters });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared = { q: filters.q, location: filters.location, category: '', sort: 'rating', minPrice: '0', maxPrice: '5000' };
    setDraftFilters(cleared);
    setFilters(cleared);
    setShowFilters(false);
  };

  const activeFilterCount = [
    draftFilters.category,
    draftFilters.sort !== 'rating',
    parseInt(draftFilters.minPrice) > 0,
    parseInt(draftFilters.maxPrice) < 5000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      {/* ── Sticky Header ── */}
      <header className={`fixed top-16 left-0 right-0 z-30 bg-white transition-all duration-300 ${scrolled ? 'py-3 border-b border-gray-100 shadow-sm' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
                {filters.q || 'All Professionals'}
              </h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                {loading ? 'Loading...' : `${pagination?.total ?? providers.length} Verified Experts${filters.location ? ` near ${filters.location}` : ' across South Africa'}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter button with active count badge */}
              <button onClick={() => { setDraftFilters({ ...filters }); setShowFilters(true); }}
                className="relative flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-gray-100" />

              {/* View mode toggle */}
              <div className="flex bg-gray-50 p-1 rounded-2xl">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(filters.category || filters.sort !== 'rating' || parseInt(filters.minPrice) > 0) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {filters.category && (
                <button onClick={() => setFilters(f => ({ ...f, category: '' }))}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800">
                  {filters.category} <X className="w-3 h-3" />
                </button>
              )}
              {filters.sort !== 'rating' && (
                <button onClick={() => setFilters(f => ({ ...f, sort: 'rating' }))}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800">
                  {SORT_OPTIONS.find(o => o.value === filters.sort)?.label} <X className="w-3 h-3" />
                </button>
              )}
              {parseInt(filters.minPrice) > 0 && (
                <button onClick={() => setFilters(f => ({ ...f, minPrice: '0' }))}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800">
                  From R{filters.minPrice} <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 pt-52 pb-20">

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-bold text-sm">Finding the best professionals...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-2xl"><AlertCircle className="h-8 w-8 text-red-400" /></div>
            <p className="font-bold text-slate-600">{error}</p>
            <button onClick={() => fetchProviders(filters)}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && providers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="text-6xl mb-2">🔍</div>
            <h3 className="text-2xl font-black tracking-tight">No providers found</h3>
            <p className="text-gray-400 font-medium max-w-sm">
              Try broadening your search — remove some filters or search for a different service.
            </p>
            <button onClick={handleClearFilters}
              className="mt-2 px-6 py-3 bg-black text-white rounded-2xl font-black hover:bg-gray-900 transition-all">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && providers.length > 0 && (
          <>
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} viewMode={viewMode}
                  onClick={() => router.push(`/provider/${p.id}`)} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-16">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button key={pageNum}
                    onClick={() => fetchProviders({ ...filters, page: pageNum })}
                    className={`w-10 h-10 rounded-2xl font-black text-sm transition-all ${
                      pageNum === pagination.page ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Filter Drawer ── */}
      {showFilters && (
        <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative bg-white w-full max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">

            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter">Sort & Filter</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-8">

              {/* Sort */}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Sort By</p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setDraftFilters(f => ({ ...f, sort: opt.value }))}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all ${
                        draftFilters.sort === opt.value ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDraftFilters(f => ({ ...f, category: '' }))}
                      className={`px-4 py-2 rounded-2xl border text-sm font-bold transition-all ${
                        !draftFilters.category ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      All
                    </button>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setDraftFilters(f => ({ ...f, category: cat }))}
                        className={`px-4 py-2 rounded-2xl border text-sm font-bold transition-all ${
                          draftFilters.category === cat ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-gray-300'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Price Range</p>
                  <p className="text-xs font-black text-gray-600">
                    {formatCurrency(parseInt(draftFilters.minPrice))} – {parseInt(draftFilters.maxPrice) >= 5000 ? 'Any' : formatCurrency(parseInt(draftFilters.maxPrice))}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Min Price</label>
                    <input type="range" min="0" max="5000" step="50"
                      value={draftFilters.minPrice}
                      onChange={e => setDraftFilters(f => ({ ...f, minPrice: e.target.value }))}
                      className="w-full mt-1 accent-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Max Price</label>
                    <input type="range" min="0" max="5000" step="50"
                      value={draftFilters.maxPrice}
                      onChange={e => setDraftFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      className="w-full mt-1 accent-black" />
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Response Time</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Within 1hr',  value: '1' },
                    { label: 'Within 4hrs', value: '4' },
                    { label: 'Same day',    value: '12' },
                    { label: 'Any',         value: '' },
                  ].map(opt => (
                    <button key={opt.label}
                      onClick={() => setDraftFilters(f => ({ ...f, responseTime: opt.value }))}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all ${
                        draftFilters.responseTime === opt.value ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleClearFilters}
                  className="flex-1 py-4 rounded-2xl border-2 border-gray-100 font-black text-sm hover:border-gray-300 transition-all">
                  Clear All
                </button>
                <button onClick={handleApplyFilters}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-sm hover:bg-gray-900 transition-all">
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}