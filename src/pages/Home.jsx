// src/pages/Home.jsx
// FIXED: Proper navigation for logged in users
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, TrendingUp, Shield, Star, Users, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

//  handleGetStarted function:

const handleGetStarted = () => {
  if (user) {
    // FIX: Redirect based on role
    const destination = user.role === 'ADMIN' ? '/admin' : '/dashboard';
    navigate(destination);
  } else {
    navigate('/signup');
  }
};

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 transform hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                <span className="text-sm font-semibold">AI-Powered Parking Solution</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="block">Stop</span>
                <span className="block relative inline-block">
                  <span className="relative z-10">Circling</span>
                  <svg className="absolute bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12">
                    <path d="M0,8 Q75,2 150,7 T300,8" stroke="#FCD34D" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Start Parking
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-purple-100 leading-relaxed">
                Find, predict, and book parking spots in{' '}
                <span className="font-bold text-white">under 30 seconds</span>.
                Powered by AI and real-time data.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="group relative px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-center"
                >
                  <span className="relative z-10">
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                {!user && (
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center gap-6 text-purple-100">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-white">10,000+ Users</p>
                  <p className="text-sm">Found parking in last 24 hours</p>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative lg:block hidden">
              <div className="relative z-10 animate-float">
                <div className="text-9xl">🚗</div>
                <div className="absolute -bottom-8 -right-8 text-7xl animate-bounce">🅿️</div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-24 h-24 border-4 border-white/30 rounded-full"></div>
              <div className="absolute bottom-20 left-0 w-32 h-32 border-4 border-yellow-300/30 rounded-lg rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-slide-up">
              <div className="text-5xl font-black text-purple-600 mb-2">50%</div>
              <p className="text-gray-600 font-medium">Time Saved</p>
              <p className="text-sm text-gray-500">Average search time reduced</p>
            </div>
            <div className="animate-slide-up animation-delay-200">
              <div className="text-5xl font-black text-purple-600 mb-2">10K+</div>
              <p className="text-gray-600 font-medium">Active Users</p>
              <p className="text-sm text-gray-500">Trust SmartPark daily</p>
            </div>
            <div className="animate-slide-up animation-delay-400">
              <div className="text-5xl font-black text-purple-600 mb-2">85%</div>
              <p className="text-gray-600 font-medium">Accuracy</p>
              <p className="text-sm text-gray-500">AI prediction accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Why Choose SmartPark?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The smartest way to find and book parking spots
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Find Nearby</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover available parking spots near your location instantly with real-time updates
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Predictions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get accurate predictions of parking availability using machine learning algorithms
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animation-delay-400">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Save Time</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reduce parking search time by up to 50% and get to your destination faster
                </p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Booking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Book and pay securely with instant confirmation and guaranteed spots
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Find parking in 3 simple steps
            </p>
          </div>

          {/* Desktop View - With Arrows */}
          <div className="hidden md:flex items-center justify-center gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Search Location</h3>
              <p className="text-gray-600 text-sm">
                Enter your destination or use your current location
              </p>
            </div>

            {/* Arrow */}
            <div className="text-5xl text-purple-400 flex-shrink-0">→</div>

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Parking</h3>
              <p className="text-gray-600 text-sm">
                View spots, compare prices, check predictions
              </p>
            </div>

            {/* Arrow */}
            <div className="text-5xl text-purple-400 flex-shrink-0">→</div>

            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book & Park</h3>
              <p className="text-gray-600 text-sm">
                Reserve instantly and navigate to your spot
              </p>
            </div>
          </div>

          {/* Mobile View - Stacked */}
          <div className="md:hidden space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Search Location</h3>
              <p className="text-gray-600">
                Enter your destination or use your current location to find nearby parkings
              </p>
              <div className="text-4xl text-purple-400 mt-6">↓</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose Parking</h3>
              <p className="text-gray-600">
                View available spots, compare prices, and check predictions for the best time
              </p>
              <div className="text-4xl text-purple-400 mt-6">↓</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-3xl font-black mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Book & Park</h3>
              <p className="text-gray-600">
                Reserve your spot instantly and navigate directly to your parking location
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Ready to Never Circle Again?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join 10,000+ users who've saved time and stress with SmartPark
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-block px-12 py-5 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            {user ? 'Go to Dashboard →' : 'Start Free Today →'}
          </button>
          
          <p className="mt-6 text-sm text-purple-200">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;