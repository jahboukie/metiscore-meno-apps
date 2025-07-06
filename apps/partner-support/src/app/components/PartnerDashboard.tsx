// apps/partner-support/src/app/components/PartnerDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { db, functions } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { RichAnalysisResponse, SentimentAnalysisResponse } from '@metiscore/types';
import { AnalysisReport, Button } from '@metiscore/ui';
import { useAuth } from './auth-provider';

interface PartnerDashboardProps {
  primaryUserId: string | null;
}

interface SharedJournalEntry {
  id: string;
  text: string;
  createdAt: Timestamp;
}

export const PartnerDashboard = ({ primaryUserId }: PartnerDashboardProps) => {
  const { userConsent, hasValidConsent, logAction } = useAuth();
  
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
    if (!primaryUserId || !hasValidConsent) {
      setIsLoading(false);
      setSharedEntries([]);
      return;
    }

    // Check if user has consent for data processing
    if (!userConsent?.dataProcessing) {
      setIsLoading(false);
      setError("Data processing consent is required to view shared entries.");
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
      
      // Log data access
      logAction('shared_entries_viewed', primaryUserId, { entriesCount: entries.length });
    }, (err) => {
      console.error("Firestore query error:", err);
      setError("Data could not be loaded. A database index may be required. Check browser console.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [primaryUserId, hasValidConsent, userConsent, logAction]);

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
    // Check consent for sentiment analysis
    if (!userConsent?.sentimentAnalysis) {
      setError("Sentiment analysis consent is required for this feature.");
      return;
    }

    setSelectedEntryId(entry.id);
    setIsAnalyzing(true);
    
    // Log analysis action
    logAction('entry_analysis_requested', entry.id, { entryUserId: primaryUserId });
    
    // TODO: Implement actual analysis functionality
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({ 
        sentiment: 'positive', 
        confidence: 0.8,
        summary: 'This entry shows positive mood indicators.'
      } as any);
      
      // Log analysis completion
      logAction('entry_analysis_completed', entry.id);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800">Partner Dashboard</h1>
        <p className="mt-2 text-gray-600">
          {primaryUserId ? 'Viewing shared entries from your partner.' : 'Welcome to Partner Support! Connect with your partner to view shared entries.'}
        </p>

        {/* Consent Status Indicator */}
        {!hasValidConsent && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-amber-600 mr-3">⚠️</div>
              <div>
                <h4 className="text-amber-800 font-semibold">Privacy Consent Required</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Please review and accept our privacy policy to access all features. Some functionality may be limited until consent is provided.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {hasValidConsent && userConsent && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-sm">
              <div className="text-green-600 mr-2">✓</div>
              <span className="text-green-800">
                Privacy settings active: 
                {userConsent.dataProcessing && ' Data Processing'}
                {userConsent.sentimentAnalysis && ' • AI Analysis'}
                {userConsent.researchParticipation && ' • Research Participation'}
              </span>
            </div>
          </div>
        )}

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
          <div className="mt-6">
            {/* Welcome Section for Non-Connected Users */}
            <div className="text-center py-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your Support Journey
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Access expert guidance, practical strategies, and comprehensive resources to become 
                a confident menopause support partner - no connection required.
              </p>
            </div>

            {/* Educational Content Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/learn'}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">🎓</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Center</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive guides covering menopause basics, symptoms, and support strategies.
                  </p>
                  <div className="text-blue-600 font-medium text-sm">Explore Topics →</div>
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/learn/faq'}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">❓</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Quick answers to the most common questions about supporting someone through menopause.
                  </p>
                  <div className="text-blue-600 font-medium text-sm">Browse FAQ →</div>
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/learn/support-guide'}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Guide</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Step-by-step strategies for providing emotional and practical support.
                  </p>
                  <div className="text-blue-600 font-medium text-sm">View Guide →</div>
                </div>
              </div>
            </div>

            {/* Quick Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Today's Quick Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Communication Tip</h4>
                  <p className="text-gray-700 text-sm">
                    Instead of "Are you okay?" try "I can see you're dealing with a lot. What would help you feel better right now?"
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Practical Support</h4>
                  <p className="text-gray-700 text-sm">
                    Keep the house cooler than usual and have a portable fan ready. Small comfort measures make a big difference.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🔗 Ready for Personalized Support?
                </h3>
                <p className="text-gray-600">
                  Connect with your partner to receive personalized insights based on their actual experiences and mood patterns.
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">With Partner Connection:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• View shared journal entries and mood logs</li>
                    <li>• Get AI-powered analysis and insights</li>
                    <li>• Receive personalized support recommendations</li>
                    <li>• Track patterns and triggers together</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-4">
                    Ask your partner to generate a connection code in their MenoWellness app
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                    Enter Connection Code
                  </button>
                </div>
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
