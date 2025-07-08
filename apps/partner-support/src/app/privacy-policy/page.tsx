'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/auth-provider';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'data-collection', title: 'Data Collection', icon: '📊' },
    { id: 'data-use', title: 'How We Use Data', icon: '🔄' },
    { id: 'data-sharing', title: 'Data Sharing', icon: '🤝' },
    { id: 'security', title: 'Security Measures', icon: '🔒' },
    { id: 'your-rights', title: 'Your Rights', icon: '⚖️' },
    { id: 'jurisdictions', title: 'Jurisdictional Compliance', icon: '🌍' },
    { id: 'contact', title: 'Contact Information', icon: '📞' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Effective Date:</strong> January 8, 2025<br />
                <strong>Last Updated:</strong> January 8, 2025
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                MenoWellness Partner Support ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our partner support platform.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Healthcare Compliance:</strong> We comply with HIPAA (US), PIPEDA & PHIPA (Canada), and GDPR (EU) regulations to ensure the highest standards of health data protection for both partners and primary users.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Privacy Principles for Partners</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Consent-Based Sharing:</strong> You only see information that your partner explicitly chooses to share</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Secure Access:</strong> All shared information is protected with end-to-end encryption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Educational Focus:</strong> Access to educational content and support resources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Privacy Controls:</strong> Full control over your own account and privacy settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Transparency:</strong> Clear information about what data you can access and why</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Partner Role & Responsibilities</h3>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-amber-800">
                  <strong>Important:</strong> As a partner user, you have access to shared health information. You are responsible for maintaining the confidentiality of any health information shared with you and using it only for supportive purposes.
                </p>
              </div>
            </div>
          </div>
        );

      case 'data-collection':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Collection for Partners</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                As a partner user, we collect different types of information to provide support services and educational content. All data collection is based on your explicit consent.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Account Information</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Identity Information:</strong> Email address, display name, user ID</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Authentication Data:</strong> Login credentials and authentication tokens</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Profile Settings:</strong> Privacy preferences, notification settings, app configuration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Connection Information:</strong> Details about your connection to primary users</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shared Health Information Access</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Shared PHI:</strong> You may have access to Personal Health Information that your connected partner chooses to share. This information is subject to the same healthcare privacy protections.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Shared Journal Entries:</strong> Journal entries explicitly shared by your partner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Wellness Insights:</strong> Aggregated wellness data shared by your partner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Progress Updates:</strong> Wellness journey updates shared by your partner</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Content Usage</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Learning Progress:</strong> Which educational content you've accessed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Support Resource Usage:</strong> How you use support guides and resources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>FAQ Interactions:</strong> Questions you search for and content you find helpful</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Device Information:</strong> Browser type, operating system, device identifiers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Usage Analytics:</strong> App usage patterns, feature utilization, performance metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Security Logs:</strong> Authentication events, security incidents, audit trails</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'data-use':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Data as a Partner</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We use your information to provide partner support services and educational content. Your data use is governed by healthcare privacy laws and our commitment to your privacy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Service Purposes</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🎯</span>
                  <span><strong>Educational Content:</strong> Provide access to menopause education and support resources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📚</span>
                  <span><strong>Learning Personalization:</strong> Customize educational content based on your interests</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Connection Management:</strong> Facilitate secure connections with primary users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Account Security:</strong> Protect your account and prevent unauthorized access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">💬</span>
                  <span><strong>Communication:</strong> Send important service updates and educational content</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shared Information Access</h3>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                <p className="text-amber-800">
                  <strong>Partner Responsibility:</strong> When you access shared health information, you become a recipient of PHI and must maintain its confidentiality.
                </p>
              </div>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">👁️</span>
                  <span><strong>Viewing Shared Content:</strong> Access journal entries and wellness data shared by your partner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📊</span>
                  <span><strong>Progress Insights:</strong> View wellness trends and progress updates (when shared)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🎯</span>
                  <span><strong>Supportive Guidance:</strong> Use shared information to provide better support</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal and Compliance Purposes</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚖️</span>
                  <span><strong>Legal Compliance:</strong> Meet healthcare privacy law requirements for partner access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🛡️</span>
                  <span><strong>Security Monitoring:</strong> Detect and prevent unauthorized access to shared information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📋</span>
                  <span><strong>Audit Requirements:</strong> Maintain audit trails of shared information access</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'data-sharing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing for Partners</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="text-green-800">
                  <strong>Partner Commitment:</strong> We do not share your personal information with third parties. Your role as a partner is to receive shared information, not to have your information shared.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information You Receive</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📝</span>
                  <span><strong>Shared Journal Entries:</strong> Only entries explicitly shared by your connected partner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📊</span>
                  <span><strong>Wellness Summaries:</strong> Aggregated wellness data when shared by your partner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🎯</span>
                  <span><strong>Progress Updates:</strong> Milestone and progress information when shared</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Confidentiality Obligations</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Important Responsibility:</strong> Any health information shared with you must be kept confidential and used only for supportive purposes.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🤐</span>
                  <span><strong>Confidentiality:</strong> Do not share PHI with anyone else without explicit consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🎯</span>
                  <span><strong>Purpose Limitation:</strong> Use shared information only for providing support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔒</span>
                  <span><strong>Secure Handling:</strong> Keep shared information secure on your devices</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We maintain the same Business Associate Agreements for partner accounts:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">☁️</span>
                  <span><strong>Google Cloud Platform/Firebase:</strong> Cloud infrastructure and database services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔒</span>
                  <span><strong>Security Monitoring:</strong> Security and monitoring service providers</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures for Partners</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Partner accounts receive the same comprehensive security protections as primary user accounts, with additional safeguards for shared health information access.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shared Information Protection</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Enhanced Security:</strong> Shared health information maintains the same end-to-end encryption protection when accessed by partners.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔐</span>
                  <span><strong>End-to-End Encryption:</strong> Shared content remains encrypted during transmission and viewing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔑</span>
                  <span><strong>Access Controls:</strong> You can only access information explicitly shared with you</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📋</span>
                  <span><strong>Audit Logging:</strong> All access to shared information is logged for compliance</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Partner Account Security</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👤</span>
                  <span><strong>Multi-Factor Authentication:</strong> Required for all partner accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Secure Sessions:</strong> Automatic session timeout and secure session handling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  <span><strong>Connection Verification:</strong> Secure partner connection verification process</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Infrastructure Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">☁️</span>
                  <span><strong>Same Infrastructure:</strong> Partner accounts use the same secure cloud infrastructure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🌐</span>
                  <span><strong>TLS 1.3 Encryption:</strong> All data in transit protected with latest encryption standards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🏠</span>
                  <span><strong>Data Residency:</strong> Same regional data storage requirements</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'your-rights':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights as a Partner</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                As a partner user, you have the same comprehensive privacy rights regarding your personal information, plus specific rights related to shared health information access.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Personal Data Rights</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📋</span>
                  <span><strong>Right to Access:</strong> Request a complete copy of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✏️</span>
                  <span><strong>Right to Rectification:</strong> Correct inaccurate personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🗑️</span>
                  <span><strong>Right to Erasure:</strong> Request deletion of your partner account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔄</span>
                  <span><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shared Information Rights</h3>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                <p className="text-amber-800">
                  <strong>Important:</strong> You do not own the shared health information you access. Rights to this information belong to the primary user who shared it.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👁️</span>
                  <span><strong>Access Rights:</strong> View only information explicitly shared with you</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🚫</span>
                  <span><strong>No Modification Rights:</strong> Cannot modify or delete shared health information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔌</span>
                  <span><strong>Connection Control:</strong> Can disconnect from partner relationships at any time</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Exercise Your Rights</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">⚙️</span>
                  <span><strong>Profile Settings:</strong> Access consent management and account settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📧</span>
                  <span><strong>Email Request:</strong> Contact team.mobileweb@gmail.com</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📞</span>
                  <span><strong>Phone Support:</strong> Call 647-880-1210</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'jurisdictions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Jurisdictional Compliance for Partners</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Partner accounts are subject to the same healthcare privacy laws as primary users, with additional considerations for shared health information access.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇺🇸 HIPAA Compliance for Partners</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Business Associate Status:</strong> Partners who access PHI may be considered business associates and must maintain PHI confidentiality.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Confidentiality Agreement:</strong> Partners agree to maintain PHI confidentiality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🎯</span>
                  <span><strong>Minimum Necessary:</strong> Access limited to minimum necessary for support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Safeguards:</strong> Same technical and administrative safeguards apply</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇨🇦 Canadian Privacy Laws for Partners</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🍁</span>
                  <span><strong>PIPEDA Compliance:</strong> Partner data processing follows PIPEDA principles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>PHIPA Considerations:</strong> Partners accessing Ontario health information must maintain confidentiality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📍</span>
                  <span><strong>Data Residency:</strong> Partner data stored in Canadian regions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇪🇺 GDPR Compliance for Partners</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">⚖️</span>
                  <span><strong>Lawful Basis:</strong> Consent and legitimate interests for partner support services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔒</span>
                  <span><strong>Article 9 Protection:</strong> Special category health data receives enhanced protection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🌍</span>
                  <span><strong>Cross-Border Access:</strong> Secure access to shared information across borders</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We're here to help with any privacy questions or concerns about your partner account or shared information access.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Officer</h3>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                <div className="space-y-2">
                  <p className="text-purple-800"><strong>Jeremy Brown</strong></p>
                  <p className="text-purple-800"><strong>Privacy Officer & Data Protection Officer</strong></p>
                  <p className="text-purple-800">📧 Email: team.mobileweb@gmail.com</p>
                  <p className="text-purple-800">📞 Phone: 647-880-1210</p>
                  <p className="text-purple-800">🕒 Business Hours: Monday-Friday, 9:00 AM - 5:00 PM EST</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Partner-Specific Support</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Connection Issues:</strong> Help with partner connections and shared access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Privacy Concerns:</strong> Questions about shared information confidentiality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📚</span>
                  <span><strong>Educational Content:</strong> Support with accessing learning resources</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Response Times</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>Critical Privacy Issues:</strong> 1 hour response time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">⚡</span>
                  <span><strong>Partner Access Issues:</strong> 4 hours response time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">📋</span>
                  <span><strong>General Questions:</strong> 24 hours response time</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Policy Updates</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800 mb-2">
                  <strong>Stay Informed:</strong> We'll notify you of any changes to this privacy policy that affect partner accounts.
                </p>
                <ul className="space-y-1 text-yellow-800 text-sm">
                  <li>• Email notification for policy changes</li>
                  <li>• In-app notifications for updates</li>
                  <li>• 30-day notice for material changes</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content for {activeSection}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛡️</div>
              <h1 className="text-2xl font-bold text-gray-900">Partner Privacy Policy</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                        ? 'bg-purple-100 text-purple-700 font-medium'
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
