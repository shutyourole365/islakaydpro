import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, Loader2, Volume2 } from 'lucide-react';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function VoiceSearch({ onSearch, placeholder = "Search equipment..." }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        setInterimTranscript(interim);
        if (final) {
          setTranscript(prev => prev + final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Submit the transcript
      if (transcript.trim()) {
        onSearch(transcript.trim());
      }
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSearch(transcript.trim());
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
          isListening ? 'border-teal-500 shadow-teal-100' : 'border-gray-200 hover:border-gray-300'
        }`}>
          <Search className="w-5 h-5 text-gray-400 ml-4" />
          
          <input
            type="text"
            value={transcript + interimTranscript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isListening ? "Listening..." : placeholder}
            className="flex-1 px-4 py-4 bg-transparent outline-none text-gray-900 placeholder-gray-400"
          />

          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 mr-2 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-500 hover:text-white'
              }`}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </form>

      {/* Voice visualization */}
      {isListening && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-teal-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <span className="ml-2 text-sm text-teal-600 font-medium">Listening...</span>
        </div>
      )}

      {/* Quick suggestions */}
      {!isListening && !transcript && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['Excavator', 'Power Drill', 'Camera', 'DJ Equipment', 'Lawn Mower'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSearch(suggestion)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
