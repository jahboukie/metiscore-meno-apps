// apps/partner-support/src/app/premium/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth-provider';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Button } from '@metiscore/ui';

interface SharedJournalEntry {
  id: string;
  text: string;
  createdAt: Timestamp;
  mood?: string;
}

interface PartnerInfo {
  displayName: string;
  email: string;
  lastActiveAt: Timestamp;
}

export default function PremiumPage() {
  const { user, appUser, userConsent, hasValidConsent, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [sharedEntries, setSharedEntries] = useState<SharedJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryUserId = appUser?.partnerId;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (primaryUserId) {
      const fetchPartnerInfo = async () => {
        try {
          const primaryUserDoc = await getDoc(doc(db, 'users', primaryUserId));
          if (primaryUserDoc.exists()) {
            setPartnerInfo(primaryUserDoc.data() as PartnerInfo);
          } else {
            setError("Could not find your partner's information.");
          }
        } catch (err) {
          setError("Failed to load partner information.");
        }
        setIsLoading(false);
      };
      fetchPartnerInfo();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [primaryUserId, authLoading]);

  useEffect(() => {
    if (!primaryUserId) {
        setSharedEntries([]);
        return;
    }

    if(hasValidConsent === false) {
        return; // Don't fetch entries if consent is not given
    }

    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', primaryUserId),
      where('isShared', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSharedEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedJournalEntry)));
    }, (err) => {
      setError("Could not load shared entries. Check permissions.");
    });
    return () => unsubscribe();
  }, [primaryUserId, hasValidConsent]);
  
  const formatDate = (timestamp: Timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'N/A';
  };

  if (authLoading || isLoading) {
    return <div className="text-center p-10">Loading Premium Dashboard...</div>;
  }

  if (!primaryUserId) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Not Connected</h1>
            <p className="text-gray-600 mt-2">Please connect to a partner from the main dashboard to access premium features.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Dashboard</h1>
                  <p className="text-gray-600">Connected insights for {partnerInfo?.displayName || 'your partner'}</p>
              </div>
              <div className="flex items-center space-x-2 text-green-700 font-medium">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected</span>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Connection Details */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Connection Details</h2>
                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Partner Information</h3>
                        <p className="text-lg font-semibold text-gray-800">{partnerInfo?.displayName || 'Loading...'}</p>
                        <p className="text-sm text-gray-600">{partnerInfo?.email || ''}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Active</h3>
                        <p className="text-gray-600">{formatDate(partnerInfo?.lastActiveAt)}</p>
                    </div>
                     <div>
                        <h3 className="text-sm font-medium text-gray-500">Connection Status</h3>
                        <p className="font-semibold text-green-600">Active</p>
                        <p className="text-sm text-gray-600">{sharedEntries.length} shared entries</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Shared Journal */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Shared Journal Entries</h2>
                    <p className="text-sm text-gray-500 mt-1">Insights from your partner's wellness journey.</p>
                </div>

                <div className="p-6">
                    {hasValidConsent === false && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.636-1.1 2.152-1.1 2.788 0l5.88 10.185a1.75 1.75 0 01-1.528 2.616H3.906a1.75 1.75 0 01-1.528-2.616L8.257 3.099zM9 11a1 1 0 112 0 1 1 0 01-2 0zm1-4a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700">
                                        <b>Privacy Consent Required:</b> You must provide consent to view shared journal entries.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {hasValidConsent && error && <div className="text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

                    {hasValidConsent && !error && sharedEntries.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Your partner has not shared any entries yet.</p>
                        </div>
                    )}
                    
                    {hasValidConsent && !error && sharedEntries.length > 0 && (
                         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3">
                            {sharedEntries.map(entry => (
                                <div key={entry.id} className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span>{formatDate(entry.createdAt)}</span>
                                        {entry.mood && <span className="font-medium capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{entry.mood}</span>}
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap">{entry.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
