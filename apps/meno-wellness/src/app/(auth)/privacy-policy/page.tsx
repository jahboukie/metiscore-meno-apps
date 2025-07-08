'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth-provider';

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
                MenoWellness ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal health information (PHI). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our menopause wellness platform.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Healthcare Compliance:</strong> We comply with HIPAA (US), PIPEDA & PHIPA (Canada), and GDPR (EU) regulations to ensure the highest standards of health data protection.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Privacy Principles</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Data Minimization:</strong> We only collect data necessary for providing our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>End-to-End Encryption:</strong> Your journal entries and sensitive data are encrypted on your device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>User Control:</strong> You have full control over your data and consent preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Transparency:</strong> Clear information about how your data is used</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Security by Design:</strong> Privacy and security built into every aspect of our platform</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scope of This Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                This policy applies to all users of the MenoWellness platform, including both primary users (individuals experiencing menopause) and partner users (supportive partners, family members, or friends). It covers all data processing activities across our web applications, mobile applications, and backend services.
              </p>
            </div>
          </div>
        );

      case 'data-collection':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Collection</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We collect different types of information to provide and improve our services. All data collection is based on your explicit consent and legitimate interests for healthcare services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Health Information (PHI)</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Protected Health Information:</strong> The following data is considered PHI and receives the highest level of protection under healthcare privacy laws.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Journal Entries:</strong> Your personal wellness journal entries and mood tracking data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Symptom Tracking:</strong> Information about menopause symptoms, severity, and frequency</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Health Metrics:</strong> Sleep patterns, mood scores, and wellness indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Treatment Information:</strong> Information about treatments, medications, or therapies (if provided)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Information</h3>
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
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Information</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Device Information:</strong> Browser type, operating system, device identifiers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Usage Analytics:</strong> App usage patterns, feature utilization, performance metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Security Logs:</strong> Authentication events, security incidents, audit trails</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Optional Data Collection</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>Your Choice:</strong> The following data is only collected with your explicit consent and can be withdrawn at any time.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Sentiment Analysis:</strong> Analysis of journal entries for emotional insights (requires consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Research Participation:</strong> Anonymized data for menopause research (requires consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Partner Sharing:</strong> Shared journal entries with connected partners (requires explicit sharing)</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'data-use':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Data</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We use your information solely for the purposes you've consented to and as necessary to provide our healthcare services. Our data use is governed by healthcare privacy laws and our commitment to your privacy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Primary Service Purposes</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🎯</span>
                  <span><strong>Wellness Tracking:</strong> Provide personalized menopause wellness tracking and insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📊</span>
                  <span><strong>Progress Monitoring:</strong> Track your wellness journey and symptom patterns over time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Partner Support:</strong> Enable secure sharing with trusted partners (with your explicit consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  <span><strong>Account Security:</strong> Protect your account and prevent unauthorized access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">💬</span>
                  <span><strong>Communication:</strong> Send important service updates and security notifications</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enhanced Features (With Consent)</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Optional Features:</strong> These features require your explicit consent and can be disabled at any time.
                </p>
              </div>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🧠</span>
                  <span><strong>Sentiment Analysis:</strong> Analyze journal entries to provide emotional wellness insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔬</span>
                  <span><strong>Research Contribution:</strong> Use anonymized data to advance menopause research</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📈</span>
                  <span><strong>Personalized Insights:</strong> Provide tailored recommendations based on your data patterns</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal and Compliance Purposes</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚖️</span>
                  <span><strong>Legal Compliance:</strong> Meet healthcare privacy law requirements (HIPAA, PIPEDA, PHIPA, GDPR)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🛡️</span>
                  <span><strong>Security Monitoring:</strong> Detect and prevent security threats and unauthorized access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📋</span>
                  <span><strong>Audit Requirements:</strong> Maintain audit trails as required by healthcare regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>Incident Response:</strong> Investigate and respond to security incidents or data breaches</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'data-sharing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="text-green-800">
                  <strong>Our Commitment:</strong> We do not sell, rent, or trade your personal health information. Data sharing is limited to essential service providers and only with your explicit consent.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authorized Data Sharing</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Partner Sharing:</strong> Journal entries shared with connected partners (only with your explicit consent for each entry)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔧</span>
                  <span><strong>Service Providers:</strong> Essential third-party services that help us operate the platform (see Business Associate Agreements section)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔬</span>
                  <span><strong>Research Partners:</strong> Anonymized data for approved menopause research (only with your research participation consent)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Associate Agreements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We maintain HIPAA-compliant Business Associate Agreements (BAAs) with all third-party service providers who may access your PHI:
              </p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">☁️</span>
                  <span><strong>Google Cloud Platform/Firebase:</strong> Cloud infrastructure and database services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🧠</span>
                  <span><strong>Sentiment Analysis Service:</strong> Optional sentiment analysis of journal entries (only with consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔒</span>
                  <span><strong>Security Monitoring:</strong> Security and monitoring service providers</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Disclosure Requirements</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Legal Obligations:</strong> We may be required to disclose information in limited circumstances as required by law.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚖️</span>
                  <span><strong>Legal Process:</strong> Court orders, subpoenas, or other legal requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>Public Safety:</strong> Imminent threats to health or safety (as permitted by healthcare privacy laws)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🛡️</span>
                  <span><strong>Regulatory Compliance:</strong> Healthcare regulatory authorities when required by law</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We implement comprehensive security measures to protect your personal health information, exceeding industry standards and healthcare compliance requirements.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Maximum Protection:</strong> Your most sensitive data is encrypted on your device before transmission and storage.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔐</span>
                  <span><strong>AES-256-GCM Encryption:</strong> Military-grade encryption for journal entries and sensitive data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔑</span>
                  <span><strong>Client-Side Key Management:</strong> Encryption keys stored only on your device, never on our servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔄</span>
                  <span><strong>Key Rotation:</strong> Regular encryption key rotation with secure key backup options</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Infrastructure Security</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">☁️</span>
                  <span><strong>Google Cloud Platform:</strong> SOC 2, ISO 27001, and HIPAA-compliant cloud infrastructure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🌐</span>
                  <span><strong>TLS 1.3 Encryption:</strong> All data in transit protected with latest encryption standards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🏠</span>
                  <span><strong>Canadian Data Residency:</strong> Data stored in Canadian regions for PIPEDA/PHIPA compliance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔄</span>
                  <span><strong>Automated Backups:</strong> Daily encrypted backups with 30-day point-in-time recovery</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Controls</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">👤</span>
                  <span><strong>Multi-Factor Authentication:</strong> Required for all user accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🎯</span>
                  <span><strong>Principle of Least Privilege:</strong> Users can only access their own data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📋</span>
                  <span><strong>Audit Logging:</strong> All data access and modifications logged for compliance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">⏰</span>
                  <span><strong>Session Management:</strong> Automatic session timeout and secure session handling</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Monitoring and Incident Response</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🚨</span>
                  <span><strong>24/7 Security Monitoring:</strong> Continuous monitoring for security threats and anomalies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚡</span>
                  <span><strong>Rapid Incident Response:</strong> 1-hour response time for critical security incidents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📢</span>
                  <span><strong>Breach Notification:</strong> Immediate notification procedures meeting all regulatory requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔍</span>
                  <span><strong>Regular Security Audits:</strong> Annual third-party security assessments and penetration testing</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'your-rights':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                You have comprehensive rights regarding your personal health information. These rights vary by jurisdiction but we provide the highest level of protection across all regions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Universal Rights (All Users)</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📋</span>
                  <span><strong>Right to Access:</strong> Request a complete copy of all your personal data in a portable format</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✏️</span>
                  <span><strong>Right to Rectification:</strong> Correct inaccurate or incomplete personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🗑️</span>
                  <span><strong>Right to Erasure:</strong> Request deletion of your account and all associated data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">⏸️</span>
                  <span><strong>Right to Restrict Processing:</strong> Limit how we process your data in certain circumstances</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📤</span>
                  <span><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🚫</span>
                  <span><strong>Right to Object:</strong> Object to processing based on legitimate interests</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔄</span>
                  <span><strong>Right to Withdraw Consent:</strong> Withdraw consent for optional data processing at any time</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Exercise Your Rights</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Easy Access:</strong> Most rights can be exercised directly through your profile settings. For additional assistance, contact our Privacy Officer.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⚙️</span>
                  <span><strong>Profile Settings:</strong> Access consent management, data export, and account deletion tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📧</span>
                  <span><strong>Email Request:</strong> Contact team.mobileweb@gmail.com for assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📞</span>
                  <span><strong>Phone Support:</strong> Call 647-880-1210 for urgent privacy matters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⏱️</span>
                  <span><strong>Response Time:</strong> We respond to all privacy requests within 30 days (or sooner as required by law)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Special Healthcare Rights</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🏥</span>
                  <span><strong>HIPAA Rights (US Users):</strong> Right to request restrictions on PHI use and disclosure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🍁</span>
                  <span><strong>PHIPA Rights (Ontario Users):</strong> Right to request access to health information custodian records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🇪🇺</span>
                  <span><strong>GDPR Rights (EU Users):</strong> Right to lodge complaints with supervisory authorities</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'jurisdictions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Jurisdictional Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We comply with healthcare privacy laws across multiple jurisdictions to ensure your data is protected regardless of your location.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇺🇸 United States - HIPAA Compliance</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>HIPAA Covered Entity:</strong> We operate as a HIPAA-covered entity for US users, providing full PHI protection.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  <span><strong>Administrative Safeguards:</strong> Access controls, workforce training, incident response procedures</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🏢</span>
                  <span><strong>Physical Safeguards:</strong> Secure cloud infrastructure with physical access controls</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">💻</span>
                  <span><strong>Technical Safeguards:</strong> Encryption, audit logs, access controls, transmission security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📋</span>
                  <span><strong>Business Associate Agreements:</strong> HIPAA-compliant agreements with all service providers</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇨🇦 Canada - PIPEDA & PHIPA Compliance</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>Canadian Data Residency:</strong> All Canadian user data is stored in Canadian data centers to meet residency requirements.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">📍</span>
                  <span><strong>Data Residency:</strong> Canadian data stored in northamerica-northeast1 (Montreal) region</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔟</span>
                  <span><strong>PIPEDA Principles:</strong> Full compliance with all 10 privacy principles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>PHIPA Compliance:</strong> Health Information Custodian procedures for Ontario users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span><strong>Breach Notification:</strong> 60-day notification to Privacy Commissioner as required</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🇪🇺 European Union - GDPR Compliance</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>GDPR Article 9:</strong> Special category health data receives enhanced protection under GDPR requirements.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📋</span>
                  <span><strong>Data Protection Impact Assessment:</strong> Completed DPIA for high-risk health data processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🔒</span>
                  <span><strong>Privacy by Design:</strong> Privacy and data protection built into system architecture</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">⚖️</span>
                  <span><strong>Lawful Basis:</strong> Explicit consent and legitimate interests for healthcare services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🚨</span>
                  <span><strong>Breach Notification:</strong> 72-hour notification to supervisory authorities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🌍</span>
                  <span><strong>International Transfers:</strong> Standard Contractual Clauses for data transfers outside EU</span>
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
                We're committed to transparency and are here to help with any privacy questions or concerns you may have.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Officer</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="space-y-2">
                  <p className="text-blue-800"><strong>Jeremy Brown</strong></p>
                  <p className="text-blue-800"><strong>Privacy Officer & Data Protection Officer</strong></p>
                  <p className="text-blue-800">📧 Email: team.mobileweb@gmail.com</p>
                  <p className="text-blue-800">📞 Phone: 647-880-1210</p>
                  <p className="text-blue-800">🕒 Business Hours: Monday-Friday, 9:00 AM - 5:00 PM EST</p>
                </div>
              </div>
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
                  <span><strong>High Priority Requests:</strong> 4 hours response time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">📋</span>
                  <span><strong>General Privacy Questions:</strong> 24 hours response time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📝</span>
                  <span><strong>Data Subject Rights Requests:</strong> 30 days maximum (often sooner)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Regulatory Authorities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you're not satisfied with our response to your privacy concerns, you have the right to contact the relevant regulatory authority:
              </p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🇺🇸</span>
                  <span><strong>US Users:</strong> Department of Health and Human Services, Office for Civil Rights (OCR)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🇨🇦</span>
                  <span><strong>Canadian Users:</strong> Office of the Privacy Commissioner of Canada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🍁</span>
                  <span><strong>Ontario Users:</strong> Information and Privacy Commissioner of Ontario (IPC)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🇪🇺</span>
                  <span><strong>EU Users:</strong> Your local Data Protection Authority</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Policy Updates</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800 mb-2">
                  <strong>Stay Informed:</strong> We'll notify you of any material changes to this privacy policy.
                </p>
                <ul className="space-y-1 text-yellow-800 text-sm">
                  <li>• Email notification for significant changes</li>
                  <li>• In-app notifications for policy updates</li>
                  <li>• 30-day notice period for material changes</li>
                  <li>• Updated effective date clearly displayed</li>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🔒</div>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                        ? 'bg-blue-100 text-blue-700 font-medium'
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
