import { useState } from 'react';
import { Download, FileText, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/AccessibleComponents';
import { useAuth } from '../../contexts/AuthContext';

interface DataExportRequest {
  id: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
}

export default function DataExportManager() {
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([
    // Mock data - in real app, this would come from API
    {
      id: 'export-001',
      requestedAt: new Date('2024-01-15'),
      status: 'completed',
      downloadUrl: '#',
      expiresAt: new Date('2024-02-15')
    }
  ]);

  const handleRequestExport = async () => {
    if (!user) return;

    setIsRequesting(true);
    try {
      // In real implementation, this would call an API endpoint
      // await requestDataExport(user.id);

      const newRequest: DataExportRequest = {
        id: `export-${Date.now()}`,
        requestedAt: new Date(),
        status: 'pending'
      };

      setExportRequests(prev => [newRequest, ...prev]);

      // Simulate processing
      setTimeout(() => {
        setExportRequests(prev =>
          prev.map(req =>
            req.id === newRequest.id
              ? { ...req, status: 'processing' as const }
              : req
          )
        );

        setTimeout(() => {
          setExportRequests(prev =>
            prev.map(req =>
              req.id === newRequest.id
                ? {
                    ...req,
                    status: 'completed' as const,
                    downloadUrl: '#',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                  }
                : req
            )
          );
        }, 5000); // Complete after 5 seconds
      }, 2000); // Start processing after 2 seconds

    } catch (error) {
      console.error('Failed to request data export:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = (status: DataExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <FileText className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: DataExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Request received, waiting to be processed';
      case 'processing':
        return 'Preparing your data export...';
      case 'completed':
        return 'Ready for download';
      case 'failed':
        return 'Export failed, please try again';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-teal-500" />
          <h1 className="text-2xl font-bold text-gray-900">Data Export (GDPR)</h1>
        </div>
        <p className="text-gray-600">
          Under GDPR, you have the right to request a copy of all personal data we hold about you.
          This includes your profile information, booking history, messages, and usage data.
        </p>
      </div>

      {/* Request New Export */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Data Export</h2>
        <p className="text-gray-600 mb-6">
          We'll prepare a comprehensive export of all your personal data within 30 days.
          The download link will be valid for 30 days from completion.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">What will be included:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Profile information and verification documents</li>
            <li>• Complete booking and rental history</li>
            <li>• Payment records and transaction data</li>
            <li>• Messages and communications</li>
            <li>• Usage analytics and preferences</li>
            <li>• Reviews and ratings you've given/received</li>
          </ul>
        </div>

        <Button
          onClick={handleRequestExport}
          disabled={isRequesting || exportRequests.some(req => req.status === 'pending' || req.status === 'processing')}
          isLoading={isRequesting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isRequesting ? 'Requesting Export...' : 'Request Data Export'}
        </Button>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>

        {exportRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No export requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exportRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        Data Export #{request.id.split('-')[1]}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested on {request.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.status === 'completed' && request.downloadUrl && (
                    <a
                      href={request.downloadUrl}
                      download={`islakayd-data-export-${request.id}.zip`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">{getStatusText(request.status)}</p>

                {request.expiresAt && (
                  <p className="text-xs text-gray-500">
                    Expires: {request.expiresAt.toLocaleDateString()}
                  </p>
                )}

                {request.status === 'processing' && (
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Processing your data...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Data Protection Rights</h3>
        <p className="text-sm text-gray-600 mb-4">
          In addition to data export, you have the right to:
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• <strong>Access:</strong> Request information about how we process your data</li>
          <li>• <strong>Rectification:</strong> Correct inaccurate personal data</li>
          <li>• <strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
          <li>• <strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
          <li>• <strong>Objection:</strong> Object to processing based on legitimate interests</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          To exercise any of these rights, contact us at privacy@islakayd.com
        </p>
      </div>
    </div>
  );
}