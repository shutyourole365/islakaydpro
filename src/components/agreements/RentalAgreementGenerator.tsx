import { useState } from 'react';
import { ArrowLeft, FileText, Download, Send, Check, Lock, Plus } from 'lucide-react';

interface RentalAgreementGeneratorProps {
  onBack: () => void;
}

interface AgreementTemplate {
  id: string;
  name: string;
  description: string;
  clauses: number;
}

interface GeneratedAgreement {
  id: string;
  equipmentName: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed';
  agreementDate: string;
}

const templates: AgreementTemplate[] = [
  { id: 't1', name: 'Standard Rental Agreement', description: 'Basic rental terms and conditions', clauses: 8 },
  { id: 't2', name: 'Heavy Equipment Agreement', description: 'Specialized for construction equipment', clauses: 12 },
  { id: 't3', name: 'Photography Equipment Agreement', description: 'Terms for cameras and media equipment', clauses: 10 },
  { id: 't4', name: 'Short-Term Rental Agreement', description: 'For rentals under 7 days', clauses: 6 },
  { id: 't5', name: 'Enterprise Agreement', description: 'For large volume/long-term rentals', clauses: 15 },
];

const sampleAgreements: GeneratedAgreement[] = [
  { id: 'a1', equipmentName: 'CAT 320 Excavator', renterName: 'John D.', startDate: '2026-02-20', endDate: '2026-02-27', totalCost: 3150, status: 'signed', agreementDate: '2026-02-19' },
  { id: 'a2', equipmentName: 'Sony A7IV Camera Kit', renterName: 'Sarah M.', startDate: '2026-03-01', endDate: '2026-03-05', totalCost: 625, status: 'pending_signature', agreementDate: '2026-02-24' },
  { id: 'a3', equipmentName: 'DeWalt Power Tool Kit', renterName: 'Mike R.', startDate: '2026-02-25', endDate: '2026-03-02', totalCost: 525, status: 'draft', agreementDate: '2026-02-23' },
  { id: 'a4', equipmentName: 'Premium DJ Package', renterName: 'Lisa K.', startDate: '2026-02-15', endDate: '2026-02-16', totalCost: 590, status: 'completed', agreementDate: '2026-02-14' },
];

const statusConfig = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Draft' },
  pending_signature: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Awaiting Signature' },
  signed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Signed' },
  completed: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500', label: 'Completed' },
};

export default function RentalAgreementGenerator({ onBack }: RentalAgreementGeneratorProps) {
  const [tab, setTab] = useState<'templates' | 'agreements'>('agreements');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [formData, setFormData] = useState({
    equipment: 'CAT 320 Excavator',
    renterName: '',
    renterEmail: '',
    startDate: '',
    endDate: '',
    totalCost: 0,
    insuranceIncluded: true,
    depositAmount: 2000,
    additionalTerms: '',
  });

  const rentalDays = formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Agreement Generator</h1>
            <p className="text-gray-500 mt-1">Create and manage digital rental contracts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {(['agreements', 'templates'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'agreements' ? 'My Agreements' : 'Templates'}
            </button>
          ))}
        </div>

        {tab === 'agreements' && (
          <div className="space-y-6">
            {/* New Agreement Button */}
            <button className="flex items-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors">
              <Plus className="w-5 h-5" /> Create New Agreement
            </button>

            {/* Agreements List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleAgreements.map((agreement) => {
                const config = statusConfig[agreement.status];
                return (
                  <div key={agreement.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <div>
                          <h3 className="font-bold text-gray-900">{agreement.equipmentName}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Renter: {agreement.renterName}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                        {config.label}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 py-4 border-y border-gray-100 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dates</span>
                        <span className="font-medium text-gray-900">
                          {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-medium text-gray-900">
                          {Math.ceil((new Date(agreement.endDate).getTime() - new Date(agreement.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Cost</span>
                        <span className="font-bold text-teal-600">${agreement.totalCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download
                      </button>
                      {agreement.status === 'pending_signature' && (
                        <button className="flex-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" /> Send
                        </button>
                      )}
                      {agreement.status === 'draft' && (
                        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                          Edit
                        </button>
                      )}
                      {agreement.status === 'signed' && (
                        <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Signed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'templates' && (
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedTemplate.id === template.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                  <p className="text-xs text-gray-400">{template.clauses} standard clauses</p>
                </button>
              ))}
            </div>

            {/* Preview & Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" /> Agreement Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                    <input
                      type="text"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renter Name</label>
                    <input
                      type="text"
                      value={formData.renterName}
                      onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
                      placeholder="Enter renter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renter Email</label>
                    <input
                      type="email"
                      value={formData.renterEmail}
                      onChange={(e) => setFormData({ ...formData, renterEmail: e.target.value })}
                      placeholder="Enter renter email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                      <input
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData({ ...formData, depositAmount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                      <input
                        type="number"
                        value={formData.totalCost}
                        onChange={(e) => setFormData({ ...formData, totalCost: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.insuranceIncluded}
                      onChange={(e) => setFormData({ ...formData, insuranceIncluded: e.target.checked })}
                      className="w-4 h-4 text-teal-500 border-gray-300 rounded"
                    />
                    Include insurance coverage
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Terms</label>
                    <textarea
                      value={formData.additionalTerms}
                      onChange={(e) => setFormData({ ...formData, additionalTerms: e.target.value })}
                      placeholder="Add any custom terms..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Agreement Preview</h3>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-700 space-y-2 max-h-96 overflow-y-auto">
                  <p className="font-bold text-center text-gray-900 mb-3">EQUIPMENT RENTAL AGREEMENT</p>
                  {formData.renterName && (
                    <>
                      <p><strong>Renter:</strong> {formData.renterName}</p>
                      <p><strong>Email:</strong> {formData.renterEmail}</p>
                    </>
                  )}
                  <p><strong>Equipment:</strong> {formData.equipment}</p>
                  {formData.startDate && formData.endDate && (
                    <>
                      <p><strong>Rental Period:</strong> {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</p>
                      <p><strong>Duration:</strong> {rentalDays} days</p>
                    </>
                  )}
                  <p><strong>Total Cost:</strong> ${formData.totalCost}</p>
                  <p><strong>Deposit:</strong> ${formData.depositAmount}</p>
                  {formData.insuranceIncluded && (
                    <p><strong>Insurance:</strong> Included in rental</p>
                  )}
                  <div className="pt-3 border-t border-gray-300 mt-3">
                    <p className="text-xs italic">This is a preview. Full terms and conditions will be included in the final document.</p>
                  </div>
                </div>
                <button className="w-full mt-4 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Generate & Sign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
