'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import {
  Briefcase, MapPin, Phone, Clock, Globe, Plus, Trash2,
  Check, ArrowLeft, ArrowRight, DollarSign, Tag, Camera,
  Calendar, Sparkles, Loader2, AlertCircle, ImagePlus, X, Image, BriefcaseBusiness
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

const MAX_PORTFOLIO_IMAGES = 4;

export default function ProviderSetup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const portfolioInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

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
    bookingFee: '',
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

  // Step 4 — Portfolio: { file, preview, title }[]
  const [portfolioImages, setPortfolioImages] = useState([]);

  // ── Fetch categories ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // ── Profile image (local preview only — uploaded on submit) ──────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Portfolio images (local preview only — uploaded on submit) ───────────
  const handlePortfolioAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_PORTFOLIO_IMAGES - portfolioImages.length;
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioImages(prev => [...prev, { file, preview: reader.result, title: '' }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePortfolioImage = (index) =>
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));

  const updatePortfolioTitle = (index, title) =>
    setPortfolioImages(prev => prev.map((img, i) => i === index ? { ...img, title } : img));

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
  const updateAvailability = (index, field, value) =>
    setAvailability(prev => prev.map((slot, i) => i === index
      ? { ...slot, [field]: field === 'dayOfWeek' ? parseInt(value) : value }
      : slot
    ));

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errors = {};
    if (!businessInfo.businessName.trim()) errors.businessName = 'Business name is required.';
    if (!businessInfo.bio.trim() || businessInfo.bio.trim().length < 20) errors.bio = 'Bio must be at least 20 characters.';
    if (!businessInfo.location.trim()) errors.location = 'Location is required.';
    if (!businessInfo.phone.trim()) errors.phone = 'Phone number is required.';
    if (businessInfo.phone.trim() && !/^\d+$/.test(businessInfo.phone.trim())) errors.phone = 'Phone number must be numeric.';
    if (businessInfo.bookingFee !== '' && parseFloat(businessInfo.bookingFee) < 0) errors.bookingFee = 'Booking fee cannot be negative.';
    if (businessInfo.languages.length === 0) errors.languages = 'Select at least one language.';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (services.some(s => !s.name.trim() || !s.categoryId || !s.price)) errors.services = 'Each service needs a name, category, and price.';
    if (services.some(s => s.price && parseFloat(s.price) <= 0)) errors.price = 'Price must be greater than 0.';
    if (services.some(s => s.durationMinutes && parseInt(s.durationMinutes) <= 0)) errors.duration = 'Duration must be greater than 0.';
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    if (availability.some(s => s.startTime >= s.endTime)) errors.time = 'End time must be after start time for each slot.';
    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(s => s + 1);
  };

  // ── Upload helper ─────────────────────────────────────────────────────────
  // Returns { url, publicId } on success, or null on failure.
  async function uploadFile(file, type) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`/api/upload?type=${type}`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`[upload] ${type} failed:`, err.error || res.status);
        return null;
      }
      return await res.json(); // { url, publicId }
    } catch (err) {
      console.error(`[upload] ${type} network error:`, err);
      return null;
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');

    try {
      // 1. Upload avatar (?type=avatar)
      //    Goes to: hired-hands/providers/{userId}/avatar/avatar
      //    Uses a stable public ID so re-uploads overwrite automatically.
      let profileImageUrl = null;
      if (profileImageFile) {
        const result = await uploadFile(profileImageFile, 'avatar');
        if (result) {
          profileImageUrl = result.url;
          // publicId not stored for avatar — it always overwrites the same path
        } else {
          console.warn('[setup] Avatar upload failed, continuing without avatar.');
        }
      }

      // 2. Upload portfolio images (?type=portfolio)
      //    Each gets a unique Cloudinary ID so multiple images accumulate.
      //    We store BOTH url AND publicId so the dashboard can delete from Cloudinary later.
      const portfolioData = [];
      for (const item of portfolioImages) {
        const result = await uploadFile(item.file, 'portfolio');
        if (result) {
          portfolioData.push({
            imageUrl: result.url,
            publicId: result.publicId,  // ← required for Cloudinary deletion later
            title:    item.title.trim() || 'Portfolio Image',
          });
        } else {
          console.warn('[setup] A portfolio image failed to upload, skipping it.');
        }
      }

      // 3. POST everything to /api/provider-setup
      const payload = {
        businessInfo: {
          ...businessInfo,
          experienceYears:   businessInfo.experienceYears ? parseInt(businessInfo.experienceYears) : null,
          responseTimeHours: parseInt(businessInfo.responseTimeHours),
          bookingFee:        businessInfo.bookingFee ? parseFloat(businessInfo.bookingFee) : 0,
          profileImageUrl,
        },
        services: services.map(s => ({
          ...s,
          price:           parseFloat(s.price),
          durationMinutes: parseInt(s.durationMinutes),
        })),
        availability,
        portfolio: portfolioData,
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

    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business',  icon: Briefcase },
    { number: 2, title: 'Services',  icon: Tag },
    { number: 3, title: 'Schedule',  icon: Calendar },
    { number: 4, title: 'Portfolio', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-gray-100 pb-20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
        <div className="h-full bg-black transition-all duration-700" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-black text-xs font-bold uppercase tracking-widest mb-4 border border-gray-100">
            <BriefcaseBusiness className="w-3 h-3" /> Provider Portal
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
                    ? 'bg-black border-black text-white shadow-lg shadow-gray-100'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-black' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-14 h-0.5 mx-2 sm:mx-3 -mt-6 transition-colors duration-500 ${currentStep > step.number ? 'bg-black' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
          <div className="p-8 sm:p-12">

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-4xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profileImage
                        ? <NextImage src={profileImage} width={112} height={112} className="w-full h-full object-cover" alt="Business" />
                        : <Briefcase className="w-8 h-8 text-slate-300" />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-black text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                      <Camera className="w-4 h-4" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <p className="mt-4 text-xs text-slate-400 font-medium">Business / profile photo (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormInput label="Business Name" icon={Briefcase} value={businessInfo.businessName}
                      onChange={v => { setBusinessInfo(p => ({ ...p, businessName: v })); setStep1Errors(e => ({ ...e, businessName: '' })); }}
                      placeholder="Elite Auto Detailing" error={step1Errors.businessName} />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Bio</label>
                    <textarea value={businessInfo.bio}
                      onChange={e => { setBusinessInfo(p => ({ ...p, bio: e.target.value })); setStep1Errors(err => ({ ...err, bio: '' })); }}
                      rows={3}
                      className={`w-full bg-slate-50 border rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all text-sm ${step1Errors.bio ? 'border-red-300' : 'border-slate-200'}`}
                      placeholder="Describe your expertise and what makes your service exceptional..." />
                    {step1Errors.bio && <ErrorMessage message={step1Errors.bio} />}
                  </div>

                  <FormInput label="Location" icon={MapPin} value={businessInfo.location}
                    onChange={v => { setBusinessInfo(p => ({ ...p, location: v })); setStep1Errors(e => ({ ...e, location: '' })); }}
                    placeholder="Johannesburg, GP" error={step1Errors.location} />

                  <FormInput label="Phone" icon={Phone} value={businessInfo.phone}
                    onChange={v => { setBusinessInfo(p => ({ ...p, phone: v })); setStep1Errors(e => ({ ...e, phone: '' })); }}
                    placeholder="0821234567" error={step1Errors.phone} />

                  <FormInput label="Years of Experience (optional)" icon={Briefcase} type="number"
                    value={businessInfo.experienceYears}
                    onChange={v => setBusinessInfo(p => ({ ...p, experienceYears: v }))}
                    placeholder="5" />

                  <div className="space-y-1">
                    <FormInput label="Base Booking Fee, ZAR (optional)" icon={DollarSign}
                      type="number" min="0" step="0.01"
                      value={businessInfo.bookingFee}
                      onChange={v => { setBusinessInfo(p => ({ ...p, bookingFee: v })); setStep1Errors(e => ({ ...e, bookingFee: '' })); }}
                      placeholder="50" error={step1Errors.bookingFee} />
                    <p className="text-[10px] text-slate-400 ml-1">Flat fee charged per booking, on top of the service price. Leave blank for R0.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Response Time</label>
                    <select value={businessInfo.responseTimeHours} onChange={e => setBusinessInfo(p => ({ ...p, responseTimeHours: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 focus:bg-white focus:border-black outline-none transition-all text-sm font-medium appearance-none">
                      <option value="1">Within 1 hour</option>
                      <option value="4">Within 4 hours</option>
                      <option value="12">Within 12 hours</option>
                      <option value="24">Within 24 hours</option>
                      <option value="48">Within 48 hours</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-black" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Languages Spoken</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map(lang => {
                      const selected = businessInfo.languages.includes(lang);
                      return (
                        <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                            selected ? 'bg-black border-black text-white shadow-md shadow-gray-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-gray-300'
                          }`}>
                          {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}{lang}
                        </button>
                      );
                    })}
                  </div>
                  {step1Errors.languages && <ErrorMessage message={step1Errors.languages} />}
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
                  <button onClick={addService} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-black rounded-xl font-bold text-xs hover:bg-gray-100 transition-all">
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>

                {step2Errors.services  && <ErrorMessage message={step2Errors.services} />}
                {step2Errors.price     && <ErrorMessage message={step2Errors.price} />}
                {step2Errors.duration  && <ErrorMessage message={step2Errors.duration} />}

                <div className="space-y-4">
                  {services.map(service => (
                    <div key={service.id} className="p-6 bg-slate-50 rounded-4xl border border-slate-200 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Service Name" icon={Tag} value={service.name}
                          onChange={v => updateService(service.id, 'name', v)} placeholder="Full House Cleaning" />
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                          <select value={service.categoryId} onChange={e => updateService(service.id, 'categoryId', e.target.value)}
                            disabled={categoriesLoading}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 outline-none focus:border-black text-sm font-medium appearance-none">
                            <option value="">{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <FormInput label="Price (ZAR)" icon={DollarSign} type="number" min="0"
                          value={service.price} onChange={v => updateService(service.id, 'price', v)} placeholder="450" />
                        <FormInput label="Duration (minutes)" icon={Clock} type="number" min="15"
                          value={service.durationMinutes} onChange={v => updateService(service.id, 'durationMinutes', v)} placeholder="60" />
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (optional)</label>
                          <textarea value={service.description} onChange={e => updateService(service.id, 'description', e.target.value)}
                            rows={2} className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:border-black outline-none transition-all text-sm"
                            placeholder="What&apos;s included in this service?" />
                        </div>
                      </div>
                      {services.length > 1 && (
                        <button onClick={() => removeService(service.id)}
                          className="absolute -top-2 -right-2 p-2 bg-white border border-slate-200 text-red-400 rounded-xl shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Working Hours</h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Set the days and hours you're available for bookings.</p>
                  </div>
                  <button onClick={addAvailabilitySlot} className="text-black text-xs font-bold border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    + Add Slot
                  </button>
                </div>

                {step3Errors.time && <ErrorMessage message={step3Errors.time} />}

                <div className="space-y-3">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-35">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Day</label>
                        <select value={slot.dayOfWeek} onChange={e => updateAvailability(index, 'dayOfWeek', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-black appearance-none">
                          {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start</label>
                        <input type="time" value={slot.startTime} onChange={e => updateAvailability(index, 'startTime', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-black" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End</label>
                        <input type="time" value={slot.endTime} onChange={e => updateAvailability(index, 'endTime', e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-black" />
                      </div>
                      {availability.length > 1 && (
                        <button onClick={() => removeAvailabilitySlot(index)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Portfolio</h2>
                  <p className="text-sm text-slate-400 mt-1 font-medium">
                    Show off your best work. Upload up to {MAX_PORTFOLIO_IMAGES} photos — customers will see these on your profile.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {portfolioImages.map((img, index) => (
                    <div key={index} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <NextImage src={img.preview} alt={`Portfolio ${index + 1}`} width={300} height={300} className="w-full aspect-square object-cover" />
                      <button onClick={() => removePortfolioImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-500 rounded-lg shadow-sm transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent">
                        <input type="text" value={img.title} onChange={e => updatePortfolioTitle(index, e.target.value)}
                          placeholder="Add a caption..."
                          className="w-full bg-transparent text-white text-xs font-medium placeholder:text-white/60 outline-none border-b border-white/30 focus:border-white pb-0.5" />
                      </div>
                    </div>
                  ))}

                  {portfolioImages.length < MAX_PORTFOLIO_IMAGES && (
                    <button onClick={() => portfolioInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-gray-300 hover:bg-gray-50/30 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-black">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-xs font-bold">
                        {portfolioImages.length === 0 ? 'Add photos' : `${MAX_PORTFOLIO_IMAGES - portfolioImages.length} slot${MAX_PORTFOLIO_IMAGES - portfolioImages.length > 1 ? 's' : ''} remaining`}
                      </span>
                    </button>
                  )}
                </div>

                <input type="file" ref={portfolioInputRef} className="hidden" accept="image/*" multiple onChange={handlePortfolioAdd} />

                {portfolioImages.length === 0 && (
                  <p className="text-center text-xs text-slate-400 font-medium pt-2">
                    Portfolio is optional — you can skip this and add photos later from your dashboard.
                  </p>
                )}

                {/* Progress indicator shown while uploading */}
                {loading && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Uploading photos and saving your profile...
                  </div>
                )}

                {submitError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> {submitError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-8 py-6 sm:py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center gap-3">
            <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 transition-all ${currentStep === 1 ? 'invisible' : ''}`}>
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
            </button>
            <button onClick={currentStep === 4 ? handleSubmit : handleNext} disabled={loading}
              className="px-4 sm:px-10 py-3 sm:py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-gray-100 hover:bg-gray-900 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed text-sm sm:text-base">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : currentStep === 4 ? (
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

function FormInput({ label, icon: Icon, error, onChange, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input {...props} onChange={e => onChange(e.target.value)}
          className={`w-full bg-slate-50 border rounded-2xl py-4 pl-12 pr-4 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-sm font-medium ${
            error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-black'
          }`} />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1.5 ml-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {message}
    </p>
  );
}