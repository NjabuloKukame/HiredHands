'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, MapPin, Phone, Mail, Heart, Bell, Plus, Trash2,
  Check, ArrowLeft, ArrowRight, Globe, Camera, Sparkles, Loader2, AlertCircle
} from 'lucide-react';

const categories = [
  { id: '1', name: 'Hair Styling' }, { id: '2', name: 'Photography' },
  { id: '3', name: 'Home Repair' }, { id: '4', name: 'Tutoring' },
  { id: '5', name: 'Personal Training' }, { id: '6', name: 'Cleaning' },
  { id: '7', name: 'Beauty & Makeup' }, { id: '8', name: 'Pet Care' },
  { id: '9', name: 'Massage Therapy' }, { id: '10', name: 'Music Lessons' }
];

const availableLanguages = [
  'English', 'Afrikaans', 'isiZulu', 'Swati', 'Xhosa', 'Tsonga',
  'Tswana', 'Venda', 'Sesotho', 'Setswana'
];

const notificationLabels = {
  emailNotifications: 'Email Notifications',
  smsNotifications: 'SMS Notifications',
  reminders: 'Booking Reminders',
  newProviders: 'New Providers Near Me',
};

export default function CustomerSetup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', address: ''
  });
  const [step1Errors, setStep1Errors] = useState({});

  const [preferences, setPreferences] = useState([{ categoryId: '', categoryName: '' }]);
  const [preferredLanguages, setPreferredLanguages] = useState(['English']);
  const [step2Errors, setStep2Errors] = useState({});

  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsNotifications: false, reminders: true, newProviders: false
  });

  // ── Image ────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Preferences ──────────────────────────────────────────────────────
  const updatePreference = (index, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newPrefs = [...preferences];
    newPrefs[index] = { categoryId, categoryName: category?.name || '' };
    setPreferences(newPrefs);
    if (step2Errors.preferences) setStep2Errors({});
  };

  const toggleLanguage = (lang) => {
    setPreferredLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
    if (step2Errors.languages) setStep2Errors({});
  };

  // ── Validation ───────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errors = {};
    if (!personalInfo.fullName.trim()) errors.fullName = 'Full Name Is Required.';
    if (!personalInfo.email.trim()) {
      errors.email = 'Email Is Required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      errors.email = 'Please Enter A Valid Email.';
    }
    if (!personalInfo.phone.trim()) errors.phone = 'Phone Number Is Required.';
    if(!personalInfo.location.trim()) errors.location = 'City/Region Is Required.';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!preferences.some(p => p.categoryId)) errors.preferences = 'Please Select At Least One Service.';
    if (preferredLanguages.length === 0) errors.languages = 'Please Select At Least One Language.';
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Navigation ───────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(s => s + 1);
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');

    try {
      let profileImageUrl = null;

      // If there's an image, upload it first (adjust to your upload endpoint)
      // if (profileImageFile) {
      //   const formData = new FormData();
      //   formData.append('file', profileImageFile);
      //   const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      //   if (uploadRes.ok) {
      //     const uploadData = await uploadRes.json();
      //     profileImageUrl = uploadData.url;
      //   }
      //   // If upload fails we still continue — image is optional
      // }

      const payload = {
        personalInfo: { ...personalInfo, profileImageUrl },
        preferences: preferences.filter(p => p.categoryId),
        preferredLanguages,
        notifications,
      };

      const res = await fetch('/api/customer-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      router.push('/customer-dashboard');
    } catch (err) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Steps meta ───────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: 'Identity', icon: User },
    { number: 2, title: 'Preferences', icon: Heart },
    { number: 3, title: 'Finalize', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-gray-100">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-black transition-all duration-700 ease-in-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 text-black text-xs font-bold uppercase tracking-widest mb-4 border border-gray-100">
            <Sparkles className="w-3 h-3" /> Get Started
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Complete your profile</h1>
          <p className="mt-2 text-slate-500 font-medium">Let's get your account ready for your first booking.</p>
        </header>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= step.number
                    ? 'bg-black border-black text-white shadow-lg shadow-gray-100'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > step.number ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-black' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-4 -mt-6 transition-colors duration-500 ${currentStep > step.number ? 'bg-black' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-12">

            {/* ── STEP 1: Identity ── */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profileImage
                        ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        : <User className="h-10 w-10 text-slate-200" />}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-3 bg-black text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <p className="mt-4 text-xs text-slate-400 font-medium">Optional profile photo</p>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <FormInput
                      label="Full Name" icon={User}
                      value={personalInfo.fullName}
                      onChange={v => { setPersonalInfo({ ...personalInfo, fullName: v }); setStep1Errors(e => ({ ...e, fullName: '' })); }}
                      placeholder="David Mabuza"
                      error={step1Errors.fullName}
                    />
                  </div>
                  <FormInput
                    label="Email" icon={Mail}
                    value={personalInfo.email}
                    onChange={v => { setPersonalInfo({ ...personalInfo, email: v }); setStep1Errors(e => ({ ...e, email: '' })); }}
                    placeholder="davidm@example.com"
                    error={step1Errors.email}
                  />
                  <FormInput
                    label="Phone" icon={Phone}
                    value={personalInfo.phone}
                    onChange={v => { setPersonalInfo({ ...personalInfo, phone: v }); setStep1Errors(e => ({ ...e, phone: '' })); }}
                    placeholder="(082) 020-2000"
                    error={step1Errors.phone}
                  />
                  <FormInput
                    label="City / Region" icon={MapPin}
                    value={personalInfo.location}
                    onChange={v => setPersonalInfo({ ...personalInfo, location: v })}
                    placeholder="Johannesburg, South Africa"
                    error={step1Errors.location}
                  />
                  <FormInput
                    label="Street Address" icon={MapPin}
                    value={personalInfo.address}
                    onChange={v => setPersonalInfo({ ...personalInfo, address: v })}
                    placeholder="123 Main St (Optional)"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Preferences ── */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                {/* Service Preferences */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Service Preferences</h2>
                    <button
                      onClick={() => setPreferences([...preferences, { categoryId: '', categoryName: '' }])}
                      className="text-black text-sm font-bold flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Service
                    </button>
                  </div>
                  <div className="space-y-3">
                    {preferences.map((pref, i) => (
                      <div key={i} className="flex gap-3">
                        <select
                          value={pref.categoryId}
                          onChange={e => updatePreference(i, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-black outline-none transition-all appearance-none text-sm font-medium text-slate-700"
                        >
                          <option value="">What service do you need?</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {preferences.length > 1 && (
                          <button
                            onClick={() => setPreferences(preferences.filter((_, idx) => idx !== i))}
                            className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {step2Errors.preferences && <ErrorMessage message={step2Errors.preferences} />}
                </div>

                {/* Language Preferences */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-black" />
                    <h2 className="text-xl font-bold text-slate-900">Preferred Languages</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 font-medium">
                    We'll prioritize providers who speak your language.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map(lang => {
                      const selected = preferredLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                            selected
                              ? 'bg-black border-black text-white shadow-md shadow-gray-100'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-gray-300'
                          }`}
                        >
                          {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {step2Errors.languages && <ErrorMessage message={step2Errors.languages} />}
                </div>
              </div>
            )}

            {/* ── STEP 3: Notifications ── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Notification Settings</h2>
                  <p className="text-sm text-slate-400 mt-1 font-medium">Choose how you'd like to hear from us.</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, val]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-gray-200 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{notificationLabels[key]}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="w-6 h-6 rounded-lg text-black focus:ring-black border-slate-300 transition-all cursor-pointer"
                        />
                      </div>
                    </label>
                  ))}
                </div>

                {/* Global submit error */}
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
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-10 py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-gray-100 hover:bg-gray-900 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : currentStep === 3 ? (
                <><Check className="w-4 h-4" /> Get Started</>
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

// ── Reusable Components ──────────────────────────────────────────────────────

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
            error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-black'
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