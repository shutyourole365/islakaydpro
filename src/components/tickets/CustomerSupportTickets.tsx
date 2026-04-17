import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Wrench,
} from 'lucide-react';

type Status = 'open' | 'in_progress' | 'resolved' | 'awaiting' | 'closed';
type Category = 'damage' | 'booking' | 'equipment' | 'technical' | 'billing' | 'other';
type Priority = 'urgent' | 'high' | 'medium' | 'low';

interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: Status;
  category: Category;
  priority: Priority;
  renter: string;
  equipment?: string;
  createdAt: string;
  updatedAt: string;
  messages: number;
}

interface Props {
  onBack: () => void;
}

const TICKETS: Ticket[] = [
  {
    id: 't1',
    number: 'TK-2026-001',
    subject: 'Equipment damage claim - CAT Excavator',
    description: 'Minor scratch on the left side panel after return. Need guidance on claim process.',
    status: 'in_progress',
    category: 'damage',
    priority: 'high',
    renter: 'John D.',
    equipment: 'CAT 320 Excavator',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-15',
    messages: 4,
  },
  {
    id: 't2',
    number: 'TK-2026-002',
    subject: 'Booking cancellation request',
    description: 'Customer requesting cancellation two days before rental start.',
    status: 'open',
    category: 'booking',
    priority: 'medium',
    renter: 'Sarah M.',
    equipment: 'Sony A7IV Camera Kit',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
    messages: 2,
  },
  {
    id: 't3',
    number: 'TK-2026-003',
    subject: 'Camera not working properly',
    description: 'Autofocus is intermittent and images appear blurry.',
    status: 'open',
    category: 'technical',
    priority: 'urgent',
    renter: 'Mike R.',
    equipment: 'Sony A7IV Camera Kit',
    createdAt: '2026-03-13',
    updatedAt: '2026-03-14',
    messages: 6,
  },
  {
    id: 't4',
    number: 'TK-2026-004',
    subject: 'Double charged for deposit',
    description: 'The deposit was captured twice on the same booking.',
    status: 'in_progress',
    category: 'billing',
    priority: 'high',
    renter: 'Elena P.',
    createdAt: '2026-03-08',
    updatedAt: '2026-03-11',
    messages: 3,
  },
  {
    id: 't5',
    number: 'TK-2026-005',
    subject: 'Thank you note',
    description: 'Great service, just wanted to say thanks.',
    status: 'resolved',
    category: 'other',
    priority: 'low',
    renter: 'Carlos V.',
    createdAt: '2026-02-28',
    updatedAt: '2026-03-02',
    messages: 1,
  },
  {
    id: 't6',
    number: 'TK-2026-006',
    subject: 'Equipment not delivered on time',
    description: 'Delivery was late and impacted our project schedule.',
    status: 'awaiting',
    category: 'equipment',
    priority: 'urgent',
    renter: 'Priya K.',
    equipment: 'DeWalt Power Tool Kit',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-15',
    messages: 2,
  },
];

const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  awaiting: 'Awaiting Response',
  closed: 'Closed',
};

const STATUS_STYLE: Record<Status, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  awaiting: 'bg-purple-50 text-purple-700',
  closed: 'bg-gray-100 text-gray-600',
};

const CATEGORY_LABEL: Record<Category, string> = {
  damage: 'Damage',
  booking: 'Booking',
  equipment: 'Equipment',
  technical: 'Technical',
  billing: 'Billing',
  other: 'Other',
};

const CATEGORY_STYLE: Record<Category, string> = {
  damage: 'bg-red-50 text-red-700',
  booking: 'bg-blue-50 text-blue-700',
  equipment: 'bg-teal-50 text-teal-700',
  technical: 'bg-indigo-50 text-indigo-700',
  billing: 'bg-amber-50 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const PRIORITY_STYLE: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export default function CustomerSupportTickets({ onBack }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = TICKETS.length;
    const open = TICKETS.filter((t) => t.status === 'open').length;
    const inProgress = TICKETS.filter((t) => t.status === 'in_progress').length;
    const resolved = TICKETS.filter((t) => t.status === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, []);

  const filtered = useMemo(() => {
    return TICKETS.filter((t) => {
      const statusMatch = statusFilter === 'all' || t.status === statusFilter;
      const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [statusFilter, categoryFilter]);

  const selected = filtered.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-sm text-gray-500">
              Manage customer support requests across the platform
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} icon={<MessageSquare className="w-5 h-5" />} />
          <StatCard label="Open" value={stats.open} icon={<AlertCircle className="w-5 h-5 text-blue-500" />} />
          <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5 text-amber-500" />} />
          <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="awaiting">Awaiting Response</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="damage">Damage</option>
            <option value="booking">Booking</option>
            <option value="equipment">Equipment</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>
          <span className="text-sm text-gray-500">{filtered.length} tickets</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
            {filtered.map((ticket) => {
              const isSelected = ticket.id === selectedId;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left rounded-2xl border transition-colors p-4 bg-white ${
                    isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">{ticket.number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_STYLE[ticket.priority]}`}>
                      {PRIORITY_LABEL[ticket.priority]}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_STYLE[ticket.category]}`}>
                      {CATEGORY_LABEL[ticket.category]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[ticket.status]}`}>
                      {STATUS_LABEL[ticket.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.renter}
                    </span>
                    <span>{ticket.updatedAt}</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messages}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            {selected ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Ticket</p>
                  <p className="font-mono text-gray-900">{selected.number}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${CATEGORY_STYLE[selected.category]}`}>
                    {CATEGORY_LABEL[selected.category]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${PRIORITY_STYLE[selected.priority]}`}>
                    {PRIORITY_LABEL[selected.priority]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${STATUS_STYLE[selected.status]}`}>
                    <Clock className="w-3 h-3" />
                    {STATUS_LABEL[selected.status]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Renter</p>
                  <p className="text-gray-900">{selected.renter}</p>
                </div>
                {selected.equipment && (
                  <div>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Equipment
                    </p>
                    <p className="text-gray-900">{selected.equipment}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-gray-900">{selected.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-gray-700">{selected.description}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                    Reply
                  </button>
                  <button className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
                    Resolve
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a ticket to view details.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
