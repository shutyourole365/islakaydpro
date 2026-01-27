import { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Link,
  Copy,
  ExternalLink,
  Fingerprint,
  Zap,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  Loader2,
  XCircle,
} from 'lucide-react';

interface BlockchainContractProps {
  bookingId: string;
  renterId: string;
  ownerId: string;
  equipmentId: string;
  equipmentTitle: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  depositAmount: number;
  terms: ContractTerms;
  onSign?: (signature: ContractSignature) => void;
  onClose: () => void;
}

interface ContractTerms {
  cancellationPolicy: string;
  damagePolicy: string;
  usageRules: string[];
  insuranceCoverage: string;
  disputeResolution: string;
}

interface ContractSignature {
  signerId: string;
  signerRole: 'renter' | 'owner';
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

interface ContractStatus {
  created: boolean;
  renterSigned: boolean;
  ownerSigned: boolean;
  active: boolean;
  completed: boolean;
}

export default function BlockchainContract({
  bookingId,
  renterId,
  ownerId,
  equipmentId,
  equipmentTitle,
  startDate,
  endDate,
  totalAmount,
  depositAmount,
  terms,
  onSign,
  onClose,
}: BlockchainContractProps) {
  const [status, setStatus] = useState<ContractStatus>({
    created: true,
    renterSigned: false,
    ownerSigned: false,
    active: false,
    completed: false,
  });
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('terms');

  useEffect(() => {
    // Generate mock contract address
    const address = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setContractAddress(address);
  }, []);

  const handleSign = async () => {
    setSigning(true);

    // Simulate blockchain signing process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const hash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setTransactionHash(hash);

    setStatus(prev => ({ ...prev, renterSigned: true }));
    setSigned(true);
    setSigning(false);

    if (onSign) {
      onSign({
        signerId: renterId,
        signerRole: 'renter',
        timestamp: new Date(),
        transactionHash: hash,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderStatusStep = (
    label: string,
    isComplete: boolean,
    isActive: boolean
  ) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isComplete ? 'bg-green-500 text-white' :
        isActive ? 'bg-teal-500 text-white' :
        'bg-gray-200 text-gray-400'
      }`}>
        {isComplete ? <CheckCircle2 className="w-5 h-5" /> :
         isActive ? <Loader2 className="w-5 h-5 animate-spin" /> :
         <Clock className="w-5 h-5" />}
      </div>
      <span className={`text-sm font-medium ${
        isComplete ? 'text-green-600' :
        isActive ? 'text-teal-600' :
        'text-gray-400'
      }`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Smart Rental Contract</h2>
                <p className="text-sm text-white/80">Secured on Blockchain</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Contract Status */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
            {renderStatusStep('Created', status.created, false)}
            <ChevronRight className="w-4 h-4 text-white/50" />
            {renderStatusStep('Renter Signs', status.renterSigned, signing)}
            <ChevronRight className="w-4 h-4 text-white/50" />
            {renderStatusStep('Owner Signs', status.ownerSigned, false)}
            <ChevronRight className="w-4 h-4 text-white/50" />
            {renderStatusStep('Active', status.active, false)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Contract Address */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Contract Address</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(contractAddress)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-purple-500" />
              <code className="text-sm font-mono text-gray-900">
                {formatAddress(contractAddress)}
              </code>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Rental Period</span>
                </div>
                <p className="font-medium text-gray-900">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Total Amount</span>
                </div>
                <p className="font-medium text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Security Deposit</span>
                </div>
                <p className="font-medium text-gray-900">${depositAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Parties</span>
                </div>
                <p className="font-medium text-gray-900">2 signers required</p>
              </div>
            </div>
          </div>

          {/* Contract Terms Accordion */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setExpandedSection(expandedSection === 'terms' ? null : 'terms')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Terms & Conditions</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'terms' ? 'rotate-90' : ''
              }`} />
            </button>
            {expandedSection === 'terms' && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                  <p className="text-gray-600">{terms.cancellationPolicy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Damage Policy</h4>
                  <p className="text-gray-600">{terms.damagePolicy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Rules</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {terms.usageRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Insurance Coverage</h4>
                  <p className="text-gray-600">{terms.insuranceCoverage}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dispute Resolution</h4>
                  <p className="text-gray-600">{terms.disputeResolution}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Security & Escrow</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'security' ? 'rotate-90' : ''
              }`} />
            </button>
            {expandedSection === 'security' && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Funds Held in Escrow</p>
                    <p className="text-gray-600">Your payment is held securely until the rental is complete.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Immutable Record</p>
                    <p className="text-gray-600">Contract terms cannot be altered once signed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Automatic Execution</p>
                    <p className="text-gray-600">Deposit release and payments are automated based on conditions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Signature Section */}
          {!signed ? (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 text-center">
              <Fingerprint className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign with Your Digital Signature
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                By signing, you agree to all terms and conditions of this rental contract.
                This signature is legally binding and recorded on the blockchain.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <input type="checkbox" id="agree" className="rounded border-gray-300" />
                <label htmlFor="agree">I have read and agree to the contract terms</label>
              </div>

              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing on Blockchain...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    Sign Contract
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Contract Signed Successfully!
              </h3>
              <p className="text-green-600 text-sm mb-4">
                Your signature has been recorded on the blockchain.
              </p>

              <div className="bg-white rounded-lg p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Transaction Hash</span>
                  <button
                    onClick={() => copyToClipboard(transactionHash)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <code className="text-xs font-mono text-gray-700 break-all">
                  {transactionHash}
                </code>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Waiting for owner to sign...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secured by Ethereum
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              End-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
