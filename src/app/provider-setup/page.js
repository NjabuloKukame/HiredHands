'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  Phone,
  Clock,
  Globe,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Tag
} from 'lucide-react';

export default function ProviderSetup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

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
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const categories = [
      { id: '1', name: 'Hair Styling', slug: 'hair-styling' },
      { id: '2', name: 'Photography', slug: 'photography' },
      { id: '3', name: 'Home Repair', slug: 'home-repair' },
      { id: '4', name: 'Tutoring', slug: 'tutoring' },
      { id: '5', name: 'Personal Training', slug: 'personal-training' },
      { id: '6', name: 'Cleaning', slug: 'cleaning' },
      { id: '7', name: 'Beauty & Makeup', slug: 'beauty-makeup' },
      { id: '8', name: 'Pet Care', slug: 'pet-care' },
      { id: '9', name: 'Massage Therapy', slug: 'massage-therapy' },
      { id: '10', name: 'Music Lessons', slug: 'music-lessons' }
    ];
    setCategories(categories);
  };

  const addService = () => {
    setServices([
      ...services,
      { id: Date.now().toString(), name: '', description: '', categoryId: '', price: '', durationMinutes: '60' }
    ]);
  };

  const removeService = (id) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const updateService = (id, field, value) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addAvailabilitySlot = () => {
    setAvailability([
      ...availability,
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }
    ]);
  };

  const removeAvailabilitySlot = (index) => {
    if (availability.length > 1) {
      setAvailability(availability.filter((_, i) => i !== index));
    }
  };

  const updateAvailability = (index, field, value) => {
    setAvailability(availability.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));
  };

  const addLanguage = () => {
    if (newLanguage && !businessInfo.languages.includes(newLanguage)) {
      setBusinessInfo({
        ...businessInfo,
        languages: [...businessInfo.languages, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language) => {
    if (businessInfo.languages.length > 1) {
      setBusinessInfo({
        ...businessInfo,
        languages: businessInfo.languages.filter(l => l !== language)
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting up provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => {
    return businessInfo.businessName && businessInfo.bio && businessInfo.location && businessInfo.phone;
  };

  const isStep2Valid = () => {
    return services.every(s => s.name && s.categoryId && s.price && s.durationMinutes);
  };

  const isStep3Valid = () => {
    return availability.length > 0;
  };

  const steps = [
    { number: 1, title: 'Business Info', icon: Briefcase },
    { number: 2, title: 'Services & Pricing', icon: DollarSign },
    { number: 3, title: 'Availability', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Set Up Your Business Profile</h1>
          <p className="text-xl text-white/80">
            Let&apos;s get your business ready to accept bookings
          </p>
        </div>

        <div className="glass-dark-card rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-white/50'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="min-h-100">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Business Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        required
                        value={businessInfo.businessName}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="Enter your business name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Bio / About Your Business *
                    </label>
                    <textarea
                      required
                      value={businessInfo.bio}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                      rows={4}
                      placeholder="Tell customers about your business, experience, and what makes you special..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        required
                        value={businessInfo.location}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="tel"
                        required
                        value={businessInfo.phone}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={businessInfo.experienceYears}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, experienceYears: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Typical Response Time (hours)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="number"
                        min="1"
                        value={businessInfo.responseTimeHours}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, responseTimeHours: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {businessInfo.languages.map((language) => (
                        <span
                          key={language}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30"
                        >
                          <Globe className="h-4 w-4" />
                          {language}
                          {businessInfo.languages.length > 1 && (
                            <button
                              onClick={() => removeLanguage(language)}
                              className="hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="Add a language"
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Services & Pricing</h2>
                  <button
                    onClick={addService}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </button>
                </div>

                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id} className="glass-semi-transparent rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Service {index + 1}</h3>
                        {services.length > 1 && (
                          <button
                            onClick={() => removeService(service.id)}
                            className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Service Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={service.name}
                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                            placeholder="e.g., Haircut & Style"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Category *
                          </label>
                          <div className="relative">
                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                            <select
                              required
                              value={service.categoryId}
                              onChange={(e) => updateService(service.id, 'categoryId', e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none appearance-none"
                            >
                              <option value="" className="bg-slate-800">Select a category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id} className="bg-slate-800">
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Price (ZAR) *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={service.price}
                              onChange={(e) => updateService(service.id, 'price', e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                              placeholder="65.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Duration (minutes) *
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                            <input
                              type="number"
                              required
                              min="15"
                              step="15"
                              value={service.durationMinutes}
                              onChange={(e) => updateService(service.id, 'durationMinutes', e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                              placeholder="60"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Description
                          </label>
                          <textarea
                            value={service.description}
                            onChange={(e) => updateService(service.id, 'description', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                            rows={2}
                            placeholder="Describe what's included in this service..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Set Your Availability</h2>
                  <button
                    onClick={addAvailabilitySlot}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Slot
                  </button>
                </div>

                <div className="space-y-4">
                  {availability.map((slot, index) => (
                    <div key={index} className="glass-semi-transparent rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Time Slot {index + 1}</h3>
                        {availability.length > 1 && (
                          <button
                            onClick={() => removeAvailabilitySlot(index)}
                            className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Day of Week *
                          </label>
                          <select
                            value={slot.dayOfWeek}
                            onChange={(e) => updateAvailability(index, 'dayOfWeek', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none"
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day.value} value={day.value} className="bg-slate-800">
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={slot.startTime}
                            onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            End Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={slot.endTime}
                            onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-semi-transparent rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                  <div className="space-y-2 text-white/80">
                    <p><strong className="text-white">Business:</strong> {businessInfo.businessName || 'Not set'}</p>
                    <p><strong className="text-white">Location:</strong> {businessInfo.location || 'Not set'}</p>
                    <p><strong className="text-white">Services:</strong> {services.length} service(s) configured</p>
                    <p><strong className="text-white">Availability:</strong> {availability.length} time slot(s) set</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
                }
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStep3Valid() || loading}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}