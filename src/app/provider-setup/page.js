'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, MapPin, Phone, Clock, Globe, Plus, Trash2,
  Check, ArrowLeft, ArrowRight, DollarSign, Tag, Camera,
  Calendar, Sparkles, Loader2, AlertCircle
} from 'lucide-react';

const daysOfWeek = [
  { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' }, { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const availableLanguages = [
  'English', 'Afrikaans', 'isiZulu', 'Swati', 'Xhosa', 'Tsonga',
  'Tswana', 'Venda', 'Sesotho', 'Setswana'
];

export default function ProviderSetup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Categories fetched from DB
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Step 1 — Business Info
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    bio: '',
    experienceYears: '',
    location: '',
    phone: '',
    responseTimeHours: '24',
    languages: ['English'],
  });
  const [step1Errors, setStep1Errors] = useState({});

  // Step 2 — Services
  const [services, setServices] = useState([
    { id: '1', name: '', description: '', categoryId: '', price: '', durationMinutes: '60' }
  ]);
  const [step2Errors, setStep2Errors] = useState({});

  // Step 3 — Availability
  const [availability, setAvailability] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }
  ]);
  const [step3Errors, setStep3Errors] = useState({});

  // ── Fetch categories on mount ────────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // ── Image ────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Language toggle ──────────────────────────────────────────────────────
  const toggleLanguage = (lang) => {
    setBusinessInfo(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
    setStep1Errors(e => ({ ...e, languages: '' }));
  };

  // ── Services ─────────────────────────────────────────────────────────────
  const addService = () =>
    setServices(prev => [...prev, { id: Date.now().toString(), name: '', description: '', categoryId: '', price: '', durationMinutes: '60' }]);

  const removeService = (id) =>
    services.length > 1 && setServices(prev => prev.filter(s => s.id !== id));

  const updateService = (id, field, value) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    setStep2Errors({});
  };

  // ── Availability ──────────────────────────────────────────────────────────
  const addAvailabilitySlot = () =>
    setAvailability(prev => [...prev, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);

  const removeAvailabilitySlot = (index) =>
    availability.length > 1 && setAvailability(prev => prev.filter((_, i) => i !== index));

  const updateAvailability = (index, field, value) => {
    setAvailability(prev => prev.map((slot, i) => i === index ? { ...slot, [field]: field === 'dayOfWeek' ? parseInt(value) : value } : slot));
    setStep3Errors({});
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errors = {};
    if (!businessInfo.businessName.trim()) errors.businessName = 'Business name is required.';
    if (!businessInfo.bio.trim()) errors.bio = 'A short bio is required.';
    if (businessInfo.bio.trim().length < 20) errors.bio = 'Bio must be at least 20 characters.';
    if (!businessInfo.location.trim()) errors.location = 'Location is required.';
    if (!businessInfo.phone.trim()) errors.phone = 'Phone number is required.';
    if (businessInfo.languages.length === 0) errors.languages = 'Select at least one language.';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const incomplete = services.filter(s => !s.name.trim() || !s.categoryId || !s.price);
    if (incomplete.length > 0) errors.services = 'Each service needs a name, category, and price.';
    services.forEach(s => {
      if (s.price && parseFloat(s.price) <= 0) errors.price = 'Price must be greater than 0.';
      if (s.durationMinutes && parseInt(s.durationMinutes) <= 0) errors.duration = 'Duration must be greater than 0.';
    });
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    const invalid = availability.filter(s => s.startTime >= s.endTime);
    if (invalid.length > 0) errors.time = 'End time must be after start time for each slot.';
    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(s => s + 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    setSubmitError('');

    try {
      let profileImageUrl = null;

      if (profileImageFile) {
        const formData = new FormData();
        formData.append('file', profileImageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          profileImageUrl = uploadData.url;
        }
      }

      const payload = {
        businessInfo: {
          ...businessInfo,
          experienceYears: businessInfo.experienceYears ? parseInt(businessInfo.experienceYears) : null,
          responseTimeHours: parseInt(businessInfo.responseTimeHours),
          profileImageUrl,
        },
        services: services.map(s => ({
          ...s,
          price: parseFloat(s.price),
          durationMinutes: parseInt(s.durationMinutes),
        })),
        availability,
      };

      const res = await fetch('/api/provider-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business', icon: Briefcase },
    { number: 2, title: 'Services', icon: Tag },
    { number: 3, title: 'Schedule', icon: Calendar },
  ];

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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 -mt-6 transition-colors duration-500 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
          <div className="p-8 sm:p-12">

            {/* ── STEP 1: Business Info ── */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profileImage
                        ? <img src={profileImage} className="w-full h-full object-cover" alt="Business" />
                        : <Briefcase className="w-8 h-8 text-slate-300" />}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <p className="mt-4 text-xs text-slate-400 font-medium">Business / profile photo (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormInput
                      label="Business Name" icon={Briefcase}
                      value={businessInfo.businessName}
                      onChange={v => { setBusinessInfo(p => ({ ...p, businessName: v })); setStep1Errors(e => ({ ...e, businessName: '' })); }}
                      placeholder="Elite Auto Detailing"
                      error={step1Errors.businessName}
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Bio</label>
                    <textarea
                      value={businessInfo.bio}
                      onChange={e => { setBusinessInfo(p => ({ ...p, bio: e.target.value })); setStep1Errors(err => ({ ...err, bio: '' })); }}
                      rows={3}
                      className={`w-full bg-slate-50 border rounded-2xl p-4 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm ${
                        step1Errors.bio ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Describe your expertise and what makes your service exceptional..."
                    />
                    {step1Errors.bio && <ErrorMessage message={step1Errors.bio} />}
                  </div>

                  <FormInput
                    label="Location" icon={MapPin}
                    value={businessInfo.location}
                    onChange={v => { setBusinessInfo(p => ({ ...p, location: v })); setStep1Errors(e => ({ ...e, location: '' })); }}
                    placeholder="Johannesburg, GP"
                    error={step1Errors.location}
                  />
                  <FormInput
                    label="Phone" icon={Phone}
                    value={businessInfo.phone}
                    onChange={v => { setBusinessInfo(p => ({ ...p, phone: v })); setStep1Errors(e => ({ ...e, phone: '' })); }}
                    placeholder="+27 82 123 4567"
                    error={step1Errors.phone}
                  />
                  <FormInput
                    label="Years of Experience (optional)" icon={Briefcase}
                    type="number"
                    value={businessInfo.experienceYears}
                    onChange={v => setBusinessInfo(p => ({ ...p, experienceYears: v }))}
                    placeholder="5"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Response Time</label>
                    <select
                      value={businessInfo.responseTimeHours}
                      onChange={e => setBusinessInfo(p => ({ ...p, responseTimeHours: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option value="1">Within 1 hour</option>
                      <option value="4">Within 4 hours</option>
                      <option value="12">Within 12 hours</option>
                      <option value="24">Within 24 hours</option>
                      <option value="48">Within 48 hours</option>
                    </select>
                  </div>
                </div>

                {/* Language Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Languages Spoken</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map(lang => {
                      const selected = businessInfo.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                            selected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {step1Errors.languages && <ErrorMessage message={step1Errors.languages} />}
                </div>
              </div>
            )}

            {/* ── STEP 2: Services & Pricing ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
                  <button
                    onClick={addService}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>

                {step2Errors.services && <ErrorMessage message={step2Errors.services} />}
                {step2Errors.price && <ErrorMessage message={step2Errors.price} />}
                {step2Errors.duration && <ErrorMessage message={step2Errors.duration} />}

                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Service Name" icon={Tag}
                          value={service.name}
                          onChange={v => updateService(service.id, 'name', v)}
                          placeholder="Full House Cleaning"
                        />
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                          <select
                            value={service.categoryId}
                            onChange={e => updateService(service.id, 'categoryId', e.target.value)}
                            disabled={categoriesLoading}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 outline-none focus:border-indigo-500 text-sm font-medium appearance-none"
                          >
                            <option value="">{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <FormInput
                          label="Price (ZAR)" icon={DollarSign}
                          type="number" min="0"
                          value={service.price}
                          onChange={v => updateService(service.id, 'price', v)}
                          placeholder="450"
                        />
                        <FormInput
                          label="Duration (minutes)" icon={Clock}
                          type="number" min="15"
                          value={service.durationMinutes}
                          onChange={v => updateService(service.id, 'durationMinutes', v)}
                          placeholder="60"
                        />
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (optional)</label>
                          <textarea
                            value={service.description}
                            onChange={e => updateService(service.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all text-sm"
                            placeholder="What's included in this service?"
                          />
                        </div>
                      </div>
                      {services.length > 1 && (
                        <button
                          onClick={() => removeService(service.id)}
                          className="absolute -top-2 -right-2 p-2 bg-white border border-slate-200 text-red-400 rounded-xl shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Availability ── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Working Hours</h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Set the days and hours you're available for bookings.</p>
                  </div>
                  <button
                    onClick={addAvailabilitySlot}
                    className="text-indigo-600 text-xs font-bold border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    + Add Slot
                  </button>
                </div>

                {step3Errors.time && <ErrorMessage message={step3Errors.time} />}

                <div className="space-y-3">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Day</label>
                        <select
                          value={slot.dayOfWeek}
                          onChange={e => updateAvailability(index, 'dayOfWeek', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-indigo-500 appearance-none"
                        >
                          {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={e => updateAvailability(index, 'startTime', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={e => updateAvailability(index, 'endTime', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                      {availability.length > 1 && (
                        <button
                          onClick={() => removeAvailabilitySlot(index)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit error shown on final step */}
                {submitError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 transition-all ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : currentStep === 3 ? (
                <><Check className="w-4 h-4" /> Launch Business</>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable Components ───────────────────────────────────────────────────────

function FormInput({ label, icon: Icon, error, onChange, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          {...props}
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-slate-50 border rounded-2xl py-4 pl-12 pr-4 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-sm font-medium ${
            error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-indigo-500'
          }`}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1.5 ml-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}