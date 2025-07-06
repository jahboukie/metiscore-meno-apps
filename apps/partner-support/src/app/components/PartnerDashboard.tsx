// apps/partner-support/src/app/components/PartnerDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { db, functions } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { RichAnalysisResponse, SentimentAnalysisResponse } from '@metiscore/types';
import { AnalysisReport, Button } from '@metiscore/ui';

interface PartnerDashboardProps {
  primaryUserId: string | null;
}

interface SharedJournalEntry {
  id: string;
  text: string;
  createdAt: Timestamp;
}

export const PartnerDashboard = ({ primaryUserId }: PartnerDashboardProps) => {
  const [sharedEntries, setSharedEntries] = useState<SharedJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RichAnalysisResponse | SentimentAnalysisResponse | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!primaryUserId) {
      setIsLoading(false);
      setSharedEntries([]);
      return;
    }
    const entriesRef = collection(db, 'journal_entries');
    const q = query(
      entriesRef,
      where('userId', '==', primaryUserId),
      where('isShared', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SharedJournalEntry[];
      setSharedEntries(entries);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore query error:", err);
      setError("Data could not be loaded. A database index may be required. Check browser console.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [primaryUserId]);

  const connectToPartner = async () => {
    if (!connectionCode.trim()) return;
    setIsConnecting(true);
    setConnectionError('');
    try {
      const acceptPartnerInvite = httpsCallable(functions, 'acceptPartnerInvite');
      const result = await acceptPartnerInvite({ inviteCode: connectionCode });
      setConnectionCode('');
      console.log('Connection successful:', result.data);
    } catch (err: any) {
      console.error('Connection error:', err);
      setConnectionError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAnalyzeClick = (entry: SharedJournalEntry) => {
    setSelectedEntryId(entry.id);
    setIsAnalyzing(true);
    // TODO: Implement analysis functionality
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({ 
        sentiment: 'positive', 
        confidence: 0.8,
        summary: 'This entry shows positive mood indicators.'
      } as any);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800">Partner Dashboard</h1>
        <p className="mt-2 text-gray-600">
          {primaryUserId ? 'Viewing shared entries from your partner.' : 'Welcome to Partner Support! Connect with your partner to view shared entries.'}
        </p>

        {primaryUserId ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="border-t pt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-3">
              {isLoading && <p>Loading entries...</p>}
              {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}
              {!isLoading && sharedEntries.length === 0 && !error && (
                <p className="text-center text-gray-500 py-8">Your partner has not shared any entries yet.</p>
              )}
              {sharedEntries.map(entry => (
                <div key={entry.id} className={`p-4 rounded-lg transition-all border ${selectedEntryId === entry.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-slate-800 whitespace-pre-wrap">{entry.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-500">{new Date(entry.createdAt.seconds * 1000).toLocaleString()}</p>
                    <Button onClick={() => handleAnalyzeClick(entry)} disabled={isAnalyzing && selectedEntryId === entry.id} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                      {isAnalyzing && selectedEntryId === entry.id ? 'Loading...' : 'Analyze'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky top-24">
              <div className="border rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {isAnalyzing && <p>Analyzing...</p>}
                {!isAnalyzing && analysisResult && <AnalysisReport response={analysisResult} />}
                {!isAnalyzing && !analysisResult && <p className="text-gray-500">Select an entry to analyze.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🤝 Connect with Your Partner</h3>
                <p className="text-blue-700">Enter a 6-digit code from your partner to access shared journal entries and personalized insights.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Available Features</h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li>• Educational content about menopause</li>
                  <li>• Support guides and tips</li>
                  <li>• Community resources</li>
                  <li>• AI-powered assistance</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Card - Show different content based on connection status */}
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 max-w-xl mx-auto">
        {primaryUserId ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-800">Connected to Your Partner</h2>
            </div>
            <p className="text-gray-600 mb-4">You're now receiving shared journal entries and insights from your partner.</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Connection Active</p>
              <p className="text-green-700 text-sm mt-1">Shared content will appear automatically as your partner creates entries.</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Connect to Your Partner</h2>
            <p className="text-gray-600 mb-4">Enter the 6-digit invite code shared with you by your partner to link accounts and view shared journal entries.</p>
            <div className="space-y-4">
              <input
                type="text"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-xl font-mono border-2 border-gray-300 rounded-lg p-4 focus:border-blue-500 focus:outline-none"
                maxLength={6}
              />
              {connectionError && (<p className="text-red-600 text-sm">{connectionError}</p>)}
              <Button
                onClick={connectToPartner}
                disabled={connectionCode.length !== 6 || isConnecting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Your partner can generate this code in their MenoWellness app
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
