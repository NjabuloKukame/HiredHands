'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Star, MapPin, MessageCircle, Heart, Filter, Search, User, Mail, Phone, MapPin as Location, CreditCard, Bell, Lock, LogOut, Edit2 } from 'lucide-react';

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Mock data - in a real app, this would come from an API
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
    },
    {
      id: 4,
      provider: {
        name: 'David Wilson',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 4.7
      },
      service: 'Home Repair',
      date: '2024-01-05',
      time: '9:00 AM',
      duration: '3 hours',
      price: 225,
      status: 'completed',
      location: 'Queens, NYC',
      reviewed: true
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
    },
    {
      id: 2,
      name: 'Lisa Rodriguez',
      service: 'Personal Training',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      rating: 4.9,
      reviews: 156,
      location: 'Manhattan, NYC',
      startingPrice: 60
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border border-red-400/30';
      default:
        return 'bg-white/10 text-white/70 border border-white/20';
    }
  };

  const customerProfile = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2023',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalSpent: '$1,285',
    memberSince: '1 year'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-white/70">Manage your profile, bookings, and favorite service providers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Completed</p>
                <p className="text-2xl font-bold text-white">{pastBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                <Heart className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Favorites</p>
                <p className="text-2xl font-bold text-white">{favoriteProviders.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Reviews Left</p>
                <p className="text-2xl font-bold text-white">
                  {pastBookings.filter(b => b.reviewed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-dark-card rounded-2xl mb-8 border border-white/20">
          <div className="border-b border-white/20">
            <nav className="flex space-x-1 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'past'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Favorites
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-400/30">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img
                      src={customerProfile.avatar}
                      alt={customerProfile.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                    />
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-3xl font-bold text-white">{customerProfile.name}</h2>
                      <p className="text-white/70 mt-1">Member since {customerProfile.memberSince}</p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-white/70">Total Spent</p>
                          <p className="text-xl font-bold text-emerald-400">{customerProfile.totalSpent}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-white/70">Bookings Made</p>
                          <p className="text-xl font-bold text-blue-400">{upcomingBookings.length + pastBookings.length}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Account Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-6">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 text-white/60 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white/70">Email Address</p>
                          <p className="font-medium text-white">{customerProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 text-white/60 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white/70">Phone Number</p>
                          <p className="font-medium text-white">{customerProfile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Location className="h-5 w-5 text-white/60 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white/70">Location</p>
                          <p className="font-medium text-white">{customerProfile.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-6">Settings</h3>
                    <div className="space-y-4">
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left">
                        <CreditCard className="h-5 w-5 text-white/60 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">Payment Methods</p>
                          <p className="text-sm text-white/60">Manage your cards</p>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left">
                        <Bell className="h-5 w-5 text-white/60 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">Notifications</p>
                          <p className="text-sm text-white/60">Email & push alerts</p>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left">
                        <Lock className="h-5 w-5 text-white/60 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">Security</p>
                          <p className="text-sm text-white/60">Change password</p>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/20 transition-colors text-left text-red-300 border border-red-400/30">
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Logout</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            {activeTab !== 'profile' && (
              <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search bookings or providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition-colors text-white">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {/* Tab Content */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="glass-semi-transparent border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.provider.avatar}
                          alt={booking.provider.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">{booking.service}</h3>
                          <p className="text-white/70 mb-2">with {booking.provider.name}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-3 flex-wrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{booking.time} ({booking.duration})</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{booking.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-medium text-white">{booking.provider.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400 mb-3">${booking.price}</div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-colors text-white">
                            Reschedule
                          </button>
                          <button className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                            <MessageCircle className="h-4 w-4 inline mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'past' && (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="glass-semi-transparent border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.provider.avatar}
                          alt={booking.provider.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">{booking.service}</h3>
                          <p className="text-white/70 mb-2">with {booking.provider.name}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-3 flex-wrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{booking.time} ({booking.duration})</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{booking.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-medium text-white">{booking.provider.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-white/70 mb-3">${booking.price}</div>
                        <div className="flex gap-2">
                          {!booking.reviewed ? (
                            <button className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                              Leave Review
                            </button>
                          ) : (
                            <span className="px-3 py-1 text-sm text-green-300 bg-green-500/20 rounded-lg border border-green-400/30">
                              Reviewed
                            </span>
                          )}
                          <button className="px-3 py-1 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-colors text-white">
                            Book Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProviders.map((provider) => (
                  <div key={provider.id} className="glass-semi-transparent border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all">
                    <div className="flex items-center mb-4">
                      <img
                        src={provider.avatar}
                        alt={provider.name}
                        className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-white/30"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{provider.name}</h3>
                        <p className="text-white/70 text-sm">{provider.service}</p>
                      </div>
                      <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-400/30">
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-white">{provider.rating}</span>
                        <span className="text-white/60 ml-1 text-sm">({provider.reviews} reviews)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                          Starting at ${provider.startingPrice}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-white/60 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{provider.location}</span>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/provider/${provider.id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}