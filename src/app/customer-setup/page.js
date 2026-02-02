'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Heart,
  Bell,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  ArrowRight,
  Globe
} from 'lucide-react';

const categories = [
  { id: '1', name: 'Hair Styling' },
  { id: '2', name: 'Photography' },
  { id: '3', name: 'Home Repair' },
  { id: '4', name: 'Tutoring' },
  { id: '5', name: 'Personal Training' },
  { id: '6', name: 'Cleaning' },
  { id: '7', name: 'Beauty & Makeup' },
  { id: '8', name: 'Pet Care' },
  { id: '9', name: 'Massage Therapy' },
  { id: '10', name: 'Music Lessons' }
];

const availableLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
];

export default function CustomerSetup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    address: ''
  });

  const [preferences, setPreferences] = useState([
    { categoryId: '', categoryName: '' }
  ]);

  const [preferredLanguages, setPreferredLanguages] = useState(['English']);
  const [newLanguage, setNewLanguage] = useState('');

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    reminders: true,
    newProviders: false
  });

  const addPreference = () => {
    setPreferences([...preferences, { categoryId: '', categoryName: '' }]);
  };

  const removePreference = (index) => {
    if (preferences.length > 1) {
      setPreferences(preferences.filter((_, i) => i !== index));
    }
  };

  const updatePreference = (index, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newPreferences = [...preferences];
    newPreferences[index] = {
      categoryId,
      categoryName: category?.name || ''
    };
    setPreferences(newPreferences);
  };

  const addLanguage = () => {
    if (newLanguage && !preferredLanguages.includes(newLanguage)) {
      setPreferredLanguages([...preferredLanguages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language) => {
    if (preferredLanguages.length > 1) {
      setPreferredLanguages(preferredLanguages.filter(l => l !== language));
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
      // This will be replaced with actual API call to create CustomerProfile
      const customerData = {
        location: personalInfo.location,
        preferredLanguages: preferredLanguages,
        servicePreferences: preferences.filter(p => p.categoryId).map(p => p.categoryId),
        notifications: notifications
      };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/customer-dashboard');
    } catch (error) {
      console.error('Error setting up customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => {
    return personalInfo.fullName && personalInfo.email && personalInfo.phone && personalInfo.location;
  };

  const isStep2Valid = () => {
    return preferences.some(p => p.categoryId);
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Preferences', icon: Heart },
    { number: 3, title: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-xl text-white/80">
            Set up your account to start booking services
          </p>
        </div>

        <div className="glass-dark-card rounded-2xl p-8 mb-8 border border-white/20">
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
                    currentStep >= step.number ? 'text-blue-400' : 'text-white/50'
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

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        required
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="email"
                        required
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="jane@example.com"
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
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      City/Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        required
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Preferred Languages
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {preferredLanguages.map((language) => (
                        <span
                          key={language}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30"
                        >
                          <Globe className="h-4 w-4" />
                          {language}
                          {preferredLanguages.length > 1 && (
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
                      <select
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none"
                      >
                        <option value="" className="bg-slate-800">Select a language</option>
                        {availableLanguages
                          .filter(lang => !preferredLanguages.includes(lang))
                          .map(lang => (
                            <option key={lang} value={lang} className="bg-slate-800">{lang}</option>
                          ))
                        }
                      </select>
                      <button
                        type="button"
                        onClick={addLanguage}
                        disabled={!newLanguage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                  <h2 className="text-2xl font-bold text-white">Service Preferences</h2>
                  <button
                    onClick={addPreference}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </button>
                </div>

                <p className="text-white/70 mb-4">Select service categories you&apos;re interested in. You&apos;ll get personalized recommendations.</p>

                <div className="space-y-4">
                  {preferences.map((preference, index) => (
                    <div key={index} className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Category {index + 1}</h3>
                        {preferences.length > 1 && (
                          <button
                            onClick={() => removePreference(index)}
                            className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <select
                        value={preference.categoryId}
                        onChange={(e) => updatePreference(index, e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:bg-white/15 focus:border-white/50 focus:outline-none appearance-none"
                      >
                        <option value="" className="bg-slate-800">Select a service category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-slate-800">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Notification Preferences</h2>
                  <p className="text-white/70">Choose how you want to receive updates about your bookings</p>
                </div>

                <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Email Notifications</p>
                        <p className="text-xs text-white/60">Receive booking confirmations and updates via email</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.smsNotifications}
                        onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">SMS Notifications</p>
                        <p className="text-xs text-white/60">Get important updates via text message</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.reminders}
                        onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Booking Reminders</p>
                        <p className="text-xs text-white/60">Get reminded before your scheduled bookings</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.newProviders}
                        onChange={(e) => setNotifications({ ...notifications, newProviders: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">New Providers</p>
                        <p className="text-xs text-white/60">Be notified about new providers in your area</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="glass-semi-transparent rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Summary</h3>
                  <div className="space-y-2 text-white/80">
                    <p><strong className="text-white">Name:</strong> {personalInfo.fullName || 'Not set'}</p>
                    <p><strong className="text-white">Location:</strong> {personalInfo.location || 'Not set'}</p>
                    <p><strong className="text-white">Languages:</strong> {preferredLanguages.join(', ')}</p>
                    <p><strong className="text-white">Service Interests:</strong> {preferences.filter(p => p.categoryId).length} categor{preferences.filter(p => p.categoryId).length === 1 ? 'y' : 'ies'}</p>
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
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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