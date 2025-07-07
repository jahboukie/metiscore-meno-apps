// apps/partner-support/src/app/components/PartnerDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, functions } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Button } from '@metiscore/ui';
import { useAuth } from './auth-provider';

interface PartnerDashboardProps {
  primaryUserId: string | null;
}

// --- FIX: All hooks and logic are now correctly inside the component function ---
export const PartnerDashboard = ({ primaryUserId }: PartnerDashboardProps) => {
  const { user, setConnectedPartnerId } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [connectionCode, setConnectionCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);

  useEffect(() => {
    if (!primaryUserId) {
      setIsLoading(false);
    }
    // We don't need to fetch sharedEntries here anymore, as the premium page will do it.
    // This component's only job now is to show the connection form if needed.
    setIsLoading(false); 
  }, [primaryUserId]);

  const connectToPartner = async () => {
    if (!connectionCode.trim() || !user) {
      setConnectionError("A 6-digit code is required.");
      return;
    }
    setIsConnecting(true);
    setConnectionError('');
    try {
      const acceptPartnerInvite = httpsCallable(functions, 'acceptPartnerInvite');
      const result: any = await acceptPartnerInvite({ inviteCode: connectionCode });

      if (result.data.success && result.data.primaryUserId) {
        setConnectedPartnerId(result.data.primaryUserId);
        router.push('/premium'); // Redirect to premium page
      } else {
        throw new Error(result.data.message || 'Connection failed.');
      }
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to connect. Please check the code.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
      return <div className="text-center p-10">Loading...</div>
  }

  // If already connected, this component can just render nothing or a success message
  if (primaryUserId) {
      return (
          <div className="bg-white shadow-lg rounded-xl p-8">
              <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-800">Connection Status</h1>
                  <div className="flex items-center space-x-2 text-green-700 font-medium">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Connected</span>
                  </div>
              </div>
              <p className="mt-4 text-gray-600">You are successfully connected to your partner. You can now access premium features.</p>
              <Button onClick={() => router.push('/premium')} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Go to Premium Dashboard
              </Button>
          </div>
      )
  }

  // If not connected, show the educational content and connection form
  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Support Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Access expert guidance, practical strategies, and comprehensive resources to become a confident menopause support partner.</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">🔗 Ready for Personalized Support?</h3>
          <p className="text-gray-600">Connect with your partner to unlock premium features and view their shared journal.</p>
        </div>
        {!showConnectForm ? (
          <div className="text-center">
            <Button onClick={() => setShowConnectForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors">
              Enter Connection Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" value={connectionCode} onChange={(e) => setConnectionCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full text-center text-xl font-mono border-2 border-gray-300 rounded-lg p-4 focus:border-blue-500 focus:outline-none" maxLength={6}/>
            {connectionError && (<p className="text-red-600 text-sm">{connectionError}</p>)}
            <Button onClick={connectToPartner} disabled={connectionCode.length !== 6 || isConnecting} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
              {isConnecting ? 'Connecting...' : 'Connect Now'}
            </Button>
            <p className="text-xs text-gray-500 text-center">Your partner can generate this code in their MenoWellness app</p>
          </div>
        )}
      </div>
    </div>
  );
};
