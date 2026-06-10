import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Pen,
  Loader2,
  Shield,
  Package,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RentalAgreementGeneratorProps {
  onBack: () => void;
  bookingId?: string;
}

interface Agreement {
  id: string;
  booking_id: string;
  equipment_title: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  deposit_amount: number;
  daily_rate: number;
  insurance_plan: string | null;
  special_terms: string | null;
  status: 'pending' | 'owner_signed' | 'fully_signed' | 'voided';
  owner_signed_at: string | null;
  renter_signed_at: string | null;
  owner_id: string;
  renter_id: string;
  created_at: string;
  owner?: { full_name: string | null };
  renter?: { full_name: string | null };
}

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Signatures', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  owner_signed: { label: 'Owner Signed', bg: 'bg-blue-50', text: 'text-blue-700', icon: Pen },
  fully_signed: { label: 'Fully Signed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  voided: { label: 'Voided', bg: 'bg-gray-50', text: 'text-gray-600', icon: XCircle },
};

const STANDARD_TERMS = `
1. EQUIPMENT USE: The renter agrees to use the equipment only for its intended purpose and in accordance with manufacturer guidelines.

2. RESPONSIBILITY: The renter is responsible for the equipment from pickup/delivery until return. Any damage beyond normal wear and tear will be deducted from the deposit.

3. RETURN CONDITION: Equipment must be returned in the same condition as received, clean and fully functional.

4. LATE RETURN: Late returns are charged at 1.5x the daily rate for each additional day without prior agreement.

5. DAMAGE POLICY: Any damage must be reported immediately. The deposit covers repairs up to the deposit amount. Costs exceeding the deposit are the renter's responsibility.

6. CANCELLATION: Cancellations 48+ hours before start date receive a full refund. Cancellations within 48 hours forfeit 50% of the rental amount.

7. DISPUTES: Any disputes will be handled through the Islakayd platform dispute resolution system.

8. INSURANCE: The selected insurance plan applies during the rental period as described during booking.
`.trim();

