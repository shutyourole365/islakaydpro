import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  ChevronLeft,
  Check,
  CheckCheck,
  Clock,
  Shield,
  Star,
  MessageSquare,
  Circle,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file' | 'equipment';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    equipmentId?: string;
    equipmentTitle?: string;
    equipmentImage?: string;
    equipmentPrice?: number;
  };
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isVerified: boolean;
  rating: number;
}

interface Conversation {
  id: string;
  participant: ChatUser;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned?: boolean;
  equipmentId?: string;
  equipmentTitle?: string;
}

interface RealTimeChatProps {
  currentUserId: string;
  conversations: Conversation[];
  onClose: () => void;
  onSendMessage: (conversationId: string, message: Partial<ChatMessage>) => void;
  className?: string;
}

export default function RealTimeChat({
  currentUserId,
  conversations: initialConversations,
  onClose,
  onSendMessage,
  className = '',
}: RealTimeChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sample messages for demo
  useEffect(() => {
    if (selectedConversation) {
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: selectedConversation.participant.id,
          content: `Hi! I saw you're interested in the equipment. Is it still available?`,
          type: 'text',
          timestamp: new Date(Date.now() - 3600000),
          status: 'read',
        },
        {
          id: '2',
          senderId: currentUserId,
          content: 'Yes, it\'s available! When would you like to rent it?',
          type: 'text',
          timestamp: new Date(Date.now() - 3500000),
          status: 'read',
        },
        {
          id: '3',
          senderId: selectedConversation.participant.id,
          content: 'I was thinking this weekend, from Friday to Sunday. Would that work?',
          type: 'text',
          timestamp: new Date(Date.now() - 3400000),
          status: 'read',
        },
        {
          id: '4',
          senderId: currentUserId,
          content: 'Perfect! Friday to Sunday works great. The daily rate is $75, so that would be $225 for 3 days.',
          type: 'text',
          timestamp: new Date(Date.now() - 3300000),
          status: 'delivered',
        },
      ];
      setMessages(sampleMessages);
    }
  }, [selectedConversation, currentUserId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content: inputText.trim(),
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    onSendMessage(selectedConversation.id, newMessage);
    setInputText('');

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m));
    }, 500);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate response
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: selectedConversation.participant.id,
          content: 'Sounds great! I\'ll book it now. 🎉',
          type: 'text',
          timestamp: new Date(),
          status: 'read',
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Unknown';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-teal-500" />;
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.equipmentTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emojis = ['😊', '👍', '🎉', '❤️', '🙌', '👋', '✅', '🔥', '💯', '🙏'];

  return (
    <div className={`fixed inset-0 z-[100] bg-white flex ${className}`}>
      {/* Conversation List - Left Panel */}
      <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conversation.id ? 'bg-teal-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                    {conversation.participant.avatar ? (
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {conversation.participant.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {conversation.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </span>
                      {conversation.participant.isVerified && (
                        <Shield className="w-4 h-4 text-teal-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {conversation.equipmentTitle && (
                    <p className="text-xs text-teal-600 mt-1 truncate">
                      📦 {conversation.equipmentTitle}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-500">Start a conversation with an equipment owner</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat View - Right Panel */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                  {selectedConversation.participant.avatar ? (
                    <img
                      src={selectedConversation.participant.avatar}
                      alt={selectedConversation.participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {selectedConversation.participant.name.charAt(0)}
                    </span>
                  )}
                </div>
                {selectedConversation.participant.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.participant.name}
                  </h3>
                  {selectedConversation.participant.isVerified && (
                    <Shield className="w-4 h-4 text-teal-500" />
                  )}
                  <div className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {selectedConversation.participant.rating.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedConversation.participant.isOnline
                    ? 'Online'
                    : `Last seen ${formatLastSeen(selectedConversation.participant.lastSeen)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMine
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-sm'
                    } px-4 py-2.5`}
                  >
                    {message.type === 'text' && (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {message.type === 'image' && message.metadata?.imageUrl && (
                      <img
                        src={message.metadata.imageUrl}
                        alt="Shared image"
                        className="rounded-lg max-w-full"
                      />
                    )}

                    {message.type === 'equipment' && message.metadata && (
                      <div className="bg-white/10 rounded-lg p-3 space-y-2">
                        <img
                          src={message.metadata.equipmentImage}
                          alt={message.metadata.equipmentTitle}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                        <p className="font-medium">{message.metadata.equipmentTitle}</p>
                        <p className="text-lg font-bold">${message.metadata.equipmentPrice}/day</p>
                      </div>
                    )}

                    <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : ''}`}>
                      <span className={`text-xs ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {isMine && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-xl overflow-x-auto">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors">
                <Image className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  style={{ maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </button>

              {inputText.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2.5 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose from your existing conversations</p>
          </div>
        </div>
      )}
    </div>
  );
}
