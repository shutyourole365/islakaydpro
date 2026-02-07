import React from 'react';
import { ArrowLeft, FileText, Shield, Users, CreditCard, AlertTriangle } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-lg text-gray-600">Last updated: February 7, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Islakayd ("the Platform"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to all the terms and conditions of this agreement, then you may not access the Platform
              or use any services.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Islakayd is an online marketplace that connects equipment owners with renters. Our platform enables:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Equipment owners to list their equipment for rent</li>
              <li>Equipment renters to browse and book available equipment</li>
              <li>Secure payment processing and booking management</li>
              <li>Communication between owners and renters</li>
              <li>Equipment verification and quality assurance</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-6 h-6 text-teal-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">3. User Accounts</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                To use certain features of the Platform, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 18 years old to create an account</li>
              </ul>
            </div>
          </section>

          {/* Equipment Listings and Rentals */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Equipment Listings and Rentals</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Equipment Owners:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>You must accurately describe your equipment and its condition</li>
                  <li>You are responsible for the maintenance and safety of your equipment</li>
                  <li>You must comply with all applicable laws and regulations</li>
                  <li>You agree to honor confirmed bookings and provide equipment as described</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Equipment Renters:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>You must use equipment responsibly and in accordance with manufacturer guidelines</li>
                  <li>You are responsible for any damage caused during rental period</li>
                  <li>You must return equipment in the same condition as received</li>
                  <li>You agree to pay all rental fees and any applicable damages</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-teal-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">5. Payment Terms</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Payment processing is handled through our secure payment system. By making a payment, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Pay all fees associated with your bookings</li>
                <li>Pay any security deposits as required</li>
                <li>Authorize automatic charges for confirmed bookings</li>
                <li>Disputes must be raised within 48 hours of transaction</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">6. Prohibited Activities</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Post false, inaccurate, or misleading information</li>
              <li>Interfere with or disrupt the Platform's operations</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
              <li>Use automated systems to access the Platform without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Liability and Disclaimers */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-teal-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">7. Liability and Disclaimers</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Islakayd provides the Platform "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>The accuracy or completeness of equipment listings</li>
                <li>The condition or safety of rented equipment</li>
                <li>The availability of equipment at all times</li>
                <li>That rentals will be completed without issues</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Our liability is limited to the amount paid for the specific transaction in question.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violations of these Terms.
              Upon termination, your right to use the Platform ceases immediately.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. Continued use of the Platform after changes constitutes
              acceptance of the new Terms. We will notify users of significant changes via email or platform notifications.
            </p>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@islakayd.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Islakayd Inc., Legal Department</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;