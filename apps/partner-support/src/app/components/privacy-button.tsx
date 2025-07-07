'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { ConsentManager } from '@metiscore/ui';
import { Button } from '@metiscore/ui';

export function PrivacyButton() {
  const { user, userConsent, hasValidConsent, updateConsent } = useAuth();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  if (!user) {
    return null;
  }

  const handleConsentUpdate = async (consent: any) => {
    await updateConsent(consent);
    setShowPrivacyModal(false);
  };

  return (
    <>
      <Button
        onClick={() => setShowPrivacyModal(true)}
        className={`
          rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors
          ${hasValidConsent 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {hasValidConsent ? '🔒' : '⚠️'}
          </span>
          Privacy
        </div>
      </Button>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <ConsentManager
              userId={user.uid}
              onConsentGiven={handleConsentUpdate}
              onConsentWithdrawn={() => setShowPrivacyModal(false)}
              initialConsent={userConsent}
            />
          </div>
        </div>
      )}
    </>
  );
}