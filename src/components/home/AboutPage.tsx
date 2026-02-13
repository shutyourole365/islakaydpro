import { Users, Shield, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Islakayd
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing equipment rental by connecting owners with renters through
            a trusted, AI-powered marketplace that makes renting equipment simple, safe, and affordable.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To democratize access to equipment by creating a global marketplace where anyone can
              rent or list equipment with confidence, backed by cutting-edge technology and community trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community First</h3>
              <p className="text-gray-600 text-sm">
                Building trust through verified users, transparent reviews, and community-driven standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safety & Security</h3>
              <p className="text-gray-600 text-sm">
                Advanced verification, insurance options, and damage protection for peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                Leveraging AI, AR, and blockchain to create the most advanced rental platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sustainability</h3>
              <p className="text-gray-600 text-sm">
                Reducing waste through equipment sharing and promoting eco-friendly practices.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-8 mb-16 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4">The Problem</h3>
                <p className="mb-4">
                  Equipment rental was broken. Owners struggled to find renters, renters couldn't
                  find quality equipment nearby, and the process was filled with uncertainty and high costs.
                </p>
                <p>
                  Traditional rental companies charged exorbitant fees, and peer-to-peer platforms
                  lacked the trust and features needed for expensive equipment.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">The Solution</h3>
                <p className="mb-4">
                  We built Islakayd - a comprehensive platform that combines the best of both worlds.
                  Advanced verification, AI-powered matching, and comprehensive insurance make renting
                  equipment as simple as booking a hotel.
                </p>
                <p>
                  Our mission is to make every tool, every machine, accessible to anyone who needs it,
                  when they need it, at a fair price.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Meet Our Team</h2>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <p className="text-lg text-gray-600 mb-6">
              Islakayd was founded by a passionate team of engineers, designers, and equipment enthusiasts
              who believe in the power of sharing and technology to solve real-world problems.
            </p>
            <p className="text-gray-600">
              We're a distributed team working remotely from around the world, united by our vision
              of making equipment rental accessible, trustworthy, and sustainable for everyone.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6">
              Have questions about Islakayd? Want to partner with us? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@islakayd.com"
                className="inline-flex items-center px-6 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
              >
                Email Us
              </a>
              <a
                href="/help"
                className="inline-flex items-center px-6 py-3 border-2 border-teal-500 text-teal-500 font-medium rounded-xl hover:bg-teal-50 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}