'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { UserConsent, JournalEntry } from '@metiscore/types';
import { getAuth } from "firebase/auth"; // Make sure firebase/auth is imported

// Note: The structure of UserDataExport remains the same, as it's the contract
// between our new backend function and the frontend.
interface UserDataExport {
  // ... (interface remains exactly the same as your original file)
  export_info: { timestamp: string; user_id: string; export_type: 'full_data_export'; jurisdiction: string; version: string; };
  personal_information: { user_id: string; email: string; display_name: string; account_created: string; last_active: string; role: string; partner_id?: string; };
  health_data: { journal_entries: Array<{ id: string; text: string; mood?: string; created_at: string; is_shared: boolean; app_origin: string; sentiment_analysis?: any; }>; mood_tracking: Array<{ date: string; mood: string; notes?: string; is_shared: boolean; }>; };
  privacy_settings: { consent_history: Array<{ data_processing: boolean; sentiment_analysis: boolean; anonymized_licensing: boolean; research_participation: boolean; consent_timestamp: string; ip_address: string; jurisdiction: string; version: string; }>; partner_sharing: { has_partner: boolean; partner_connection_date?: string; shared_entries_count: number; }; };
  usage_statistics: { total_journal_entries: number; total_mood_entries: number; account_age_days: number; last_export_date?: string; };
  audit_logs: Array<{ action: string; timestamp: string; details?: any; }>;
}

interface UserDataManagerProps {
  userId: string;
  onExportComplete?: (exportData: UserDataExport) => void;
  onDeleteComplete?: () => void;
}

export const UserDataManager: React.FC<UserDataManagerProps> = ({
  userId,
  onExportComplete,
  onDeleteComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  /**
   * --- REWRITTEN LOGIC ---
   * This function now calls a single, secure Cloud Function to get the data.
   * All the complex database queries have been moved to the backend, which is more secure
   * and bypasses the need for complex client-side Firestore rules.
   */
  const handleDataExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportStatus('Authenticating and preparing request...');

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User is not authenticated.");
      }

      // Step 1: Get the user's ID token to prove their identity to the backend.
      const idToken = await currentUser.getIdToken();
      setExportProgress(30);
      setExportStatus('Requesting secure data export from server...');

      // Step 2: Call the new 'exportUserData' cloud function with the token.
      // Make sure you create this function in your backend! (Code provided below)
      const response = await fetch('https://exportuserdata-afsh2nntka-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server failed to export data.');
      }
      
      setExportProgress(80);
      setExportStatus('Data received, creating download file...');

      const exportData: UserDataExport = await response.json();

      // Step 3: The rest of the logic to create and download the file is the same.
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `menowellness-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      setExportStatus('Export complete!');
      onExportComplete?.(exportData);

      setTimeout(() => {
        setExportStatus('');
        setExportProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Data export failed:', error);
      setExportStatus(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  }, [userId, onExportComplete]);

  /**
   * --- REWRITTEN LOGIC ---
   * This function now makes a direct, authenticated call to the 'processaccountdeletion'
   * Cloud Function, which handles the secure deletion logic on the backend.
   */
  const handleAccountDeletion = useCallback(async () => {
    if (deleteConfirmationText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User is not authenticated for deletion.");
      }

      // Step 1: Get the user's ID token.
      const idToken = await currentUser.getIdToken();

      // Step 2: Call the 'processaccountdeletion' function with authentication.
      const response = await fetch('https://processaccountdeletion-afsh2nntka-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Account deletion failed on server.');
      }

      alert('Account deletion request submitted. Your account and data will be permanently removed after the verification period.');
      onDeleteComplete?.();

    } catch (error) {
      console.error('Account deletion request failed:', error);
      alert(`Deletion request failed: ${error instanceof Error ? error.message : "Please contact support."}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setDeleteConfirmationText('');
    }
  }, [userId, deleteConfirmationText, onDeleteComplete]);

  // This helper function can be removed if you prefer the backend to log the IP.
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0'; // Fallback IP
    }
  };

  return (
    // The JSX part of your component remains unchanged.
    <div className="space-y-6">
      {/* Data Export Section */}
      <div className="bg-white border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">📊</div>
          <h3 className="text-xl font-semibold text-gray-800">Export Your Data</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Download all your personal data in a structured format. This includes your journal entries, 
          mood data, privacy settings, and account information in compliance with data protection laws.
        </p>
        {isExporting && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">{exportStatus}</span>
                <span className="text-blue-600 text-sm">{exportProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleDataExport}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
          >
            {isExporting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exporting...
              </div>
            ) : (
              '📊 Export My Data'
            )}
          </Button>
          <div className="text-sm text-gray-500">
            <div>• JSON format</div>
            <div>• GDPR & PIPEDA compliant</div>
            <div>• Includes all personal data</div>
          </div>
        </div>
      </div>

      {/* Account Deletion Section */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🗑️</div>
          <h3 className="text-xl font-semibold text-gray-800">Delete Account</h3>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Permanent Action</h4>
          <p className="text-red-700 text-sm">
            This will permanently delete your account and all associated data including:
          </p>
          <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
            <li>All journal entries and mood data</li>
            <li>Personal information and preferences</li>
            <li>Partner connections and shared data</li>
            <li>Privacy settings and consent history</li>
          </ul>
        </div>
        {!showDeleteConfirmation ? (
          <Button
            onClick={() => setShowDeleteConfirmation(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            🗑️ Delete My Account
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handleAccountDeletion}
                disabled={isDeleting || deleteConfirmationText !== 'DELETE MY ACCOUNT'}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Confirm Deletion'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeleteConfirmationText('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
