export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: May 2026</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing and using IslaKayd (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Age Requirement</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>You must be at least 18 years of age to use this Service.</strong>
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            By registering, you represent and warrant that you are 18 years of age or older. We may verify your age at any time. False information may result in account termination and legal action.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Account Creation</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activities under your account</li>
            <li>You must provide accurate, complete, and current information</li>
            <li>You must update information as needed to keep it accurate</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Account Suspension or Termination</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may suspend or terminate your account if you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Violate these Terms of Service</li>
            <li>Provide false or misleading information</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Damage or misuse equipment in violation of rental agreements</li>
            <li>Have unpaid balances or disputed charges</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Equipment Rentals</h2>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Renter Responsibilities</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>Use equipment only for lawful purposes</li>
            <li>Operate equipment safely and according to owner instructions</li>
            <li>Return equipment in the same condition as received (normal wear excepted)</li>
            <li>Pay all rental fees and applicable taxes on time</li>
            <li>Comply with all safety requirements and instructions</li>
            <li>Report damage or defects immediately</li>
            <li>Insure equipment if optional coverage is declined</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Owner Responsibilities</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>Equipment must be safe and in good working condition</li>
            <li>Provide accurate descriptions and condition photos</li>
            <li>Disclose any known defects or limitations</li>
            <li>Respond to renter inquiries promptly</li>
            <li>Ensure insurance coverage is valid (if provided)</li>
            <li>Resolve disputes in good faith</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Damage & Liability</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Renters are responsible for any damage beyond normal wear and tear. Damage claims must be reported within 48 hours of equipment return. We provide damage insurance options at checkout.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Liability Limitation:</strong> In no case shall IslaKayd be liable for equipment damage, injury, or loss. Renters assume all risk when using rented equipment.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Payments & Refunds</h2>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Payment</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>All payments are processed through Stripe</li>
            <li>We do not store credit card information</li>
            <li>You authorize charges for confirmed bookings</li>
            <li>Applicable taxes are added to rental fees</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Cancellation & Refund Policy</h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li><strong>Free Cancellation:</strong> Full refund if cancelled 7+ days before rental</li>
            <li><strong>50% Refund:</strong> If cancelled 3-6 days before rental</li>
            <li><strong>No Refund:</strong> If cancelled less than 3 days before rental</li>
            <li><strong>No-show:</strong> No refund if you fail to pick up equipment</li>
            <li>Refunds processed within 5-10 business days</li>
            <li>Service fees are non-refundable</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Disputes</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Payment disputes must be reported within 30 days. We will investigate and resolve disputes fairly. Repeated chargebacks may result in account termination.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. User Conduct</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Post obscene, offensive, or illegal content</li>
            <li>Engage in fraud, phishing, or deceptive practices</li>
            <li>Access systems without authorization</li>
            <li>Attempt to disrupt or degrade Service performance</li>
            <li>Scrape or collect data from the Service</li>
            <li>Use the Service for commercial purposes without permission</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All content on IslaKayd (including logos, text, graphics, images) is the property of IslaKayd or its content suppliers and is protected by international copyright laws.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            You may not reproduce, republish, distribute, or transmit any content without our written consent. User-generated content (reviews, photos, messages) becomes our property once posted.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Ratings & Reviews</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By submitting a review or rating, you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Grant us the right to publish and display it</li>
            <li>Guarantee it is truthful and based on your genuine experience</li>
            <li>Understand it may appear with your name/photo</li>
            <li>Assume liability for any false or defamatory statements</li>
            <li>Agree not to post for commercial purposes</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            We reserve the right to remove reviews that violate these terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>IslaKayd is provided "AS IS" without warranties</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to the amount you paid</li>
            <li>We are not liable for third-party content or equipment condition</li>
            <li>We are not liable for service interruptions or data loss</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Indemnification</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You agree to indemnify and hold harmless IslaKayd, its officers, directors, and employees from any claims, damages, or costs arising from:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Your violation of these Terms</li>
            <li>Your use of the Service</li>
            <li>Your user-generated content</li>
            <li>Injury or damage caused by rented equipment</li>
            <li>Disputes with other users</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Dispute Resolution</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Arbitration:</strong> Any dispute shall be resolved through binding arbitration, not court proceedings. You waive the right to jury trial and class actions.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Exceptions:</strong> We may pursue legal action for intellectual property infringement, fraud, or data theft.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Governing Law</h2>
          <p className="text-gray-700 dark:text-gray-300">
            These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of laws principles.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Modifications to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may modify these Terms at any time. Continued use of the Service constitutes acceptance of modified terms. We will notify you of material changes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact for Questions</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> legal@islakayd.com</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Support:</strong> support@islakayd.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
