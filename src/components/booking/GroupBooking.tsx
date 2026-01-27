import { useState } from 'react';
import {
  Users,
  Trash2,
  Calendar,
  Clock,
  Package,
  DollarSign,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  Share2,
  XCircle,
  Building2,
  Tag,
  Loader2,
} from 'lucide-react';

interface GroupBookingProps {
  equipmentId: string;
  equipmentTitle: string;
  dailyRate: number;
  maxQuantity?: number;
  onComplete?: (booking: GroupBookingData) => void;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'organizer' | 'member';
  confirmed: boolean;
}

interface GroupBookingData {
  id: string;
  equipmentId: string;
  teamName: string;
  members: TeamMember[];
  startDate: Date;
  endDate: Date;
  quantity: number;
  totalDays: number;
  subtotal: number;
  groupDiscount: number;
  totalAmount: number;
  notes: string;
}

export default function GroupBooking({
  equipmentId,
  equipmentTitle,
  dailyRate,
  maxQuantity = 10,
  onComplete,
  onClose,
}: GroupBookingProps) {
  const [step, setStep] = useState<'team' | 'schedule' | 'review'>('team');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You (Organizer)',
      email: 'organizer@example.com',
      role: 'organizer',
      confirmed: true,
    },
  ]);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [_shareLink, setShareLink] = useState(''); // Reserved for share feature
  const [submitting, setSubmitting] = useState(false);

  const addMember = () => {
    if (!newMember.name || !newMember.email) {
      alert('Please enter name and email');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: 'member',
      confirmed: false,
    };

    setMembers([...members, member]);
    setNewMember({ name: '', email: '', phone: '' });
    setShowAddMember(false);
  };

  const removeMember = (id: string) => {
    if (id === '1') return; // Can't remove organizer
    setMembers(members.filter(m => m.id !== id));
  };

  const calculatePricing = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) return null;

    const subtotal = dailyRate * quantity * days;
    
    // Group discounts
    let discountPercent = 0;
    if (members.length >= 3) discountPercent = 5;
    if (members.length >= 5) discountPercent = 10;
    if (members.length >= 10) discountPercent = 15;
    if (days >= 7) discountPercent += 5;

    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;

    return {
      days,
      subtotal,
      discountPercent,
      discount,
      total,
    };
  };

  const pricing = calculatePricing();

  const generateShareLink = () => {
    const link = `https://islakayd.com/group/${equipmentId}/${Date.now().toString(36)}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  const handleSubmit = async () => {
    if (!pricing) return;

    setSubmitting(true);

    // Simulate booking creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const bookingData: GroupBookingData = {
      id: Date.now().toString(),
      equipmentId,
      teamName,
      members,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity,
      totalDays: pricing.days,
      subtotal: pricing.subtotal,
      groupDiscount: pricing.discount,
      totalAmount: pricing.total,
      notes,
    };

    if (onComplete) {
      onComplete(bookingData);
    }

    setSubmitting(false);
    onClose();
  };

  const canProceedToSchedule = teamName.trim() !== '' && members.length >= 1;
  const canProceedToReview = startDate && endDate && pricing && pricing.days > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Group Booking</h2>
                <p className="text-sm text-white/80">Book for your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            {(['team', 'schedule', 'review'] as const).map((s, index) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-white text-orange-500'
                    : index < ['team', 'schedule', 'review'].indexOf(step)
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm hidden sm:block ${
                  step === s ? 'text-white font-medium' : 'text-white/70'
                }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
                {index < 2 && (
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'team' && (
            <>
              {/* Team Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team or company name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Team Members ({members.length})
                  </label>
                  {members.length >= 3 && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Group discount applied!
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.role === 'organizer'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{member.name}</p>
                          {member.role === 'organizer' && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                              Organizer
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.confirmed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                        {member.role !== 'organizer' && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {showAddMember ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Add Team Member</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Name"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="Email"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      placeholder="Phone (optional)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddMember(false)}
                        className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addMember}
                        className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="flex-1 py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:border-orange-300 hover:text-orange-500 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Member
                    </button>
                    <button
                      onClick={generateShareLink}
                      className="flex-1 py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:border-orange-300 hover:text-orange-500 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Invite Link
                    </button>
                  </div>
                )}
              </div>

              {/* Group Discount Info */}
              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Group Discounts</p>
                    <ul className="text-sm text-amber-700 mt-1 space-y-1">
                      <li>• 3+ members: 5% off</li>
                      <li>• 5+ members: 10% off</li>
                      <li>• 10+ members: 15% off</li>
                      <li>• 7+ days: Additional 5% off</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('schedule')}
                disabled={!canProceedToSchedule}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continue to Schedule
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {step === 'schedule' && (
            <>
              {/* Equipment Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{equipmentTitle}</p>
                    <p className="text-sm text-gray-500">${dailyRate}/day per unit</p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Units
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">Max: {maxQuantity}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements for your group..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Pricing Preview */}
              {pricing && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Pricing Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        ${dailyRate} × {quantity} unit{quantity > 1 ? 's' : ''} × {pricing.days} day{pricing.days > 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-900">${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {pricing.discountPercent > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Group discount ({pricing.discountPercent}%)</span>
                        <span>-${pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-600">${pricing.total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Split between {members.length} member{members.length > 1 ? 's' : ''}: ~${(pricing.total / members.length).toFixed(2)} each
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('team')}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  disabled={!canProceedToReview}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Review Booking
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {step === 'review' && pricing && (
            <>
              {/* Booking Summary */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    Team Details
                  </h4>
                  <p className="text-gray-700">{teamName}</p>
                  <p className="text-sm text-gray-500">{members.length} team member{members.length > 1 ? 's' : ''}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    Equipment
                  </h4>
                  <p className="text-gray-700">{equipmentTitle}</p>
                  <p className="text-sm text-gray-500">{quantity} unit{quantity > 1 ? 's' : ''}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    Schedule
                  </h4>
                  <p className="text-gray-700">
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{pricing.days} day{pricing.days > 1 ? 's' : ''}</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    Payment Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">Subtotal</span>
                      <span className="text-orange-900">${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {pricing.discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Group Discount ({pricing.discountPercent}%)</span>
                        <span>-${pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-orange-200 font-semibold">
                      <span className="text-orange-900">Total</span>
                      <span className="text-orange-600 text-lg">${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                  <p className="text-gray-600 text-sm">{notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('schedule')}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Group Booking
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
