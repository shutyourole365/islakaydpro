import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, X, Check, CheckCheck } from 'lucide-react';

interface LiveChatProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  equipmentId?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'system';
}

export default function LiveChat({ recipientId, recipientName, equipmentId, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: recipientId,
      content: `Hi! I'm interested in renting this equipment. Is it still available?`,
      timestamp: new Date(Date.now() - 300000),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      senderId: 'me',
      content: `Yes! It's available. When do you need it?`,
      timestamp: new Date(Date.now() - 240000),
      status: 'read',
      type: 'text',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (messages.length > 2) return;
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: recipientId,
          content: 'Great! I need it for next weekend. Can you deliver?',
          timestamp: new Date(),
          status: 'delivered',
          type: 'text',
        };
        setMessages(prev => [...prev, newMessage]);
      }, 2000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [messages.length, recipientId]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[440px] sm:h-[600px] h-full bg-white sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-500 to-emerald-500">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                {recipientName.charAt(0)}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{recipientName}</h3>
              <p className="text-xs text-white/80">
                {isOnline ? 'Active now' : 'Away'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Equipment Context Banner */}
        {equipmentId && (
          <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-200 rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                CAT 320 Excavator - 20 Ton
              </p>
              <p className="text-xs text-gray-600">$450/day</p>
            </div>
            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              View
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isMe = message.senderId === 'me';
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {isMe && (
                      <span className="text-teal-600">
                        {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5" />}
                        {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
                        {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                        {message.status === 'sending' && (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-end gap-2">
            <button className="p-2.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 focus-within:border-teal-500 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>

            <button className="p-2.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
