'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, MapPin, Phone, Mail, Heart, Bell, Plus, Trash2,
  Check, ArrowLeft, ArrowRight, Globe, Camera, X, Sparkles
} from 'lucide-react';

const categories = [
  { id: '1', name: 'Hair Styling' }, { id: '2', name: 'Photography' },
  { id: '3', name: 'Home Repair' }, { id: '4', name: 'Tutoring' },
  { id: '5', name: 'Personal Training' }, { id: '6', name: 'Cleaning' },
  { id: '7', name: 'Beauty & Makeup' }, { id: '8', name: 'Pet Care' },
  { id: '9', name: 'Massage Therapy' }, { id: '10', name: 'Music Lessons' }
];

const availableLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
];

export default function CustomerSetup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', address: ''
  });

  const [preferences, setPreferences] = useState([{ categoryId: '', categoryName: '' }]);
  const [preferredLanguages, setPreferredLanguages] = useState(['English']);
  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsNotifications: false, reminders: true, newProviders: false
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updatePreference = (index, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newPrefs = [...preferences];
    newPrefs[index] = { categoryId, categoryName: category?.name || '' };
    setPreferences(newPrefs);
  };

  const steps = [
    { number: 1, title: 'Identity', icon: User },
    { number: 2, title: 'Preferences', icon: Heart },
    { number: 3, title: 'Finalize', icon: Bell }
  ];

  const isStep1Valid = () => personalInfo.fullName && personalInfo.email && personalInfo.phone;
  const isStep2Valid = () => preferences.some(p => p.categoryId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100">
            <Sparkles className="w-3 h-3" /> Get Started
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Complete your profile
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Let's get your account ready for your first booking.
          </p>
        </header>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= step.number 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > step.number ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-4 -mt-6 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-500">
          <div className="p-8 sm:p-12">
            
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-slate-200" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <FormInput label="Full Name" icon={User} value={personalInfo.fullName} onChange={(v) => setPersonalInfo({...personalInfo, fullName: v})} placeholder="Alex Morgan" />
                  </div>
                  <FormInput label="Email" icon={Mail} value={personalInfo.email} onChange={(v) => setPersonalInfo({...personalInfo, email: v})} placeholder="alex@example.com" />
                  <FormInput label="Phone" icon={Phone} value={personalInfo.phone} onChange={(v) => setPersonalInfo({...personalInfo, phone: v})} placeholder="(555) 000-0000" />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Service Preferences</h2>
                  <button onClick={() => setPreferences([...preferences, {categoryId: '', categoryName: ''}])} className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>
                {preferences.map((pref, i) => (
                  <div key={i} className="flex gap-3">
                    <select
                      value={pref.categoryId}
                      onChange={(e) => updatePreference(i, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">What service do you need?</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {preferences.length > 1 && (
                      <button onClick={() => setPreferences(preferences.filter((_, idx) => idx !== i))} className="p-4 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in zoom-in-95">
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, val]) => (
                    <label key={key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors">
                      <span className="capitalize font-bold text-slate-700 text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input 
                        type="checkbox" 
                        checked={val} 
                        onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                        className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 transition-all ${currentStep === 1 ? 'opacity-0' : 'opacity-100'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={currentStep === 3 ? () => router.push('/dashboard') : () => setCurrentStep(currentStep + 1)}
              disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
            >
              {currentStep === 3 ? 'Get Started' : 'Continue'} <ArrowRight className="w-4 h-4" />
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