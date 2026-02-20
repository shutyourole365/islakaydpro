import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks';
import { streamMessage } from '../../services/ai';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Minimize2,
  Maximize2,
  Search,
  Calendar,
  DollarSign,
  HelpCircle,
  Wrench,
  Camera,
  Truck,
  PartyPopper,
} from 'lucide-react';

const AI_ENABLED = import.meta.env.VITE_ENABLE_AI === 'true';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    type?: 'search' | 'booking' | 'info' | 'recommendation';
    equipmentIds?: string[];
  };
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  query: string;
}

const quickActions: QuickAction[] = [
  { icon: <Wrench className="w-4 h-4" />, label: 'Power Tools', query: 'Show me available power tools' },
  { icon: <Camera className="w-4 h-4" />, label: 'Cameras', query: 'I need to rent a camera' },
  { icon: <Truck className="w-4 h-4" />, label: 'Heavy Equipment', query: 'Find me an excavator or bulldozer' },
  { icon: <PartyPopper className="w-4 h-4" />, label: 'Events', query: 'What equipment do I need for a wedding?' },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  // Telemetry helper
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { logAiEvent } = require('../../services/database');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm **Kayd**, your AI equipment assistant. I can help you:\n\n• 🔍 Find the perfect equipment for your project\n• 💰 Compare prices and get the best deals\n• 📅 Check availability and make reservations\n• ❓ Answer any questions about rentals\n\nWhat are you looking to rent today?",
      timestamp: new Date(),
      suggestions: [
        'Find me an excavator',
        'What equipment do I need for a wedding?',
        'Compare camera rental prices',
        'Show me available power tools',
      ],
    },
  ]);

  // Respect user preference (localStorage) in addition to the env flag
  const [aiEnabledByUser] = useLocalStorage<boolean>('ai_assistant_enabled', true);
  const aiIsEnabled = AI_ENABLED && aiEnabledByUser;
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getContextualResponses = useCallback((userMessage: string): { content: string; suggestions: string[]; type: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Price/cost related
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap') || lowerMessage.includes('budget')) {
      return {
        content: "💰 **Equipment Pricing Guide**\n\nPrices vary by equipment type and rental duration:\n\n**Power Tools**: $25-100/day\n**Photography Gear**: $50-250/day\n**Heavy Equipment**: $200-800/day\n**Event Supplies**: $100-500/day\n\n💡 **Pro tip**: Weekly and monthly rentals often include significant discounts (up to 30% off daily rates)!\n\nWhat's your budget range? I can find the best options for you.",
        suggestions: ['Under $100/day', '$100-300/day', 'Show me weekly deals', 'Premium equipment'],
        type: 'info'
      };
    }

    // Availability related
    if (lowerMessage.includes('available') || lowerMessage.includes('when') || lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return {
        content: "📅 **Checking Availability**\n\nMost equipment on Islakayd can be booked with just 24-hour notice! Here's how it works:\n\n1. Select your dates\n2. Equipment owner confirms (usually within 2 hours)\n3. Pick up or get delivery\n\nTo check specific availability, tell me:\n• What equipment you need\n• Your preferred dates\n• Your location",
        suggestions: ['Check excavator availability', 'Book for this weekend', 'Need equipment tomorrow', 'How does delivery work?'],
        type: 'booking'
      };
    }

    // Delivery related
    if (lowerMessage.includes('delivery') || lowerMessage.includes('deliver') || lowerMessage.includes('pickup') || lowerMessage.includes('pick up')) {
      return {
        content: "🚚 **Delivery & Pickup Options**\n\nWe offer flexible options:\n\n**Owner Delivery** - Many owners offer delivery for a small fee\n**Self Pickup** - Meet at the owner's location\n**Courier Partners** - For smaller items\n\n📍 Delivery typically costs $25-150 depending on distance and equipment size.\n\nWould you like me to filter by equipment with free delivery?",
        suggestions: ['Show free delivery options', 'Equipment near me', 'Self pickup only', 'How far will they deliver?'],
        type: 'info'
      };
    }

    // Construction/renovation
    if (lowerMessage.includes('construct') || lowerMessage.includes('build') || lowerMessage.includes('renovation') || lowerMessage.includes('remodel') || lowerMessage.includes('home improvement')) {
      return {
        content: "🏗️ **Construction & Renovation Equipment**\n\nHere's what most projects need:\n\n**Demolition**\n• Hammer drills, jackhammers\n• Demolition saws\n\n**Building**\n• Concrete mixers, vibrators\n• Scaffolding, ladders\n\n**Finishing**\n• Sanders, planers\n• Paint sprayers\n\n**Safety**\n• PPE equipment\n\nWhat type of project are you working on?",
        suggestions: ['Kitchen remodel', 'Bathroom renovation', 'Deck building', 'Full home renovation'],
        type: 'recommendation'
      };
    }

    // Tools/power tools
    if (lowerMessage.includes('tool') || lowerMessage.includes('drill') || lowerMessage.includes('saw') || lowerMessage.includes('power')) {
      return {
        content: "🔧 **Power Tools Available**\n\nI found 50+ power tools near you! Here are the most popular:\n\n⭐ **DeWalt 20V Combo Kit** - $75/day (4.9 rating)\n⭐ **Milwaukee M18 Impact Driver** - $35/day (4.8 rating)\n⭐ **Makita Circular Saw** - $40/day (4.7 rating)\n⭐ **Bosch Rotary Hammer** - $55/day (4.9 rating)\n\nAll include batteries, chargers, and carrying cases. What specific tools do you need?",
        suggestions: ['Drilling & driving', 'Cutting tools', 'Sanders & grinders', 'Full tool kit'],
        type: 'search'
      };
    }

    // Camera/photography
... (file content unchanged) ...
