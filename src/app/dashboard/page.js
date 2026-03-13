'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar, DollarSign, Users, Star, Plus, Trash2,
  TrendingUp, X, ChevronRight, Loader2, AlertCircle,
  Clock, Tag, User, Image as ImageIcon, Briefcase, MapPin, Phone,
  Globe, Edit2, Check, Save, ImagePlus
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['overview', 'bookings', 'services', 'portfolio', 'profile', 'analytics'];

const availableLanguages = [
  'English', 'Afrikaans', 'isiZulu', 'Swati', 'Xhosa', 'Tsonga',
  'Tswana', 'Venda', 'Sesotho', 'Setswana'
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `R${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
}

function getStatusBadge(status) {
  const styles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending:   'bg-amber-50  text-amber-700  border-amber-100',
    completed: 'bg-blue-50   text-blue-700   border-blue-100',
    cancelled: 'bg-red-50    text-red-700    border-red-100',
  };
  return `px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`;
}

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
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const router = useRouter();
  const portfolioInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [data, setData]               = useState(null);

  // Add service modal
  const [categories, setCategories]         = useState([]);
  const [newService, setNewService]         = useState({ name: '', price: '', durationMinutes: '60', description: '', categoryId: '' });
  const [addingService, setAddingService]   = useState(false);
  const [addServiceError, setAddServiceError] = useState('');

  // Portfolio
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm]           = useState(null);
  const [savingProfile, setSavingProfile]       = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // ── Fetch dashboard ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/provider/dashboard');
        const body = await res.json();
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 403) {
          if (body.redirect) { router.push(body.redirect); return; }
          router.push('/'); return;
        }
        if (!res.ok) throw new Error(body.error || body.message || 'Failed to load dashboard');
        setData(body);
        // Pre-fill profile form with fetched data
        setProfileForm({ ...body.provider });
      } catch (err) {
        console.error('[provider dashboard]', err);
        setError(err.message || 'Something went wrong. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [router]);

  // ── Fetch categories for modal ─────────────────────────────────────────────
  useEffect(() => {
    if (!isModalOpen || categories.length > 0) return;
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, [isModalOpen, categories.length]);

  // ── Add service ────────────────────────────────────────────────────────────
  const handleAddService = async (e) => {
    e.preventDefault();
    setAddServiceError('');
    if (!newService.name.trim() || !newService.price || !newService.categoryId) {
      setAddServiceError('Name, category and price are required.'); return;
    }
    setAddingService(true);
    try {
      const res = await fetch('/api/provider/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            newService.name.trim(),
          description:     newService.description.trim(),
          categoryId:      newService.categoryId,
          price:           parseFloat(newService.price),
          durationMinutes: parseInt(newService.durationMinutes),
        }),
      });
      const result = await res.json();
      if (!res.ok) { setAddServiceError(result.message || 'Failed to add service.'); return; }
      setData(prev => ({ ...prev, services: [...prev.services, result.service] }));
      setIsModalOpen(false);
      setNewService({ name: '', price: '', durationMinutes: '60', description: '', categoryId: '' });
    } catch { setAddServiceError('Network error. Please try again.'); }
    finally { setAddingService(false); }
  };

  // ── Delete service ─────────────────────────────────────────────────────────
  const handleDeleteService = async (serviceId) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/provider/services/${serviceId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setData(prev => ({ ...prev, services: prev.services.filter(s => s.id !== serviceId) }));
    } catch { /* fail silently */ }
  };

  // ── Portfolio: upload new photo ────────────────────────────────────────────
  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    if (data.portfolio.length >= 4) {
      setPortfolioError('Maximum 4 portfolio images allowed.'); return;
    }

    setUploadingPhoto(true);
    setPortfolioError('');
    try {
      // Upload file
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) { setPortfolioError('Image upload failed. Please try again.'); return; }
      const { url } = await uploadRes.json();

      // Save to DB
      const res = await fetch('/api/provider/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, title: 'Portfolio Image' }),
      });
      const result = await res.json();
      if (!res.ok) { setPortfolioError(result.message || 'Failed to save image.'); return; }

      setData(prev => ({ ...prev, portfolio: [...prev.portfolio, result.item] }));
    } catch { setPortfolioError('Network error. Please try again.'); }
    finally { setUploadingPhoto(false); }
  };

  // ── Portfolio: delete photo ────────────────────────────────────────────────
  const handlePortfolioDelete = async (itemId) => {
    if (!confirm('Remove this photo from your portfolio?')) return;
    try {
      const res = await fetch(`/api/provider/portfolio/${itemId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setData(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== itemId) }));
    } catch { /* fail silently */ }
  };

  // ── Save business profile ──────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSaveError('');
    setProfileSaveSuccess(false);
    try {
      const res = await fetch('/api/provider/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const result = await res.json();
      if (!res.ok) { setProfileSaveError(result.message || 'Failed to save.'); return; }

      // Update local data with new values
      setData(prev => ({ ...prev, provider: { ...prev.provider, ...profileForm } }));
      setIsEditingProfile(false);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch { setProfileSaveError('Network error. Please try again.'); }
    finally { setSavingProfile(false); }
  };

  const toggleLanguage = (lang) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="p-4 bg-red-50 rounded-2xl"><AlertCircle className="h-8 w-8 text-red-500" /></div>
          <p className="text-slate-700 font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading || !data ? 'Dashboard' : data.provider.businessName}
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              {loading || !data ? 'Loading your data...' : `Welcome back, ${data.provider.name.split(' ')[0]}`}
            </p>
          </div>
          <div className="flex gap-3 justify-center md:justify-start">
            <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm text-slate-700 transition-all">
              Export Data
            </button>
            <button onClick={() => setIsModalOpen(true)} disabled={loading}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Monthly Revenue', value: formatCurrency(data.stats.monthlyRevenue), icon: DollarSign, color: 'text-black',        bg: 'bg-gray-50' },
                { label: 'Total Bookings',  value: data.stats.totalBookings,                  icon: Calendar,    color: 'text-black',        bg: 'bg-gray-50' },
                { label: 'Rating',          value: data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Reviews',         value: data.stats.totalReviews,                   icon: Users,       color: 'text-emerald-600',  bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bg} p-3 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto bg-white rounded-t-xl px-4">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap capitalize ${
                    activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-sm font-semibold text-black hover:text-gray-700">View All</button>
                  </div>
                  {data.upcomingBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No upcoming appointments</p>
                    </div>
                  ) : data.upcomingBookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="group bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {booking.customerAvatar
                            ? <Image src={booking.customerAvatar} width={40} height={40} className="w-10 h-10 rounded-full object-cover" alt="" />
                            : <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><User className="h-5 w-5 text-gray-300" /></div>}
                          <div>
                            <h4 className="text-slate-900 font-bold text-sm">{booking.customerName}</h4>
                            <p className="text-xs text-slate-500 font-medium">{booking.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-slate-900 font-bold text-sm">{formatCurrency(booking.price)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{booking.date} · {booking.time}</p>
                          </div>
                          <span className={getStatusBadge(booking.status)}>{booking.status.toUpperCase()}</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="bg-black rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Grow your revenue</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">Providers using our "Last Minute" promotion see a 24% increase in bookings.</p>
                    <button className="w-full py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors">Create Promotion</button>
                  </div>
                  {data.reviews.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4">Recent Reviews</h3>
                      <div className="space-y-4">
                        {data.reviews.slice(0, 3).map(review => (
                          <div key={review.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                              {review.customerAvatar
                                ? <Image src={review.customerAvatar} width={28} height={28} className="w-7 h-7 rounded-full object-cover" alt="" />
                                : <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><User className="h-3 w-3 text-slate-400" /></div>}
                              <span className="text-xs font-bold text-slate-700">{review.customerName}</span>
                              <div className="flex ml-auto">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {data.upcomingBookings.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-xl text-slate-400">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No upcoming bookings yet.</p>
                  </div>
                ) : data.upcomingBookings.map(booking => (
                  <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-gray-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {booking.customerAvatar
                          ? <Image src={booking.customerAvatar} width={48} height={48} className="w-12 h-12 rounded-full object-cover ring-4 ring-slate-50" alt="" />
                          : <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ring-4 ring-slate-50"><User className="h-6 w-6 text-gray-300" /></div>}
                        <div>
                          <h4 className="font-bold text-slate-900">{booking.customerName}</h4>
                          <p className="text-sm text-slate-500">{booking.service} · {booking.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="h-4 w-4 text-slate-400" /><span className="font-semibold">{booking.date}</span></div>
                        <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="h-4 w-4 text-slate-400" /><span className="font-semibold">{booking.time}</span></div>
                        <span className={getStatusBadge(booking.status)}>{booking.status.toUpperCase()}</span>
                        <span className="text-lg font-black text-slate-900">{formatCurrency(booking.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SERVICES ── */}
            {activeTab === 'services' && (
              <div>
                {data.services.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-xl text-slate-400">
                    <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No services yet.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900">Add Your First Service</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.services.map(service => (
                      <div key={service.id} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{service.category}</span>
                          <button onClick={() => handleDeleteService(service.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 min-h-10">{service.description || '—'}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <span className="text-xl font-bold text-slate-900">{formatCurrency(service.price)}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{service.duration}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-700">{service.bookings} Bookings</p>
                            <p className={`text-[10px] font-bold ${service.active ? 'text-emerald-600' : 'text-slate-400'}`}>● {service.active ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PORTFOLIO ── */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Portfolio</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{data.portfolio.length}/4 photos uploaded — customers see these on your profile.</p>
                  </div>
                  {data.portfolio.length < 4 && (
                    <button onClick={() => portfolioInputRef.current?.click()} disabled={uploadingPhoto}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all disabled:opacity-50 w-full sm:w-auto">
                      {uploadingPhoto ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><ImagePlus className="h-4 w-4" /> Add Photo</>}
                    </button>
                  )}
                  <input type="file" ref={portfolioInputRef} className="hidden" accept="image/*" onChange={handlePortfolioUpload} />
                </div>

                {portfolioError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {portfolioError}
                  </div>
                )}

                {data.portfolio.length === 0 ? (
                  <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-500">No portfolio photos yet</p>
                    <p className="text-sm mt-1 mb-6">Show customers your best work by uploading up to 4 photos.</p>
                    <button onClick={() => portfolioInputRef.current?.click()}
                      className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all">
                      Upload First Photo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.portfolio.map(item => (
                      <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                        <Image src={item.imageUrl} alt={item.title} width={300} height={300} className="w-full h-full object-cover" />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <button onClick={() => handlePortfolioDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-white text-red-500 rounded-xl shadow-lg transition-all hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Caption */}
                        {item.title && item.title !== 'Portfolio Image' && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent">
                            <p className="text-white text-xs font-medium truncate">{item.title}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Add more slot */}
                    {data.portfolio.length < 4 && (
                      <button onClick={() => portfolioInputRef.current?.click()} disabled={uploadingPhoto}
                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-black hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-black disabled:opacity-50">
                        {uploadingPhoto ? <Loader2 className="h-6 w-6 animate-spin" /> : <><ImagePlus className="h-6 w-6" /><span className="text-xs font-bold">{4 - data.portfolio.length} slot{4 - data.portfolio.length > 1 ? 's' : ''} left</span></>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE (Edit Business Details) ── */}
            {activeTab === 'profile' && profileForm && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Business Profile</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Your public profile that customers see when browsing services.</p>
                  </div>
                  {!isEditingProfile ? (
                    <button onClick={() => setIsEditingProfile(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all w-full sm:w-auto">
                      <Edit2 className="h-4 w-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => { setIsEditingProfile(false); setProfileForm({ ...data.provider }); setProfileSaveError(''); }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                        Cancel
                      </button>
                      <button onClick={handleSaveProfile} disabled={savingProfile}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all disabled:opacity-60">
                        {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
                      </button>
                    </div>
                  )}
                </div>

                {profileSaveSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                    <Check className="h-4 w-4" /> Profile updated successfully.
                  </div>
                )}
                {profileSaveError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {profileSaveError}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left — avatar + quick stats */}
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                      {data.provider.avatar
                        ? <Image src={data.provider.avatar} width={96} height={96} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-slate-50" alt="" />
                        : <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto border-4 border-slate-50"><User className="h-10 w-10 text-slate-300" /></div>}
                      <h2 className="text-xl font-bold text-slate-900 mt-4">{data.provider.businessName}</h2>
                      <p className="text-sm text-slate-500 font-medium">{data.provider.location}</p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-lg font-black text-slate-900">{data.stats.totalBookings}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Bookings</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-lg font-black text-slate-900">{data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : '—'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — all editable fields */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">

                      <ProfileField label="Full Name" icon={User} value={profileForm.name} editing={isEditingProfile}
                        onChange={v => setProfileForm(p => ({ ...p, name: v }))} placeholder="Your name" />

                      <ProfileField label="Business Name" icon={Briefcase} value={profileForm.businessName} editing={isEditingProfile}
                        onChange={v => setProfileForm(p => ({ ...p, businessName: v }))} placeholder="Your business name" />

                      <ProfileField label="Location" icon={MapPin} value={profileForm.location} editing={isEditingProfile}
                        onChange={v => setProfileForm(p => ({ ...p, location: v }))} placeholder="City, Province" />

                      <ProfileField label="Phone" icon={Phone} value={profileForm.phone} editing={isEditingProfile}
                        onChange={v => setProfileForm(p => ({ ...p, phone: v }))} placeholder="+27 82 000 0000" />

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bio</label>
                        {isEditingProfile ? (
                          <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                            rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black transition-all" />
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed">{profileForm.bio || '—'}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Experience */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Years Experience</label>
                          {isEditingProfile ? (
                            <input type="number" min="0" value={profileForm.experienceYears ?? ''}
                              onChange={e => setProfileForm(p => ({ ...p, experienceYears: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
                          ) : (
                            <p className="text-sm font-semibold text-slate-700">{profileForm.experienceYears || '—'}</p>
                          )}
                        </div>

                        {/* Booking fee */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Fee (ZAR)</label>
                          {isEditingProfile ? (
                            <input type="number" min="0" step="0.01" value={profileForm.bookingFee ?? 0}
                              onChange={e => setProfileForm(p => ({ ...p, bookingFee: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
                          ) : (
                            <p className="text-sm font-semibold text-slate-700">{formatCurrency(profileForm.bookingFee ?? 0)}</p>
                          )}
                        </div>

                        {/* Response time */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Time</label>
                          {isEditingProfile ? (
                            <select value={profileForm.responseTimeHours} onChange={e => setProfileForm(p => ({ ...p, responseTimeHours: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black appearance-none">
                              <option value="1">Within 1 hour</option>
                              <option value="4">Within 4 hours</option>
                              <option value="12">Within 12 hours</option>
                              <option value="24">Within 24 hours</option>
                              <option value="48">Within 48 hours</option>
                            </select>
                          ) : (
                            <p className="text-sm font-semibold text-slate-700">Within {profileForm.responseTimeHours}h</p>
                          )}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Languages</label>
                        </div>
                        {isEditingProfile ? (
                          <div className="flex flex-wrap gap-2">
                            {availableLanguages.map(lang => {
                              const selected = profileForm.languages?.includes(lang);
                              return (
                                <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${selected ? 'bg-black border-black text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                                  {selected && <Check className="inline w-3 h-3 mr-1" />}{lang}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(profileForm.languages ?? []).map(lang => (
                              <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">{lang}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900">Revenue — Last 7 Days</h3>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <TrendingUp className="h-4 w-4" />
                      {formatCurrency(data.analytics.revenueByDay.reduce((s, d) => s + d.revenue, 0))} this week
                    </div>
                  </div>
                  {data.analytics.maxDayRevenue === 0 ? (
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">No revenue data yet.</div>
                  ) : (
                    <>
                      <div className="h-48 flex items-end gap-3">
                        {data.analytics.revenueByDay.map((d, i) => {
                          const heightPct = (d.revenue / data.analytics.maxDayRevenue) * 100;
                          return (
                            <div key={i} className="flex-1 relative group">
                              <div className="w-full bg-gray-100 rounded-t-md group-hover:bg-black transition-all cursor-pointer" style={{ height: `${Math.max(heightPct, 4)}%` }}>
                                {d.revenue > 0 && (
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xl whitespace-nowrap">
                                    {formatCurrency(d.revenue)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {data.analytics.revenueByDay.map((d, i) => <span key={i}>{d.day}</span>)}
                      </div>
                    </>
                  )}
                </div>
                {data.services.length > 0 && (
                  <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Services Performance</h3>
                    <div className="space-y-4">
                      {[...data.services].sort((a, b) => b.bookings - a.bookings).map(service => (
                        <div key={service.id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-bold text-slate-700">{service.name}</span>
                              <span className="text-xs font-bold text-slate-500">{service.bookings} bookings</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-black rounded-full transition-all"
                                style={{ width: `${data.services[0].bookings > 0 ? (service.bookings / data.services[0].bookings) * 100 : 0}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-900 w-20 text-right">{formatCurrency(service.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Service Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New Service</h2>
              <button onClick={() => { setIsModalOpen(false); setAddServiceError(''); }} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddService} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Name</label>
                <input required type="text" placeholder="e.g. Deluxe Manicure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-all"
                  value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-all appearance-none"
                  value={newService.categoryId} onChange={e => setNewService({ ...newService, categoryId: e.target.value })}>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (R)</label>
                  <input required type="number" min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
                    value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black appearance-none"
                    value={newService.durationMinutes} onChange={e => setNewService({ ...newService, durationMinutes: e.target.value })}>
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                    <option value="180">180 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (optional)</label>
                <textarea rows={2} placeholder="What&apos;s included?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-all"
                  value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
              </div>
              {addServiceError && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium"><AlertCircle className="h-4 w-4 shrink-0" />{addServiceError}</div>
              )}
              <button type="submit" disabled={addingService}
                className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {addingService ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Confirm & Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProfileField ──────────────────────────────────────────────────────────────

function ProfileField({ label, icon: Icon, value, editing, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      </div>
      {editing ? (
        <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-all" />
      ) : (
        <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
      )}
    </div>
  );
}