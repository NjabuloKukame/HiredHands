'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, Star, MapPin, MessageCircle, Heart, Filter,
  Search, User, Mail, Phone, CreditCard, Bell, Lock,
  LogOut, Edit2, ChevronRight, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status) {
  const styles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending:   'bg-amber-50  text-amber-700  border-amber-100',
    completed: 'bg-blue-50   text-blue-700   border-blue-100',
    cancelled: 'bg-red-50    text-red-700    border-red-100',
    no_show:   'bg-slate-50  text-slate-600  border-slate-100',
  };
  return `px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] ?? styles.no_show}`;
}

function formatCurrency(amount) {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab]     = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [data, setData]               = useState(null);

  // Fetch on mount
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/customer/dashboard');
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 403) { router.push('/'); return; }
        if (!res.ok) throw new Error('Failed to load dashboard');
        setData(await res.json());
      } catch (err) {
        setError(err.message || 'Something went wrong. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [router]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  const handleExploreServices = () => {
    router.push('/search');
  };

  // Filter bookings by search query
  const filterBookings = (bookings) =>
    bookings.filter(b =>
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="p-4 bg-red-50 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-slate-700 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? 'Dashboard' : `Welcome back, ${data.user.name.split(' ')[0]}`}
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage your appointments and personal settings.
            </p>
          </div>
          <button onClick={handleExploreServices} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-sm hover:bg-gray-900 transition-all">
            Explore Services
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && <DashboardSkeleton />}

        {!loading && data && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Upcoming',    value: data.stats.upcomingCount,                    icon: Calendar,      color: 'text-black', bg: 'bg-gray-50' },
                { label: 'Completed',   value: data.stats.completedCount,                   icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Favorites',   value: data.stats.favoritesCount,                   icon: Heart,         color: 'text-rose-600',    bg: 'bg-rose-50' },
                { label: 'Total Spent', value: formatCurrency(data.stats.totalSpent),       icon: CreditCard,    color: 'text-black',    bg: 'bg-gray-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto bg-white rounded-t-xl px-4">
              {['profile', 'upcoming', 'past', 'favorites'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-black text-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="min-h-100">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                      <div className="relative inline-block mb-4">
                        {data.user.avatar ? (
                          <img src={data.user.avatar} className="w-24 h-24 rounded-full border-4 border-slate-50 mx-auto object-cover" alt="" />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-4 border-slate-50 bg-gray-50 flex items-center justify-center mx-auto">
                            <User className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 p-1.5 bg-black text-white rounded-full border-2 border-white">
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{data.user.name}</h2>
                      <p className="text-sm text-slate-500 mb-1 font-medium">Member since {data.user.joinDate}</p>
                      {data.user.preferredLanguages?.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mt-3 mb-4">
                          {data.user.preferredLanguages.map(lang => (
                            <span key={lang} className="px-2 py-0.5 bg-gray-50 text-black text-[10px] font-bold rounded-full border border-gray-100">
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { icon: Mail,  label: 'Email',   value: data.user.email },
                          { icon: Phone, label: 'Phone',   value: data.user.phone || '—' },
                          { icon: MapPin,label: 'Location',value: data.user.location || '—' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg"><Icon className="h-4 w-4 text-slate-400" /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                              <p className="text-sm font-semibold text-slate-700">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Notification Settings</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                      <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Security & Password</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-rose-50 transition-colors text-rose-600"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-bold">Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* UPCOMING / PAST TABS */}
              {(activeTab === 'upcoming' || activeTab === 'past') && (
                <div className="space-y-4">
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by service or provider..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                      <Filter className="h-4 w-4" /> Filter
                    </button>
                  </div>

                  {filterBookings(activeTab === 'upcoming' ? data.upcomingBookings : data.pastBookings).length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold">
                        {searchQuery ? 'No bookings match your search.' : `No ${activeTab} bookings yet.`}
                      </p>
                    </div>
                  ) : (
                    filterBookings(activeTab === 'upcoming' ? data.upcomingBookings : data.pastBookings).map(booking => (
                      <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            {booking.provider.avatar ? (
                              <img src={booking.provider.avatar} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" alt="" />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center ring-4 ring-slate-50">
                                <User className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-bold text-slate-900">{booking.service}</h4>
                                <span className={getStatusBadge(booking.status)}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                                with {booking.provider.name}
                                {booking.provider.rating > 0 && (
                                  <> • <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {booking.provider.rating.toFixed(1)}</>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 max-w-xl">
                            {[
                              { icon: Calendar, label: 'Date',     value: booking.date,     bg: 'bg-gray-50', color: 'text-black' },
                              { icon: Clock,    label: 'Time',     value: booking.time,     bg: 'bg-gray-50',   color: 'text-black' },
                              { icon: MapPin,   label: 'Location', value: booking.location, bg: 'bg-emerald-50',color: 'text-emerald-600', hidden: true },
                            ].map(({ icon: Icon, label, value, bg, color, hidden }) => (
                              <div key={label} className={`flex items-center gap-3 ${hidden ? 'hidden md:flex' : ''}`}>
                                <div className={`p-2 ${bg} rounded-lg`}><Icon className={`h-4 w-4 ${color}`} /></div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                                  <p className="text-xs font-bold text-slate-700 truncate max-w-25">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-right mr-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                              <p className="text-lg font-black text-slate-900">{formatCurrency(booking.price)}</p>
                            </div>
                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-black hover:bg-gray-50 transition-all">
                              <MessageCircle className="h-5 w-5" />
                            </button>
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm">
                              {activeTab === 'upcoming' ? 'Reschedule' : booking.reviewed ? 'Rebook' : 'Leave Review'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* FAVORITES TAB */}
              {activeTab === 'favorites' && (
                data.favoriteProviders.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No favourite providers yet.</p>
                    <p className="text-sm mt-1">Browse services and heart a provider to save them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.favoriteProviders.map(provider => (
                      <div key={provider.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          {provider.avatar ? (
                            <img src={provider.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center">
                              <User className="h-7 w-7 text-gray-300" />
                            </div>
                          )}
                          <button className="p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100">
                            <Heart className="h-5 w-5 fill-rose-500" />
                          </button>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">{provider.name}</h4>
                        <p className="text-sm text-slate-500 font-medium mb-4">{provider.service}</p>

                        <div className="flex items-center gap-4 text-xs font-bold mb-6">
                          {provider.rating > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="h-3 w-3 fill-amber-600" /> {provider.rating.toFixed(1)}
                            </div>
                          )}
                          <div className="text-slate-400">({provider.reviewCount} Reviews)</div>
                          <div className="text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {provider.location}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Starts at</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(provider.startingPrice)}</p>
                          </div>
                          <button className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-900 shadow-lg shadow-gray-100 transition-all">
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}