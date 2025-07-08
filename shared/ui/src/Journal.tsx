// packages/shared/ui/src/Journal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { SecurityUtils } from './security-utils';
import { EncryptedData } from '@metiscore/types';

// Remove local interface and use the one from @metiscore/types
import { JournalEntry as JournalEntryType } from '@metiscore/types';

interface JournalProps {
  entries: JournalEntryType[];
  isSaving: boolean;
  userId: string;
  onSaveEntry: (text: string, isShared: boolean, encryptedText?: EncryptedData) => Promise<void>;
  onAnalyzeClick: (text: string) => void;
  enableEncryption?: boolean;
}

export const Journal = ({ 
  entries, 
  isSaving, 
  userId, 
  onSaveEntry, 
  onAnalyzeClick, 
  enableEncryption = true 
}: JournalProps) => {
  const [newEntryText, setNewEntryText] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [decryptedEntries, setDecryptedEntries] = useState<JournalEntryType[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Initialize encryption key
  useEffect(() => {
    if (enableEncryption && userId) {
      SecurityUtils.getUserEncryptionKey(userId)
        .then(key => {
          setEncryptionKey(key);
        })
        .catch(error => {
          console.error('Failed to initialize encryption key:', error);
        });
    }
  }, [userId, enableEncryption]);

  // Decrypt entries when they change
  useEffect(() => {
    if (enableEncryption && encryptionKey && entries.length > 0) {
      setIsDecrypting(true);
      decryptEntries(entries, encryptionKey)
        .then(decrypted => {
          setDecryptedEntries(decrypted);
        })
        .catch(error => {
          console.error('Failed to decrypt entries:', error);
          setDecryptedEntries(entries);
        })
        .finally(() => {
          setIsDecrypting(false);
        });
    } else {
      setDecryptedEntries(entries);
    }
  }, [entries, encryptionKey, enableEncryption]);

  // Decrypt journal entries
  const decryptEntries = async (entries: JournalEntryType[], key: CryptoKey): Promise<JournalEntryType[]> => {
    const decryptedEntries = await Promise.all(
      entries.map(async (entry) => {
        if (entry.isEncrypted && entry.encryptedText) {
          try {
            const decryptedText = await SecurityUtils.decryptData(entry.encryptedText, key);
            return { ...entry, text: decryptedText };
          } catch (error) {
            console.error('Failed to decrypt entry:', error);
            return { ...entry, text: '[Decryption failed]' };
          }
        }
        return entry;
      })
    );
    return decryptedEntries;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enableEncryption && encryptionKey) {
      try {
        const encryptedData = await SecurityUtils.encryptData(newEntryText, encryptionKey);
        await onSaveEntry(newEntryText, isShared, encryptedData);
      } catch (error) {
        console.error('Failed to encrypt journal entry:', error);
        await onSaveEntry(newEntryText, isShared);
      }
    } else {
      await onSaveEntry(newEntryText, isShared);
    }
    
    setNewEntryText('');
    setIsShared(false);
  };

  return (
    <div>
      <form onSubmit={handleSave} className="mb-6">
        <div className="relative">
          <textarea
            value={newEntryText}
            onChange={(e) => setNewEntryText(e.target.value)}
            placeholder="How are you feeling today?"
            className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-32"
            disabled={isSaving}
          />
          {enableEncryption && (
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                🔒 Encrypted
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-slate-700">Share with partner</span>
            </label>
            {enableEncryption && (
              <span className="text-xs text-slate-500">
                End-to-end encrypted
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSaving || !newEntryText.trim() || (enableEncryption && !encryptionKey)}
            className="rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>

      <h3 className="text-xl font-bold text-slate-800 mb-4 pt-4 border-t">Past Entries</h3>
      {isDecrypting && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-600">Decrypting entries...</span>
          </div>
        </div>
      )}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {decryptedEntries.length > 0 ? decryptedEntries.map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-slate-800 whitespace-pre-wrap">{entry.text}</p>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-slate-500">
                {entry.createdAt ? entry.createdAt.toLocaleString() : 'Just now'}
              </p>
              <div className="flex items-center space-x-2">
                {entry.isEncrypted && enableEncryption && (
                  <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">
                    🔒 Encrypted
                  </span>
                )}
                {entry.isShared && <span className="text-xs bg-sky-100 text-sky-700 font-medium px-2 py-1 rounded-full">Shared</span>}
                <Button
                  onClick={() => onAnalyzeClick(entry.text)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-slate-500 text-center py-4">No past entries yet.</p>
        )}
      </div>
    </div>
  );
};
