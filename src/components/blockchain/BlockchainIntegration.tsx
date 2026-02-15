import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, FileText, Coins, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings } from '../../services/database';
import type { Booking } from '../../types';

interface SmartContract {
  id: string;
  bookingId: string;
  status: 'pending' | 'active' | 'completed' | 'disputed';
  contractAddress: string;
  network: 'ethereum' | 'polygon' | 'bnb';
  value: number;
  deposit: number;
  startDate: Date;
  endDate: Date;
  terms: string[];
  signatures: {
    renter: boolean;
    owner: boolean;
    platform: boolean;
  };
  transactions: BlockchainTransaction[];
}

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'deployment' | 'signature' | 'payment' | 'refund' | 'dispute';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: number;
  value?: number;
}

interface NFTCertificate {
  id: string;
  equipmentId: string;
  tokenId: string;
  contractAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  owner: string;
  mintedAt: Date;
}

export default function BlockchainIntegration() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [certificates, setCertificates] = useState<NFTCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'certificates' | 'transactions'>('contracts');

  useEffect(() => {
    if (user) {
      loadBlockchainData();
    }
  }, [user]);

  const loadBlockchainData = async () => {
    if (!user) return;

    try {
      const bookingsData = await getBookings({ ownerId: user.id });
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];

      // Simulate smart contracts (in real app, this would come from blockchain)
      const mockContracts: SmartContract[] = bookings.slice(0, 5).map((booking: Booking, index: number) => ({
        id: `contract-${booking.id}`,
        bookingId: booking.id,
        status: ['pending', 'active', 'completed'][index % 3] as any,
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        network: ['ethereum', 'polygon', 'bnb'][index % 3] as any,
        value: booking.total_amount,
        deposit: booking.deposit_amount,
        startDate: new Date(booking.start_date),
        endDate: new Date(booking.end_date),
        terms: [
          'Equipment must be returned in original condition',
          'Late returns subject to additional charges',
          'Deposit held until equipment inspection',
          'Disputes resolved through arbitration'
        ],
        signatures: {
          renter: index > 0,
          owner: index > 1,
          platform: true
        },
        transactions: [
          {
            id: `tx-${index}-1`,
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            type: 'deployment',
            status: 'confirmed',
            timestamp: new Date(Date.now() - 86400000),
            gasUsed: Math.floor(Math.random() * 100000) + 50000
          }
        ]
      }));

      // Simulate NFT certificates
      const mockCertificates: NFTCertificate[] = [
        {
          id: 'nft-1',
          equipmentId: 'eq-1',
          tokenId: '12345',
          contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          metadata: {
            name: 'Premium Excavator Certificate',
            description: 'Official ownership certificate for high-performance excavator equipment',
            image: 'https://example.com/nft/12345.png',
            attributes: [
              { trait_type: 'Equipment Type', value: 'Excavator' },
              { trait_type: 'Model Year', value: '2023' },
              { trait_type: 'Condition', value: 'Excellent' },
              { trait_type: 'Certification', value: 'Premium' }
            ]
          },
          owner: user.id,
          mintedAt: new Date(Date.now() - 604800000)
        }
      ];

      setContracts(mockContracts);
      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'bg-blue-500';
      case 'polygon': return 'bg-purple-500';
      case 'bnb': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const signContract = async (contractId: string) => {
    // Simulate contract signing
    setContracts(prev => prev.map(contract =>
      contract.id === contractId
        ? {
            ...contract,
            signatures: { ...contract.signatures, owner: true },
            status: contract.signatures.renter ? 'active' : 'pending'
          }
        : contract
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Blockchain Integration</h1>
        </div>
        <p className="text-purple-100">
          Secure smart contracts, NFT certificates, and decentralized trust for equipment rentals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Contracts</p>
              <p className="text-2xl font-bold text-green-600">
                {contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">NFT Certificates</p>
              <p className="text-2xl font-bold text-purple-600">{certificates.length}</p>
            </div>
            <Coins className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold text-blue-600">
                ${contracts.reduce((sum, c) => sum + c.value, 0).toLocaleString()}
              </p>
            </div>
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-teal-600">98.7%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'contracts', label: 'Smart Contracts', icon: FileText },
          { id: 'certificates', label: 'NFT Certificates', icon: Coins },
          { id: 'transactions', label: 'Transactions', icon: ExternalLink }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          {contracts.map(contract => (
            <div key={contract.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getNetworkColor(contract.network)}`}></div>
                  <div>
                    <h3 className="text-lg font-semibold">Contract #{contract.id.slice(-4)}</h3>
                    <p className="text-sm text-gray-600">
                      {contract.network.toUpperCase()} • {contract.contractAddress.slice(0, 6)}...{contract.contractAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                  {!contract.signatures.owner && (
                    <button
                      onClick={() => signContract(contract.id)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                    >
                      Sign Contract
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Rental Value</p>
                  <p className="text-xl font-semibold">${contract.value}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Security Deposit</p>
                  <p className="text-xl font-semibold">${contract.deposit}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-xl font-semibold">
                    {Math.ceil((contract.endDate.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Contract Terms</h4>
                  <ul className="space-y-2">
                    {contract.terms.map((term, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Signatures</h4>
                  <div className="space-y-2">
                    {[
                      { role: 'Renter', signed: contract.signatures.renter },
                      { role: 'Owner', signed: contract.signatures.owner },
                      { role: 'Platform', signed: contract.signatures.platform }
                    ].map(({ role, signed }) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{role}</span>
                        {signed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {contract.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          tx.status === 'confirmed' ? 'bg-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-gray-500">{tx.hash.slice(0, 10)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{tx.timestamp.toLocaleDateString()}</p>
                        {tx.gasUsed && (
                          <p className="text-xs text-gray-500">{tx.gasUsed} gas</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <div className="flex items-center justify-between">
                  <Coins className="w-6 h-6" />
                  <span className="text-sm font-medium">NFT #{cert.tokenId}</span>
                </div>
                <h3 className="text-lg font-bold mt-2">{cert.metadata.name}</h3>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{cert.metadata.description}</p>

                <div className="space-y-2 mb-4">
                  {cert.metadata.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{attr.trait_type}:</span>
                      <span className="font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Minted: {cert.mintedAt.toLocaleDateString()}</span>
                  <span className="font-mono">{cert.contractAddress.slice(0, 6)}...</span>
                </div>

                <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium">
                  View on OpenSea
                </button>
              </div>
            </div>
          ))}

          {certificates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No NFT Certificates</h3>
              <p className="text-gray-600">Equipment certificates will appear here when minted.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Blockchain Transactions</h3>
            <p className="text-sm text-gray-600">All smart contract interactions and NFT transactions</p>
          </div>

          <div className="divide-y">
            {contracts.flatMap(contract =>
              contract.transactions.map(tx => (
                <div key={tx.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        tx.status === 'confirmed' ? 'bg-green-500' :
                        tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium capitalize">{tx.type} Transaction</p>
                        <p className="text-sm text-gray-600">
                          Contract #{contract.id.slice(-4)} • {contract.network}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm">{tx.hash.slice(0, 12)}...</p>
                      <p className="text-sm text-gray-600">{tx.timestamp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                      {tx.gasUsed && (
                        <span className="text-gray-600">{tx.gasUsed.toLocaleString()} gas</span>
                      )}
                    </div>

                    <button className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm">
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}