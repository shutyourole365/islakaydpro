import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface EquipmentCertificationTrackerProps {
  onBack: () => void;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  category: string;
}

interface EquipmentCompliance {
  equipmentId: string;
  name: string;
  category: string;
  certifications: Certification[];
  overallStatus: 'compliant' | 'at-risk' | 'non-compliant';
}

const sampleCompliance: EquipmentCompliance[] = [
  {
    equipmentId: '1',
    name: 'CAT 320 Excavator',
    category: 'Heavy Equipment',
    overallStatus: 'compliant',
    certifications: [
      { id: 'c1', name: 'OSHA Heavy Equipment Operation', issuer: 'OSHA', certificateNumber: 'HE-2024-001', issueDate: '2024-01-15', expiryDate: '2027-01-15', status: 'active', category: 'Safety' },
      { id: 'c2', name: 'Equipment Maintenance & Inspection', issuer: 'NCCCO', certificateNumber: 'MAINT-2024-042', issueDate: '2024-03-20', expiryDate: '2026-03-20', status: 'active', category: 'Maintenance' },
    ],
  },
  {
    equipmentId: '2',
    name: 'John Deere 1025R Tractor',
    category: 'Agricultural Equipment',
    overallStatus: 'at-risk',
    certifications: [
      { id: 'c5', name: 'Agricultural Machinery Safety', issuer: 'ASABE', certificateNumber: 'AGR-2023-087', issueDate: '2023-05-12', expiryDate: '2025-05-12', status: 'expiring', category: 'Safety' },
    ],
  },
];

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Active' },
  expiring: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-4 h-4" />, label: 'Expiring Soon' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4" />, label: 'Expired' },
};

export default function EquipmentCertificationTracker({ onBack }: EquipmentCertificationTrackerProps) {
  const [selected, setSelected] = useState(sampleCompliance[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certification Tracker</h1>
            <p className="text-gray-500 mt-1">Manage equipment certifications and compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {sampleCompliance.map((eq) => (
            <button
              key={eq.equipmentId}
              onClick={() => setSelected(eq)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected.equipmentId === eq.equipmentId
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-sm">{eq.name}</p>
              <p className="text-xs text-gray-500 mt-1">{eq.category}</p>
              <p className="text-xs font-medium mt-2 text-gray-600">{eq.certifications.length} certifications</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Certifications for {selected.name}</h3>
          <div className="space-y-3">
            {selected.certifications.map((cert) => {
              const config = statusConfig[cert.status];
              return (
                <div key={cert.id} className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Issuer: {cert.issuer} | ID: {cert.certificateNumber}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
                      {config.icon} {config.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
