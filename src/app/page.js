'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Star, MapPin, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
  };

  const categories = [
    { name: 'Hair Styling', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '1,200+ providers' },
    { name: 'Photography', image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '850+ providers' },
    { name: 'Home Repair', image: 'https://images.pexels.com/photos/5691569/pexels-photo-5691569.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '2,100+ providers' },
    { name: 'Tutoring', image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '650+ providers' },
    { name: 'Personal Training', image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '420+ providers' },
    { name: 'Cleaning', image: 'https://images.pexels.com/photos/4239016/pexels-photo-4239016.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2', count: '980+ providers' }
  ];

  const featuredProviders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      service: 'Hair Styling',
      rating: 4.9,
      reviews: 127,
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Johannesburg, SA',
      startingPrice: 'R45'
    },
    {
      id: 2,
      name: 'Sipho Mokoena',
      service: 'Photography',
      rating: 4.8,
      reviews: 89,
      image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Nelspruit, SA',
      startingPrice: 'R150'
    },
    {
      id: 3,
      name: 'Lisa van Wyk',
      service: 'Personal Training',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Cape Town, SA',
      startingPrice: 'R300'
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Find the Perfect Service Provider for Your Needs
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/80 font-light">
              Connect with trusted professionals in your area. From hair styling to home repair, 
              we&apos;ve got you covered.
            </p>
            
            <form onSubmit={handleSearch} className="glass-dark-card rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/70 focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/70 focus:bg-white/15 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 smooth-transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Search <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Popular Service Categories
            </h2>
            <p className="text-xl text-white/80 font-light">
              Browse thousands of professionals ready to help you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {categories.map((category, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl cursor-pointer transform hover:scale-105 smooth-transition glass-card group"
                onClick={() => router.push(`/search?category=${encodeURIComponent(category.name)}`)}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={224}
                  className="w-full h-56 object-cover group-hover:scale-110 smooth-transition"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{category.name}</h3>
                  <p className="text-sm text-white/90 font-medium drop-shadow-md">{category.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Top Rated Service Providers
            </h2>
            <p className="text-xl text-white/80 font-light">
              Meet some of our highest-rated professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {featuredProviders.map((provider) => (
              <div
                key={provider.id}
                className="glass-dark-card rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 smooth-transition group"
                onClick={() => router.push(`/provider/${provider.id}`)}
              >
                <Image
                  src={provider.image}
                  alt={provider.service}
                  width={300}
                  height={224}
                  className="w-full h-56 object-cover group-hover:scale-110 smooth-transition"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Image
                      src={provider.avatar}
                      alt={provider.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white/30"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-white">{provider.name}</h3>
                      <p className="text-white/80 text-sm">{provider.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-white">{provider.rating}</span>
                      <span className="text-white/70 ml-1 text-sm">({provider.reviews} reviews)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400">Starting at {provider.startingPrice}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white/70 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How ServiceHub Works
            </h2>
            <p className="text-xl text-white/80 font-light">
              Getting the help you need is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="text-center">
              <div className="glass-dark-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group hover:scale-110 smooth-transition">
                <Search className="h-10 w-10 text-white group-hover:scale-110 smooth-transition" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">1. Search & Browse</h3>
              <p className="text-white/70 font-light leading-relaxed">
                Find service providers in your area by searching for specific services or browsing categories.
              </p>
            </div>
            
            <div className="text-center">
              <div className="glass-dark-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group hover:scale-110 smooth-transition">
                <Clock className="h-10 w-10 text-white group-hover:scale-110 smooth-transition" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">2. Book & Schedule</h3>
              <p className="text-white/70 font-light leading-relaxed">
                Review profiles, check availability, and book appointments that fit your schedule.
              </p>
            </div>
            
            <div className="text-center">
              <div className="glass-dark-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group hover:scale-110 smooth-transition">
                <CheckCircle className="h-10 w-10 text-white group-hover:scale-110 smooth-transition" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">3. Get Service</h3>
              <p className="text-white/70 font-light leading-relaxed">
                Meet with your chosen professional and get the quality service you deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-12 text-white/80 font-light">
            Join thousands of satisfied customers who found their perfect service provider
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => router.push('/search')}
              className="glass-button text-white px-10 py-4 rounded-xl font-semibold text-lg"
            >
              Find a Service
            </button>
            <button className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 smooth-transition text-lg shadow-lg">
              Become a Provider
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}