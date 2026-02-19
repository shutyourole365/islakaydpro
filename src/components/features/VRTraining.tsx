import { ArrowLeft, Eye, Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

interface VRTrainingProps {
  onBack: () => void;
}

interface TrainingModule {
  id: string;
  title: string;
  equipment: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  completed: boolean;
  progress: number;
}

const mockModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Excavator Safety & Operation',
    equipment: 'CAT 320 Excavator',
    duration: 25,
    difficulty: 'beginner',
    description: 'Learn safe operation procedures, controls identification, and basic maneuvering techniques.',
    completed: true,
    progress: 100,
  },
  {
    id: '2',
    title: 'Advanced Excavator Techniques',
    equipment: 'CAT 320 Excavator',
    duration: 45,
    difficulty: 'intermediate',
    description: 'Master precision digging, slope work, and complex terrain operations.',
    completed: false,
    progress: 65,
  },
  {
    id: '3',
    title: 'Loader Bucket Control',
    equipment: 'Bobcat S650 Loader',
    duration: 30,
    difficulty: 'beginner',
    description: 'Understand loader controls, bucket positioning, and material handling.',
    completed: false,
    progress: 30,
  },
  {
    id: '4',
    title: 'Generator Maintenance VR',
    equipment: 'Honda EU3000is Generator',
    duration: 20,
    difficulty: 'intermediate',
    description: 'Virtual maintenance procedures, troubleshooting, and safety protocols.',
    completed: false,
    progress: 0,
  },
  {
    id: '5',
    title: 'Drone Flight Operations',
    equipment: 'DJI Phantom Pro',
    duration: 35,
    difficulty: 'advanced',
    description: 'Advanced aerial photography, mapping, and inspection techniques.',
    completed: false,
    progress: 10,
  },
];

export default function VRTraining({ onBack }: VRTrainingProps) {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedModule) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= selectedModule.duration * 60) {
            setIsPlaying(false);
            return selectedModule.duration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedModule]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: TrainingModule['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (newTime: number) => {
    if (selectedModule) {
      setCurrentTime(Math.max(0, Math.min(newTime, selectedModule.duration * 60)));
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const completeModule = () => {
    if (selectedModule) {
      // In a real app, this would update the backend
      console.log(`Completed module: ${selectedModule.title}`);
      setSelectedModule(null);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">VR Training Simulator</h1>
                <p className="text-indigo-100">Immersive equipment training with virtual reality</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Settings className="w-4 h-4" />
                VR Settings
              </Button>
            </div>
          </div>

          <div className="p-8">
            {/* VR Settings Panel */}
            {showSettings && (
              <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">VR Training Settings</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headset Compatibility</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>Meta Quest 2/3</option>
                      <option>Oculus Rift</option>
                      <option>HTC Vive</option>
                      <option>WebXR Compatible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Difficulty</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Audio Language</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motion Controls</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Enable haptic feedback</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Training Modules Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Training Modules</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockModules.map(module => (
                  <div
                    key={module.id}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      selectedModule?.id === module.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-200'
                    }`}
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Equipment: {module.equipment}</div>
                      <div className="text-sm text-gray-600 mb-1">Duration: {module.duration} min</div>
                      <div className="text-sm text-gray-600">{module.description}</div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>

                    {module.completed && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* VR Player */}
            {selectedModule && (
              <div className="mb-8">
                <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}>
                  {/* VR Video Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-2xl font-bold mb-2">{selectedModule.title}</h3>
                      <p className="text-indigo-200 mb-4">VR Training Simulation</p>
                      <div className="text-sm opacity-75">
                        <p>Equipment: {selectedModule.equipment}</p>
                        <p>Difficulty: {selectedModule.difficulty}</p>
                      </div>
                    </div>
                  </div>

                  {/* VR Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(selectedModule.duration * 60)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setVolume(volume > 0 ? 0 : 80)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={toggleFullscreen}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <input
                        type="range"
                        min="0"
                        max={selectedModule.duration * 60}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={handleRestart}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handlePlayPause}
                        className="bg-white text-black hover:bg-gray-200 px-6"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button
                        onClick={completeModule}
                        className="bg-green-600 text-white hover:bg-green-700 px-4"
                      >
                        Complete Module
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Module Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Understand equipment controls and safety features</li>
                        <li>• Practice proper operating procedures</li>
                        <li>• Learn emergency response protocols</li>
                        <li>• Master equipment-specific techniques</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">VR Features</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 360° immersive environment</li>
                        <li>• Interactive equipment controls</li>
                        <li>• Real-time performance feedback</li>
                        <li>• Multi-language audio support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Training Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockModules.filter(m => m.completed).length}</div>
                <div className="text-sm text-gray-600">Completed Modules</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockModules.filter(m => m.progress > 0 && !m.completed).length}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{mockModules.filter(m => m.difficulty === 'beginner').length}</div>
                <div className="text-sm text-gray-600">Beginner Modules</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{mockModules.reduce((acc, m) => acc + m.duration, 0)}</div>
                <div className="text-sm text-gray-600">Total Training Hours</div>
              </div>
            </div>

            {/* VR Compatibility */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">VR Compatibility & Requirements</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supported Devices</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Meta Quest 2 & Quest 3</li>
                    <li>• Oculus Rift S & Rift</li>
                    <li>• HTC Vive & Vive Pro</li>
                    <li>• WebXR compatible browsers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">System Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Modern VR headset</li>
                    <li>• Hand controllers</li>
                    <li>• Stable internet connection</li>
                    <li>• Minimum 8GB RAM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}