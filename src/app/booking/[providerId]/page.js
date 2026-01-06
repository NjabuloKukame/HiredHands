'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, CreditCard, Check, ArrowLeft, ArrowRight, User, MapPin, Star } from 'lucide-react';

export default function BookingFlow() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: searchParams.get('service') || '',
    date: '',
    time: '',
    notes: '',
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    paymentMethod: 'card'
  });

  // Mock provider data - in a real app, this would be fetched based on the ID
  const provider = {
    id: 1,
    name: 'Ntombi Dlamini',
    title: 'Professional Hair Stylist & Colorist',
    rating: 4.9,
    reviews: 127,
    location: 'Nelspruit, Mpumalanga',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    services: [
      {
        id: '1',
        name: 'Haircut & Style',
        description: 'Professional cut and styling tailored to your face shape and lifestyle',
        duration: '60 min',
        price: 65
      },
      {
        id: '2',
        name: 'Full Color',
        description: 'Complete color transformation with premium products',
        duration: '120 min',
        price: 120
      },
      {
        id: '3',
        name: 'Highlights',
        description: 'Partial or full highlights to brighten your look',
        duration: '90 min',
        price: 95
      },
      {
        id: '4',
        name: 'Wedding Hair',
        description: 'Special occasion styling for your perfect day',
        duration: '90 min',
        price: 150
      }
    ]
  };

  const selectedService = provider.services.find(s => s.id === bookingData.serviceId) || provider.services[0];

  const availableDates = [
    { date: '2024-01-15', day: 'Mon', dayNum: '15' },
    { date: '2024-01-16', day: 'Tue', dayNum: '16' },
    { date: '2024-01-17', day: 'Wed', dayNum: '17' },
    { date: '2024-01-18', day: 'Thu', dayNum: '18' },
    { date: '2024-01-19', day: 'Fri', dayNum: '19' },
    { date: '2024-01-22', day: 'Mon', dayNum: '22' },
    { date: '2024-01-23', day: 'Tue', dayNum: '23' }
  ];

  const availableTimes = [
    '9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM'
  ];

  const steps = [
    { number: 1, title: 'Select Service', icon: User },
    { number: 2, title: 'Choose Date & Time', icon: Calendar },
    { number: 3, title: 'Your Details', icon: User },
    { number: 4, title: 'Payment', icon: CreditCard }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingComplete = () => {
    // In a real app, this would process the payment and create the booking
    router.push('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Select a Service</h2>
            <div className="space-y-4">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    bookingData.serviceId === service.id
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, serviceId: service.id })}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">{service.name}</h3>
                      <p className="text-white/70 mt-1">{service.description}</p>
                      <div className="flex items-center mt-2 text-sm text-white/60">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-emerald-400">R{service.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Choose Date & Time</h2>
            
            <div>
              <h3 className="font-semibold text-white mb-3">Select Date</h3>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((dateObj) => (
                  <button
                    key={dateObj.date}
                    onClick={() => setBookingData({ ...bookingData, date: dateObj.date })}
                    className={`p-3 rounded-lg text-center transition-colors border ${
                      bookingData.date === dateObj.date
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    <div className="text-xs">{dateObj.day}</div>
                    <div className="font-semibold">{dateObj.dayNum}</div>
                  </button>
                ))}
              </div>
            </div>

            {bookingData.date && (
              <div>
                <h3 className="font-semibold text-white mb-3">Select Time</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingData({ ...bookingData, time })}
                      className={`p-3 rounded-lg text-center transition-colors border ${
                        bookingData.time === time
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-white mb-3">Special Requests (Optional)</h3>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                placeholder="Any special requests or notes for your service provider..."
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.customerInfo.name}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={bookingData.customerInfo.email}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.customerInfo.phone}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
              <h4 className="font-semibold text-blue-300 mb-2">Booking Confirmation</h4>
              <p className="text-blue-200 text-sm">
                You&apos;ll receive a confirmation email and SMS with booking details and the service provider&apos;s contact information.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Payment & Confirmation</h2>
            
            <div className="glass-semi-transparent p-6 rounded-lg border border-white/20">
              <h3 className="font-semibold text-white mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Service:</span>
                  <span className="font-medium text-white">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Duration:</span>
                  <span className="font-medium text-white">{selectedService.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Date:</span>
                  <span className="font-medium text-white">
                    {bookingData.date ? new Date(bookingData.date).toLocaleDateString() : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Time:</span>
                  <span className="font-medium text-white">{bookingData.time || 'Not selected'}</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="font-bold text-xl text-emerald-400">R{selectedService.price}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-white/30 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={bookingData.paymentMethod === 'card'}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-3 text-white/70" />
                  <span className="text-white">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center p-4 border border-white/30 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={bookingData.paymentMethod === 'paypal'}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-white">PayPal</span>
                </label>
              </div>
            </div>

            {bookingData.paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30">
              <h4 className="font-semibold text-yellow-300 mb-2">Cancellation Policy</h4>
              <p className="text-yellow-200 text-sm">
                Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours may incur a 50% charge.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <div className="glass-dark-card rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center gap-4">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{provider.name}</h1>
              <p className="text-white/70">{provider.title}</p>
              <div className="flex items-center mt-1 text-sm text-white/60">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-white">{provider.rating}</span>
                <span className="ml-1">({provider.reviews} reviews)</span>
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4 mr-1" />
                <span>{provider.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="glass-dark-card rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 text-white/50'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-400' : 'text-white/50'
                  }`}>
                    Step {step.number}
                  </div>
                  <div className="text-xs text-white/60">{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 ml-6 ${
                    currentStep > step.number ? 'bg-blue-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-dark-card rounded-2xl p-6 mb-8 border border-white/20">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !bookingData.serviceId) ||
                (currentStep === 2 && (!bookingData.date || !bookingData.time)) ||
                (currentStep === 3 && (!bookingData.customerInfo.name || !bookingData.customerInfo.email || !bookingData.customerInfo.phone))
              }
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleBookingComplete}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg"
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}