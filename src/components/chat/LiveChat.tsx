import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, X, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, createConversation, getMessages, sendMessage, subscribeToMessages } from '../../services/database';
import type { Message } from '../../types';

interface LiveChatProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  equipmentId?: string;
  onClose: () => void;
}

export default function LiveChat({ recipientId, recipientName, equipmentId, onClose }: LiveChatProps) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find or create conversation on mount
  useEffect(() => {
    if (!user) return;

    const initConversation = async () => {
      setIsLoading(true);
      try {
        // Look for an existing conversation between these two users for this equipment
        const convos = await getConversations(user.id);
        const existing = convos.find(c =>
          c.equipment_id === (equipmentId ?? null) &&
          c.participants?.some(p => p.user_id === recipientId)
        );

        let convId: string;
        if (existing) {
          convId = existing.id;
        } else {
          const newConvo = await createConversation([user.id, recipientId], equipmentId);
          convId = newConvo.id;
        }

        setConversationId(convId);
        const msgs = await getMessages(convId);
        setMessages(msgs);
      } catch {
        // Silently fail — chat will still work if conversation is created on first send
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [user, recipientId, equipmentId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = subscribeToMessages(conversationId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user || isSending) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const newConvo = await createConversation([user.id, recipientId], equipmentId);
        convId = newConvo.id;
        setConversationId(convId);
      }

      await sendMessage({
        conversationId: convId,
        senderId: user.id,
        receiverId: recipientId,
        content,
        equipmentId,
      });
    } catch {
      setInputValue(content); // restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{recipientName}</h3>
              <p className="text-xs text-white/80">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" aria-label="Start phone call" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Start video call" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button type="button" aria-label="More options" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center pt-8">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center pt-8">
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === user?.id;
              return (
                <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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
                      <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                      {isMe && (
                        <span className="text-teal-600">
                          {message.is_read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-end gap-2">
            <button type="button" aria-label="Attach file" className="p-2.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 focus-within:border-teal-500 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm max-h-[120px]"
                rows={1}
              />
            </div>

            <button type="button" aria-label="Insert emoji" className="p-2.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              aria-label="Send message"
              className="p-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
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
