import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Shield,
  ChevronRight,
  Camera,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DisputeCenterProps {
  onBack: () => void;
  bookingId?: string;
}

interface Dispute {
  id: string;
  booking_id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  evidence_urls: string[];
  resolution_notes: string | null;
  deposit_action: string | null;
  created_at: string;
  opened_by: string;
  against_user: string;
  equipment_title?: string;
}

interface DisputeMessage {
  id: string;
  sender_id: string;
  content: string;
  attachments: string[];
  is_admin: boolean;
  created_at: string;
}

const DISPUTE_TYPES = [
  { value: 'damage', label: 'Equipment Damage', icon: '💥' },
  { value: 'no_show', label: 'No-Show', icon: '🚫' },
  { value: 'late_return', label: 'Late Return', icon: '⏰' },
  { value: 'wrong_item', label: 'Wrong Item Sent', icon: '📦' },
  { value: 'payment', label: 'Payment Issue', icon: '💳' },
  { value: 'other', label: 'Other', icon: '❓' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle },
  under_review: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  resolved_renter: { label: 'Resolved (Renter)', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  resolved_owner: { label: 'Resolved (Owner)', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  resolved_split: { label: 'Resolved (Split)', bg: 'bg-teal-50', text: 'text-teal-700', icon: CheckCircle },
  closed: { label: 'Closed', bg: 'bg-gray-50', text: 'text-gray-600', icon: XCircle },
};

async function getDisputes(userId: string): Promise<Dispute[]> {
  const { data, error } = await supabase
    .from('disputes')
    .select(`*, bookings(equipment:equipment(title))`)
    .or(`opened_by.eq.${userId},against_user.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    equipment_title: (d.bookings as { equipment?: { title?: string } } | null)?.equipment?.title ?? 'Unknown Equipment',
  })) as Dispute[];
}

async function getDisputeMessages(disputeId: string): Promise<DisputeMessage[]> {
  const { data, error } = await supabase
    .from('dispute_messages')
    .select('*')
    .eq('dispute_id', disputeId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as DisputeMessage[];
}

async function createDispute(dispute: {
  booking_id: string;
  opened_by: string;
  against_user: string;
  type: string;
  title: string;
  description: string;
  evidence_urls: string[];
}): Promise<Dispute> {
  const { data, error } = await supabase
    .from('disputes')
    .insert(dispute)
    .select()
    .single();
  if (error) throw error;
  return data as Dispute;
}

async function sendDisputeMessage(disputeId: string, senderId: string, content: string): Promise<DisputeMessage> {
  const { data, error } = await supabase
    .from('dispute_messages')
    .insert({ dispute_id: disputeId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  return data as DisputeMessage;
}

export default function DisputeCenter({ onBack, bookingId }: DisputeCenterProps) {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(!!bookingId);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    booking_id: bookingId || '',
    type: 'damage',
    title: '',
    description: '',
    against_user: '',
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const loadDisputes = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getDisputes(user.id);
      setDisputes(data);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadDisputes(); }, [loadDisputes]);

  useEffect(() => {
    if (!selected) return;
    getDisputeMessages(selected.id).then(setMessages);
    const channel = supabase
      .channel(`dispute_msgs_${selected.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispute_messages', filter: `dispute_id=eq.${selected.id}` },
        (payload) => setMessages(prev => [...prev, payload.new as DisputeMessage]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  const handleSendMessage = async () => {
    if (!user || !selected || !newMessage.trim()) return;
    setSending(true);
    try {
      const msg = await sendDisputeMessage(selected.id, user.id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleEvidenceUpload = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const path = `disputes/${user!.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('evidence').upload(path, file);
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmitDispute = async () => {
    if (!user || !form.booking_id || !form.title || !form.description) return;
    setSubmitting(true);
    try {
      // Get booking to find the other party
      const { data: booking } = await supabase
        .from('bookings')
        .select('renter_id, owner_id')
        .eq('id', form.booking_id)
        .single();

      if (!booking) {
        alert('Booking not found. Please check the Booking ID.');
        return;
      }

      const against = booking.renter_id === user.id ? booking.owner_id : booking.renter_id;
      const evidenceUrls = evidenceFiles.length > 0 ? await handleEvidenceUpload(evidenceFiles) : [];

      const dispute = await createDispute({
        booking_id: form.booking_id,
        opened_by: user.id,
        against_user: against,
        type: form.type,
        title: form.title,
        description: form.description,
        evidence_urls: evidenceUrls,
      });

      setDisputes(prev => [dispute, ...prev]);
      setSelected(dispute);
      setShowNewForm(false);
      setForm({ booking_id: '', type: 'damage', title: '', description: '', against_user: '' });
      setEvidenceFiles([]);
    } catch (err) {
      console.error('Failed to open dispute:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (selected) {
    const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.open;
    const Icon = cfg.icon;
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Disputes
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.equipment_title}</p>
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-sm font-medium`}>
                <Icon className="w-4 h-4" />
                {cfg.label}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{selected.description}</p>
            {selected.evidence_urls?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {selected.evidence_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                      <img src={url} alt="Evidence" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {selected.resolution_notes && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm font-medium text-green-800 mb-1">Resolution</p>
                <p className="text-sm text-green-700">{selected.resolution_notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Dispute Messages</h3>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 py-8">No messages yet. Start the conversation.</p>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm ${isMe ? 'bg-teal-500 text-white rounded-br-none' : msg.is_admin ? 'bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                      {msg.is_admin && <p className="text-xs font-medium mb-1 text-amber-600">Platform Support</p>}
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected.status !== 'closed' && (
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showNewForm) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => setShowNewForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Open a Dispute</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID *</label>
                <input
                  value={form.booking_id}
                  onChange={e => setForm(f => ({ ...f, booking_id: e.target.value }))}
                  placeholder="Paste your booking ID here"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">Find this in your booking confirmation or dashboard.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISPUTE_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${form.type === t.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief summary of the issue"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe what happened in detail..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (photos)</label>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-teal-400 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload photos as evidence</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => setEvidenceFiles(Array.from(e.target.files || []))}
                  />
                </label>
                {evidenceFiles.length > 0 && (
                  <p className="text-sm text-teal-600 mt-2">{evidenceFiles.length} file(s) selected</p>
                )}
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Platform Protection</p>
                    <p className="text-xs text-amber-700 mt-0.5">Our team reviews all disputes within 48 hours. Both parties will be notified and can provide evidence. Deposits are held until resolution.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitDispute}
                disabled={submitting || !form.booking_id || !form.title || !form.description}
                className="w-full py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Open Dispute'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispute Center</h1>
              <p className="text-gray-500 text-sm">Resolve issues with rentals safely</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Open Dispute
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900">Protected by Islakayd</p>
              <p className="text-sm text-gray-500">All disputes are reviewed by our team. Deposits are protected during the review period.</p>
            </div>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No disputes</h3>
            <p className="text-gray-500 mb-6">Any issues with your rentals can be resolved here.</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-6 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              Open Your First Dispute
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map(dispute => {
              const cfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
              const Icon = cfg.icon;
              const typeLabel = DISPUTE_TYPES.find(t => t.value === dispute.type)?.label || dispute.type;
              return (
                <button
                  key={dispute.id}
                  onClick={() => setSelected(dispute)}
                  className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{dispute.title}</p>
                    <p className="text-sm text-gray-500">{dispute.equipment_title} · {typeLabel}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(dispute.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`hidden sm:flex items-center gap-1 px-2.5 py-1 ${cfg.bg} ${cfg.text} rounded-full text-xs font-medium`}>
                      {cfg.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
