'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, Star, MapPin, MessageCircle, Heart, Filter,
  Search, User, Mail, Phone, CreditCard, Bell, Lock,
  LogOut, Edit2, ChevronRight, CheckCircle2, Loader2, AlertCircle,
  Save, X, Check, Globe, Camera
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['profile', 'upcoming', 'past', 'favorites'];

const availableLanguages = [
  'English', 'Afrikaans', 'isiZulu', 'Swati', 'Xhosa', 'Tsonga',
  'Tswana', 'Venda', 'Sesotho', 'Setswana'
];

const notificationLabels = {
  emailNotifications: 'Email Notifications',
  smsNotifications:   'SMS Notifications',
  reminders:          'Booking Reminders',
  newProviders:       'New Providers Near Me',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  return `R${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
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
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const router = useRouter();
  const avatarInputRef = useRef(null);
  const [activeTab, setActiveTab]   = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [data, setData]             = useState(null);

  // Profile editing
  const [isEditing, setIsEditing]         = useState(false);
  const [profileForm, setProfileForm]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);  // local preview
  const [avatarFile, setAvatarFile]       = useState(null);  // File to upload
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError]         = useState('');
  const [saveSuccess, setSaveSuccess]     = useState(false);

  // ── Fetch dashboard ──────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/customer/dashboard');
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 403) { router.push('/'); return; }
        if (!res.ok) throw new Error('Failed to load dashboard');
        const body = await res.json();
        setData(body);
        setProfileForm({
          name:               body.user.name,
          phone:              body.user.phone,
          location:           body.user.location,
          address:            body.user.address ?? '',
          preferredLanguages: body.user.preferredLanguages ?? [],
          notifications:      body.user.notifications ?? {
            emailNotifications: true,
            smsNotifications:   false,
            reminders:          true,
            newProviders:       false,
          },
        });
      } catch (err) {
        setError(err.message || 'Something went wrong. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [router]);

  // ── Avatar picker ────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Language toggle ──────────────────────────────────────────────────────
  const toggleLanguage = (lang) => {
    setProfileForm(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(lang)
        ? prev.preferredLanguages.filter(l => l !== lang)
        : [...prev.preferredLanguages, lang],
    }));
  };

  // ── Cancel editing ───────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setSaveError('');
    // Reset form back to current saved data
    setProfileForm({
      name:               data.user.name,
      phone:              data.user.phone,
      location:           data.user.location,
      address:            data.user.address ?? '',
      preferredLanguages: data.user.preferredLanguages ?? [],
      notifications:      data.user.notifications,
    });
  };

  // ── Save profile ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // 1. Upload new avatar if one was selected
      let avatarUrl = null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload?type=avatar', { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          avatarUrl = url;
        } else {
          console.warn('[customer profile] Avatar upload failed, keeping existing.');
        }
      }

      // 2. Save profile data
      const res = await fetch('/api/customer/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileForm, avatarUrl }),
      });

      const result = await res.json();
      if (!res.ok) {
        setSaveError(result.message || 'Failed to save. Please try again.');
        return;
      }

      // 3. Update local data so the UI reflects changes immediately
      setData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...profileForm,
          ...(avatarUrl && { avatar: avatarUrl }),
        },
      }));

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  const filterBookings = (bookings) =>
    bookings.filter(b =>
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ── Error state ──────────────────────────────────────────────────────────
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

  // Current avatar to display: local preview > saved avatar > placeholder
  const displayAvatar = avatarPreview || data?.user.avatar || null;

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? 'Dashboard' : `Welcome back, ${data.user.name.split(' ')[0]}`}
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage your appointments and personal settings.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-sm hover:bg-gray-900 transition-all">
            Explore Services
          </button>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Upcoming',    value: data.stats.upcomingCount,              icon: Calendar,     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
                { label: 'Completed',   value: data.stats.completedCount,             icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Favourites',  value: data.stats.favoritesCount,             icon: Heart,        color: 'text-rose-600',    bg: 'bg-rose-50' },
                { label: 'Total Spent', value: formatCurrency(data.stats.totalSpent), icon: CreditCard,   color: 'text-blue-600',    bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bg} p-3 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto bg-white rounded-t-xl px-4">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap capitalize ${
                    activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && profileForm && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left — avatar card */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                      {displayAvatar ? (
                        <img src={displayAvatar} className="w-24 h-24 rounded-full border-4 border-slate-50 mx-auto object-cover" alt="" />
                      ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center mx-auto">
                          <User className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                      {isEditing && (
                        <button onClick={() => avatarInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full border-2 border-white hover:bg-gray-800 transition-all">
                          <Camera className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">{data.user.name}</h2>
                    <p className="text-sm text-slate-500 font-medium mb-3">Member since {data.user.joinDate}</p>

                    {data.user.preferredLanguages?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {data.user.preferredLanguages.map(lang => (
                          <span key={lang} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)}
                        className="w-full mt-2 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                        <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                      </button>
                    )}

                    {avatarPreview && (
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">New photo selected — save to apply</p>
                    )}
                  </div>

                  {/* Quick actions */}
                  {!isEditing && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Security & Password</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                      <button onClick={handleSignOut}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-rose-50 transition-colors text-rose-600">
                        <div className="flex items-center gap-3">
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-bold">Sign Out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right — editable fields */}
                <div className="lg:col-span-2 space-y-4">

                  {/* Success / error banners */}
                  {saveSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                      <Check className="h-4 w-4 shrink-0" /> Profile updated successfully.
                    </div>
                  )}
                  {saveError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
                    </div>
                  )}

                  {/* Personal Info */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                      {isEditing && (
                        <div className="flex gap-2">
                          <button onClick={handleCancelEdit} disabled={savingProfile}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                          <button onClick={handleSaveProfile} disabled={savingProfile}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition-all disabled:opacity-60">
                            {savingProfile
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                              : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <ProfileField label="Full Name" icon={User} value={profileForm.name} editing={isEditing}
                        onChange={v => setProfileForm(p => ({ ...p, name: v }))} placeholder="Your name" />
                      <ProfileField label="Phone" icon={Phone} value={profileForm.phone} editing={isEditing}
                        onChange={v => setProfileForm(p => ({ ...p, phone: v }))} placeholder="0821234567" />
                      <ProfileField label="Email" icon={Mail} value={data.user.email} editing={false}
                        onChange={() => {}} placeholder="" hint="Contact support to change email" />
                      <ProfileField label="City / Region" icon={MapPin} value={profileForm.location} editing={isEditing}
                        onChange={v => setProfileForm(p => ({ ...p, location: v }))} placeholder="Johannesburg, GP" />
                      <div className="sm:col-span-2">
                        <ProfileField label="Street Address (optional)" icon={MapPin} value={profileForm.address} editing={isEditing}
                          onChange={v => setProfileForm(p => ({ ...p, address: v }))} placeholder="123 Main St" />
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <h3 className="text-base font-bold text-slate-900">Preferred Languages</h3>
                    </div>
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {availableLanguages.map(lang => {
                          const selected = profileForm.preferredLanguages.includes(lang);
                          return (
                            <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                                selected ? 'bg-black border-black text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                              }`}>
                              {selected && <Check className="inline w-3 h-3 mr-1" />}{lang}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(data.user.preferredLanguages ?? []).map(lang => (
                          <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">{lang}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="h-4 w-4 text-slate-400" />
                      <h3 className="text-base font-bold text-slate-900">Notification Settings</h3>
                    </div>
                    {Object.entries(notificationLabels).map(([key, label]) => (
                      <label key={key}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          isEditing ? 'bg-slate-50 border-slate-200 cursor-pointer hover:border-slate-300' : 'bg-slate-50/50 border-slate-100 cursor-default'
                        }`}>
                        <span className="text-sm font-bold text-slate-700">{label}</span>
                        <div className="relative">
                          <input type="checkbox"
                            checked={profileForm.notifications[key] ?? false}
                            disabled={!isEditing}
                            onChange={e => setProfileForm(p => ({
                              ...p,
                              notifications: { ...p.notifications, [key]: e.target.checked }
                            }))}
                            className="w-5 h-5 rounded text-black focus:ring-black border-slate-300 cursor-pointer disabled:cursor-default disabled:opacity-60" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── UPCOMING / PAST TABS ── */}
            {(activeTab === 'upcoming' || activeTab === 'past') && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search by service or provider..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                    <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          {booking.provider.avatar ? (
                            <img src={booking.provider.avatar} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" alt="" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-slate-50">
                              <User className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-slate-900">{booking.service}</h4>
                              <span className={getStatusBadge(booking.status)}>{booking.status.toUpperCase()}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                              with {booking.provider.name}
                              {booking.provider.rating > 0 && (
                                <> · <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {booking.provider.rating.toFixed(1)}</>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1 max-w-xl">
                          {[
                            { icon: Calendar, label: 'Date',     value: booking.date,     bg: 'bg-slate-50', color: 'text-slate-600' },
                            { icon: Clock,    label: 'Time',     value: booking.time,     bg: 'bg-slate-50', color: 'text-slate-600' },
                            { icon: MapPin,   label: 'Location', value: booking.location, bg: 'bg-slate-50', color: 'text-slate-600', hidden: true },
                          ].map(({ icon: Icon, label, value, bg, color, hidden }) => (
                            <div key={label} className={`flex items-center gap-3 ${hidden ? 'hidden md:flex' : ''}`}>
                              <div className={`p-2 ${bg} rounded-lg`}><Icon className={`h-4 w-4 ${color}`} /></div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                                <p className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="text-right mr-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                            <p className="text-lg font-black text-slate-900">{formatCurrency(booking.price)}</p>
                          </div>
                          <button className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-black hover:bg-slate-100 transition-all">
                            <MessageCircle className="h-5 w-5" />
                          </button>
                          <button className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-900 shadow-sm">
                            {activeTab === 'upcoming' ? 'Reschedule' : booking.reviewed ? 'Rebook' : 'Leave Review'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── FAVORITES TAB ── */}
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
                          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                            <User className="h-7 w-7 text-slate-300" />
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Starts at</p>
                          <p className="text-xl font-black text-slate-900">{formatCurrency(provider.startingPrice)}</p>
                        </div>
                        <button className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-900 transition-all">
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── ProfileField ──────────────────────────────────────────────────────────────

function ProfileField({ label, icon: Icon, value, editing, onChange, placeholder, hint }) {
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
        <>
          <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
          {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
        </>
      )}
    </div>
  );
}