'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, Star, MapPin, MessageCircle, Heart, Filter, 
  Search, User, Mail, Phone, CreditCard, Bell, Lock, 
  LogOut, Edit2, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Mock data preserved from your original code
  const upcomingBookings = [
    {
      id: 1,
      provider: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 4.9
      },
      service: 'Haircut & Style',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '60 min',
      price: 65,
      status: 'confirmed',
      location: 'Downtown, NYC'
    },
    {
      id: 2,
      provider: {
        name: 'Mike Chen',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 4.8
      },
      service: 'Wedding Photography',
      date: '2024-01-25',
      time: '10:00 AM',
      duration: '4 hours',
      price: 800,
      status: 'confirmed',
      location: 'Brooklyn, NYC'
    }
  ];

  const pastBookings = [
    {
      id: 3,
      provider: {
        name: 'Lisa Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 4.9
      },
      service: 'Personal Training Session',
      date: '2024-01-10',
      time: '6:00 PM',
      duration: '60 min',
      price: 60,
      status: 'completed',
      location: 'Manhattan, NYC',
      reviewed: false
    }
  ];

  const favoriteProviders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      service: 'Hair Styling',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      rating: 4.9,
      reviews: 127,
      location: 'Downtown, NYC',
      startingPrice: 45
    }
  ];

  const customerProfile = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2023',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalSpent: 'R1,285',
    memberSince: '1 year'
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      completed: 'bg-blue-50 text-blue-700 border-blue-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100',
    };
    return `px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-50 text-slate-600'}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage your appointments and personal settings.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all">
             Explore Services
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Upcoming', value: upcomingBookings.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Completed', value: pastBookings.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Favorites', value: favoriteProviders.length, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Total Spent', value: customerProfile.totalSpent, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
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
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                  <div className="relative inline-block mb-4">
                    <img src={customerProfile.avatar} className="w-24 h-24 rounded-full border-4 border-slate-50 mx-auto object-cover" alt="" />
                    <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{customerProfile.name}</h2>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Member since {customerProfile.joinDate}</p>
                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                    Update Avatar
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg"><Mail className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                        <p className="text-sm font-semibold text-slate-700">{customerProfile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg"><Phone className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                        <p className="text-sm font-semibold text-slate-700">{customerProfile.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg"><MapPin className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                        <p className="text-sm font-semibold text-slate-700">{customerProfile.location}</p>
                      </div>
                    </div>
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
                  <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-rose-50 transition-colors text-rose-600">
                    <div className="flex items-center gap-3">
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-bold">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'upcoming' || activeTab === 'past') && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search bookings..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                  <Filter className="h-4 w-4" /> Filter
                </button>
              </div>

              {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <img src={booking.provider.avatar} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" alt="" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900">{booking.service}</h4>
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                          with {booking.provider.name} • <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {booking.provider.rating}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 max-w-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg"><Calendar className="h-4 w-4 text-indigo-600" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                          <p className="text-xs font-bold text-slate-700 whitespace-nowrap">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><Clock className="h-4 w-4 text-blue-600" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                          <p className="text-xs font-bold text-slate-700">{booking.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 hidden md:flex">
                        <div className="p-2 bg-emerald-50 rounded-lg"><MapPin className="h-4 w-4 text-emerald-600" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                          <p className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{booking.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                        <p className="text-lg font-black text-slate-900">R{booking.price}</p>
                      </div>
                      <button className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm">
                        {activeTab === 'upcoming' ? 'Reschedule' : 'Rebook'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProviders.map((provider) => (
                <div key={provider.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <img src={provider.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <button className="p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100">
                      <Heart className="h-5 w-5 fill-rose-500" />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{provider.name}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-4">{provider.service}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold mb-6">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="h-3 w-3 fill-amber-600" /> {provider.rating}
                    </div>
                    <div className="text-slate-400">({provider.reviews} Reviews)</div>
                    <div className="text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {provider.location}</div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Starts at</p>
                      <p className="text-xl font-black text-slate-900">R{provider.startingPrice}</p>
                    </div>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}