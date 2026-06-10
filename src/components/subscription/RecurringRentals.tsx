import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Calendar,
  DollarSign,
  Package,
  Pause,
  Play,
  X,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RecurringRentalsProps {
  onBack: () => void;
}

interface RecurringRental {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  rental_days: number;
  rate_per_period: number;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  next_billing_date: string | null;
  total_periods_completed: number;
  total_amount_paid: number;
  notes: string | null;
  created_at: string;
  equipment?: { title: string; daily_rate: number; images: string[] } | null;
  owner?: { full_name: string | null } | null;
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  paused: { label: 'Paused', bg: 'bg-amber-50', text: 'text-amber-700', icon: Pause },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-50', text: 'text-gray-600', icon: X },
  completed: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle },
};

function computeNextBilling(startDate: string, frequency: string, periodsCompleted: number): Date {
  const start = new Date(startDate);
  const daysPerPeriod = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;
  return new Date(start.getTime() + (periodsCompleted + 1) * daysPerPeriod * 86400000);
}

export default function RecurringRentals({ onBack }: RecurringRentalsProps) {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<RecurringRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    equipment_id: '',
    frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    rental_days: 1,
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentResults, setEquipmentResults] = useState<{ id: string; title: string; daily_rate: number; owner_id: string }[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<{ id: string; title: string; daily_rate: number; owner_id: string } | null>(null);

  const loadRentals = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('recurring_rentals')
      .select(`*, equipment:equipment(title, daily_rate, images), owner:profiles!recurring_rentals_owner_id_fkey(full_name)`)
      .eq('renter_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setRentals((data || []) as RecurringRental[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadRentals(); }, [loadRentals]);

  useEffect(() => {
    if (!equipmentSearch.trim()) { setEquipmentResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('equipment')
        .select('id, title, daily_rate, owner_id')
        .ilike('title', `%${equipmentSearch}%`)
        .eq('is_active', true)
        .limit(5);
      setEquipmentResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [equipmentSearch]);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    const { error } = await supabase.from('recurring_rentals').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setRentals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleCreate = async () => {
    if (!user || !selectedEquipment) return;
    setSubmitting(true);
    try {
      const ratePerPeriod = selectedEquipment.daily_rate * form.rental_days;
      const { data, error } = await supabase
        .from('recurring_rentals')
        .insert({
          renter_id: user.id,
          owner_id: selectedEquipment.owner_id,
          equipment_id: selectedEquipment.id,
          frequency: form.frequency,
          rental_days: form.rental_days,
          rate_per_period: ratePerPeriod,
          start_date: form.start_date,
          next_billing_date: form.start_date,
          notes: form.notes || null,
          status: 'active',
        })
        .select(`*, equipment:equipment(title, daily_rate, images), owner:profiles!recurring_rentals_owner_id_fkey(full_name)`)
        .single();

      if (error) throw error;
      setRentals(prev => [data as RecurringRental, ...prev]);
      setShowNewForm(false);
      setSelectedEquipment(null);
      setEquipmentSearch('');
      setForm({ equipment_id: '', frequency: 'monthly', rental_days: 1, start_date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      console.error('Failed to create recurring rental:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (showNewForm) {
    const estimatedMonthly = selectedEquipment
      ? selectedEquipment.daily_rate * form.rental_days * (form.frequency === 'weekly' ? 4 : form.frequency === 'biweekly' ? 2 : 1)
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-xl mx-auto px-4 py-8">
          <button onClick={() => setShowNewForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Set Up Recurring Rental</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Equipment *</label>
                <input
                  value={equipmentSearch}
                  onChange={e => setEquipmentSearch(e.target.value)}
                  placeholder="Search by equipment name..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {equipmentResults.length > 0 && !selectedEquipment && (
                  <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {equipmentResults.map(eq => (
                      <button key={eq.id} onClick={() => { setSelectedEquipment(eq); setEquipmentSearch(eq.title); setEquipmentResults([]); }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex justify-between items-center border-b last:border-0 border-gray-100">
                        <span className="font-medium text-gray-900">{eq.title}</span>
                        <span className="text-gray-500">${eq.daily_rate}/day</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedEquipment && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-teal-600">
                    <CheckCircle className="w-4 h-4" /> Selected: {selectedEquipment.title} (${selectedEquipment.daily_rate}/day)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rental Frequency *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weekly', 'biweekly', 'monthly'] as const).map(freq => (
                    <button key={freq} onClick={() => setForm(f => ({ ...f, frequency: freq }))}
                      className={`py-2 rounded-xl border text-sm font-medium transition-colors ${form.frequency === freq ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                      {FREQ_LABELS[freq]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days per Rental Period *</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.rental_days}
                  onChange={e => setForm(f => ({ ...f, rental_days: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={form.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special requirements..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {selectedEquipment && (
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <p className="text-sm font-medium text-teal-800 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-teal-900">${(selectedEquipment.daily_rate * form.rental_days).toFixed(2)}</p>
                  <p className="text-xs text-teal-700">per {FREQ_LABELS[form.frequency].toLowerCase()} period ({form.rental_days} days × ${selectedEquipment.daily_rate}/day)</p>
                  <p className="text-xs text-teal-600 mt-1">≈ ${estimatedMonthly.toFixed(2)}/month</p>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={submitting || !selectedEquipment}
                className="w-full py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><RefreshCw className="w-4 h-4" /> Start Recurring Rental</>}
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
              <h1 className="text-2xl font-bold text-gray-900">Recurring Rentals</h1>
              <p className="text-gray-500 text-sm">Schedule automatic recurring equipment rentals</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Recurring Rental
          </button>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: DollarSign, title: 'Save More', desc: 'Regular renters get priority access and discounted rates' },
            { icon: Calendar, title: 'Guaranteed Availability', desc: 'Equipment reserved for your schedule' },
            { icon: Clock, title: 'No Re-booking', desc: 'Automatic renewals, no action needed' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <b.icon className="w-5 h-5 text-teal-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900">{b.title}</p>
              <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recurring rentals</h3>
            <p className="text-gray-500 mb-6 text-sm">Set up automatic recurring rentals to save time and guarantee equipment availability.</p>
            <button onClick={() => setShowNewForm(true)} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors">
              Set Up Your First Recurring Rental
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map(rental => {
              const cfg = STATUS_CONFIG[rental.status];
              const Icon = cfg.icon;
              const nextBilling = rental.next_billing_date
                ? new Date(rental.next_billing_date)
                : computeNextBilling(rental.start_date, rental.frequency, rental.total_periods_completed);

              return (
                <div key={rental.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{rental.equipment?.title || 'Unknown Equipment'}</p>
                        <p className="text-sm text-gray-500">{rental.owner?.full_name || 'Owner'} · {FREQ_LABELS[rental.frequency]}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-xs font-medium`}>
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Per Period</p>
                      <p className="text-sm font-semibold text-gray-900">${rental.rate_per_period.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Periods Done</p>
                      <p className="text-sm font-semibold text-gray-900">{rental.total_periods_completed}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Total Paid</p>
                      <p className="text-sm font-semibold text-gray-900">${rental.total_amount_paid.toFixed(2)}</p>
                    </div>
                  </div>

                  {rental.status === 'active' && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 text-teal-500" />
                      Next period: {nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}

                  {rental.status !== 'cancelled' && rental.status !== 'completed' && (
                    <div className="flex gap-2">
                      {rental.status === 'active' && (
                        <button onClick={() => handleStatusChange(rental.id, 'paused')} className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors">
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                      )}
                      {rental.status === 'paused' && (
                        <button onClick={() => handleStatusChange(rental.id, 'active')} className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-700 bg-green-50 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                          <Play className="w-3.5 h-3.5" /> Resume
                        </button>
                      )}
                      <button onClick={() => handleStatusChange(rental.id, 'cancelled')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
