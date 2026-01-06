'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Clock, Calendar, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock provider data - in a real app, this would be fetched based on the ID
  const provider = {
    id: params.id,
    name: 'Ntombi Dlamini',
    title: 'Professional Hair Stylist & Colorist',
    rating: 4.9,
    totalReviews: 127,
    location: 'Nelspruit, Mpumalanga',
    distance: '0.8 miles',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    coverImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2',
    bio: 'With over 8 years of experience in the beauty industry, I specialize in modern cuts, creative coloring, and special occasion styling. I believe every client deserves to feel confident and beautiful, and I work closely with each person to achieve their perfect look.',
    experience: '8+ years',
    responseTime: 'Usually responds within 2 hours',
    languages: ['English', 'isiZulu', 'siSwati'],
    portfolio: [
      'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
    ],
    services: [
      {
        id: 1,
        name: 'Haircut & Style',
        description: 'Professional cut and styling tailored to your face shape and lifestyle',
        duration: '60 min',
        price: 65,
        category: 'Cut & Style'
      },
      {
        id: 2,
        name: 'Full Color',
        description: 'Complete color transformation with premium products',
        duration: '120 min',
        price: 120,
        category: 'Coloring'
      },
      {
        id: 3,
        name: 'Highlights',
        description: 'Partial or full highlights to brighten your look',
        duration: '90 min',
        price: 95,
        category: 'Coloring'
      },
      {
        id: 4,
        name: 'Wedding Hair',
        description: 'Special occasion styling for your perfect day',
        duration: '90 min',
        price: 150,
        category: 'Special Events'
      }
    ],
    availability: {
      today: ['2:00 PM', '4:30 PM'],
      tomorrow: ['10:00 AM', '1:00 PM', '3:30 PM', '5:00 PM'],
      thisWeek: 12
    },
    reviews: [
      {
        id: 1,
        name: 'Emily Chen',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Ntombi is absolutely amazing! She transformed my hair completely and I couldn\'t be happier. Her attention to detail and professionalism is outstanding.',
        service: 'Full Color'
      },
      {
        id: 2,
        name: 'Jessica Rodriguez',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 5,
        date: '1 month ago',
        comment: 'Best haircut I\'ve ever had! Ntombi really listened to what I wanted and delivered exactly that. Will definitely be coming back.',
        service: 'Haircut & Style'
      },
      {
        id: 3,
        name: 'Amanda Wilson',
        avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        rating: 5,
        date: '1 month ago',
        comment: 'Ntombi did my wedding hair and it was perfect! She was so professional and made me feel so beautiful on my special day.',
        service: 'Wedding Hair'
      }
    ]
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === provider.portfolio.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? provider.portfolio.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={provider.coverImage}
          alt={provider.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors border ${
              isFavorited 
                ? 'bg-red-500/80 text-white border-red-400/50' 
                : 'bg-white/20 text-white hover:bg-white/30 border-white/30'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/30">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Header */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
                />
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {provider.name}
                  </h1>
                  <p className="text-lg text-white/80 mb-3">{provider.title}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-white">{provider.rating}</span>
                      <span className="ml-1">({provider.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{provider.location} • {provider.distance}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{provider.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-white/80 mb-6 leading-relaxed">{provider.bio}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Experience</h3>
                  <p className="text-white/70">{provider.experience}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Languages</h3>
                  <p className="text-white/70">{provider.languages.join(', ')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Response Time</h3>
                  <p className="text-white/70">{provider.responseTime}</p>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
              
              {/* Main Image */}
              <div className="relative mb-4">
                <img
                  src={provider.portfolio[selectedImageIndex]}
                  alt="Portfolio"
                  className="w-full h-64 md:h-80 object-cover rounded-xl border border-white/20"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors border border-white/30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors border border-white/30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              {/* Thumbnail Grid */}
              <div className="grid grid-cols-6 gap-2">
                {provider.portfolio.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-blue-400 border-blue-400' 
                        : 'border-white/20 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Services & Pricing</h2>
              
              <div className="space-y-4">
                {provider.services.map((service) => (
                  <div
                    key={service.id}
                    className="glass-semi-transparent border border-white/20 rounded-xl p-4 hover:border-blue-400/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        <span className="text-sm text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30 inline-block mt-1">
                          {service.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400">R{service.price}</div>
                        <div className="text-sm text-white/60">{service.duration}</div>
                      </div>
                    </div>
                    <p className="text-white/70 mb-3">{service.description}</p>
                    <button
                      onClick={() => router.push(`/booking/${provider.id}?service=${service.id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">
                Reviews ({provider.reviews.length})
              </h2>
              
              <div className="space-y-6">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/20 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{review.name}</h4>
                            <p className="text-sm text-white/60">{review.service} • {review.date}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/80">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Quick Booking</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Available Today</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.availability.today.map((time, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 border border-white/30 rounded-lg text-sm text-white hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Available Tomorrow</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.availability.tomorrow.slice(0, 3).map((time, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 border border-white/30 rounded-lg text-sm text-white hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                    {provider.availability.tomorrow.length > 3 && (
                      <span className="px-3 py-2 text-sm text-white/60">
                        +{provider.availability.tomorrow.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push(`/booking/${provider.id}`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  View Full Calendar
                </button>
                <button className="w-full border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Send Message
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-white/60">
                {provider.availability.thisWeek} slots available this week
              </div>
            </div>

            {/* Contact Info */}
            <div className="glass-dark-card rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Location & Contact</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <MapPin className="h-4 w-4 mr-3 text-white/60" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Clock className="h-4 w-4 mr-3 text-white/60" />
                  <span>{provider.responseTime}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-white/80">
                  <strong className="text-white">Service Area:</strong> Manhattan, Brooklyn, Queens
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}