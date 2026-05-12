import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, ChevronLeft, User, Clock, CheckCheck, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessageNotification } from '../../services/pushNotifications';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const convChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
          const otherId = conv.participants?.find((p: string) => p !== user.id);
          let otherUser = undefined;
          if (otherId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', otherId)
              .single();
            otherUser = profile ?? undefined;
          }

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .eq('read', false);

          return { ...conv, otherUser, unread_count: count ?? 0 };
        })
      );

      setConversations(convs);

      if (initialConversationId) {
        const found = convs.find((c) => c.id === initialConversationId);
        if (found) setSelectedConv(found);
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  }, [user, initialConversationId]);

  const loadMessages = useCallback(async (conversationId: string) => {
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

    // Mark as read
    if (user) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false);

      // Update local unread count
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    }
  }, [user]);

  // Subscribe to new messages in selected conversation
  useEffect(() => {
    if (!selectedConv) return;

    loadMessages(selectedConv.id);

    // Unsubscribe from previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${selectedConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConv.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Auto-mark as read if it's not from me
          if (user && newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMsg.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, loadMessages, user]);

  // Subscribe to conversation list changes (new convs, last_message updates)
  useEffect(() => {
    if (!user) return;

    if (convChannelRef.current) {
      supabase.removeChannel(convChannelRef.current);
    }

    const channel = supabase
      .channel(`conversations:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as Message;
          // If message is not in current conv, increment unread
          if (user && msg.sender_id !== user.id && msg.conversation_id !== selectedConv?.id) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === msg.conversation_id
                  ? { ...c, unread_count: (c.unread_count ?? 0) + 1, last_message: msg.content, last_message_at: msg.created_at }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    convChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations, selectedConv]);

  // Start or find an existing conversation with a recipient
  const startOrOpenConversation = useCallback(async (recipientId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const existing = conversations.find(c => c.participants?.includes(recipientId));
    if (existing) {
      setSelectedConv(existing);
      return;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participants: [user.id, recipientId],
        last_message: null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      return;
    }

    // Fetch recipient profile
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', recipientId)
      .single();

    const newConv: Conversation = {
      ...data,
      otherUser: recipientProfile ?? undefined,
      unread_count: 0,
    };

    setConversations(prev => [newConv, ...prev]);
    setSelectedConv(newConv);
  }, [user, conversations]);

  // Auto-start conversation when initialRecipientId is provided
  useEffect(() => {
    if (initialRecipientId && user && !loading) {
      startOrOpenConversation(initialRecipientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecipientId, user, loading]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id);

      // Notify other participants (fire-and-forget)
      const recipientIds = selectedConv.participants.filter(id => id !== user.id);
      if (recipientIds.length > 0) {
        const senderName = profile?.full_name || user.email?.split('@')[0] || 'Someone';
        const preview = content.length > 80 ? content.slice(0, 80) + '...' : content;
        void (async () => {
          try {
            await supabase.from('notifications').insert(
              recipientIds.map(recipientId => ({
                user_id: recipientId,
                type: 'new_message',
                title: 'New Message',
                message: `${senderName}: ${preview}`,
                data: { conversation_id: selectedConv.id, sender_id: user.id },
              }))
            );
            recipientIds.forEach(recipientId => {
              sendMessageNotification(recipientId, senderName, content, selectedConv.id).catch(() => {});
            });
          } catch { /* fire-and-forget */ }
        })();
      }
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

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Sign in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-500" />
            Messages
            {totalUnread > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex h-[calc(100vh-180px)]">
          {/* Conversation List */}
          <div
            className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col ${
              selectedConv ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
              {totalUnread > 0 && (
                <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Bell className="w-3.5 h-3.5" />
                  {totalUnread} unread
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
                  {initialEquipmentTitle ? `Starting conversation about: ${initialEquipmentTitle}` : 'Message an owner from any equipment listing'}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 dark:border-gray-700 ${
                      selectedConv?.id === conv.id ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {conv.otherUser?.full_name?.charAt(0)?.toUpperCase() || (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      {(conv.unread_count ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {(conv.unread_count ?? 0) > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-sm truncate ${(conv.unread_count ?? 0) > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {conv.otherUser?.full_name || 'User'}
                        </p>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${(conv.unread_count ?? 0) > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
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
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 dark:text-gray-400" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedConv.otherUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedConv.otherUser?.full_name || 'User'}
                  </p>
                  {initialEquipmentTitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{initialEquipmentTitle}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
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
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
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
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
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
                    className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-teal-500 max-h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                <MessageSquare className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 dark:text-gray-500 font-medium">Select a conversation</p>
                <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">
                  Choose from your conversations on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
