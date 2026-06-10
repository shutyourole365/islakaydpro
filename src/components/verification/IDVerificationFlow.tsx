import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  CreditCard,
  Loader2,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface IDVerificationFlowProps {
  onBack: () => void;
}

interface VerificationDoc {
  id: string;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const DOC_TYPES = [
  { value: "drivers_license", label: "Driver's License", icon: CreditCard, description: "Front and back required" },
  { value: "passport", label: "Passport", icon: CreditCard, description: "Photo page required" },
  { value: "national_id", label: "National ID", icon: CreditCard, description: "Front and back required" },
  { value: "state_id", label: "State ID", icon: CreditCard, description: "Front and back required" },
];

const STATUS_CONFIG = {
  pending: { label: 'Under Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  approved: { label: 'Verified', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  expired: { label: 'Expired', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: AlertTriangle },
};

export default function IDVerificationFlow({ onBack }: IDVerificationFlowProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'overview' | 'upload'>('overview');
  const [docType, setDocType] = useState('drivers_license');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!user) return;
    const { data: verificationData, error } = await supabase
      .from('id_verification_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });
    if (!error) setDocs((verificationData || []) as VerificationDoc[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const latestDoc = docs[0] || null;
  const isVerified = profile?.identity_verified || latestDoc?.status === 'approved';

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const path = `${folder}/${user!.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('verifications').upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('verifications').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !docFile) return;
    setSubmitting(true);
    try {
      const docUrl = await uploadFile(docFile, 'documents');
      let selfieUrl: string | undefined;
      if (selfieFile) {
        selfieUrl = await uploadFile(selfieFile, 'selfies');
      }

      const { error } = await supabase.from('id_verification_documents').insert({
        user_id: user.id,
        document_type: docType,
        document_url: docUrl,
        selfie_url: selfieUrl || null,
        status: 'pending',
      });

      if (error) throw error;

      setSubmitted(true);
      await loadDocs();
      await refreshProfile();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Documents Submitted!</h2>
          <p className="text-gray-500 mb-6">Our team will review your ID within 24 hours. You'll be notified once verified.</p>
          <button onClick={() => { setSubmitted(false); setStep('overview'); setDocFile(null); setSelfieFile(null); }} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors">
            Back to Verification
          </button>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-xl mx-auto px-4 py-8">
          <button onClick={() => setStep('overview')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Submit ID Verification</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setDocType(type.value)}
                      className={`p-3 rounded-xl border text-left transition-colors ${docType === type.value ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <type.icon className={`w-5 h-5 mb-1 ${docType === type.value ? 'text-teal-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${docType === type.value ? 'text-teal-700' : 'text-gray-700'}`}>{type.label}</p>
                      <p className="text-xs text-gray-400">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Photo *</label>
                <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${docFile ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}>
                  {docFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-teal-500" />
                      <span className="text-sm text-teal-600 font-medium">{docFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload your ID photo</span>
                      <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selfie with ID (recommended)</label>
                <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selfieFile ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}>
                  {selfieFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-teal-500" />
                      <span className="text-sm text-teal-600 font-medium">{selfieFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Selfie holding your ID</span>
                      <span className="text-xs text-gray-400">Speeds up verification</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Your privacy matters.</strong> Documents are encrypted and only used for verification. They are never shared with other users.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !docFile}
                className="w-full py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isVerified ? 'bg-green-50' : 'bg-gray-100'}`}>
                {isVerified ? <BadgeCheck className="w-7 h-7 text-green-500" /> : <Shield className="w-7 h-7 text-gray-400" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ID Verification</h2>
                <p className={`text-sm font-medium ${isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                  {isVerified ? 'Your identity is verified' : 'Not yet verified'}
                </p>
              </div>
            </div>
            {!isVerified && (
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
              >
                Verify Now
              </button>
            )}
          </div>
        </div>

        {!isVerified && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Shield, title: 'Build Trust', desc: 'Verified users get 3x more bookings' },
              { icon: BadgeCheck, title: 'Verification Badge', desc: 'Display a badge on your profile' },
              { icon: CheckCircle, title: 'Higher Limits', desc: 'Access higher-value equipment rentals' },
            ].map(benefit => (
              <div key={benefit.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <benefit.icon className="w-6 h-6 text-teal-500 mb-2" />
                <p className="font-semibold text-gray-900 text-sm">{benefit.title}</p>
                <p className="text-xs text-gray-500 mt-1">{benefit.desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Submission History</h3>
          </div>
          {docs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No documents submitted yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {docs.map(doc => {
                const cfg = STATUS_CONFIG[doc.status];
                const Icon = cfg.icon;
                const docLabel = DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type;
                return (
                  <div key={doc.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{docLabel}</p>
                      <p className="text-sm text-gray-400">Submitted {new Date(doc.submitted_at).toLocaleDateString()}</p>
                      {doc.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 ${cfg.bg} ${cfg.color} rounded-full text-xs font-medium border ${cfg.border}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
