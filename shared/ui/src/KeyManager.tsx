'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { SecurityUtils } from './security-utils';

interface KeyManagerProps {
  userId: string;
  onKeyRotated?: () => void;
  onBackupCreated?: (backup: string) => void;
  onKeyRestored?: () => void;
}

export const KeyManager: React.FC<KeyManagerProps> = ({
  userId,
  onKeyRotated,
  onBackupCreated,
  onKeyRestored
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rotationHistory, setRotationHistory] = useState<any[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [backupString, setBackupString] = useState('');
  const [restoreData, setRestoreData] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadRotationHistory();
  }, [userId]);

  const loadRotationHistory = async () => {
    try {
      const history = await SecurityUtils.getKeyRotationHistory(userId);
      setRotationHistory(history);
    } catch (error) {
      console.error('Failed to load rotation history:', error);
    }
  };

  const handleKeyRotation = async () => {
    setIsLoading(true);
    try {
      await SecurityUtils.rotateUserKey(userId);
      await loadRotationHistory();
      setMessage({ type: 'success', text: 'Encryption key rotated successfully!' });
      onKeyRotated?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to rotate encryption key' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter a backup password' });
      return;
    }

    setIsLoading(true);
    try {
      const backup = await SecurityUtils.createKeyBackup(userId, backupPassword);
      setBackupString(backup);
      setMessage({ type: 'success', text: 'Key backup created successfully!' });
      onBackupCreated?.(backup);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create key backup' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreKey = async () => {
    if (!restoreData.trim() || !restorePassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter both backup data and password' });
      return;
    }

    setIsLoading(true);
    try {
      await SecurityUtils.restoreKeyFromBackup(userId, restoreData, restorePassword);
      setMessage({ type: 'success', text: 'Encryption key restored successfully!' });
      setShowRestoreDialog(false);
      setRestoreData('');
      setRestorePassword('');
      onKeyRestored?.();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore key - check your backup data and password' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (message) clearMessage();
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🔐</div>
        <h3 className="text-xl font-semibold text-gray-800">Encryption Key Management</h3>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="text-lg mr-2">
              {message.type === 'success' ? '✅' : '❌'}
            </div>
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Key Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Rotation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-lg">🔄</div>
            <h4 className="font-semibold text-blue-900">Rotate Key</h4>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Generate a new encryption key for enhanced security
          </p>
          <Button
            onClick={handleKeyRotation}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 text-sm"
          >
            {isLoading ? 'Rotating...' : 'Rotate Key'}
          </Button>
        </div>

        {/* Key Backup */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-lg">💾</div>
            <h4 className="font-semibold text-purple-900">Backup Key</h4>
          </div>
          <p className="text-sm text-purple-700 mb-4">
            Create an encrypted backup of your encryption key
          </p>
          <Button
            onClick={() => setShowBackupDialog(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-md px-3 py-2 text-sm"
          >
            Create Backup
          </Button>
        </div>

        {/* Key Restore */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-lg">📥</div>
            <h4 className="font-semibold text-orange-900">Restore Key</h4>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            Restore your encryption key from a backup
          </p>
          <Button
            onClick={() => setShowRestoreDialog(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2 text-sm"
          >
            Restore Key
          </Button>
        </div>
      </div>

      {/* Rotation History */}
      {rotationHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Key Rotation History</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {rotationHistory.slice(0, 5).map((rotation, index) => (
              <div key={rotation.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Rotation #{rotationHistory.length - index}
                </span>
                <span className="text-gray-500">
                  {new Date(rotation.rotatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup Dialog */}
      {showBackupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Create Key Backup</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Password
                </label>
                <input
                  type="password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This password will be needed to restore your key
                </p>
              </div>
              
              {backupString && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Data (Save this securely)
                  </label>
                  <textarea
                    value={backupString}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50"
                    rows={4}
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowBackupDialog(false);
                    setBackupPassword('');
                    setBackupString('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-3 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBackup}
                  disabled={isLoading || !backupPassword.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-3 py-2"
                >
                  {isLoading ? 'Creating...' : 'Create Backup'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      {showRestoreDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Restore Key</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Data
                </label>
                <textarea
                  value={restoreData}
                  onChange={(e) => setRestoreData(e.target.value)}
                  placeholder="Paste your backup data here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Password
                </label>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Enter your backup password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowRestoreDialog(false);
                    setRestoreData('');
                    setRestorePassword('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-3 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestoreKey}
                  disabled={isLoading || !restoreData.trim() || !restorePassword.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-3 py-2"
                >
                  {isLoading ? 'Restoring...' : 'Restore Key'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};