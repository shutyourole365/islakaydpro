import { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  User,
  Building,
  MapPin,
  CreditCard,
  Shield,
  FileSignature,
  Mail,
  Phone,
  Scale,
  Bookmark,
  PenTool,
  Send,
} from 'lucide-react';

interface ContractParty {
  type: 'renter' | 'owner' | 'company';
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  taxId?: string;
}

interface ContractEquipment {
  id: string;
  name: string;
  serialNumber: string;
  condition: string;
  value: number;
  accessories: string[];
}

interface ContractTerms {
  rentalPeriod: {
    start: Date;
    end: Date;
    timezone: string;
  };
  pricing: {
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    subtotal: number;
    serviceFee: number;
    insurance: number;
    deposit: number;
    total: number;
  };
  insurance: {
    type: string;
    coverage: number;
    deductible: number;
    provider: string;
  };
  cancellation: {
    policy: string;
    refundPercentage: number;
    noticePeriod: number;
  };
}

interface ContractSignature {
  party: string;
  signed: boolean;
  signedAt?: Date;
  ipAddress?: string;
  signatureImage?: string;
}

interface RentalContract {
  id: string;
  version: string;
  createdAt: Date;
  status: 'draft' | 'pending_signatures' | 'active' | 'completed' | 'cancelled';
  renter: ContractParty;
  owner: ContractParty;
  equipment: ContractEquipment;
  terms: ContractTerms;
  clauses: { title: string; content: string }[];
  signatures: ContractSignature[];
  amendments?: { date: Date; description: string }[];
}

interface RentalContractViewerProps {
  contractId?: string;
  onSign?: () => void;
  onDownload?: () => void;
  onShare?: (email: string) => void;
  className?: string;
}

// Demo contract data
const demoContract: RentalContract = {
  id: 'CTR-2024-001',
  version: '1.0',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  status: 'pending_signatures',
  renter: {
    type: 'renter',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 555-0123',
    address: '123 Main St, New York, NY 10001',
    company: 'Smith Construction LLC',
    taxId: '12-3456789',
  },
  owner: {
    type: 'owner',
    name: 'Equipment Rentals Inc.',
    email: 'rentals@equipmentinc.com',
    phone: '+1 555-0456',
    address: '456 Industrial Ave, New York, NY 10002',
    company: 'Equipment Rentals Inc.',
    taxId: '98-7654321',
  },
  equipment: {
    id: 'EQ-001',
    name: 'CAT 320 Excavator',
    serialNumber: 'CAT320-2024-78542',
    condition: 'Excellent',
    value: 150000,
    accessories: ['Standard bucket', 'Hydraulic hammer attachment', 'Operating manual'],
  },
  terms: {
    rentalPeriod: {
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      timezone: 'America/New_York',
    },
    pricing: {
      dailyRate: 450,
      weeklyRate: 2800,
      subtotal: 3150,
      serviceFee: 315,
      insurance: 200,
      deposit: 5000,
      total: 8665,
    },
    insurance: {
      type: 'Comprehensive Coverage',
      coverage: 150000,
      deductible: 2500,
      provider: 'EquipGuard Insurance',
    },
    cancellation: {
      policy: 'Free cancellation up to 48 hours before rental start',
      refundPercentage: 100,
      noticePeriod: 48,
    },
  },
  clauses: [
    {
      title: '1. Equipment Use',
      content: 'The Renter agrees to use the Equipment only for its intended purpose and in accordance with the manufacturer\'s specifications. The Equipment shall not be used for any illegal activities or in a manner that could cause damage beyond normal wear and tear.',
    },
    {
      title: '2. Maintenance & Care',
      content: 'The Renter shall maintain the Equipment in good working condition and perform routine maintenance as required. This includes checking fluid levels, tire pressure, and general cleanliness. Any mechanical issues must be reported immediately to the Owner.',
    },
    {
      title: '3. Insurance & Liability',
      content: 'The Renter acknowledges that insurance coverage has been arranged as specified in this agreement. The Renter is responsible for the deductible amount in case of any damage claims. The Owner shall not be liable for any injuries, damages, or losses arising from the use of the Equipment.',
    },
    {
      title: '4. Return Conditions',
      content: 'The Equipment must be returned in the same condition as received, allowing for normal wear and tear. The Renter shall be responsible for cleaning the Equipment before return. Late returns will incur additional daily charges at 150% of the standard daily rate.',
    },
    {
      title: '5. Deposit & Payment',
      content: 'The security deposit will be held during the rental period and refunded within 7 business days after the Equipment is returned in satisfactory condition. Any damages, cleaning fees, or additional charges will be deducted from the deposit.',
    },
    {
      title: '6. Force Majeure',
      content: 'Neither party shall be liable for failure to perform due to causes beyond their reasonable control, including but not limited to natural disasters, government actions, or civil unrest.',
    },
    {
      title: '7. Dispute Resolution',
      content: 'Any disputes arising from this agreement shall first be attempted to be resolved through mediation. If mediation fails, disputes will be settled through binding arbitration in accordance with the rules of the Australian Centre for International Commercial Arbitration (ACICA).',
    },
    {
      title: '8. Governing Law',
      content: 'This agreement shall be governed by and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law principles.',
    },
  ],
  signatures: [
    {
      party: 'renter',
      signed: false,
    },
    {
      party: 'owner',
      signed: true,
      signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.1',
    },
  ],
};

