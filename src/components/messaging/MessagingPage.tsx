import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, ChevronLeft, CheckCheck, Check,
  Search, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessageNotification } from '../../services/pushNotifications';
import { enforceMaxLength } from '../../utils/validation';
import { useToast } from '../ui/Toast';

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
  unread_count?: number;
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
  onBack?: () => void;
}

export default function MessagingPage({
  initialConversationId,
  initialRecipientId,
  initialEquipmentTitle,
  onBack,
}: MessagingPageProps) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const convChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations + enrich with other-user profile
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const convs: Conversation[] = await Promise.all(
        (data || []).map(async (conv) => {
          const otherId = (conv.participants as string[]).find((p) => p !== user.id);
          let otherUser: Conversation['otherUser'] | undefined;
          if (otherId) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', otherId)
              .single();
            if (profileData) {
              otherUser = { id: profileData.id, full_name: profileData.full_name || 'User', avatar_url: profileData.avatar_url };
            }
          }
          // Unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);
          return { ...conv, otherUser, unread_count: count || 0 };
        })
      );
      setConversations(convs);

      // Auto-select initial conversation if specified
      if (initialConversationId) {
        const found = convs.find((c) => c.id === initialConversationId);
        if (found) setSelectedConv(found);
      }
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, initialConversationId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
      // Mark unread messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', convId)
        .eq('read', false)
        .neq('sender_id', user?.id ?? '');
    }
  }, [user?.id, scrollToBottom]);

  // Subscribe to new messages in selected conversation
  const subscribeToMessages = useCallback((convId: string) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    const ch = supabase
      .channel(`messages:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 50);
        // Mark as read if we're the recipient
        if (msg.sender_id !== user?.id) {
          supabase.from('messages').update({ read: true }).eq('id', msg.id);
        }
      })
      .subscribe();
    channelRef.current = ch;
  }, [user?.id, scrollToBottom]);

  // Subscribe to conversation list updates
  const subscribeToConversations = useCallback(() => {
    if (convChannelRef.current) supabase.removeChannel(convChannelRef.current);
    const ch = supabase
      .channel('conversations:user')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, () => { loadConversations(); })
      .subscribe();
    convChannelRef.current = ch;
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (convChannelRef.current) supabase.removeChannel(convChannelRef.current);
    };
  }, [loadConversations, subscribeToConversations]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      subscribeToMessages(selectedConv.id);
    }
  }, [selectedConv?.id]);

  // Create conversation with a new user if needed
  useEffect(() => {
    const initRecipient = async () => {
      if (!initialRecipientId || !user || conversations.length === 0) return;
      const existing = conversations.find((c) =>
        (c.participants as string[]).includes(initialRecipientId)
      );
      if (existing) {
        setSelectedConv(existing);
        return;
      }
      // Create new conversation
      const { data, error } = await supabase.from('conversations').insert({
        participants: [user.id, initialRecipientId],
        last_message: initialEquipmentTitle ? `Re: ${initialEquipmentTitle}` : null,
        last_message_at: new Date().toISOString(),
      }).select().single();
      if (!error && data) {
        await loadConversations();
        setSelectedConv(data as Conversation);
      }
    };
    if (!loading) initRecipient();
  }, [loading, initialRecipientId, conversations.length]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user || sending) return;
    const content = newMessage.trim();
    try {
      // Service-layer DoS guard — apply here too since this component
      // bypasses services/database.sendMessage and inserts directly.
      enforceMaxLength(content, 'messageContent', 'Message');
    } catch (e) {
      // Surface the validation error; don't clear the input so the user
      // can trim it down.
      setSending(false);
      addToast({
        type: 'error',
        title: 'Message not sent',
        message: e instanceof Error ? e.message : 'Message too long.',
      });
      return;
    }
    setNewMessage('');
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content,
        read: false,
      });
      if (error) throw error;

      // Update conversation last message
      await supabase.from('conversations').update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      }).eq('id', selectedConv.id);

      // Push notification to other participant
      const otherId = selectedConv.otherUser?.id;
      if (otherId) {
        sendMessageNotification(
          otherId,
          profile?.full_name || 'Someone',
          content,
          selectedConv.id
        ).catch(console.warn);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setNewMessage(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-AU', { weekday: 'short' });
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(c =>
    !searchQuery ||
    c.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showThread = !!selectedConv;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-bold text-gray-900">Messages</h1>
            {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0) > 0 && (
              <span className="px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full font-semibold">
                {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Conversation list */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-200 bg-white`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-200"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Message an equipment owner to get started</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                    selectedConv?.id === conv.id ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 font-semibold text-sm">
                    {conv.otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.otherUser?.full_name || 'User'}
                      </p>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate">
                        {conv.last_message || 'No messages yet'}
                      </p>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        {showThread ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                {selectedConv.otherUser?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedConv.otherUser?.full_name || 'User'}</p>
                <p className="text-xs text-gray-400">Tap to view profile</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i-1].created_at).toDateString();
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            {new Date(msg.created_at).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-teal-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-xs ${isOwn ? 'text-teal-200' : 'text-gray-400'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              msg.read
                                ? <CheckCheck className="w-3 h-3 text-teal-200" />
                                : <Check className="w-3 h-3 text-teal-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="w-full px-4 py-3 bg-transparent text-sm resize-none focus:outline-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">Choose from your messages on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
