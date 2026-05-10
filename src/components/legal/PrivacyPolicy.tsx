export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: May 2026</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            IslaKayd ("we", "us", "our", or "Company") operates the islakaydpro.netlify.app website and mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Personal Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
            <li><strong>Account Information:</strong> Name, email, phone number, address, date of birth</li>
            <li><strong>Identity Verification:</strong> Government ID, photos, verification documents</li>
            <li><strong>Payment Information:</strong> Credit card details (processed by Stripe, not stored by us)</li>
            <li><strong>Profile Information:</strong> Bio, avatar, ratings, reviews</li>
            <li><strong>Communication:</strong> Messages, support tickets, feedback</li>
            <li><strong>Equipment Data:</strong> Listings, availability, photos, descriptions</li>
            <li><strong>Booking Information:</strong> Rental history, dates, locations, insurance choices</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Usage Data:</strong> Pages viewed, clicks, search queries, time spent</li>
            <li><strong>Location Data:</strong> GPS location (with your permission) for nearby rentals</li>
            <li><strong>Cookies & Analytics:</strong> Session data, preferences, analytics tracking</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Provide, maintain, and improve our Services</li>
            <li>Process bookings, payments, and refunds</li>
            <li>Send transactional communications (confirmations, updates, support)</li>
            <li>Send marketing communications (only with your consent)</li>
            <li>Verify identity and prevent fraud</li>
            <li>Comply with legal obligations and enforce agreements</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Resolve disputes and handle complaints</li>
            <li>Send push notifications (only if you opt-in)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Sharing & Disclosure</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>We do NOT sell your data.</strong> We only share information in these cases:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Service Providers:</strong> Stripe (payments), Netlify (hosting), Supabase (database)</li>
            <li><strong>Other Users:</strong> Limited profile info to facilitate rentals (name, reviews, ratings)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            <li><strong>With Your Consent:</strong> For any other purpose explicitly approved by you</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement comprehensive security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>SSL/TLS encryption for all data in transit</li>
            <li>Encrypted storage for sensitive personal data</li>
            <li>Row-level database security (only you can access your data)</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Strict access controls for staff</li>
            <li>Two-factor authentication available</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            <strong>No method of transmission over the internet is 100% secure.</strong> While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Your Rights</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data (right to be forgotten)</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications anytime</li>
            <li><strong>Withdraw Consent:</strong> Withdraw notification permissions</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            To exercise these rights, contact us at support@islakayd.com
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Account Data:</strong> Kept as long as your account is active, then 30 days for recovery</li>
            <li><strong>Booking/Payment Records:</strong> 7 years (legal/tax requirements)</li>
            <li><strong>Messages:</strong> Until deleted by you or 2 years of inactivity</li>
            <li><strong>Analytics:</strong> 90 days of aggregated data</li>
            <li><strong>Verification Documents:</strong> Until verified, then securely deleted</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Cookies & Tracking</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Session management (keeping you logged in)</li>
            <li>Remembering preferences</li>
            <li>Analytics and usage patterns</li>
            <li>Security and fraud prevention</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            You can control cookies through your browser settings. Disabling cookies may affect functionality.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our Services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will delete such information and terminate the child's account.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. GDPR & CCPA Compliance</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>For EU Residents (GDPR):</strong> We process your data with your explicit consent and maintain a lawful basis for each processing activity. You have the rights mentioned in Section 6.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>For California Residents (CCPA):</strong> You have the right to know, delete, and opt-out of the sale of your personal information. We do not sell your data.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Third-Party Links</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our Services may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Policy Changes</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent notice on our Services. Your continued use of the Services constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have questions about this Privacy Policy or our privacy practices:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-4">
            <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> privacy@islakayd.com</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Mailing Address:</strong> IslaKayd Support, [Your Address]</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Response Time:</strong> We aim to respond within 30 days</p>
          </div>
        </section>
      </div>
    </div>
  );
}
