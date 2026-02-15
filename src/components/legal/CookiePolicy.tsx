import React from 'react';
import { ArrowLeft, Cookie, Settings, BarChart3, Target } from 'lucide-react';

interface CookiePolicyProps {
  onBack: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Cookie className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
            <p className="text-lg text-gray-600">Last updated: February 7, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide
              you with a better browsing experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-start gap-3 mb-3">
                  <Settings className="w-6 h-6 text-green-600 mt-1" />
                  <h3 className="text-lg font-semibold text-green-900">Essential Cookies</h3>
                </div>
                <p className="text-green-800 mb-3">
                  These cookies are necessary for the website to function and cannot be switched off in our systems.
                </p>
                <ul className="list-disc list-inside text-green-800 space-y-1 ml-4">
                  <li>Authentication and security cookies</li>
                  <li>Session management cookies</li>
                  <li>CSRF protection tokens</li>
                  <li>Load balancing cookies</li>
                </ul>
                <p className="text-green-700 text-sm mt-2">
                  <strong>Purpose:</strong> Enable core platform functionality
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-start gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 mt-1" />
                  <h3 className="text-lg font-semibold text-blue-900">Analytics Cookies</h3>
                </div>
                <p className="text-blue-800 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
                  <li>Page view tracking</li>
                  <li>User journey analysis</li>
                  <li>Performance monitoring</li>
                  <li>Error tracking</li>
                </ul>
                <p className="text-blue-700 text-sm mt-2">
                  <strong>Purpose:</strong> Improve website performance and user experience
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="w-6 h-6 text-purple-600 mt-1" />
                  <h3 className="text-lg font-semibold text-purple-900">Marketing Cookies</h3>
                </div>
                <p className="text-purple-800 mb-3">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-1 ml-4">
                  <li>Retargeting campaigns</li>
                  <li>Social media advertising</li>
                  <li>Conversion tracking</li>
                  <li>Audience segmentation</li>
                </ul>
                <p className="text-purple-700 text-sm mt-2">
                  <strong>Purpose:</strong> Show relevant advertisements and measure campaign effectiveness
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-indigo-200 rounded-lg p-6 bg-indigo-50">
                <div className="flex items-start gap-3 mb-3">
                  <Settings className="w-6 h-6 text-indigo-600 mt-1" />
                  <h3 className="text-lg font-semibold text-indigo-900">Functional Cookies</h3>
                </div>
                <p className="text-indigo-800 mb-3">
                  These cookies enable the website to provide enhanced functionality and personalization.
                </p>
                <ul className="list-disc list-inside text-indigo-800 space-y-1 ml-4">
                  <li>Language preferences</li>
                  <li>Location settings</li>
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Search filters and preferences</li>
                </ul>
                <p className="text-indigo-700 text-sm mt-2">
                  <strong>Purpose:</strong> Enhance user experience and personalization
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use third-party services that may set their own cookies. These include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Supabase:</strong> For authentication and database services</li>
              <li><strong>Mapbox/Leaflet:</strong> For location services and mapping</li>
              <li><strong>Social media platforms:</strong> For social sharing and login options</li>
            </ul>
          </section>

          {/* Cookie Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Your Cookie Preferences</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                You have several options for managing cookies:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                <p className="text-gray-700 text-sm">
                  Most web browsers allow you to control cookies through their settings preferences.
                  You can usually find these settings in the 'Options' or 'Preferences' menu of your browser.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Consent Banner</h3>
                <p className="text-gray-700 text-sm">
                  When you first visit our website, you'll see a cookie consent banner where you can
                  choose which types of cookies to accept or reject.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-700 text-sm">
                  Logged-in users can manage their cookie preferences through their account settings page.
                </p>
              </div>
            </div>
          </section>

          {/* Impact of Disabling Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Impact of Disabling Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you disable certain cookies, some features of our website may not function properly:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential cookies:</strong> Disabling these will prevent the website from functioning</li>
              <li><strong>Analytics cookies:</strong> We won't be able to improve the website based on usage data</li>
              <li><strong>Marketing cookies:</strong> You'll see less relevant advertisements</li>
              <li><strong>Functional cookies:</strong> Personalized features and preferences won't be saved</li>
            </ul>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational,
              legal, or regulatory reasons. We will notify you of any material changes via email or through our platform.
            </p>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@islakayd.com</p>
              <p className="text-gray-700"><strong>Subject:</strong> Cookie Policy Inquiry</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;