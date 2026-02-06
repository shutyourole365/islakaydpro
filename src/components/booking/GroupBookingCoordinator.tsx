import { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Mail,
  User,
  Calendar,
  DollarSign,
  Split,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link,
  MessageCircle,
  Sparkles,
  CreditCard,
} from 'lucide-react';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'organizer' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  paymentStatus: 'pending' | 'paid' | 'partial';
  shareAmount: number;
  paidAmount: number;
  invitedAt: Date;
  respondedAt?: Date;
}

interface Equipment {
  id: string;
  name: string;
  image: string;
  dailyRate: number;
}

interface GroupBookingDetails {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  equipment: Equipment[];
  totalCost: number;
  splitMethod: 'equal' | 'custom' | 'by_usage';
  depositRequired: number;
  depositCollected: number;
  members: GroupMember[];
  organizerId: string;
  status: 'planning' | 'inviting' | 'confirmed' | 'active' | 'completed';
  createdAt: Date;
  notes?: string;
}

interface GroupBookingCoordinatorProps {
  bookingId?: string;
  onInviteMember?: (email: string) => void;
  onRemoveMember?: (memberId: string) => void;
  className?: string;
}

// Demo data
const demoBooking: GroupBookingDetails = {
  id: 'GB-001',
  name: 'Highway 101 Project Team',
  startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
  equipment: [
    {
      id: 'E1',
      name: 'CAT 320 Excavator',
      image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=100',
      dailyRate: 450,
    },
    {
      id: 'E2',
      name: 'Komatsu D65 Bulldozer',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100',
      dailyRate: 550,
    },
  ],
  totalCost: 7000,
  splitMethod: 'equal',
  depositRequired: 3500,
  depositCollected: 1750,
  members: [
    {
      id: 'M1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 555-0123',
      role: 'organizer',
      status: 'accepted',
      paymentStatus: 'paid',
      shareAmount: 1750,
      paidAmount: 1750,
      invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'M2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 555-0456',
      role: 'member',
      status: 'accepted',
      paymentStatus: 'pending',
      shareAmount: 1750,
      paidAmount: 0,
      invitedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'M3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      role: 'member',
      status: 'pending',
      paymentStatus: 'pending',
      shareAmount: 1750,
      paidAmount: 0,
      invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'M4',
      name: 'Emily Brown',
      email: 'emily@example.com',
      role: 'member',
      status: 'accepted',
      paymentStatus: 'partial',
      shareAmount: 1750,
      paidAmount: 875,
      invitedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ],
  organizerId: 'M1',
  status: 'inviting',
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  notes: 'Coordination for the highway expansion project. Need equipment for one week.',
};

export default function GroupBookingCoordinator({
  bookingId: _bookingId,
  onInviteMember,
  onRemoveMember,
  className = '',
}: GroupBookingCoordinatorProps) {
  void _bookingId;
  const [booking, setBooking] = useState<GroupBookingDetails>(demoBooking);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [expandedSection, setExpandedSection] = useState<string>('members');
  const [copySuccess, setCopySuccess] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalCollected = booking.members.reduce((sum, m) => sum + m.paidAmount, 0);
  const acceptedMembers = booking.members.filter(m => m.status === 'accepted').length;
  const pendingMembers = booking.members.filter(m => m.status === 'pending').length;

  const handleInvite = () => {
    if (newMemberEmail && newMemberName) {
      const newMember: GroupMember = {
        id: `M${booking.members.length + 1}`,
        name: newMemberName,
        email: newMemberEmail,
        role: 'member',
        status: 'pending',
        paymentStatus: 'pending',
        shareAmount: booking.totalCost / (booking.members.length + 1),
        paidAmount: 0,
        invitedAt: new Date(),
      };

      setBooking(prev => ({
        ...prev,
        members: [...prev.members, newMember],
      }));

      // Recalculate shares for equal split
      if (booking.splitMethod === 'equal') {
        const newShareAmount = booking.totalCost / (booking.members.length + 1);
        setBooking(prev => ({
          ...prev,
          members: prev.members.map(m => ({ ...m, shareAmount: newShareAmount })),
        }));
      }

      onInviteMember?.(newMemberEmail);
      setNewMemberEmail('');
      setNewMemberName('');
      setShowInviteModal(false);
    }
  };

  const removeMember = (memberId: string) => {
    if (booking.members.find(m => m.id === memberId)?.role === 'organizer') return;

    setBooking(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
    }));
    onRemoveMember?.(memberId);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${booking.id}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getStatusBadge = (status: GroupMember['status']) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[status];
  };

  const getPaymentBadge = (status: GroupMember['paymentStatus']) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return badges[status];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {booking.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Group Booking #{booking.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyInviteLink}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
            >
              {copySuccess ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Link className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {booking.members.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{acceptedMembers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingMembers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((totalCollected / booking.totalCost) * 100)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Collected</p>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              Total: {formatCurrency(booking.totalCost)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300 capitalize">
              {booking.splitMethod.replace('_', ' ')} Split
            </span>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Equipment ({booking.equipment.length})
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {booking.equipment.map(eq => (
            <div
              key={eq.id}
              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-w-[200px]"
            >
              <img
                src={eq.image}
                alt={eq.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {eq.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(eq.dailyRate)}/day
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Progress */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Payment Collection
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(totalCollected)} / {formatCurrency(booking.totalCost)}
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(totalCollected / booking.totalCost) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Deposit: {formatCurrency(booking.depositCollected)} / {formatCurrency(booking.depositRequired)}</span>
          <span>{formatCurrency(booking.totalCost - totalCollected)} remaining</span>
        </div>
      </div>

      {/* Members List */}
      <div className="p-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setExpandedSection(expandedSection === 'members' ? '' : 'members')}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Group Members
          </h3>
          {expandedSection === 'members' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {expandedSection === 'members' && (
          <div className="space-y-3">
            {booking.members.map(member => (
              <div
                key={member.id}
                className={`p-4 border dark:border-gray-700 rounded-xl ${
                  member.role === 'organizer' ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                        {member.role === 'organizer' && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">
                            Organizer
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(member.status)}`}>
                      {member.status}
                    </span>
                    {member.role !== 'organizer' && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Share Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(member.shareAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(member.paidAmount)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPaymentBadge(member.paymentStatus)}`}>
                    {member.paymentStatus === 'partial'
                      ? `${Math.round((member.paidAmount / member.shareAmount) * 100)}% paid`
                      : member.paymentStatus}
                  </span>
                </div>

                {member.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 text-sm border dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      Resend Invite
                    </button>
                    <button className="flex-1 py-2 text-sm border dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Send Reminder
                    </button>
                  </div>
                )}

                {member.status === 'accepted' && member.paymentStatus !== 'paid' && (
                  <div className="mt-3">
                    <button
                      className="w-full py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      Request Payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
        <div className="flex gap-3">
          <button
            onClick={() => setShowSplitModal(true)}
            className="flex-1 py-3 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Split className="w-5 h-5" />
            Adjust Split
          </button>
          <button
            disabled={pendingMembers > 0 || totalCollected < booking.depositRequired}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Confirm Booking
          </button>
        </div>
        {(pendingMembers > 0 || totalCollected < booking.depositRequired) && (
          <p className="text-sm text-amber-600 text-center mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {pendingMembers > 0
              ? `Waiting for ${pendingMembers} member${pendingMembers > 1 ? 's' : ''} to respond`
              : 'Deposit not yet collected'}
          </p>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Invite Member
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                They will receive an email invitation to join this group booking.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!newMemberEmail || !newMemberName}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Adjust Payment Split
            </h3>

            <div className="space-y-3 mb-4">
              {['equal', 'custom', 'by_usage'].map(method => (
                <button
                  key={method}
                  onClick={() => setBooking(prev => ({ ...prev, splitMethod: method as GroupBookingDetails['splitMethod'] }))}
                  className={`w-full p-4 border-2 rounded-xl text-left ${
                    booking.splitMethod === method
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {method.replace('_', ' ')} Split
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method === 'equal' && 'Divide total equally among all members'}
                    {method === 'custom' && 'Set custom amounts for each member'}
                    {method === 'by_usage' && 'Split based on equipment usage days'}
                  </p>
                </button>
              ))}
            </div>

            {booking.splitMethod === 'custom' && (
              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {booking.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {member.name}
                    </span>
                    <input
                      type="number"
                      value={member.shareAmount}
                      onChange={(e) => {
                        const newAmount = parseFloat(e.target.value) || 0;
                        setBooking(prev => ({
                          ...prev,
                          members: prev.members.map(m =>
                            m.id === member.id ? { ...m, shareAmount: newAmount } : m
                          ),
                        }));
                      }}
                      className="w-24 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white text-right"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
