'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth-provider';
import { db, functions } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button, UserDataManager } from '@metiscore/ui';
import { UserConsent } from '@metiscore/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Consent state - each field can be individually controlled
  const [consent, setConsent] = useState<Partial<UserConsent>>({
    dataProcessing: false,
    sentimentAnalysis: false,
    anonymizedLicensing: false,
    researchParticipation: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<'US' | 'CA' | 'EU' | 'OTHER'>('US');

  // Load existing consent on mount
  useEffect(() => {
    const loadUserConsent = async () => {
      if (!user) return;
      
      try {
        const consentDoc = await getDoc(doc(db, 'user_consents', user.uid));
        if (consentDoc.exists()) {
          const existingConsent = consentDoc.data() as UserConsent;
          setConsent({
            dataProcessing: existingConsent.dataProcessing || false,
            sentimentAnalysis: existingConsent.sentimentAnalysis || false,
            anonymizedLicensing: existingConsent.anonymizedLicensing || false,
            researchParticipation: existingConsent.researchParticipation || false,
          });
          setJurisdiction(existingConsent.jurisdiction || 'US');
        }
      } catch (error) {
        console.error('Error loading consent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserConsent();
  }, [user]);

  // Handle individual consent toggle
  const handleConsentToggle = (field: keyof UserConsent, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save consent changes
  const handleSaveConsent = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const fullConsent: UserConsent = {
        userId: user.uid,
        dataProcessing: consent.dataProcessing || false,
        sentimentAnalysis: consent.sentimentAnalysis || false,
        anonymizedLicensing: consent.anonymizedLicensing || false,
        researchParticipation: consent.researchParticipation || false,
        jurisdiction,
        version: '1.0',
        consentTimestamp: new Date(),
        ipAddress: '0.0.0.0', // Client-side doesn't have real IP
        userAgent: navigator.userAgent,
      };

      await setDoc(doc(db, 'user_consents', user.uid), {
        ...fullConsent,
        consentTimestamp: serverTimestamp(),
      });

      setSaveMessage('✅ Consent preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving consent:', error);
      setSaveMessage('❌ Error saving preferences. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Get jurisdiction-specific text
  const getJurisdictionText = () => {
    switch (jurisdiction) {
      case 'EU':
        return {
          title: 'Data Processing Consent (GDPR)',
          subtitle: 'In accordance with the General Data Protection Regulation (GDPR)',
        };
      case 'CA':
        return {
          title: 'Privacy Consent (PIPEDA)',
          subtitle: 'In accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA)',
        };
      case 'US':
        return {
          title: 'Health Information Consent (HIPAA)',
          subtitle: 'In accordance with the Health Insurance Portability and Accountability Act (HIPAA)',
        };
      default:
        return {
          title: 'Data Processing Consent',
          subtitle: 'We respect your privacy and data protection rights',
        };
    }
  };

  const jurisdictionText = getJurisdictionText();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to access your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🛡️</div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ textShadow: '1px 1px 3px rgba(255,255,255,0.5)' }}>
              Partner Privacy & Support
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/privacy-policy')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              📋 Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="p-3 bg-white shadow-sm rounded-lg text-gray-600 hover:bg-gray-50 transition-colors border"
              aria-label="Back to dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* User Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Account</h2>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🤝</span>
            </div>
            <div>
              <p className="text-xl font-medium text-gray-800 mb-1">{user.displayName || 'Welcome Partner!'}</p>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block">
                Support Partner • Protected by {jurisdiction === 'US' ? 'HIPAA' : jurisdiction === 'CA' ? 'PIPEDA' : 'GDPR'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-8 p-6 rounded-xl shadow-lg ${
            saveMessage.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">{saveMessage.includes('✅') ? '🤝' : '⚠️'}</div>
              <p className="text-lg font-medium">{saveMessage}</p>
            </div>
          </div>
        )}

        {/* Consent Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">🔒</div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {jurisdictionText.title}
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed bg-blue-50 p-4 rounded-lg">
              {jurisdictionText.subtitle}
            </p>
            <p className="text-gray-500 mt-3 text-sm">
              As a support partner, you have access to shared wellness data to better support your loved one. 
              Each setting below can be customized to your comfort level.
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Processing */}
            <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xl">📊</div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Data Processing <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">*Required</span>
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    I consent to the processing of shared wellness data to provide personalized support guidance and relationship insights.
                  </p>
                </div>
                <div className="flex space-x-6 ml-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="dataProcessing"
                      checked={consent.dataProcessing === true}
                      onChange={() => handleConsentToggle('dataProcessing', true)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-green-700">On</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="dataProcessing"
                      checked={consent.dataProcessing === false}
                      onChange={() => handleConsentToggle('dataProcessing', false)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-red-700">Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xl">🧠</div>
                    <h3 className="text-lg font-semibold text-gray-800">AI-Powered Support Insights</h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    I consent to AI analysis of shared journal entries to receive personalized support recommendations and communication guidance.
                  </p>
                </div>
                <div className="flex space-x-6 ml-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sentimentAnalysis"
                      checked={consent.sentimentAnalysis === true}
                      onChange={() => handleConsentToggle('sentimentAnalysis', true)}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-green-700">On</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sentimentAnalysis"
                      checked={consent.sentimentAnalysis === false}
                      onChange={() => handleConsentToggle('sentimentAnalysis', false)}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-red-700">Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Anonymized Data Licensing */}
            <div className="border border-green-200 rounded-xl p-6 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xl">🌍</div>
                    <h3 className="text-lg font-semibold text-gray-800">Anonymized Research Contribution</h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    I consent to contributing anonymized support interaction data to advance menopause care and partner support research.
                  </p>
                </div>
                <div className="flex space-x-6 ml-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="anonymizedLicensing"
                      checked={consent.anonymizedLicensing === true}
                      onChange={() => handleConsentToggle('anonymizedLicensing', true)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-green-700">On</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="anonymizedLicensing"
                      checked={consent.anonymizedLicensing === false}
                      onChange={() => handleConsentToggle('anonymizedLicensing', false)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-red-700">Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Research Participation */}
            <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xl">🔬</div>
                    <h3 className="text-lg font-semibold text-gray-800">Partner Support Research</h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    I consent to participate in anonymous studies focused on improving partner support strategies and relationship wellness.
                  </p>
                </div>
                <div className="flex space-x-6 ml-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="researchParticipation"
                      checked={consent.researchParticipation === true}
                      onChange={() => handleConsentToggle('researchParticipation', true)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-green-700">On</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="researchParticipation"
                      checked={consent.researchParticipation === false}
                      onChange={() => handleConsentToggle('researchParticipation', false)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-base font-medium text-red-700">Off</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Partner-Specific Rights */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">🤝</div>
              <h4 className="text-lg font-semibold text-blue-900">Your Partner Rights</h4>
            </div>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">✓</span>
                <span>Access to shared wellness data only with explicit permission</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">✓</span>
                <span>Right to disconnect from partner data at any time</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">✓</span>
                <span>Right to delete your support interaction history</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">✓</span>
                <span>Right to export your learning progress and preferences</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">✓</span>
                <span>Right to withdraw consent and maintain support access</span>
              </li>
            </ul>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConsent}
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                '🤝 Save Preferences'
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-600 mt-6 p-4 bg-gray-50 rounded-lg">
            🤝 <strong>Note:</strong> Data Processing consent is required for partner support functionality. 
            Optional consents help us provide better guidance and advance relationship wellness research. 
            You can change these settings anytime.
          </p>
        </div>

        {/* Encryption Key Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">🔐</div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Partner Encryption Management
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed bg-blue-50 p-4 rounded-lg">
              Manage your encryption keys for secure communication and shared data access. 
              Your keys ensure that your partner interactions remain private and secure.
            </p>
          </div>

          {/* Simple KMS Status Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-3xl">🔒</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-lg mb-2">
                  Local Encryption Active
                </h4>
                <p className="text-blue-700 mb-4">
                  Your data is encrypted using local encryption keys stored securely in your browser.
                  This provides good security for partner communication and shared data access.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm font-medium text-blue-900">Security Level</div>
                    <div className="text-blue-700">Browser Protected</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm font-medium text-blue-900">Key Storage</div>
                    <div className="text-blue-700">Local Device</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    ✅ AES-256 Encryption
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    ✅ Local Storage
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    ✅ Partner Privacy
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Security Information</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• All shared data is encrypted both at rest and in transit</p>
              <p>• Encryption keys are never transmitted or stored in plain text</p>
              <p>• Web Crypto API provides cryptographic operations</p>
              <p>• Partner communications are end-to-end encrypted</p>
            </div>
          </div>
        </div>

        {/* User Data Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">🛡️</div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Data Rights
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed bg-blue-50 p-4 rounded-lg">
              As a support partner, you have the right to access, export, and delete your personal data 
              and interaction history in compliance with healthcare privacy regulations.
            </p>
          </div>

          <UserDataManager
            userId={user.uid}
            functions={functions}
            onExportComplete={(exportData) => {
              console.log('Partner data export completed:', exportData.export_info);
            }}
            onDeleteComplete={() => {
              // Redirect to home page after deletion request
              router.push('/');
            }}
          />
        </div>
      </main>
    </div>
  );
}
