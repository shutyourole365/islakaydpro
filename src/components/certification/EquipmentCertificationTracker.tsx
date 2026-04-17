import { useMemo, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

type CertStatus = 'active' | 'expiring' | 'expired';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  number: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: CertStatus;
}

interface EquipmentRecord {
  id: string;
  name: string;
  category: string;
  certifications: Certification[];
}

interface Props {
  onBack: () => void;
}

const STATUS_STYLES: Record<CertStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expiring: 'bg-amber-50 text-amber-700 border-amber-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<CertStatus, string> = {
  active: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
};

const EQUIPMENT: EquipmentRecord[] = [
  {
    id: 'e1',
    name: 'CAT 320 Excavator',
    category: 'Heavy Equipment',
    certifications: [
      {
        id: 'c1',
        name: 'OSHA Heavy Equipment Operation',
        issuer: 'OSHA',
        number: 'HE-2024-001',
        category: 'Safety',
        issueDate: '2024-01-15',
        expiryDate: '2027-01-15',
        status: 'active',
      },
      {
        id: 'c2',
        name: 'Equipment Maintenance & Inspection',
        issuer: 'NCCCO',
        number: 'MAINT-2024-042',
        category: 'Maintenance',
        issueDate: '2024-03-20',
        expiryDate: '2026-09-20',
        status: 'active',
      },
    ],
  },
  {
    id: 'e2',
    name: 'John Deere 1025R Tractor',
    category: 'Agricultural Equipment',
    certifications: [
      {
        id: 'c3',
        name: 'Agricultural Machinery Safety',
        issuer: 'ASABE',
        number: 'AGR-2023-087',
        category: 'Safety',
        issueDate: '2023-05-10',
        expiryDate: '2026-06-10',
        status: 'expiring',
      },
    ],
  },
];

export default function EquipmentCertificationTracker({ onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string>(EQUIPMENT[0].id);
  const selected = useMemo(
    () => EQUIPMENT.find((e) => e.id === selectedId) ?? EQUIPMENT[0],
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certification Tracker</h1>
            <p className="text-sm text-gray-500">
              Manage equipment certifications and renewal schedules
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {EQUIPMENT.map((eq) => {
            const isSelected = eq.id === selected.id;
            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedId(eq.id)}
                className={`text-left rounded-2xl border p-5 bg-white transition-colors ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-semibold text-gray-900">{eq.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2">{eq.category}</p>
                <p className="text-xs text-gray-500">{eq.certifications.length} certifications</p>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Certifications for {selected.name}
            </h2>
            <span className="text-sm text-gray-500">{selected.certifications.length} certifications</span>
          </div>

          <div className="space-y-3">
            {selected.certifications.map((cert) => {
              const Icon = cert.status === 'active'
                ? CheckCircle2
                : cert.status === 'expiring'
                  ? AlertTriangle
                  : XCircle;
              return (
                <div
                  key={cert.id}
                  className={`rounded-2xl border p-4 ${STATUS_STYLES[cert.status]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                      <p className="text-sm text-gray-600">
                        Issuer: {cert.issuer} | ID: {cert.number}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cert.category} | Issued {cert.issueDate} | Expires {cert.expiryDate}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                      <Icon className="w-4 h-4" />
                      {STATUS_LABEL[cert.status]}
                    </span>
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
