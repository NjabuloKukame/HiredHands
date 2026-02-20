'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, MapPin, Phone, Clock, Globe, Plus, Trash2,
  Check, ArrowLeft, ArrowRight, DollarSign, Tag, Camera,
  Info, Calendar, Sparkles
} from 'lucide-react';

export default function ProviderSetup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    bio: '',
    experienceYears: '',
    location: '',
    phone: '',
    responseTimeHours: '24',
    languages: ['English']
  });

  const [services, setServices] = useState([
    { id: '1', name: '', description: '', categoryId: '', price: '', durationMinutes: '60' }
  ]);

  const [availability, setAvailability] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }
  ]);

  const [newLanguage, setNewLanguage] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' }, { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

    // Simulating fetching categories
    const categories = [
      { id: '1', name: 'Hair Styling' },
      { id: '2', name: 'Photography' },
      { id: '3', name: 'Home Repair' },
      { id: '4', name: 'Tutoring' },
      { id: '5', name: 'Cleaning' },
      { id: '6', name: 'Beauty & Makeup' }
    ];



  // Handlers for Services and Availability (kept your logic)
  const addService = () => setServices([...services, { id: Date.now().toString(), name: '', description: '', categoryId: '', price: '', durationMinutes: '60' }]);
  const removeService = (id) => services.length > 1 && setServices(services.filter(s => s.id !== id));
  const updateService = (id, field, value) => setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));

  const addAvailabilitySlot = () => setAvailability([...availability, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  const removeAvailabilitySlot = (index) => availability.length > 1 && setAvailability(availability.filter((_, i) => i !== index));
  const updateAvailability = (index, field, value) => setAvailability(availability.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    { number: 1, title: 'Business', icon: Briefcase },
    { number: 2, title: 'Services', icon: Tag },
    { number: 3, title: 'Schedule', icon: Calendar }
  ];

  const isStep1Valid = () => businessInfo.businessName && businessInfo.bio && businessInfo.location;
  const isStep2Valid = () => services.every(s => s.name && s.categoryId && s.price);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 pb-20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
        <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100">
            <Sparkles className="w-3 h-3" /> Provider Portal
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Set up your business</h1>
          <p className="mt-2 text-slate-500 font-medium">Create a professional profile to start receiving bookings.</p>
        </header>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${currentStep >= step.number ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && <div className={`w-16 h-0.5 mx-4 -mt-6 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
          <div className="p-8 sm:p-12">

            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <Briefcase className="w-8 h-8 text-slate-300" />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                      <Camera className="w-4 h-4" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormInput label="Business Name" icon={Briefcase} value={businessInfo.businessName} onChange={(v) => setBusinessInfo({ ...businessInfo, businessName: v })} placeholder="Elite Auto Detailing" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Bio</label>
                    <textarea
                      value={businessInfo.bio}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, bio: e.target.value })}
                      rows={3}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="Describe your expertise and service quality..."
                    />
                  </div>
                  <FormInput label="Location" icon={MapPin} value={businessInfo.location} onChange={(v) => setBusinessInfo({ ...businessInfo, location: v })} placeholder="Johannesburg, GP" />
                  <FormInput label="Phone" icon={Phone} value={businessInfo.phone} onChange={(v) => setBusinessInfo({ ...businessInfo, phone: v })} placeholder="+27 82 123 4567" />
                </div>
              </div>
            )}

            {/* Step 2: Services & Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
                  <button onClick={addService} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all">
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>

                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative group">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                          <FormInput label="Service Name" icon={Tag} value={service.name} onChange={(v) => updateService(service.id, 'name', v)} placeholder="Full House Cleaning" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                          <select
                            value={service.categoryId}
                            onChange={(e) => updateService(service.id, 'categoryId', e.target.value)}
                            className="w-full mt-2 bg-white border border-slate-200 rounded-2xl py-3.5 px-4 outline-none focus:border-indigo-500 text-sm"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <FormInput label="Price (ZAR)" icon={DollarSign} type="number" value={service.price} onChange={(v) => updateService(service.id, 'price', v)} placeholder="450" />
                        <FormInput label="Duration (min)" icon={Clock} type="number" value={service.durationMinutes} onChange={(v) => updateService(service.id, 'durationMinutes', v)} placeholder="60" />
                      </div>
                      {services.length > 1 && (
                        <button onClick={() => removeService(service.id)} className="absolute -top-2 -right-2 p-2 bg-white border border-slate-200 text-red-500 rounded-xl shadow-sm hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Working Hours</h2>
                  <button onClick={addAvailabilitySlot} className="text-indigo-600 text-xs font-bold border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50">
                    + Add Slot
                  </button>
                </div>

                <div className="space-y-3">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Day</label>
                        <select
                          value={slot.dayOfWeek}
                          onChange={(e) => updateAvailability(index, 'dayOfWeek', parseInt(e.target.value))}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
                        >
                          {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start</label>
                        <input type="time" value={slot.startTime} onChange={(e) => updateAvailability(index, 'startTime', e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End</label>
                        <input type="time" value={slot.endTime} onChange={(e) => updateAvailability(index, 'endTime', e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none" />
                      </div>
                      {availability.length > 1 && (
                        <button onClick={() => removeAvailabilitySlot(index)} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 transition-all ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={currentStep === 3 ? () => router.push('/dashboard') : () => setCurrentStep(currentStep + 1)}
              disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {currentStep === 3 ? 'Launch Business' : 'Continue'}
              {currentStep === 3 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          {...props}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
        />
      </div>
    </div>
  );
}