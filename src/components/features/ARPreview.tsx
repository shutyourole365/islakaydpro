import { ArrowLeft, Eye, RotateCcw, ZoomIn, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface ARPreviewProps {
  onBack: () => void;
}

export default function ARPreview({ onBack }: ARPreviewProps) {
  const [selectedView, setSelectedView] = useState('3d');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeOn, setVolumeOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const equipmentViews = [
    {
      id: '3d',
      name: '3D Model',
      description: 'Interactive 3D model with full rotation',
      icon: <RotateCcw className="w-5 h-5" />
    },
    {
      id: 'ar',
      name: 'AR Preview',
      description: 'See equipment in your space using AR',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'vr',
      name: 'VR Experience',
      description: 'Immersive virtual reality walkthrough',
      icon: <Play className="w-5 h-5" />
    },
    {
      id: '360',
      name: '360° Video',
      description: 'Panoramic video tour of the equipment',
      icon: <RotateCcw className="w-5 h-5" />
    }
  ];

  const equipmentSpecs = [
    { label: 'Dimensions', value: '12ft x 8ft x 10ft' },
    { label: 'Weight', value: '45,000 lbs' },
    { label: 'Engine', value: 'CAT C7.1 ACERT' },
    { label: 'Power', value: '275 HP' },
    { label: 'Fuel Capacity', value: '140 gallons' },
    { label: 'Operating Weight', value: '66,000 lbs' }
  ];

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Immersive Preview',
      description: 'Experience equipment before booking with photorealistic 3D models and AR placement.'
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: '360° Inspection',
      description: 'Examine every angle, component, and feature with interactive rotation and zoom.'
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Operational Demo',
      description: 'Watch equipment in action with VR simulations and operational walkthroughs.'
    },
    {
      icon: <ZoomIn className="w-6 h-6" />,
      title: 'Detailed Analysis',
      description: 'Zoom into specific components and access detailed specifications instantly.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Construction Manager',
      quote: 'The AR preview saved us hours of site visits. We could see exactly how the excavator would fit in our workspace.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Equipment Renter',
      quote: 'VR walkthrough helped me understand the controls and safety features before my first rental.',
      rating: 5
    },
    {
      name: 'David Rodriguez',
      role: 'Project Manager',
      quote: 'The 3D models are incredibly detailed. I can check maintenance access points and component locations.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4">
                <h1 className="text-2xl font-bold">CAT 320 Excavator - 3D Preview</h1>
                <p className="text-green-100">Experience equipment like never before</p>
              </div>

              {/* View Controls */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {equipmentViews.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setSelectedView(view.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedView === view.id
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {view.icon}
                      {view.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="relative bg-gray-900 h-96 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {equipmentViews.find(v => v.id === selectedView)?.name} Preview
                  </h3>
                  <p className="text-gray-300">
                    {equipmentViews.find(v => v.id === selectedView)?.description}
                  </p>
                  <div className="mt-4 text-sm text-gray-400">
                    Interactive preview loading...
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setVolumeOn(!volumeOn)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {volumeOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5 rotate-45" />
                    </button>
                    <span className="text-white text-sm px-2">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Equipment Specs */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {equipmentSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{spec.label}:</span>
                      <span className="font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AR/VR Features</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Book This Equipment
                </Button>
                <Button variant="outline" className="w-full">
                  Download 3D Model
                </Button>
                <Button variant="outline" className="w-full">
                  Share Preview Link
                </Button>
                <Button variant="outline" className="w-full">
                  Compare Equipment
                </Button>
              </div>
            </div>

            {/* Compatibility */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Compatibility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">iOS AR Support</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Android AR</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">VR Headsets</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Web Browser</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Eye key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience Equipment Like Never Before</h2>
          <p className="text-gray-600 mb-6">
            Join the future of equipment rental with immersive AR/VR previews.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 px-8 py-3">
            Try AR Preview Now
          </Button>
        </div>
      </div>
    </div>
  );
}