/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import {
  Users,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Copy,
  Share2,
  Loader2,
  XCircle,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { errorMonitoring } from '../../services/errorMonitoring';
import { useToast } from '../ui/Toast';

interface SplitPaymentProps {
  bookingId: string;
  totalAmount: number;
  equipmentTitle: string;
  onComplete?: (splits: PaymentSplit[]) => void;
  onClose: () => void;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarColor: string;
}

interface PaymentSplit {
  participantId: string;
  participant: Participant;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'declined';
  paidAt?: Date;
}

const avatarColors = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-teal-500 to-emerald-500',
  'from-orange-500 to-amber-500',
];

export default function SplitPayment({
  bookingId,
  totalAmount,
  equipmentTitle,
  onComplete,
  onClose,
}: SplitPaymentProps) {
  const { addToast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', email: 'you@example.com', avatarColor: avatarColors[0] },
  ]);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>({});
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', phone: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.email) {
      addToast({
        type: 'warning',
        title: 'Missing details',
        message: 'Please enter both a name and an email.',
      });
      return;
    }

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      email: newParticipant.email,
      phone: newParticipant.phone || undefined,
      avatarColor: avatarColors[participants.length % avatarColors.length],
    };

    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', email: '', phone: '' });
    setShowAddForm(false);
  };

  const removeParticipant = (id: string) => {
    if (id === '1') return; // Can't remove self
    setParticipants(participants.filter(p => p.id !== id));
    const newCustom = { ...customAmounts };
    delete newCustom[id];
    setCustomAmounts(newCustom);
  };

  const calculateSplits = (): PaymentSplit[] => {
    if (splitType === 'equal') {
      const perPerson = totalAmount / participants.length;
      return participants.map(p => ({
        participantId: p.id,
        participant: p,
        amount: Math.round(perPerson * 100) / 100,
        percentage: 100 / participants.length,
        status: p.id === '1' ? 'pending' : 'pending',
      }));
    } else {
      // Custom amounts
      let remaining = totalAmount;
      const assigned = Object.values(customAmounts).reduce((sum, amt) => sum + amt, 0);
      remaining -= assigned;

      return participants.map(p => {
        const amount = customAmounts[p.id] || 0;
        return {
          participantId: p.id,
          participant: p,
          amount,
          percentage: (amount / totalAmount) * 100,
          status: 'pending' as const,
        };
      });
    }
  };

  const handleCustomAmountChange = (participantId: string, amount: number) => {
    setCustomAmounts(prev => ({
      ...prev,
      [participantId]: Math.min(amount, totalAmount),
    }));
  };

  const getRemainingAmount = () => {
    const assigned = Object.values(customAmounts).reduce((sum, amt) => sum + amt, 0);
    return totalAmount - assigned;
  };

  const splitEvenly = () => {
    const perPerson = totalAmount / participants.length;
    const newAmounts: { [key: string]: number } = {};
    participants.forEach(p => {
      newAmounts[p.id] = Math.round(perPerson * 100) / 100;
    });
    setCustomAmounts(newAmounts);
  };

  const sendInvites = async () => {
    setSending(true);

    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 2000));

    const link = `https://islakayd.com/split/${bookingId}/${Date.now().toString(36)}`;
    setShareLink(link);

    const finalSplits = calculateSplits();
    setSplits(finalSplits);
    setSent(true);
    setSending(false);

    if (onComplete) {
      onComplete(finalSplits);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      addToast({
        type: 'success',
        title: 'Link copied to clipboard',
      });
    } catch (err) {
      console.error('Failed to copy split-payment link:', err);
      addToast({
        type: 'error',
        title: 'Could not copy link',
        message: 'Please copy it manually.',
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Split Payment Request',
          text: `You've been invited to split the cost of renting ${equipmentTitle}`,
          url: shareLink,
        });
      } catch (e) {
        // AbortError == user dismissed the share sheet (expected, no
        // signal). Anything else (invalid payload, OS-level error) is
        // worth seeing — forward to Sentry.
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          errorMonitoring.captureException(
            e instanceof Error ? e : new Error(String(e)),
            { share: { source: 'SplitPayment.share' } }
          );
        }
      }
    }
  };

  const currentSplits = calculateSplits();
  const isValidSplit = splitType === 'equal' || getRemainingAmount() === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Split Payment</h2>
                <p className="text-sm text-white/80">Share costs with friends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-white/80 mb-1">Total Amount</div>
            <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
            <div className="text-sm text-white/80 mt-1">{equipmentTitle}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!sent ? (
            <>
              {/* Split Type Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setSplitType('equal')}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                    splitType === 'equal'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Split Equally
                </button>
                <button
                  onClick={() => setSplitType('custom')}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                    splitType === 'custom'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Custom Amounts
                </button>
              </div>

              {/* Participants List */}
              <div className="space-y-3 mb-6">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${participant.avatarColor} flex items-center justify-center text-white font-semibold`}>
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {participant.name}
                        {participant.id === '1' && (
                          <span className="ml-2 text-xs text-green-600">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{participant.email}</p>
                    </div>

                    {splitType === 'equal' ? (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${currentSplits[index]?.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(100 / participants.length).toFixed(1)}%
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          value={customAmounts[participant.id] || ''}
                          onChange={(e) => handleCustomAmountChange(
                            participant.id,
                            parseFloat(e.target.value) || 0
                          )}
                          placeholder="0.00"
                          className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-green-500 text-right"
                        />
                      </div>
                    )}

                    {participant.id !== '1' && (
                      <button
                        aria-label="Remove participant" onClick={() => removeParticipant(participant.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Amount Helper */}
              {splitType === 'custom' && (
                <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
                  getRemainingAmount() === 0 ? 'bg-green-50' : 'bg-amber-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {getRemainingAmount() === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      getRemainingAmount() === 0 ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {getRemainingAmount() === 0
                        ? 'All amounts assigned!'
                        : `$${getRemainingAmount().toFixed(2)} remaining`}
                    </span>
                  </div>
                  <button
                    onClick={splitEvenly}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                   >
                    <RefreshCw className="w-4 h-4" />
                    Split evenly
                  </button>
                </div>
              )}

              {/* Add Participant */}
              {showAddForm ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Participant</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                      placeholder="Name"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="email"
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                      placeholder="Email"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="tel"
                      value={newParticipant.phone}
                      onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                      placeholder="Phone (optional)"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-green-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addParticipant}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                       >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 mb-6"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Participant
                </button>
              )}

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Split Preview</h4>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
                  {currentSplits.map((split) => (
                    <div
                      key={split.participantId}
                      className={`h-full bg-gradient-to-r ${split.participant.avatarColor}`}
                      style={{ width: `${split.percentage}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {currentSplits.map((split) => (
                    <span key={split.participantId}>
                      {split.participant.name}: {split.percentage.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={sendInvites}
                disabled={participants.length < 2 || !isValidSplit || sending}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Invites...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Payment Requests
                  </>
                )}
              </button>

              {participants.length < 2 && (
                <p className="text-sm text-center text-gray-500 mt-3">
                  Add at least one more person to split the payment
                </p>
              )}
            </>
          ) : (
            /* Success View */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Requests Sent!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've notified everyone to pay their share
              </p>

              {/* Status List */}
              <div className="space-y-3 mb-6">
                {splits.map((split) => (
                  <div
                    key={split.participantId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${split.participant.avatarColor} flex items-center justify-center text-white font-semibold`}>
                        {split.participant.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{split.participant.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">${split.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      split.status === 'paid' ? 'text-green-600' :
                      split.status === 'declined' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {split.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> :
                       split.status === 'declined' ? <XCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                      {split.status.charAt(0).toUpperCase() + split.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Share Link */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share payment link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300"
                  />
                  <button
                    onClick={copyLink}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={shareNative}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                   >
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
               >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
