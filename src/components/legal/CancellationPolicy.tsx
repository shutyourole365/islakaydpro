import React from 'react';
import { ArrowLeft, XCircle, Clock, AlertTriangle, CheckCircle, Info, Calendar, DollarSign } from 'lucide-react';

interface CancellationPolicyProps {
  onBack: () => void;
}

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Cancellation Policy</h1>
            <p className="text-lg text-gray-600">Last updated: February 14, 2026</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Islakayd, we understand that plans change. This cancellation policy outlines the terms and
              conditions for cancelling equipment rental bookings made through our platform. Both renters and
              equipment owners are bound by these terms.
            </p>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="w-6 h-6 text-teal-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">2. Renter Cancellation Windows</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The refund amount depends on how far in advance you cancel relative to your rental start date:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Cancellation Window</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Refund</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Cancellation Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="font-medium text-green-700">7+ days before rental start</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-green-700 font-medium">100% refund</td>
                    <td className="border border-gray-300 px-4 py-3">No fee</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="font-medium text-yellow-700">3-7 days before rental start</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-yellow-700 font-medium">80% refund</td>
                    <td className="border border-gray-300 px-4 py-3">20% of booking value</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="font-medium text-orange-700">24-72 hours before rental start</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-orange-700 font-medium">50% refund</td>
                    <td className="border border-gray-300 px-4 py-3">50% of booking value</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="font-medium text-red-700">Less than 24 hours / No-show</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-red-700 font-medium">No refund</td>
                    <td className="border border-gray-300 px-4 py-3">100% of booking value</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-teal-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">3. Owner Cancellation Policy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Equipment owners who cancel confirmed bookings are subject to the following:
            </p>

            <div className="space-y-3">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">First Cancellation</h3>
                <p className="text-red-800 text-sm">
                  Warning issued. The renter receives a full refund plus a 10% credit toward their next booking.
                </p>
              </div>
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Repeated Cancellations (3+ in 90 days)</h3>
                <p className="text-red-800 text-sm">
                  Listing visibility reduced. A cancellation penalty of 15% of the booking value may be charged
                  to the owner. Continued cancellations may result in account suspension.
                </p>
              </div>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Legitimate Equipment Issues</h3>
                <p className="text-green-800 text-sm">
                  If an owner cancels due to equipment malfunction or safety concerns verified by Islakayd,
                  no penalty applies. The renter receives a full refund and relocation assistance.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">4. Free Cancellation Exceptions</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Full refunds with no fees are granted in these circumstances regardless of timing:
            </p>
            <ul className="space-y-3">
              {[
                'Government-declared natural disaster or emergency in the rental area',
                'Equipment owner fails to make equipment available at the agreed time',
                'Equipment is significantly different from the listing description',
                'Safety recall or regulatory action affecting the equipment',
                'Platform error resulting in incorrect booking',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">5. How to Cancel a Booking</h2>
            </div>
            <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
              <li>Log into your Islakayd account</li>
              <li>Navigate to <strong>Dashboard</strong> and select <strong>My Bookings</strong></li>
              <li>Find the booking you wish to cancel</li>
              <li>Click <strong>Cancel Booking</strong> and select a reason</li>
              <li>Confirm the cancellation -- your refund will be processed automatically</li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                <strong>Processing time:</strong> Refunds are typically processed within 5-7 business days
                depending on your payment method and financial institution.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">6. Partial Rental Cancellations</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you need to shorten your rental period after pickup:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Return equipment early and request a partial refund for unused days</li>
              <li>A minimum 1-day rental charge always applies</li>
              <li>Partial refunds are calculated at the daily rate minus a 10% early return fee</li>
              <li>Equipment must be returned in the same condition as received</li>
            </ul>
          </section>

          <section>
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-900">7. Disputes and Appeals</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you disagree with a cancellation outcome:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Contact Support:</strong> Reach out within 48 hours of the cancellation</li>
              <li><strong>Provide Evidence:</strong> Screenshots, messages, or photos supporting your case</li>
              <li><strong>Review:</strong> Our team reviews disputes within 3 business days</li>
              <li><strong>Resolution:</strong> Outcomes may include full refund, partial refund, or credit</li>
            </ol>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For cancellation-related questions or assistance:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@islakayd.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> 1-800-ISLAKAYD (available 9 AM - 6 PM EST)</p>
              <p className="text-gray-700 mt-2 text-sm text-gray-500">
                This policy is subject to change. Users will be notified of significant updates via email.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
