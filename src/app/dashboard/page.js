'use client';

import { useState } from 'react';
import { 
  Calendar, DollarSign, Users, Star, Plus, Edit, 
  Trash2, Eye, Clock, TrendingUp, X, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Services (CRUD-ready)
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Haircut & Style',
      description: 'Professional cut and styling tailored to your face shape.',
      duration: '60 min',
      price: 65,
      category: 'Cut & Style',
      active: true,
      bookings: 23
    },
    {
      id: 2,
      name: 'Full Color',
      description: 'Complete color transformation with premium products.',
      duration: '120 min',
      price: 120,
      category: 'Coloring',
      active: true,
      bookings: 15
    }
  ]);

  const [newService, setNewService] = useState({
    name: '', price: '', duration: '60 min', description: '', category: 'Cut & Style'
  });

  const stats = {
    totalBookings: 47,
    monthlyRevenue: 3240,
    averageRating: 4.9,
    totalReviews: 127
  };

  const upcomingBookings = [
    {
      id: 1,
      customer: { name: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
      service: 'Haircut & Style',
      date: '2024-01-20',
      time: '2:00 PM',
      price: 65,
      status: 'confirmed'
    },
    {
      id: 2,
      customer: { name: 'Jessica Rodriguez', avatar: 'https://i.pravatar.cc/150?u=jess' },
      service: 'Full Color',
      date: '2024-01-21',
      time: '10:00 AM',
      price: 120,
      status: 'confirmed'
    }
  ];

  const handleAddService = (e) => {
    e.preventDefault();
    const serviceToAdd = {
      ...newService,
      id: Date.now(),
      active: true,
      bookings: 0,
      price: parseFloat(newService.price)
    };
    setServices([...services, serviceToAdd]);
    setIsModalOpen(false);
    setNewService({ name: '', price: '', duration: '60 min', description: '', category: 'Cut & Style' });
  };

  const deleteService = (id) => {
    setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Provider Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Overview of your salon's performance and bookings.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all text-sm font-semibold shadow-sm text-slate-700">
               Export Data
             </button>
             <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold flex items-center gap-2 shadow-sm"
             >
               <Plus className="h-4 w-4" /> Add Service
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Revenue', value: `R${stats.monthlyRevenue}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Rating', value: stats.averageRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Reviews', value: stats.totalReviews, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          {['overview', 'bookings', 'services', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View Calendar</button>
                </div>
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="group bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={booking.customer.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt="" />
                        <div>
                          <h4 className="text-slate-900 font-semibold text-sm">{booking.customer.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{booking.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-slate-900 font-bold text-sm">R{booking.price}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{booking.time}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <h3 className="font-bold text-lg mb-2">Grow your revenue</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  Providers who use our "Last Minute" promotion feature see a 24% increase in booking density.
                </p>
                <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                  Create Promotion
                </button>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {service.category}
                    </div>
                    <button 
                      onClick={() => deleteService(service.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-slate-900">R{service.price}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{service.duration}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-700">{service.bookings} Bookings</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
             <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-bold text-slate-900">Revenue (Last 7 Days)</h3>
                   <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                     <TrendingUp className="h-4 w-4" /> +12.5%
                   </div>
                 </div>
                 <div className="h-48 flex items-end gap-3">
                   {[40, 70, 55, 90, 65, 80, 100].map((height, i) => (
                     <div key={i} className="flex-1 bg-indigo-100 rounded-t-md group relative hover:bg-indigo-600 transition-all cursor-pointer" style={{ height: `${height}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xl">
                          ${height * 10}
                        </div>
                     </div>
                   ))}
                 </div>
                 <div className="flex justify-between mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                 </div>
             </div>
          )}
        </div>

        {/* Light Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create New Service</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddService} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Deluxe Manicure"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (R)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    >
                      <option>30 min</option>
                      <option>60 min</option>
                      <option>90 min</option>
                      <option>120 min</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 mt-2">
                  Confirm & Publish
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}