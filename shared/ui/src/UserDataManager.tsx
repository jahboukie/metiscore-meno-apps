'use client';

import React, { useState } from 'react';
import { Functions, httpsCallable } from 'firebase/functions';
import { Button } from './Button';

interface UserDataManagerProps {
  userId: string;
  functions?: Functions;
  onExportComplete?: (exportData: any) => void;
  onDeleteComplete?: () => void;
}

interface ExportData {
  export_info: {
    userId: string;
    exportedAt: string;
    collections: string[];
    totalRecords: number;
  };
  user_data: any;
  journal_entries: any[];
  user_consents: any;
  audit_logs: any[];
}

export const UserDataManager: React.FC<UserDataManagerProps> = ({
  userId,
  functions,
  onExportComplete,
  onDeleteComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportData = async () => {
    if (!functions) {
      showMessage('error', 'Firebase Functions not available');
      return;
    }

    setIsExporting(true);
    try {
      const exportUserData = httpsCallable(functions, 'exportUserData');
      const result = await exportUserData({ userId });

      const exportData = result.data as ExportData;

      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully');
      onExportComplete?.(exportData);

    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!functions) {
      showMessage('error', 'Firebase Functions not available');
      return;
    }

    setIsDeleting(true);
    try {
      // First create a deletion request
      const requestDeletion = httpsCallable(functions, 'requestAccountDeletion');
      const result = await requestDeletion({ userId });

      const { requestId } = result.data as { requestId: string };

      // Then process the deletion
      const processAccountDeletion = httpsCallable(functions, 'processAccountDeletion');
      await processAccountDeletion({ requestId });

      showMessage('success', 'Account deletion completed successfully');
      setShowDeleteConfirm(false);

      // Call the completion callback after a short delay
      setTimeout(() => {
        onDeleteComplete?.();
      }, 2000);

    } catch (error) {
      console.error('Deletion failed:', error);
      showMessage('error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Data Management</h3>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Data Export Section */}
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">Export Your Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download a complete copy of all your personal data stored in our system.
          </p>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>

        {/* Account Deletion Section */}
        <div>
          <h4 className="font-medium mb-2 text-red-600">Delete Account</h4>
          <p className="text-sm text-gray-600 mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </Button>
          ) : (
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <p className="text-sm text-red-800 mb-3 font-medium">
                Are you absolutely sure? This will permanently delete your account and all data.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
