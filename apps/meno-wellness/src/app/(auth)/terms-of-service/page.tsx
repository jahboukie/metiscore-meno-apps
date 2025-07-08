'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'acceptance', title: 'Acceptance of Terms', icon: '✅' },
    { id: 'services', title: 'Our Services', icon: '🏥' },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: '👤' },
    { id: 'privacy-health', title: 'Privacy & Health Data', icon: '🔒' },
    { id: 'prohibited-uses', title: 'Prohibited Uses', icon: '🚫' },
    { id: 'disclaimers', title: 'Medical Disclaimers', icon: '⚠️' },
    { id: 'termination', title: 'Account Termination', icon: '🔚' },
    { id: 'legal', title: 'Legal Terms', icon: '⚖️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Effective Date:</strong> January 8, 2025<br />
                <strong>Last Updated:</strong> January 8, 2025
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to MenoWellness. These Terms of Service ("Terms") govern your use of our menopause wellness platform and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Healthcare Service:</strong> MenoWellness provides wellness tracking and support services for menopause management. We are not a substitute for professional medical care.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Overview</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Wellness Tracking:</strong> Personal menopause symptom and mood tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Secure Journaling:</strong> End-to-end encrypted personal wellness journaling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Partner Support:</strong> Secure sharing with trusted partners and family</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Educational Resources:</strong> Evidence-based menopause information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Privacy Protection:</strong> HIPAA, PIPEDA, PHIPA, and GDPR compliant</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Important Legal Information</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Please Read Carefully:</strong> These Terms include important information about your rights, legal obligations, and limitations of liability. By using our services, you acknowledge that you have read and understood these Terms.
                </p>
              </div>
            </div>
          </div>
        );

      case 'acceptance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                By creating an account, accessing, or using MenoWellness services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligibility Requirements</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👤</span>
                  <span><strong>Age Requirement:</strong> You must be at least 18 years old to use our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🧠</span>
                  <span><strong>Capacity:</strong> You must have the legal capacity to enter into binding agreements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📍</span>
                  <span><strong>Jurisdiction:</strong> You must be located in a jurisdiction where our services are available</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✅</span>
                  <span><strong>Compliance:</strong> You must comply with all applicable laws and regulations</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Registration</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📧</span>
                  <span><strong>Accurate Information:</strong> Provide accurate and complete registration information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔒</span>
                  <span><strong>Account Security:</strong> Maintain the security of your account credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔄</span>
                  <span><strong>Information Updates:</strong> Keep your account information current and accurate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">👤</span>
                  <span><strong>Personal Use:</strong> Your account is for your personal use only</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Consent to Healthcare Data Processing</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Health Information Consent:</strong> By using our services, you consent to the collection, processing, and storage of your health information as described in our Privacy Policy.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>PHI Processing:</strong> Consent to processing of Personal Health Information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔒</span>
                  <span><strong>Encryption:</strong> Understanding that your data will be encrypted for protection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🤝</span>
                  <span><strong>Partner Sharing:</strong> Explicit consent required for sharing with partners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔄</span>
                  <span><strong>Consent Withdrawal:</strong> Right to withdraw consent at any time</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                MenoWellness provides digital wellness services specifically designed for menopause support and management. Our services are complementary to, not a replacement for, professional medical care.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Core Services</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📝</span>
                  <span><strong>Wellness Journaling:</strong> Secure, encrypted personal wellness and symptom tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📊</span>
                  <span><strong>Symptom Tracking:</strong> Tools to monitor menopause symptoms and patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🎯</span>
                  <span><strong>Mood Monitoring:</strong> Emotional wellness tracking and insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Partner Connection:</strong> Secure sharing with trusted partners and family</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📚</span>
                  <span><strong>Educational Content:</strong> Evidence-based menopause information and resources</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Optional Services (With Consent)</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>Enhanced Features:</strong> These services require your explicit consent and can be disabled at any time.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🧠</span>
                  <span><strong>Sentiment Analysis:</strong> AI-powered emotional insights from journal entries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔬</span>
                  <span><strong>Research Participation:</strong> Contribute anonymized data to menopause research</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📈</span>
                  <span><strong>Advanced Analytics:</strong> Detailed wellness patterns and insights</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Availability</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🌐</span>
                  <span><strong>Platform Access:</strong> Services available through web and mobile applications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">⏰</span>
                  <span><strong>Service Hours:</strong> Platform available 24/7 with scheduled maintenance windows</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔄</span>
                  <span><strong>Updates:</strong> Regular service improvements and feature updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🛠️</span>
                  <span><strong>Maintenance:</strong> Scheduled maintenance with advance notice</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'user-responsibilities':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                As a user of MenoWellness, you have certain responsibilities to ensure the safe and effective use of our services for yourself and other users.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Responsibilities</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Account Security:</strong> Maintain the confidentiality of your login credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📧</span>
                  <span><strong>Accurate Information:</strong> Provide and maintain accurate account information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🚨</span>
                  <span><strong>Unauthorized Access:</strong> Immediately report any unauthorized account access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👤</span>
                  <span><strong>Personal Use:</strong> Use your account only for your personal wellness tracking</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Health Information Responsibilities</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Important:</strong> You are responsible for the accuracy of health information you enter and for making appropriate healthcare decisions.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📝</span>
                  <span><strong>Accurate Tracking:</strong> Provide accurate health and symptom information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>Medical Care:</strong> Continue appropriate medical care and consultation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>Emergency Situations:</strong> Seek immediate medical attention for emergencies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">💊</span>
                  <span><strong>Medication Decisions:</strong> Consult healthcare providers for medication changes</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Partner Sharing Responsibilities</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🤝</span>
                  <span><strong>Consent Management:</strong> Only share information you're comfortable sharing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔒</span>
                  <span><strong>Partner Trust:</strong> Only connect with trusted partners who will maintain confidentiality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">⚖️</span>
                  <span><strong>Legal Compliance:</strong> Ensure partner sharing complies with applicable privacy laws</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'privacy-health':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy & Health Data</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Your health information is protected under multiple healthcare privacy laws. This section outlines how we handle your Personal Health Information (PHI).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Healthcare Privacy Compliance</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Multi-Jurisdictional Compliance:</strong> We comply with HIPAA (US), PIPEDA & PHIPA (Canada), and GDPR (EU) to protect your health information.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🇺🇸</span>
                  <span><strong>HIPAA Compliance:</strong> Full PHI protection for US users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🇨🇦</span>
                  <span><strong>PIPEDA/PHIPA Compliance:</strong> Canadian privacy law compliance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🇪🇺</span>
                  <span><strong>GDPR Compliance:</strong> European data protection standards</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Protection Measures</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔐</span>
                  <span><strong>End-to-End Encryption:</strong> Your journal entries are encrypted on your device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔑</span>
                  <span><strong>Key Management:</strong> You control your encryption keys</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🛡️</span>
                  <span><strong>Access Controls:</strong> Strict access controls and authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📋</span>
                  <span><strong>Audit Logging:</strong> All access to your data is logged</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Privacy Rights</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📋</span>
                  <span><strong>Right to Access:</strong> Request copies of your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✏️</span>
                  <span><strong>Right to Correct:</strong> Update inaccurate information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🗑️</span>
                  <span><strong>Right to Delete:</strong> Request deletion of your account and data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔄</span>
                  <span><strong>Right to Withdraw:</strong> Withdraw consent for data processing</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'prohibited-uses':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                To maintain a safe and secure environment for all users, certain uses of our services are prohibited.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚫</span>
                  <span><strong>Illegal Activities:</strong> Using our services for any illegal purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔓</span>
                  <span><strong>Unauthorized Access:</strong> Attempting to access other users' accounts or data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🤖</span>
                  <span><strong>Automated Access:</strong> Using bots, scrapers, or automated tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">💥</span>
                  <span><strong>Service Disruption:</strong> Interfering with or disrupting our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔍</span>
                  <span><strong>Reverse Engineering:</strong> Attempting to reverse engineer our software</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Health Information Misuse</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Serious Violations:</strong> Misuse of health information is a serious violation that may result in immediate account termination and legal action.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚫</span>
                  <span><strong>Unauthorized Sharing:</strong> Sharing other users' health information without consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">💰</span>
                  <span><strong>Commercial Use:</strong> Using health information for commercial purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🎭</span>
                  <span><strong>False Information:</strong> Deliberately entering false health information</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Consequences of Violations</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⚠️</span>
                  <span><strong>Warning:</strong> First violations may result in warnings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⏸️</span>
                  <span><strong>Suspension:</strong> Temporary account suspension for serious violations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🔚</span>
                  <span><strong>Termination:</strong> Permanent account termination for severe violations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⚖️</span>
                  <span><strong>Legal Action:</strong> Legal action for violations of healthcare privacy laws</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'disclaimers':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Disclaimers</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <p className="text-red-800">
                  <strong>Important Medical Disclaimer:</strong> MenoWellness is a wellness tracking platform and is not a substitute for professional medical care, diagnosis, or treatment.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Not Medical Advice</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>Professional Care:</strong> Always consult qualified healthcare providers for medical advice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">💊</span>
                  <span><strong>Treatment Decisions:</strong> Do not make treatment decisions based solely on our platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>Emergency Care:</strong> Seek immediate medical attention for medical emergencies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📊</span>
                  <span><strong>Data Interpretation:</strong> Our insights are for informational purposes only</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitations of Service</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">📱</span>
                  <span><strong>Technology Limitations:</strong> Our platform may have technical limitations or errors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🎯</span>
                  <span><strong>Individual Variation:</strong> Results and insights may vary between individuals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🔬</span>
                  <span><strong>Research Basis:</strong> Features are based on available research but not medical devices</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Responsibility</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Your Health Decisions:</strong> You are responsible for all health-related decisions and should always consult with healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        );

      case 'termination':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Both you and MenoWellness have the right to terminate your account under certain circumstances. This section outlines the termination process and consequences.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by You</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔚</span>
                  <span><strong>Voluntary Termination:</strong> You may terminate your account at any time through your profile settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📋</span>
                  <span><strong>Data Export:</strong> Export your data before termination if desired</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⏰</span>
                  <span><strong>Processing Time:</strong> Account termination processed within 30 days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔄</span>
                  <span><strong>Withdrawal Period:</strong> 30-day period to withdraw termination request</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by MenoWellness</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Service Termination:</strong> We may terminate accounts for violations of these Terms or applicable laws.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span><strong>Terms Violations:</strong> Violations of these Terms of Service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚫</span>
                  <span><strong>Prohibited Activities:</strong> Engaging in prohibited uses or activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚖️</span>
                  <span><strong>Legal Violations:</strong> Violations of applicable laws or regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔒</span>
                  <span><strong>Security Threats:</strong> Activities that threaten platform security</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Effects of Termination</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🚪</span>
                  <span><strong>Access Termination:</strong> Immediate loss of access to your account and data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🗑️</span>
                  <span><strong>Data Deletion:</strong> Permanent deletion of account data after withdrawal period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🤝</span>
                  <span><strong>Partner Disconnection:</strong> Automatic disconnection from partner accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📋</span>
                  <span><strong>Audit Retention:</strong> Audit logs retained for compliance purposes</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                These legal terms govern your relationship with MenoWellness and outline important legal protections and limitations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Important:</strong> Our liability is limited as permitted by law. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚖️</span>
                  <span><strong>Service Limitations:</strong> Liability limited to the extent permitted by applicable law</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">💰</span>
                  <span><strong>Damage Limitations:</strong> Not liable for indirect or consequential damages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">🏥</span>
                  <span><strong>Medical Decisions:</strong> Not liable for health decisions based on platform use</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🇨🇦</span>
                  <span><strong>Canadian Law:</strong> These Terms are governed by Canadian law</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🏛️</span>
                  <span><strong>Jurisdiction:</strong> Disputes resolved in Canadian courts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🌍</span>
                  <span><strong>International Users:</strong> Local laws may also apply</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📝</span>
                  <span><strong>Updates:</strong> We may update these Terms from time to time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📧</span>
                  <span><strong>Notification:</strong> Material changes will be communicated via email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">⏰</span>
                  <span><strong>Effective Date:</strong> Changes effective 30 days after notification</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="space-y-2">
                  <p className="text-blue-800"><strong>Legal Questions:</strong></p>
                  <p className="text-blue-800">📧 Email: team.mobileweb@gmail.com</p>
                  <p className="text-blue-800">📞 Phone: 647-880-1210</p>
                  <p className="text-blue-800"><strong>Jeremy Brown</strong> - Privacy Officer & Legal Contact</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content for {activeSection}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📋</div>
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Back to Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
