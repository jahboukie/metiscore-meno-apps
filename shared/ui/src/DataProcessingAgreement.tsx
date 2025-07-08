// Data Processing Agreement component for GDPR Article 28 compliance
'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface DataProcessingAgreementProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
  jurisdiction: 'US' | 'CA' | 'EU' | 'OTHER';
}

export const DataProcessingAgreement: React.FC<DataProcessingAgreementProps> = ({
  onAccept,
  onDecline,
  showActions = true,
  jurisdiction
}) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'definitions', title: 'Definitions', icon: '📖' },
    { id: 'processing', title: 'Data Processing', icon: '⚙️' },
    { id: 'security', title: 'Security Measures', icon: '🔒' },
    { id: 'transfers', title: 'Data Transfers', icon: '🌍' },
    { id: 'rights', title: 'Data Subject Rights', icon: '⚖️' },
    { id: 'breach', title: 'Breach Notification', icon: '🚨' },
    { id: 'audit', title: 'Audit & Compliance', icon: '📊' },
  ];

  const getJurisdictionSpecificContent = () => {
    switch (jurisdiction) {
      case 'EU':
        return {
          title: 'GDPR Data Processing Agreement',
          subtitle: 'Article 28 Compliance for EU Data Subjects',
          lawReference: 'General Data Protection Regulation (GDPR) Article 28',
          authority: 'European Data Protection Authorities'
        };
      case 'CA':
        return {
          title: 'PIPEDA/PHIPA Data Processing Agreement',
          subtitle: 'Canadian Privacy Law Compliance',
          lawReference: 'Personal Information Protection and Electronic Documents Act (PIPEDA) & Personal Health Information Protection Act (PHIPA)',
          authority: 'Office of the Privacy Commissioner of Canada'
        };
      case 'US':
        return {
          title: 'HIPAA Business Associate Agreement',
          subtitle: 'US Healthcare Privacy Compliance',
          lawReference: 'Health Insurance Portability and Accountability Act (HIPAA)',
          authority: 'Department of Health and Human Services'
        };
      default:
        return {
          title: 'Data Processing Agreement',
          subtitle: 'International Privacy Compliance',
          lawReference: 'Applicable Privacy Laws',
          authority: 'Relevant Privacy Authorities'
        };
    }
  };

  const jurisdictionContent = getJurisdictionSpecificContent();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{jurisdictionContent.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Effective Date:</strong> January 8, 2025<br />
                <strong>Legal Basis:</strong> {jurisdictionContent.lawReference}
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>{jurisdictionContent.subtitle}</strong><br />
                  This agreement governs the processing of personal data in accordance with applicable privacy laws.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Parties to this Agreement</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Controller</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>You (Data Subject)</strong><br />
                    The individual whose personal health information is being processed
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Processor</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>MenoWellness</strong><br />
                    Jeremy Brown, Privacy Officer<br />
                    Email: team.mobileweb@gmail.com<br />
                    Phone: 647-880-1210
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Purposes</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Wellness Tracking:</strong> Processing health data for menopause wellness management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Secure Storage:</strong> Encrypted storage of personal health information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Partner Sharing:</strong> Controlled sharing with authorized partners (with explicit consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Research Support:</strong> Anonymized data for menopause research (with explicit consent)</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'definitions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Definitions</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The following terms have specific meanings within this Data Processing Agreement:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Personal Data</h4>
                <p className="text-blue-800 text-sm">
                  Any information relating to an identified or identifiable natural person, including health information, contact details, and usage data.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Personal Health Information (PHI)</h4>
                <p className="text-green-800 text-sm">
                  Health information about an identifiable individual, including menopause symptoms, wellness data, journal entries, and related health metrics.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Processing</h4>
                <p className="text-purple-800 text-sm">
                  Any operation performed on personal data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, dissemination, restriction, erasure, or destruction.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Data Controller</h4>
                <p className="text-yellow-800 text-sm">
                  The natural person who determines the purposes and means of processing personal data. In this case, you (the user) are the controller of your health data.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Data Processor</h4>
                <p className="text-red-800 text-sm">
                  The natural or legal person who processes personal data on behalf of the controller. MenoWellness acts as a processor for your health data.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Data Subject</h4>
                <p className="text-gray-800 text-sm">
                  The identified or identifiable natural person to whom personal data relates. This is you, the user of our services.
                </p>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Processing Details</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This section outlines the specific details of how your personal data is processed.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Categories of Data Subjects</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👤</span>
                  <span><strong>Primary Users:</strong> Individuals experiencing menopause using wellness tracking services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span><strong>Partner Users:</strong> Trusted partners, family members, or friends with authorized access to shared information</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Categories of Personal Data</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🏥</span>
                  <span><strong>Health Data:</strong> Menopause symptoms, wellness metrics, mood tracking, journal entries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">📧</span>
                  <span><strong>Contact Data:</strong> Email address, display name, user preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">💻</span>
                  <span><strong>Technical Data:</strong> Device information, usage analytics, security logs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔗</span>
                  <span><strong>Relationship Data:</strong> Partner connections, sharing preferences, consent records</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Operations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Collection & Storage</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Encrypted data collection</li>
                    <li>• Secure cloud storage</li>
                    <li>• Automated backups</li>
                    <li>• Data retention management</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Analysis & Insights</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Wellness pattern analysis</li>
                    <li>• Sentiment analysis (optional)</li>
                    <li>• Progress tracking</li>
                    <li>• Personalized insights</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Sharing & Access</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Controlled partner sharing</li>
                    <li>• Data export functionality</li>
                    <li>• Research data anonymization</li>
                    <li>• Audit trail maintenance</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Security & Compliance</h4>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Access control enforcement</li>
                    <li>• Security monitoring</li>
                    <li>• Compliance reporting</li>
                    <li>• Incident response</li>
                  </ul>
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
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Agreement Sections</h3>
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
            
            {showActions && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    By accepting, you agree to the terms of this Data Processing Agreement.
                  </p>
                  <div className="flex space-x-3">
                    {onDecline && (
                      <Button
                        onClick={onDecline}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Decline
                      </Button>
                    )}
                    {onAccept && (
                      <Button
                        onClick={onAccept}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Accept Agreement
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
