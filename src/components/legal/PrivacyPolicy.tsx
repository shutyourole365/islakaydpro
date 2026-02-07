import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Users, Lock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-lg text-gray-600">Last updated: February 7, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Islakayd, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">2. Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and payment information</li>
                  <li>Government-issued ID for verification</li>
                  <li>Location data for equipment matching</li>
                  <li>Profile information and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Equipment search and booking history</li>
                  <li>Communication records between users</li>
                  <li>Device information and IP addresses</li>
                  <li>Analytics and performance data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">3. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide and maintain our equipment rental services</li>
              <li>Process payments and manage bookings</li>
              <li>Verify user identities and prevent fraud</li>
              <li>Facilitate communication between equipment owners and renters</li>
              <li>Improve our platform and develop new features</li>
              <li>Send important service updates and notifications</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">4. Information Sharing</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>With other users:</strong> Basic profile information to facilitate rentals</li>
              <li><strong>With service providers:</strong> Payment processors, verification services, and hosting providers</li>
              <li><strong>For legal compliance:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With consent:</strong> When you explicitly agree to sharing</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-semibold text-gray-900">5. Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure payment processing through certified providers</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. This includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential cookies:</strong> Required for platform functionality</li>
              <li><strong>Analytics cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Marketing cookies:</strong> Used to show relevant advertisements</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform integrates with third-party services including payment processors, verification services,
              and analytics providers. These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
              Account data is typically retained for 7 years after account closure for tax and legal compliance purposes.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate
              safeguards are in place to protect your data during international transfers.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes via email
              or through our platform. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@islakayd.com</p>
              <p className="text-gray-700"><strong>Data Protection Officer:</strong> dpo@islakayd.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Islakayd Inc., Privacy Department</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;