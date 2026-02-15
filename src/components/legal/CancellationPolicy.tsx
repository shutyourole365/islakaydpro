import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface CancellationPolicyProps {
  onBack: () => void;
}

export default function CancellationPolicy({ onBack }: CancellationPolicyProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cancellation Policy</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              At Islakayd, we understand that plans can change. Our cancellation policy is designed to be fair and flexible for both renters and equipment owners.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">For Renters</h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Free Cancellation</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Cancel up to 48 hours before pickup for a full refund</li>
              <li>No cancellation fees within the free cancellation window</li>
              <li>Instant refund processing for eligible cancellations</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Modified Cancellation (24-48 hours before pickup)</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>50% refund of the booking amount</li>
              <li>Service fee is non-refundable</li>
              <li>Deposit may be partially refundable at owner's discretion</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Late Cancellation (Less than 24 hours before pickup)</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>No refund for the booking amount</li>
              <li>Deposit may be forfeited</li>
              <li>Potential impact on future booking privileges</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">No-Show Policy</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Full booking amount and deposit are forfeited</li>
              <li>Account may be suspended for future bookings</li>
              <li>Owner compensation guarantee applies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">For Equipment Owners</h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Owner Cancellation Rights</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Cancel anytime before renter pickup for full refund to renter</li>
              <li>Emergency cancellations require valid documentation</li>
              <li>Repeated cancellations may result in listing suspension</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Force Majeure</h3>
            <p className="text-gray-600 mb-4">
              In cases of natural disasters, equipment failure, or other unforeseen circumstances, both parties may cancel with appropriate documentation. Refunds will be processed based on the circumstances and timing.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Modification Policy</h2>
            <p className="text-gray-600 mb-4">
              Booking modifications (dates, duration, equipment changes) follow the same cancellation timeline as full cancellations. If the modification increases the booking cost, the difference must be paid immediately.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Refunds are processed within 3-5 business days</li>
              <li>Original payment method will be used for refunds</li>
              <li>Service fees are non-refundable except in cases of owner cancellation</li>
              <li>Deposit refunds are at the discretion of the equipment owner</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              If you disagree with a cancellation decision, you can appeal through our resolution center. Our team will review the case and make a final determination within 48 hours.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              For questions about cancellations or to request a special exception, contact our support team at support@islakayd.com or through the Help Center.
            </p>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Last updated:</strong> February 15, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}