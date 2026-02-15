import React from 'react';
import { ArrowLeft, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RefundPolicyProps {
  onBack: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
            <p className="text-lg text-gray-600">Last updated: February 7, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Islakayd, we strive to provide a fair and transparent refund policy for all equipment rentals.
              This policy outlines the circumstances under which refunds may be granted and the procedures for requesting them.
            </p>
          </section>

          {/* Refund Eligibility */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">2. Refund Eligibility</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">Refunds may be available in the following situations:</p>

            <div className="space-y-4">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Equipment Unavailability</h3>
                <p className="text-green-800 text-sm">
                  If the equipment owner cancels the booking due to equipment unavailability, you will receive a full refund.
                </p>
              </div>

              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Platform Technical Issues</h3>
                <p className="text-green-800 text-sm">
                  If booking fails due to technical issues on our platform, you will receive a full refund.
                </p>
              </div>

              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold text-yellow-900 mb-2">Early Cancellation by Renter</h3>
                <p className="text-yellow-800 text-sm">
                  Cancellations made more than 48 hours before rental start receive 80% refund.
                  Cancellations within 48 hours may be subject to cancellation fees.
                </p>
              </div>

              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Equipment Not as Described</h3>
                <p className="text-red-800 text-sm">
                  If equipment significantly differs from the listing description, partial or full refunds may apply.
                </p>
              </div>
            </div>
          </section>

          {/* Non-Refundable Situations */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">3. Non-Refundable Situations</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">Refunds are generally not available in these circumstances:</p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Normal wear and tear:</strong> Expected usage of equipment during rental period</li>
              <li><strong>Change of mind:</strong> After the rental period has begun</li>
              <li><strong>Weather conditions:</strong> Unless specifically covered in equipment listing</li>
              <li><strong>Personal circumstances:</strong> Medical emergencies or personal reasons</li>
              <li><strong>Late returns:</strong> Additional fees for equipment returned after agreed time</li>
              <li><strong>Damage caused by renter:</strong> Repair costs and potential loss of rental income</li>
            </ul>
          </section>

          {/* Refund Timeline */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">4. Refund Processing Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Approval Time</h3>
                  <p className="text-blue-800 text-sm">Most refund requests are reviewed within 24-48 hours</p>
                </div>
                <div className="border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Processing Time</h3>
                  <p className="text-blue-800 text-sm">Approved refunds are processed within 5-7 business days</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Refund processing times may vary depending on your payment method and financial institution.
              </p>
            </div>
          </section>

          {/* How to Request a Refund */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">5. How to Request a Refund</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">To request a refund:</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>Log into your Islakayd account</li>
                <li>Go to your booking history</li>
                <li>Select the booking you want to refund</li>
                <li>Click "Request Refund" and provide reason</li>
                <li>Include photos or evidence if applicable</li>
                <li>Submit your request for review</li>
              </ol>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Important:</strong> Refund requests must be submitted within 48 hours of the booking end date
                  or equipment return, whichever comes first.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Methods */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Refund Methods</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Refunds are processed using the original payment method:</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Credit/Debit Cards</h3>
                <p className="text-gray-700 text-sm">3-5 business days for processing</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Digital Wallets</h3>
                <p className="text-gray-700 text-sm">1-3 business days for processing</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Bank Transfers</h3>
                <p className="text-gray-700 text-sm">5-7 business days for processing</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Platform Credits</h3>
                <p className="text-gray-700 text-sm">Instant credit to your account</p>
              </div>
            </div>
          </section>

          {/* Cancellation Fees */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellation Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Cancellation Timing</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Refund Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">More than 7 days before</td>
                    <td className="border border-gray-300 px-4 py-2">100%</td>
                    <td className="border border-gray-300 px-4 py-2">$0</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">3-7 days before</td>
                    <td className="border border-gray-300 px-4 py-2">80%</td>
                    <td className="border border-gray-300 px-4 py-2">20% of booking value</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">24-72 hours before</td>
                    <td className="border border-gray-300 px-4 py-2">50%</td>
                    <td className="border border-gray-300 px-4 py-2">50% of booking value</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Less than 24 hours</td>
                    <td className="border border-gray-300 px-4 py-2">0%</td>
                    <td className="border border-gray-300 px-4 py-2">100% of booking value</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you're not satisfied with a refund decision, you can escalate the matter:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>First appeal:</strong> Contact our customer support team</li>
              <li><strong>Mediation:</strong> We offer mediation services for disputed refunds</li>
              <li><strong>Final review:</strong> Senior management review for complex cases</li>
            </ol>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For refund-related questions or to submit a refund request:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> refunds@islakayd.com</p>
              <p className="text-gray-700"><strong>Support Portal:</strong> https://support.islakayd.com/refunds</p>
              <p className="text-gray-700"><strong>Phone:</strong> 1-800-ISLAKAYD (available 9 AM - 6 PM EST)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;