export default function RentalContractViewer({
  contractId: _contractId,
  onSign,
  onDownload,
  onShare,
  className = '',
}: RentalContractViewerProps) {
  void _contractId;
  const [contract] = useState<RentalContract>(demoContract);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['terms']));
  const [showSignModal, setShowSignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: RentalContract['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      pending_signatures: 'bg-amber-100 text-amber-600',
      active: 'bg-green-100 text-green-600',
      completed: 'bg-blue-100 text-blue-600',
      cancelled: 'bg-red-100 text-red-600',
    };
    return colors[status];
  };

  const renterSignature = contract.signatures.find(s => s.party === 'renter');
  const ownerSignature = contract.signatures.find(s => s.party === 'owner');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rental Agreement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contract #{contract.id} • v{contract.version}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
            {contract.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onDownload?.()}
            className="flex-1 py-2 flex items-center justify-center gap-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 flex items-center justify-center gap-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 py-2 flex items-center justify-center gap-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Contract Content */}
      <div className="max-h-[500px] overflow-y-auto">
        {/* Parties Section */}
        <CollapsibleSection
          title="Parties to the Agreement"
          icon={<User className="w-5 h-5" />}
          isExpanded={expandedSections.has('parties')}
          onToggle={() => toggleSection('parties')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* Renter */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                Renter
              </p>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {contract.renter.name}
              </h4>
              {contract.renter.company && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {contract.renter.company}
                </p>
              )}
              <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contract.renter.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {contract.renter.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {contract.renter.address}
                </p>
              </div>
            </div>

            {/* Owner */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                Owner/Lessor
              </p>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {contract.owner.name}
              </h4>
              {contract.owner.company && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {contract.owner.company}
                </p>
              )}
              <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contract.owner.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {contract.owner.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {contract.owner.address}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Equipment Section */}
        <CollapsibleSection
          title="Equipment Details"
          icon={<Scale className="w-5 h-5" />}
          isExpanded={expandedSections.has('equipment')}
          onToggle={() => toggleSection('equipment')}
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Equipment Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {contract.equipment.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Serial Number</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {contract.equipment.serialNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Condition</p>
                <p className="text-gray-900 dark:text-white">{contract.equipment.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Replacement Value</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(contract.equipment.value)}
                </p>
              </div>
            </div>
            {contract.equipment.accessories.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Included Accessories
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {contract.equipment.accessories.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Terms Section */}
        <CollapsibleSection
          title="Rental Terms & Pricing"
          icon={<CreditCard className="w-5 h-5" />}
          isExpanded={expandedSections.has('terms')}
          onToggle={() => toggleSection('terms')}
        >
          <div className="space-y-4">
            {/* Dates */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Rental Period
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Start Date</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {formatDate(contract.terms.rentalPeriod.start)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">End Date</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {formatDate(contract.terms.rentalPeriod.end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Pricing Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.dailyRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal (7 days)</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.insurance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.deposit)}
                  </span>
                </div>
                <div className="pt-2 border-t dark:border-gray-600 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    {formatCurrency(contract.terms.pricing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Insurance Coverage
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-green-700 dark:text-green-300">Type</p>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {contract.terms.insurance.type}
                  </p>
                </div>
                <div>
                  <p className="text-green-700 dark:text-green-300">Coverage Amount</p>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {formatCurrency(contract.terms.insurance.coverage)}
                  </p>
                </div>
                <div>
                  <p className="text-green-700 dark:text-green-300">Deductible</p>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {formatCurrency(contract.terms.insurance.deductible)}
                  </p>
                </div>
                <div>
                  <p className="text-green-700 dark:text-green-300">Provider</p>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {contract.terms.insurance.provider}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Terms & Conditions */}
        <CollapsibleSection
          title="Terms & Conditions"
          icon={<Bookmark className="w-5 h-5" />}
          isExpanded={expandedSections.has('clauses')}
          onToggle={() => toggleSection('clauses')}
        >
          <div className="space-y-4">
            {contract.clauses.map((clause, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {clause.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {clause.content}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Signatures Section */}
        <CollapsibleSection
          title="Signatures"
          icon={<FileSignature className="w-5 h-5" />}
          isExpanded={expandedSections.has('signatures')}
          onToggle={() => toggleSection('signatures')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* Owner Signature */}
            <div className={`p-4 rounded-xl border-2 ${
              ownerSignature?.signed
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Owner/Lessor
                </p>
                {ownerSignature?.signed ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-sm">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {contract.owner.name}
              </p>
              {ownerSignature?.signed && ownerSignature.signedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Signed on {ownerSignature.signedAt.toLocaleString()}
                </p>
              )}
            </div>

            {/* Renter Signature */}
            <div className={`p-4 rounded-xl border-2 ${
              renterSignature?.signed
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Renter
                </p>
                {renterSignature?.signed ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Your signature needed
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {contract.renter.name}
              </p>
              {!renterSignature?.signed && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Sign Now
                </button>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Sign Rental Agreement
            </h3>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  By signing, you agree to all terms and conditions outlined in this contract.
                </p>
              </div>
            </div>

            <div className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center mb-4">
              <p className="text-gray-400">Draw your signature here</p>
            </div>

            <label className="flex items-start gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I have read and agree to all the terms and conditions of this rental agreement
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignModal(false);
                  onSign?.();
                }}
                disabled={!agreedToTerms}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Sign Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Share Contract
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Send a copy of this contract to another email address
            </p>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onShare?.(shareEmail);
                  setShowShareModal(false);
                  setShareEmail('');
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
