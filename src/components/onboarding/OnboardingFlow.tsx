import { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Zap,
  Gift,
  Camera,
  Wrench,
  Truck,
  PartyPopper,
  CheckCircle2,
  ArrowRight,
  Play,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

interface UserPreferences {
  interests: string[];
  location: string;
  notificationsEnabled: boolean;
  rentalType: 'renter' | 'owner' | 'both';
}

const categories = [
  { id: 'tools', name: 'Power Tools', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'cameras', name: 'Photography', icon: Camera, color: 'from-blue-500 to-indigo-500' },
  { id: 'vehicles', name: 'Vehicles', icon: Truck, color: 'from-green-500 to-emerald-500' },
  { id: 'events', name: 'Events', icon: PartyPopper, color: 'from-pink-500 to-rose-500' },
  { id: 'construction', name: 'Construction', icon: Wrench, color: 'from-amber-500 to-orange-500' },
  { id: 'outdoor', name: 'Outdoor', icon: MapPin, color: 'from-teal-500 to-cyan-500' },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    location: '',
    notificationsEnabled: true,
    rentalType: 'renter',
  });

  const totalSteps = 5;

  const goToNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete(preferences);
    }
  }, [currentStep, onComplete, preferences]);

  const goToPrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const toggleInterest = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  // Auto-advance after certain actions
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        goToNext();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [goToNext, onSkip]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            {/* Welcome animation */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-teal-500 animate-bounce" />
              </div>
              {/* Orbiting particles */}
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                  style={{
                    animation: `orbit ${3 + i * 0.5}s linear infinite`,
                    animationDelay: `${i * 0.25}s`,
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                  }}
                />
              ))}
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Islakayd</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                The world's most intelligent equipment rental marketplace. Let's personalize your experience.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Search, label: 'AI-Powered Search' },
                { icon: Shield, label: 'Verified Rentals' },
                { icon: Zap, label: 'Instant Booking' },
                { icon: Gift, label: 'Rewards Program' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600"
                  style={{
                    animation: 'fadeInUp 0.5s ease-out forwards',
                    animationDelay: `${0.5 + i * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <feature.icon className="w-4 h-4 text-teal-500" />
                  {feature.label}
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How will you use Islakayd?</h2>
              <p className="text-gray-600">This helps us show you the right features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                {
                  id: 'renter',
                  title: 'Rent Equipment',
                  description: 'Find and rent equipment for your projects',
                  icon: Search,
                  color: 'from-teal-500 to-emerald-500',
                },
                {
                  id: 'owner',
                  title: 'List Equipment',
                  description: 'Earn money by renting out your equipment',
                  icon: Gift,
                  color: 'from-purple-500 to-indigo-500',
                },
                {
                  id: 'both',
                  title: 'Both',
                  description: 'Rent equipment and list your own',
                  icon: Zap,
                  color: 'from-orange-500 to-red-500',
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPreferences(prev => ({ ...prev, rentalType: option.id as 'renter' | 'owner' | 'both' }))}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    preferences.rentalType === option.id
                      ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {preferences.rentalType === option.id && (
                    <CheckCircle2 className="absolute top-3 right-3 w-6 h-6 text-teal-500" />
                  )}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                    <option.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What are you interested in?</h2>
              <p className="text-gray-600">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleInterest(category.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    preferences.interests.includes(category.id)
                      ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {preferences.interests.includes(category.id) && (
                    <CheckCircle2 className="absolute top-3 right-3 w-6 h-6 text-teal-500" />
                  )}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Where are you located?</h2>
              <p className="text-gray-600">We'll show you equipment nearby</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={preferences.location}
                  onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your city or zip code"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-lg"
                />
              </div>

              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setPreferences(prev => ({ ...prev, location: 'Current Location' }));
                      },
                      () => {
                        console.log('Location access denied');
                      }
                    );
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Use my current location
              </button>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
                <Shield className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm">Your location is only used to show nearby equipment and is never shared publicly.</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 text-center">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">You're all set!</h2>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                Your personalized experience is ready. Let's start exploring!
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Your preferences:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-gray-700">
                    {preferences.rentalType === 'both' ? 'Renter & Owner' : preferences.rentalType === 'owner' ? 'Equipment Owner' : 'Equipment Renter'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Star className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-gray-700">
                    {preferences.interests.length > 0
                      ? preferences.interests.map(i => categories.find(c => c.id === i)?.name).join(', ')
                      : 'All categories'}
                  </span>
                </div>
                {preferences.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-gray-700">{preferences.location}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onComplete(preferences)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className="font-bold text-xl text-gray-900">islakayd</span>
        </div>
        
        <button
          onClick={onSkip}
          className="flex items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                i <= currentStep ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div
          className={`max-w-4xl mx-auto transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
          }`}
        >
          {renderStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={goToPrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={goToNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                Get Started
                <Play className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(80px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
