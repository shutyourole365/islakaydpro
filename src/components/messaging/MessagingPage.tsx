import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronLeft, User, Clock, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  otherUser?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface MessagingPageProps {
  initialConversationId?: string;
  initialRecipientId?: string;
  initialEquipmentTitle?: string;
}

export default function MessagingPage({
  initialConversationId,
  initialRecipientId,
  initialEquipmentTitle,
}: MessagingPageProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch other user profiles
      const convs: Conversation[] = await Promise.all(
        (data || []).map(async (conv) => {
          const otherId = conv.participants.find((p: string) => p !== user.id);
          if (otherId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', otherId)
              .single();
            return { ...conv, otherUser: profile };
          }
          return conv;
        })
      );

      setConversations(convs);

      // Auto-select if initialConversationId provided
      if (initialConversationId) {
        const found = convs.find((c) => c.id === initialConversationId);
        if (found) setSelectedConv(found);
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      return;
    }
    setMessages(data || []);

    // Mark messages as read
    if (user) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false);
    }
  }

  async function startConversationWithUser(recipientId: string) {
    if (!user) return;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [user.id, recipientId])
      .single();

    if (existing) {
      setSelectedConv({ ...existing, otherUser: undefined });
      loadConversations();
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ participants: [user.id, recipientId] })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      return;
    }

    await loadConversations();
    setSelectedConv(newConv);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv || !user || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content,
        read: false,
      });

      if (error) throw error;

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id);

      loadMessages(selectedConv.id);
      loadConversations();
    } catch (e) {
      console.error('Failed to send message:', e);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Sign in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-teal-500" />
          Messages
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-[calc(100vh-180px)]">
          {/* Conversation List */}
          <div
            className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${
              selectedConv ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-300 text-xs mt-1">
                  Message an owner from any equipment listing
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                      selectedConv?.id === conv.id ? 'bg-teal-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.otherUser?.full_name?.charAt(0)?.toUpperCase() || (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {conv.otherUser?.full_name || 'User'}
                        </p>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.last_message || 'Start a conversation'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Thread */}
          {selectedConv ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedConv.otherUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {selectedConv.otherUser?.full_name || 'User'}
                  </p>
                  {initialEquipmentTitle && (
                    <p className="text-xs text-gray-500">{initialEquipmentTitle}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <Clock
                            className={`w-3 h-3 ${isMe ? 'text-white/60' : 'text-gray-400'}`}
                          />
                          <span
                            className={`text-xs ${isMe ? 'text-white/60' : 'text-gray-400'}`}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                          {isMe && msg.read && (
                            <CheckCheck className="w-3 h-3 text-white/60 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-teal-500 max-h-32"
                    style={{ minHeight: '46px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Select a conversation</p>
                <p className="text-gray-300 text-sm mt-1">
                  Or start one from an equipment listing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
