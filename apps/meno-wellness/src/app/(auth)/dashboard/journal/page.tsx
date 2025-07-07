'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/auth-provider';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Journal } from '@metiscore/ui';
import { JournalEntry, EncryptedData } from '@metiscore/types';

export default function JournalPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load journal entries
  useEffect(() => {
    if (!user) {
      setJournalEntries([]);
      return;
    }
    
    const q = query(
      collection(db, 'journal_entries'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as JournalEntry[];
      setJournalEntries(entries);
    }, (error) => {
      console.error("Journal query failed:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Save new journal entry with encryption
  const handleSaveEntry = async (text: string, isShared: boolean, encryptedText?: EncryptedData) => {
    if (!user || !text.trim()) return;
    
    setIsSaving(true);
    
    try {
      const entryData: any = {
        userId: user.uid,
        text: encryptedText ? '[ENCRYPTED]' : text.trim(), // Store placeholder if encrypted
        isShared,
        isEncrypted: !!encryptedText,
        createdAt: serverTimestamp(),
        appOrigin: 'meno-wellness',
        analysis: {}
      };

      // Add encrypted text if encryption is enabled
      if (encryptedText) {
        entryData.encryptedText = encryptedText;
      }

      await addDoc(collection(db, 'journal_entries'), entryData);
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle analysis click
  const handleAnalyzeClick = (text: string) => {
    console.log('Analyzing text:', text);
    // Future: Implement sentiment analysis
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-300 to-green-300 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-white text-xl font-semibold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
            Please sign in to access your journal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-300 to-green-300 px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📝</div>
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
              My Encrypted Journal
            </h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors border border-white/20"
            aria-label="Back to dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-white/90 mt-2 text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
          🔒 End-to-end encrypted space for your thoughts, feelings, and reflections
        </p>
      </div>

      {/* Main Journal Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <Journal
            entries={journalEntries}
            isSaving={isSaving}
            userId={user.uid}
            onSaveEntry={handleSaveEntry}
            onAnalyzeClick={handleAnalyzeClick}
            enableEncryption={true}
          />
        </div>
      </div>
    </div>
  );
}