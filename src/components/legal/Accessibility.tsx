import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface AccessibilityProps {
  onBack: () => void;
}

export default function Accessibility({ onBack }: AccessibilityProps) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Accessibility Statement</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              At Islakayd, we are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
            <p className="text-gray-600 mb-4">
              Islakayd is committed to making our platform accessible to all users, including those with disabilities. We strive to provide an inclusive experience that meets or exceeds the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Accessibility Features</h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Navigation & Structure</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Semantic HTML structure with proper headings hierarchy</li>
              <li>Keyboard navigation support throughout the platform</li>
              <li>Skip links for screen reader users</li>
              <li>Consistent navigation patterns across all pages</li>
              <li>Descriptive link text and button labels</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Visual Accessibility</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>High contrast color schemes</li>
              <li>Resizable text (up to 200% without loss of functionality)</li>
              <li>Alternative text for all images and icons</li>
              <li>Clear focus indicators for keyboard navigation</li>
              <li>Support for high contrast mode</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Screen Reader Support</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>ARIA labels and descriptions where needed</li>
              <li>Proper form labels and fieldsets</li>
              <li>Status messages for dynamic content updates</li>
              <li>Table headers and data relationships</li>
              <li>Live regions for real-time updates</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Motor Accessibility</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Keyboard-only navigation support</li>
              <li>Sufficient time for user input</li>
              <li>No pointer-only interactions</li>
              <li>Large clickable areas (minimum 44px)</li>
              <li>Support for assistive technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Assistive Technologies</h2>
            <p className="text-gray-600 mb-4">
              Our platform is designed to work with common assistive technologies including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Alternative input devices</li>
              <li>Braille displays</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Mobile Accessibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Responsive design that works on all screen sizes</li>
              <li>Touch targets meet minimum size requirements</li>
              <li>Gesture alternatives for complex interactions</li>
              <li>Support for mobile screen readers</li>
              <li>Optimized for both portrait and landscape orientations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Content Accessibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Plain language content where possible</li>
              <li>Consistent terminology throughout the platform</li>
              <li>Clear instructions and error messages</li>
              <li>Logical reading order</li>
              <li>Transcripts for audio content (when applicable)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Reporting Accessibility Issues</h2>
            <p className="text-gray-600 mb-4">
              If you encounter accessibility barriers on our platform, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Email: accessibility@islakayd.com</li>
              <li>Phone: 1-800-ISLAKAYD (1-800-475-25293)</li>
              <li>Use our contact form in the Help Center</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Please include details about the issue, the device and browser you're using, and any assistive technologies. We'll respond within 48 hours and work to resolve the issue promptly.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Continuous Improvement</h2>
            <p className="text-gray-600 mb-4">
              We regularly audit our platform for accessibility issues and are committed to continuous improvement. Our development process includes accessibility testing and user feedback from people with disabilities.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Legal Compliance</h2>
            <p className="text-gray-600 mb-4">
              Islakayd complies with applicable accessibility laws and standards, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Section 508 of the Rehabilitation Act</li>
              <li>WCAG 2.1 Level AA</li>
              <li>ADA (Americans with Disabilities Act) compliance</li>
              <li>EN 301 549 (European accessibility standard)</li>
            </ul>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Accessibility Score:</strong> WCAG 2.1 AA Compliant | <strong>Last Audit:</strong> February 15, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}