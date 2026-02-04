/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  X,
  BookOpen,
  Shield,
  Zap,
  Clock,
  Award,
} from 'lucide-react';

interface AREquipmentTutorialProps {
  equipmentId: string;
  equipmentTitle: string;
  equipmentType: string;
  onComplete?: () => void;
  onClose: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl: string;
  duration: number; // seconds
  safetyNotes?: string[];
  tips?: string[];
  checkpoints: string[];
  arMarkers?: { x: number; y: number; label: string }[];
}

interface TutorialProgress {
  currentStep: number;
  completedSteps: string[];
  totalTime: number;
  quizScore?: number;
}

export default function AREquipmentTutorial({
  equipmentId,
  equipmentTitle,
  equipmentType,
  onComplete,
  onClose,
}: AREquipmentTutorialProps) {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [progress, setProgress] = useState<TutorialProgress>({
    currentStep: 0,
    completedSteps: [],
    totalTime: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  // Video playback state - using currentTime for progress display
  const [currentTime, _setCurrentTime] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);

  useEffect(() => {
    loadTutorial();
  }, [equipmentId, equipmentType]);

  const loadTutorial = () => {
    // Generate tutorial steps based on equipment type
    const tutorialSteps: TutorialStep[] = [
      {
        id: '1',
        title: 'Safety First - Pre-Operation Checks',
        description: 'Before operating any equipment, always perform these essential safety checks.',
        imageUrl: 'https://images.pexels.com/photos/8985458/pexels-photo-8985458.jpeg',
        duration: 120,
        safetyNotes: [
          'Wear appropriate PPE (hard hat, safety glasses, gloves)',
          'Check for visible damage or wear',
          'Ensure all guards are in place',
          'Verify emergency stop is functional',
        ],
        checkpoints: [
          'PPE equipped',
          'Visual inspection complete',
          'Emergency stop tested',
        ],
        arMarkers: [
          { x: 20, y: 30, label: 'Safety switch' },
          { x: 70, y: 50, label: 'Emergency stop' },
          { x: 45, y: 70, label: 'Guard position' },
        ],
      },
      {
        id: '2',
        title: 'Starting the Equipment',
        description: 'Follow these steps to properly start the equipment and prepare for operation.',
        imageUrl: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg',
        duration: 90,
        tips: [
          'Allow equipment to warm up before heavy use',
          'Check all fluid levels before starting',
          'Listen for unusual sounds during startup',
        ],
        checkpoints: [
          'Ignition procedure followed',
          'Warm-up complete',
          'All systems normal',
        ],
        arMarkers: [
          { x: 30, y: 40, label: 'Ignition' },
          { x: 60, y: 35, label: 'Throttle' },
          { x: 50, y: 65, label: 'Gauges' },
        ],
      },
      {
        id: '3',
        title: 'Basic Operations',
        description: 'Learn the fundamental controls and operations for this equipment.',
        imageUrl: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg',
        duration: 180,
        tips: [
          'Start with slow, controlled movements',
          'Maintain awareness of your surroundings',
          'Use smooth, gradual control inputs',
        ],
        checkpoints: [
          'Control familiarization complete',
          'Basic movements practiced',
          'Comfortable with controls',
        ],
        arMarkers: [
          { x: 25, y: 45, label: 'Movement control' },
          { x: 75, y: 45, label: 'Function control' },
          { x: 50, y: 25, label: 'Display' },
        ],
      },
      {
        id: '4',
        title: 'Advanced Techniques',
        description: 'Master advanced operations for maximum efficiency and safety.',
        imageUrl: 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg',
        duration: 150,
        tips: [
          'Practice in open areas first',
          'Know your equipment\'s limits',
          'Plan your work before starting',
        ],
        safetyNotes: [
          'Never exceed rated capacity',
          'Maintain proper stability at all times',
        ],
        checkpoints: [
          'Advanced techniques understood',
          'Limits acknowledged',
          'Ready for real work',
        ],
        arMarkers: [
          { x: 40, y: 30, label: 'Precision control' },
          { x: 60, y: 60, label: 'Load indicator' },
        ],
      },
      {
        id: '5',
        title: 'Shutdown & Maintenance',
        description: 'Proper shutdown procedures and basic maintenance tasks.',
        imageUrl: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        duration: 90,
        tips: [
          'Allow cool-down before shutdown',
          'Clean equipment after use',
          'Report any issues immediately',
        ],
        checkpoints: [
          'Shutdown procedure complete',
          'Equipment cleaned',
          'Condition documented',
        ],
        arMarkers: [
          { x: 35, y: 50, label: 'Fluid check' },
          { x: 65, y: 40, label: 'Clean here' },
        ],
      },
    ];

    setSteps(tutorialSteps);
  };

  const currentStep = steps[progress.currentStep];
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const completedDuration = steps
    .slice(0, progress.currentStep)
    .reduce((sum, s) => sum + s.duration, 0);

  const handleNextStep = () => {
    if (!stepComplete) return;

    const newCompletedSteps = [...progress.completedSteps, currentStep.id];
    
    if (progress.currentStep < steps.length - 1) {
      setProgress({
        ...progress,
        currentStep: progress.currentStep + 1,
        completedSteps: newCompletedSteps,
      });
      setStepComplete(false);
    } else {
      // Tutorial complete - show quiz
      setShowQuiz(true);
    }
  };

  const handlePrevStep = () => {
    if (progress.currentStep > 0) {
      setProgress({
        ...progress,
        currentStep: progress.currentStep - 1,
      });
      setStepComplete(progress.completedSteps.includes(steps[progress.currentStep - 1].id));
    }
  };

  const completeCheckpoint = (checkpoint: string) => {
    const allComplete = currentStep.checkpoints.every(cp => 
      cp === checkpoint || progress.completedSteps.includes(`${currentStep.id}-${cp}`)
    );
    
    if (allComplete || currentStep.checkpoints.indexOf(checkpoint) === currentStep.checkpoints.length - 1) {
      setStepComplete(true);
    }
  };

  const quizQuestions = [
    {
      id: '1',
      question: 'What should you do before operating the equipment?',
      options: [
        'Start immediately',
        'Perform safety checks and wear PPE',
        'Skip the manual',
        'Remove safety guards',
      ],
      correct: 1,
    },
    {
      id: '2',
      question: 'What is the purpose of the emergency stop?',
      options: [
        'To turn off lights',
        'To speed up operation',
        'To immediately halt all operations in emergency',
        'For decoration',
      ],
      correct: 2,
    },
    {
      id: '3',
      question: 'After operation, you should:',
      options: [
        'Leave equipment running',
        'Skip cleanup',
        'Properly shutdown, clean, and document condition',
        'Hide any issues',
      ],
      correct: 2,
    },
  ];

  const submitQuiz = () => {
    const score = quizQuestions.reduce((acc, q) => {
      return acc + (quizAnswers[q.id] === q.correct ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    setProgress({
      ...progress,
      quizScore: percentage,
    });

    if (percentage >= 70 && onComplete) {
      onComplete();
    }
  };

  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Knowledge Check</h2>
                  <p className="text-sm text-white/80">Test what you've learned</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {progress.quizScore === undefined ? (
              <>
                <div className="space-y-6">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900 mb-3">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIndex })}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                              quizAnswers[q.id] === oIndex
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  Submit Answers
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  progress.quizScore >= 70 ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  {progress.quizScore >= 70 ? (
                    <Award className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-amber-600" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {progress.quizScore >= 70 ? 'Congratulations!' : 'Almost There!'}
                </h3>
                
                <p className="text-4xl font-bold text-indigo-600 mb-4">
                  {progress.quizScore}%
                </p>
                
                <p className="text-gray-600 mb-6">
                  {progress.quizScore >= 70
                    ? 'You\'ve completed the equipment tutorial successfully!'
                    : 'You need 70% to pass. Review the tutorial and try again.'}
                </p>

                <div className="flex gap-3">
                  {progress.quizScore < 70 && (
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setProgress({ ...progress, currentStep: 0, quizScore: undefined });
                        setQuizAnswers({});
                      }}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl"
                    >
                      Review Tutorial
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl"
                  >
                    {progress.quizScore >= 70 ? 'Get Started!' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold">{equipmentTitle}</h2>
                <p className="text-sm text-white/80">Interactive Tutorial</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className={`h-1.5 rounded-full ${
                  index < progress.currentStep
                    ? 'bg-white'
                    : index === progress.currentStep
                    ? 'bg-white/50'
                    : 'bg-white/20'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>Step {progress.currentStep + 1} of {steps.length}</span>
            <span>
              <Clock className="w-3 h-3 inline mr-1" />
              {Math.floor((completedDuration + currentTime) / 60)}m / {Math.floor(totalDuration / 60)}m
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Video/Image Section */}
          <div className="relative aspect-video lg:aspect-auto lg:h-[400px] bg-gray-900">
            <img
              src={currentStep.imageUrl}
              alt={currentStep.title}
              className="w-full h-full object-cover"
            />

            {/* AR Markers */}
            {currentStep.arMarkers?.map((marker, index) => (
              <div
                key={index}
                className="absolute"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-cyan-500/80 rounded-full flex items-center justify-center animate-pulse cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
                    {marker.label}
                  </div>
                </div>
              </div>
            ))}

            {/* Video Controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>
                </div>
                <button
                  onClick={() => setShowAR(!showAR)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    showAR ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  {showAR ? 'AR On' : 'AR Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 overflow-y-auto max-h-[400px]">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
            <p className="text-gray-600 mb-6">{currentStep.description}</p>

            {/* Safety Notes */}
            {currentStep.safetyNotes && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Safety Notes</h4>
                </div>
                <ul className="space-y-2">
                  {currentStep.safetyNotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {currentStep.tips && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h4 className="font-semibold text-amber-800">Pro Tips</h4>
                </div>
                <ul className="space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checkpoints */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900">Complete These Steps</h4>
              </div>
              <div className="space-y-2">
                {currentStep.checkpoints.map((checkpoint, index) => (
                  <button
                    key={index}
                    onClick={() => completeCheckpoint(checkpoint)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      progress.completedSteps.includes(`${currentStep.id}-${checkpoint}`) || 
                      (stepComplete && index <= currentStep.checkpoints.indexOf(checkpoint))
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress.completedSteps.includes(`${currentStep.id}-${checkpoint}`) || 
                      (stepComplete && index <= currentStep.checkpoints.indexOf(checkpoint))
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 ${
                        progress.completedSteps.includes(`${currentStep.id}-${checkpoint}`) || 
                        (stepComplete && index <= currentStep.checkpoints.indexOf(checkpoint))
                          ? 'text-white'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{checkpoint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={progress.currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === progress.currentStep
                    ? 'bg-blue-500'
                    : index < progress.currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            disabled={!stepComplete}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium ${
              stepComplete
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {progress.currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
