// apps/partner-support/src/app/components/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onboardUser } from '@/lib/user';
import { User as AppUser, UserConsent } from '@metiscore/types';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { ConsentManager } from '@metiscore/ui';

// --- THE DEFINITIVE INTERFACE ---
interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  userConsent: UserConsent | null;
  loading: boolean;
  hasValidConsent: boolean;
  showConsentModal: boolean;
  setConnectedPartner: (partnerId: string) => void;
  updateConsent: (consent: UserConsent) => Promise<void>;
  withdrawConsent: () => Promise<void>;
  logAction: (action: string, resourceId?: string, details?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [userConsent, setUserConsent] = useState<UserConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const setConnectedPartner = (partnerId: string) => {
    if (appUser) {
      setAppUser({ ...appUser, partnerId });
    }
  };

  const logAction = async (action: string, resourceId?: string, details?: any) => {
    if (!user) return;
    try {
      const auditLogData: any = {
        userId: user.uid, action, timestamp: serverTimestamp(),
        ipAddress: 'unknown', userAgent: navigator.userAgent
      };
      if (resourceId) auditLogData.resourceId = resourceId;
      if (details) auditLogData.details = details;
      await addDoc(collection(db, 'audit_logs'), auditLogData);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const updateConsent = async (consent: UserConsent) => {
    try {
      const consentWithTimestamp = {
        ...consent, consentTimestamp: serverTimestamp(),
        ipAddress: 'unknown', userAgent: navigator.userAgent
      };
      await setDoc(doc(db, 'user_consents', consent.userId), consentWithTimestamp, { merge: true });
      setUserConsent(consent);
      setShowConsentModal(false);
      await logAction('consent_updated', consent.userId);
    } catch (error) {
      console.error('Error updating consent:', error);
      throw error;
    }
  };

  const withdrawConsent = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'user_consents', user.uid));
      setUserConsent(null);
      await logAction('consent_withdrawn', user.uid);
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        await onboardUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setAppUser(userDoc.data() as AppUser);
        
        const consentDoc = await getDoc(doc(db, 'user_consents', user.uid));
        if (consentDoc.exists()) {
          setUserConsent(consentDoc.data() as UserConsent);
        } else {
            setShowConsentModal(true);
        }
        
        setUser(user);
      } else {
        setUser(null);
        setAppUser(null);
        setUserConsent(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hasValidConsent = !!userConsent?.dataProcessing;

  const value = {
    user, appUser, userConsent, loading, hasValidConsent, showConsentModal,
    setConnectedPartner, updateConsent, withdrawConsent, logAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && (
        <>
          {children}
          {showConsentModal && user && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <ConsentManager
                  userId={user.uid}
                  onConsentGiven={updateConsent}
                  onConsentWithdrawn={() => setShowConsentModal(false)}
                  initialConsent={userConsent}
                />
              </div>
            </div>
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