function generateAgreementText(agreement: Agreement, ownerName: string, renterName: string): string {
  const start = new Date(agreement.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const end = new Date(agreement.end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const days = Math.ceil((new Date(agreement.end_date).getTime() - new Date(agreement.start_date).getTime()) / 86400000);

  return `
EQUIPMENT RENTAL AGREEMENT
===========================
Agreement ID: ${agreement.id}
Date: ${new Date(agreement.created_at).toLocaleDateString()}

PARTIES
-------
Owner: ${ownerName}
Renter: ${renterName}

EQUIPMENT
---------
Equipment: ${agreement.equipment_title}
Rental Period: ${start} to ${end} (${days} days)
Daily Rate: $${agreement.daily_rate.toFixed(2)}
Insurance Plan: ${agreement.insurance_plan || 'None'}

FINANCIAL TERMS
---------------
Total Rental Amount: $${agreement.total_amount.toFixed(2)}
Security Deposit: $${agreement.deposit_amount.toFixed(2)}

SPECIAL TERMS
-------------
${agreement.special_terms || 'None'}

STANDARD TERMS & CONDITIONS
----------------------------
${STANDARD_TERMS}

SIGNATURES
----------
Owner: ${agreement.owner_signed_at ? `Signed on ${new Date(agreement.owner_signed_at).toLocaleDateString()}` : '[Pending]'}
Renter: ${agreement.renter_signed_at ? `Signed on ${new Date(agreement.renter_signed_at).toLocaleDateString()}` : '[Pending]'}
`.trim();
}

export default function RentalAgreementGenerator({ onBack, bookingId }: RentalAgreementGeneratorProps) {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selected, setSelected] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bookingIdInput, setBookingIdInput] = useState(bookingId || '');
  const [specialTerms, setSpecialTerms] = useState('');

  const loadAgreements = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('rental_agreements')
      .select(`*, owner:profiles!rental_agreements_owner_id_fkey(full_name), renter:profiles!rental_agreements_renter_id_fkey(full_name)`)
      .or(`owner_id.eq.${user.id},renter_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (!error) setAgreements((data || []) as Agreement[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAgreements(); }, [loadAgreements]);

  const handleGenerate = async () => {
    if (!user || !bookingIdInput.trim()) return;
    setGenerating(true);
    try {
      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .select(`id, owner_id, renter_id, start_date, end_date, total_amount, deposit_amount, daily_rate, service_fee, equipment:equipment(title)`)
        .eq('id', bookingIdInput.trim())
        .single();

      if (bError || !booking) {
        alert('Booking not found. Please check the ID.');
        return;
      }

      const equipmentTitle = (booking.equipment as { title?: string } | null)?.title || 'Unknown Equipment';

      const { data: existing } = await supabase
        .from('rental_agreements')
        .select('id')
        .eq('booking_id', booking.id)
        .maybeSingle();

      if (existing) {
        alert('An agreement already exists for this booking.');
        await loadAgreements();
        return;
      }

      const { data: agreement, error: aError } = await supabase
        .from('rental_agreements')
        .insert({
          booking_id: booking.id,
          owner_id: booking.owner_id,
          renter_id: booking.renter_id,
          equipment_title: equipmentTitle,
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_amount: booking.total_amount,
          deposit_amount: booking.deposit_amount,
          daily_rate: booking.daily_rate,
          special_terms: specialTerms || null,
        })
        .select(`*, owner:profiles!rental_agreements_owner_id_fkey(full_name), renter:profiles!rental_agreements_renter_id_fkey(full_name)`)
        .single();

      if (aError) throw aError;
      setAgreements(prev => [agreement as Agreement, ...prev]);
      setSelected(agreement as Agreement);
      setBookingIdInput('');
      setSpecialTerms('');
    } catch (err) {
      console.error('Failed to generate agreement:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSign = async (agreementId: string, role: 'owner' | 'renter') => {
    if (!user) return;
    setSigning(true);
    try {
      const now = new Date().toISOString();
      const updates: Record<string, string> = {};
      updates[role === 'owner' ? 'owner_signed_at' : 'renter_signed_at'] = now;
      updates[role === 'owner' ? 'owner_signature' : 'renter_signature'] = `${user.id}:${now}`;

      const { data: current } = await supabase.from('rental_agreements').select('owner_signed_at,renter_signed_at').eq('id', agreementId).single();
      const otherSigned = role === 'owner' ? current?.renter_signed_at : current?.owner_signed_at;
      if (otherSigned) updates.status = 'fully_signed';
      else updates.status = role === 'owner' ? 'owner_signed' : 'pending';

      const { data, error } = await supabase
        .from('rental_agreements')
        .update(updates)
        .eq('id', agreementId)
        .select(`*, owner:profiles!rental_agreements_owner_id_fkey(full_name), renter:profiles!rental_agreements_renter_id_fkey(full_name)`)
        .single();

      if (error) throw error;
      setSelected(data as Agreement);
      setAgreements(prev => prev.map(a => a.id === agreementId ? data as Agreement : a));
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = (agreement: Agreement) => {
    const ownerName = agreement.owner?.full_name || 'Owner';
    const renterName = agreement.renter?.full_name || 'Renter';
    const text = generateAgreementText(agreement, ownerName, renterName);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rental-agreement-${agreement.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selected) {
    const cfg = STATUS_CONFIG[selected.status];
    const Icon = cfg.icon;
    const isOwner = user?.id === selected.owner_id;
    const isRenter = user?.id === selected.renter_id;
    const myRole = isOwner ? 'owner' : 'renter';
    const mySigned = isOwner ? selected.owner_signed_at : selected.renter_signed_at;
    const ownerName = selected.owner?.full_name || 'Owner';
    const renterName = selected.renter?.full_name || 'Renter';

    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Agreements
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Rental Agreement</h2>
              <span className={`flex items-center gap-1.5 px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-sm font-medium`}>
                <Icon className="w-4 h-4" /> {cfg.label}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-96 mb-6">
              {generateAgreementText(selected, ownerName, renterName)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Owner ({ownerName})</p>
                {selected.owner_signed_at ? (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Signed {new Date(selected.owner_signed_at).toLocaleDateString()}</p>
                ) : (
                  <p className="text-sm text-amber-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</p>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Renter ({renterName})</p>
                {selected.renter_signed_at ? (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Signed {new Date(selected.renter_signed_at).toLocaleDateString()}</p>
                ) : (
                  <p className="text-sm text-amber-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownload(selected)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              {(isOwner || isRenter) && !mySigned && selected.status !== 'voided' && (
                <button
                  onClick={() => handleSign(selected.id, myRole)}
                  disabled={signing}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
                >
                  {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pen className="w-4 h-4" />}
                  Sign as {myRole === 'owner' ? 'Owner' : 'Renter'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rental Agreements</h1>
            <p className="text-gray-500 text-sm">Digital contracts for your rentals</p>
          </div>
        </div>

        {/* Generate new */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Generate Agreement from Booking</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
              <input
                value={bookingIdInput}
                onChange={e => setBookingIdInput(e.target.value)}
                placeholder="Paste your booking ID"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Terms (optional)</label>
              <textarea
                value={specialTerms}
                onChange={e => setSpecialTerms(e.target.value)}
                rows={2}
                placeholder="Any additional terms for this rental..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !bookingIdInput.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate Agreement
            </button>
          </div>
        </div>

        {/* Protection note */}
        <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100 mb-6">
          <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <p className="text-sm text-teal-800">Signed agreements provide legal protection for both parties. Both owner and renter must sign before the rental begins.</p>
        </div>

        {/* Agreement list */}
        {agreements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No agreements yet. Generate one from a booking above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agreements.map(a => {
              const cfg = STATUS_CONFIG[a.status];
              const Icon = cfg.icon;
              return (
                <button key={a.id} onClick={() => setSelected(a)} className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{a.equipment_title}</p>
                    <p className="text-sm text-gray-500">{new Date(a.start_date).toLocaleDateString()} – {new Date(a.end_date).toLocaleDateString()} · ${a.total_amount.toFixed(2)}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-xs font-medium flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
