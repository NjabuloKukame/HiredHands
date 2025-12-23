'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Users, Star, Plus, Edit, Trash2, Eye, Clock, TrendingUp } from 'lucide-react';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in a real app, this would come from an API
  const stats = {
    totalBookings: 47,
    monthlyRevenue: 3240,
    averageRating: 4.9,
    totalReviews: 127
  };

  const upcomingBookings = [
    {
      id: 1,
      customer: {
        name: 'Emily Chen',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
      },
      service: 'Haircut & Style',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '60 min',
      price: 65,
      status: 'confirmed'
    },
    {
      id: 2,
      customer: {
        name: 'Jessica Rodriguez',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
      },
      service: 'Full Color',
      date: '2024-01-21',
      time: '10:00 AM',
      duration: '120 min',
      price: 120,
      status: 'confirmed'
    }
  ];

  const services = [
    {
      id: 1,
      name: 'Haircut & Style',
      description: 'Professional cut and styling tailored to your face shape and lifestyle',
      duration: '60 min',
      price: 65,
      category: 'Cut & Style',
      active: true,
      bookings: 23
    },
    {
      id: 2,
      name: 'Full Color',
      description: 'Complete color transformation with premium products',
      duration: '120 min',
      price: 120,
      category: 'Coloring',
      active: true,
      bookings: 15
    },
    {
      id: 3,
      name: 'Highlights',
      description: 'Partial or full highlights to brighten your look',
      duration: '90 min',
      price: 95,
      category: 'Coloring',
      active: true,
      bookings: 18
    }
  ];

  const portfolioItems = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      title: 'Modern Bob Cut',
      category: 'Haircut'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      title: 'Balayage Highlights',
      category: 'Color'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      title: 'Wedding Updo',
      category: 'Special Event'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Provider Dashboard</h1>
          <p className="text-white/70">Manage your services, bookings, and business analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Average Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark-card rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-dark-card rounded-2xl mb-8 border border-white/20">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'services'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'portfolio'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Bookings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Bookings</h3>
                    <div className="space-y-3">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="glass-semi-transparent border border-white/20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={booking.customer.avatar}
                                alt={booking.customer.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                              />
                              <div>
                                <p className="font-medium text-white">{booking.customer.name}</p>
                                <p className="text-sm text-white/70">{booking.service}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-400">${booking.price}</p>
                              <p className="text-sm text-white/60">
                                {formatDate(booking.date)} at {booking.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <p className="text-sm text-white/90">New booking from Emily Chen</p>
                        <span className="text-xs text-white/60 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <p className="text-sm text-white/90">5-star review received</p>
                        <span className="text-xs text-white/60 ml-auto">1 day ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <p className="text-sm text-white/90">Service price updated</p>
                        <span className="text-xs text-white/60 ml-auto">2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">All Bookings</h3>
                  <button className="px-4 py-2 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                    Set Availability
                  </button>
                </div>
                
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="glass-semi-transparent border border-white/20 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.customer.avatar}
                          alt={booking.customer.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                        />
                        <div>
                          <h4 className="font-semibold text-white">{booking.customer.name}</h4>
                          <p className="text-white/70 mb-2">{booking.service}</p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{formatDate(booking.date)} at {booking.time}</span>
                            <span>{booking.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400 mb-2">${booking.price}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">My Services</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Service
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="glass-semi-transparent border border-white/20 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">{service.name}</h4>
                          <span className="text-sm text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                            {service.category}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-white/70 text-sm mb-4">{service.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-xl font-bold text-emerald-400">${service.price}</div>
                          <div className="text-sm text-white/60">{service.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{service.bookings} bookings</div>
                          <div className={`text-xs ${service.active ? 'text-green-400' : 'text-red-400'}`}>
                            {service.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full border border-white/30 text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">
                        <Eye className="h-4 w-4 inline mr-2" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Portfolio</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Image
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg border border-white/20"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg mr-2 hover:bg-white/30 transition-colors border border-white/30">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-red-500/20 backdrop-blur-sm text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        <p className="text-sm text-white/60">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Business Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Revenue Trend</h4>
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">$3,240</div>
                    <p className="text-sm text-green-400">+12% from last month</p>
                  </div>
                  
                  <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Booking Rate</h4>
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">78%</div>
                    <p className="text-sm text-blue-400">+5% from last month</p>
                  </div>
                </div>
                
                <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                  <h4 className="font-medium text-white mb-4">Popular Services</h4>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <span className="text-white/80">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 rounded-full h-2 border border-white/20">
                            <div 
                              className="bg-linear-to-br from-blue-500 to-purple-600 h-2 rounded-full" 
                              style={{ width: `${(service.bookings / 25) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white/70">{service.bookings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}