import { ArrowLeft, FileText, Shield, Clock, CheckCircle, AlertTriangle, Eye, Download, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface Contract {
  id: string;
  title: string;
  equipment: string;
  renter: string;
  owner: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'disputed';
  value: number;
  startDate: string;
  endDate: string;
  blockchainTx: string;
  smartContractAddress: string;
}

interface BlockchainContractsProps {
  onBack: () => void;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Excavator Rental Agreement',
    equipment: 'CAT 320 Excavator',
    renter: 'John Construction Co.',
    owner: 'Heavy Equipment Rentals LLC',
    status: 'active',
    value: 2850,
    startDate: '2026-02-15',
    endDate: '2026-02-22',
    blockchainTx: '0x8f7a...3b2c',
    smartContractAddress: '0x1a2b...9f8e'
  },
  {
    id: '2',
    title: 'Generator Rental Contract',
    equipment: 'Honda EU3000is Generator',
    renter: 'Event Planners Inc.',
    owner: 'Power Solutions Ltd.',
    status: 'pending',
    value: 425,
    startDate: '2026-02-18',
    endDate: '2026-02-20',
    blockchainTx: '0x4d5e...7a8b',
    smartContractAddress: '0x2c3d...0f9a'
  },
  {
    id: '3',
    title: 'Camera Equipment Lease',
    equipment: 'Sony A7R IV + Lenses',
    renter: 'Wedding Photography Pro',
    owner: 'Pro Camera Rentals',
    status: 'completed',
    value: 285,
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    blockchainTx: '0x6f8g...1c2d',
    smartContractAddress: '0x3e4f...2b0c'
  },
  {
    id: '4',
    title: 'Loader Rental Agreement',
    equipment: 'Bobcat S650 Loader',
    renter: 'Landscaping Services',
    owner: 'Construction Equipment Co.',
    status: 'disputed',
    value: 1950,
    startDate: '2026-02-08',
    endDate: '2026-02-15',
    blockchainTx: '0x9h0i...4e5f',
    smartContractAddress: '0x4g5h...3d1e'
  }
];

export default function BlockchainContracts({ onBack }: BlockchainContractsProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Blockchain Contracts</h1>
                <p className="text-purple-100">Secure, automated rental agreements on the blockchain</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create New Contract
              </Button>
            </div>
          </div>

          <div className="p-8">
            {/* Contracts List */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Contracts</h2>
              <div className="space-y-4">
                {mockContracts.map(contract => (
                  <div
                    key={contract.id}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      selectedContract?.id === contract.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedContract(contract)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(contract.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">${contract.value}</div>
                        <div className="text-sm text-gray-500">{contract.startDate} to {contract.endDate}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Equipment:</span> {contract.equipment}
                      </div>
                      <div>
                        <span className="font-medium">Renter:</span> {contract.renter}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span> {contract.owner}
                      </div>
                      <div>
                        <span className="font-medium">Contract:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded ml-1">
                          {contract.smartContractAddress.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Details */}
            {selectedContract && (
              <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-purple-900">{selectedContract.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View on Blockchain
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Equipment:</span>
                      <p className="text-gray-900">{selectedContract.equipment}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Renter:</span>
                      <p className="text-gray-900">{selectedContract.renter}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Owner:</span>
                      <p className="text-gray-900">{selectedContract.owner}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rental Period:</span>
                      <p className="text-gray-900">{selectedContract.startDate} to {selectedContract.endDate}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Contract Value:</span>
                      <p className="text-2xl font-bold text-green-600">${selectedContract.value}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Smart Contract:</span>
                      <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                        {selectedContract.smartContractAddress}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Blockchain TX:</span>
                      <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                        {selectedContract.blockchainTx}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(selectedContract.status)}`}>
                        {getStatusIcon(selectedContract.status)}
                        {selectedContract.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contract Actions */}
                <div className="mt-6 flex gap-3">
                  {selectedContract.status === 'pending' && (
                    <>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Contract
                      </Button>
                      <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Dispute Contract
                      </Button>
                    </>
                  )}
                  {selectedContract.status === 'active' && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" />
                      Execute Payment
                    </Button>
                  )}
                  {selectedContract.status === 'disputed' && (
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Resolve Dispute
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Blockchain Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Immutable Contracts</h3>
                <p className="text-sm text-gray-600">Contracts stored permanently on blockchain</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Automated Execution</h3>
                <p className="text-sm text-gray-600">Smart contracts execute automatically</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Real-time Tracking</h3>
                <p className="text-sm text-gray-600">Monitor contract status in real-time</p>
              </div>
            </div>

            {/* Contract Statistics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Overview</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockContracts.filter(c => c.status === 'active').length}</div>
                  <div className="text-sm text-gray-600">Active Contracts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{mockContracts.filter(c => c.status === 'pending').length}</div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockContracts.filter(c => c.status === 'completed').length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{mockContracts.filter(c => c.status === 'disputed').length}</div>
                  <div className="text-sm text-gray-600">Under Dispute</div>
                </div>
              </div>
            </div>

            {/* Create Contract Form */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Create New Smart Contract</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter equipment name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="date"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rental Value ($)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Create Contract
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}