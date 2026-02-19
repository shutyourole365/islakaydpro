import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Users, Wrench, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface SafetyProps {
  onBack: () => void;
}

export default function Safety({ onBack }: SafetyProps) {
  const safetyPrinciples = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Equipment',
      description: 'All equipment listings undergo thorough verification and safety inspections before being approved.',
      details: ['Professional inspection reports', 'Maintenance history review', 'Safety compliance certification', 'Regular quality audits']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Trusted Community',
      description: 'Our user verification system ensures all participants are legitimate and accountable.',
      details: ['Identity verification', 'Background checks for owners', 'User rating and review system', 'Community guidelines enforcement']
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Comprehensive Insurance',
      description: 'Multiple insurance options protect both renters and owners against accidents and damage.',
      details: ['Equipment damage coverage', 'Personal injury protection', 'Theft and vandalism insurance', 'Liability coverage options']
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Transparent Processes',
      description: 'Clear communication and documentation throughout the rental process.',
      details: ['Detailed equipment descriptions', 'Usage guidelines provided', 'Contact information exchange', 'Dispute resolution procedures']
    }
  ];

  const safetyGuidelines = [
    {
      category: 'For Renters',
      guidelines: [
        'Always inspect equipment before use and report any issues immediately',
        'Follow all manufacturer safety guidelines and operating instructions',
        'Use appropriate personal protective equipment (PPE)',
        'Never operate equipment under the influence of alcohol or drugs',
        'Report any accidents or injuries to the owner and Islakayd immediately',
        'Return equipment in the same condition as received'
      ]
    },
    {
      category: 'For Owners',
      guidelines: [
        'Ensure all equipment is properly maintained and safe to operate',
        'Provide accurate descriptions and safety information',
        'Verify renter qualifications for specialized equipment',
        'Maintain adequate insurance coverage',
        'Respond promptly to renter inquiries and concerns',
        'Inspect equipment upon return and document any damage'
      ]
    },
    {
      category: 'General Safety',
      guidelines: [
        'Follow all local laws and regulations regarding equipment operation',
        'Never modify equipment without manufacturer approval',
        'Keep emergency contact information readily available',
        'Store equipment securely when not in use',
        'Report suspicious activity or safety concerns to Islakayd',
        'Participate in safety training when available'
      ]
    }
  ];

  const emergencyContacts = [
    {
      type: 'Platform Emergency',
      contact: '1-800-ISLAKAYD (475-25293)',
      description: 'For urgent safety issues or accidents involving Islakayd equipment',
      availability: '24/7'
    },
    {
      type: 'Equipment Support',
      contact: 'support@islakayd.com',
      description: 'Technical support and equipment-related questions',
      availability: 'Mon-Fri 9AM-6PM EST'
    },
    {
      type: 'Insurance Claims',
      contact: 'claims@islakayd.com',
      description: 'Report incidents and file insurance claims',
      availability: 'Mon-Fri 9AM-6PM EST'
    },
    {
      type: 'Local Emergency',
      contact: '911 (US) or local emergency services',
      description: 'For life-threatening emergencies or serious accidents',
      availability: '24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Safety First
              </h1>
              <p className="text-xl md:text-2xl text-red-100 mb-8">
                Your safety is our top priority. Learn about our comprehensive safety measures and guidelines.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                <div className="text-lg font-semibold">Safety Rating: A+</div>
                <div className="text-red-100">Industry-leading safety standards</div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Safety Principles */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Safety Principles</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {safetyPrinciples.map((principle, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                          {principle.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{principle.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{principle.description}</p>
                      <ul className="space-y-2">
                        {principle.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Guidelines */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Safety Guidelines</h2>
                <div className="space-y-8">
                  {safetyGuidelines.map((section, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.category}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {section.guidelines.map((guideline, idx) => (
                          <div key={idx} className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-600 text-sm">{guideline}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Safety Checklist */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pre-Use Safety Checklist</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Wrench className="w-6 h-6 text-yellow-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Before Using Any Equipment</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Inspect for visible damage or defects
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Check fluid levels and tire pressure
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Test all controls and safety features
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Verify safety guards are in place
                      </li>
                    </ul>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Read and understand operating manual
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Wear appropriate personal protective equipment
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Know location of emergency stops
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Have emergency contact numbers ready
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Emergency Contacts</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.type}</h3>
                      <p className="text-red-600 font-medium text-lg mb-1">{contact.contact}</p>
                      <p className="text-gray-600 mb-2">{contact.description}</p>
                      <p className="text-sm text-gray-500">Available: {contact.availability}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Reporting */}
              <div className="bg-red-50 rounded-lg p-8">
                <div className="text-center mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Safety Concerns</h2>
                  <p className="text-gray-600 mb-6">
                    If you encounter unsafe equipment, suspicious activity, or have safety concerns, please report them immediately.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Report Safety Issue
                  </Button>
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                    View Safety Resources
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  All reports are confidential and investigated promptly. Your safety concerns help make Islakayd safer for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}