import { useState } from 'react';
import { ArrowLeft, Plus, MessageSquare, Clock, AlertCircle, CheckCircle, XCircle, User, MessageCircle } from 'lucide-react';

interface CustomerSupportTicketsProps {
  onBack: () => void;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'booking' | 'equipment' | 'damage' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  created: string;
  updated: string;
  messages: number;
  renter: string;
  equipment?: string;
}

const sampleTickets: SupportTicket[] = [
  {
    id: 't1',
    ticketNumber: 'TK-2026-001',
    subject: 'Equipment damage claim - CAT Excavator',
    description: 'Minor scratch on the left side of the equipment. Requesting insurance claim.',
    category: 'damage',
    priority: 'high',
    status: 'in_progress',
    created: '2026-02-22',
    updated: '2026-02-24',
    messages: 4,
    renter: 'John D.',
    equipment: 'CAT 320 Excavator',
  },
  {
    id: 't2',
    ticketNumber: 'TK-2026-002',
    subject: 'Booking cancellation request',
    description: 'Need to cancel booking due to project delay. Requesting refund.',
    category: 'booking',
    priority: 'medium',
    status: 'waiting_customer',
    created: '2026-02-23',
    updated: '2026-02-23',
    messages: 2,
    renter: 'Sarah M.',
  },
  {
    id: 't3',
    ticketNumber: 'TK-2026-003',
    subject: 'Camera not working properly',
    description: 'Sony A7IV not focusing correctly. Possibly needs servicing.',
    category: 'equipment',
    priority: 'urgent',
    status: 'open',
    created: '2026-02-24',
    updated: '2026-02-24',
    messages: 1,
    renter: 'Mike R.',
    equipment: 'Sony A7IV Camera Kit',
  },
  {
    id: 't4',
    ticketNumber: 'TK-2026-004',
    subject: 'Billing discrepancy',
    description: 'Charged twice for the same rental. Please review transaction.',
    category: 'billing',
    priority: 'high',
    status: 'in_progress',
    created: '2026-02-20',
    updated: '2026-02-24',
    messages: 6,
    renter: 'Lisa K.',
  },
  {
    id: 't5',
    ticketNumber: 'TK-2026-005',
    subject: 'How to use the 3D viewer feature',
    description: 'Having trouble accessing the 3D equipment viewer.',
    category: 'technical',
    priority: 'low',
    status: 'resolved',
    created: '2026-02-18',
    updated: '2026-02-21',
    messages: 3,
    renter: 'David W.',
  },
  {
    id: 't6',
    ticketNumber: 'TK-2026-006',
    subject: 'Delivery to wrong address',
    description: 'Equipment was delivered to wrong location. Need immediate correction.',
    category: 'booking',
    priority: 'urgent',
    status: 'open',
    created: '2026-02-24',
    updated: '2026-02-24',
    messages: 2,
    renter: 'Jennifer L.',
  },
];

const categoryConfig = {
  technical: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Technical' },
  billing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Billing' },
  booking: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Booking' },
  equipment: { bg: 'bg-green-100', text: 'text-green-700', label: 'Equipment' },
  damage: { bg: 'bg-red-100', text: 'text-red-700', label: 'Damage' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Other' },
};

const statusConfig = {
  open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <MessageCircle className="w-4 h-4" />, label: 'Open' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-4 h-4" />, label: 'In Progress' },
  waiting_customer: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <AlertCircle className="w-4 h-4" />, label: 'Awaiting Response' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Resolved' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <XCircle className="w-4 h-4" />, label: 'Closed' },
};

const priorityConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-50', label: 'Low' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Medium' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
  urgent: { color: 'text-red-600', bg: 'bg-red-50', label: 'Urgent' },
};

export default function CustomerSupportTickets({ onBack }: CustomerSupportTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | SupportTicket['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | SupportTicket['category']>('all');

  const filteredTickets = sampleTickets.filter((t) => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const stats = {
    total: sampleTickets.length,
    open: sampleTickets.filter((t) => t.status === 'open').length,
    inProgress: sampleTickets.filter((t) => t.status === 'in_progress').length,
    resolved: sampleTickets.filter((t) => t.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
              <p className="text-gray-500 mt-1">Manage customer support requests and issues</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors">
            <Plus className="w-5 h-5" /> New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-600' },
            { label: 'Open', value: stats.open, color: 'text-blue-600' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Tickets</h3>
                <span className="text-sm text-gray-500">{filteredTickets.length} tickets</span>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | SupportTicket['status'])}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Awaiting Response</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as 'all' | SupportTicket['category'])}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="booking">Booking</option>
                  <option value="equipment">Equipment</option>
                  <option value="damage">Damage</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Tickets */}
              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const statusCfg = statusConfig[ticket.status];
                  const categoryCfg = categoryConfig[ticket.category];
                  const priorityCfg = priorityConfig[ticket.priority];
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 truncate">{ticket.subject}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryCfg.bg} ${categoryCfg.text} whitespace-nowrap flex-shrink-0`}>
                              {categoryCfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{ticket.ticketNumber}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span>{ticket.renter}</span>
                          <span>•</span>
                          <span>{new Date(ticket.updated).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={priorityCfg.color}>{priorityCfg.label}</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {ticket.messages}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div>
            {selectedTicket ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" /> Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Ticket Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedTicket.ticketNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase">Category</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${categoryConfig[selectedTicket.category].bg} ${categoryConfig[selectedTicket.category].text}`}>
                      {categoryConfig[selectedTicket.category].label}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase">Priority</p>
                    <span className={`inline-block text-xs font-medium ${priorityConfig[selectedTicket.priority].color}`}>
                      {priorityConfig[selectedTicket.priority].label}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusConfig[selectedTicket.status].bg} ${statusConfig[selectedTicket.status].text}`}>
                      {statusConfig[selectedTicket.status].icon}
                      {statusConfig[selectedTicket.status].label}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase">Renter</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4" /> {selectedTicket.renter}
                    </p>
                  </div>

                  {selectedTicket.equipment && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Equipment</p>
                      <p className="text-sm text-gray-900">{selectedTicket.equipment}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 uppercase">Created</p>
                    <p className="text-sm text-gray-900">{new Date(selectedTicket.created).toLocaleDateString()}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 uppercase mb-2">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <button className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                      Reply
                    </button>
                    <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
