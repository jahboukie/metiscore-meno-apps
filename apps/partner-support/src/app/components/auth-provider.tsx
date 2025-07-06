// packages/apps/partner-support/src/app/components/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onboardUser } from '@/lib/user';
import { UserConsent, AuditLog } from '@metiscore/types';
import { ConsentManager, SecurityAuthProvider } from '@metiscore/ui';

interface AuthContextType {
  user: User | null;
  userConsent: UserConsent | null;
  loading: boolean;
  hasValidConsent: boolean;
  showConsentModal: boolean;
  updateConsent: (consent: UserConsent) => Promise<void>;
  withdrawConsent: () => Promise<void>;
  logAction: (action: string, resourceId?: string, details?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userConsent, setUserConsent] = useState<UserConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Load user consent from Firestore
  const loadUserConsent = async (userId: string) => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const consentDoc = await getDoc(doc(db, 'user_consents', userId));
      
      if (consentDoc.exists()) {
        const consentData = consentDoc.data() as UserConsent;
        setUserConsent(consentData);
        return consentData;
      }
      return null;
    } catch (error) {
      console.error('Error loading user consent:', error);
      return null;
    }
  };

  // Update user consent
  const updateConsent = async (consent: UserConsent) => {
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const consentWithTimestamp = {
        ...consent,
        consentTimestamp: serverTimestamp(),
        ipAddress: 'unknown', // Would be set by backend in production
        userAgent: navigator.userAgent
      };

      await setDoc(doc(db, 'user_consents', consent.userId), consentWithTimestamp);
      setUserConsent(consent);
      setShowConsentModal(false);
      
      // Log consent action
      await logAction('consent_updated', consent.userId, { consentVersion: consent.version });
    } catch (error) {
      console.error('Error updating consent:', error);
      throw error;
    }
  };

  // Withdraw consent
  const withdrawConsent = async () => {
    if (!user) return;
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'user_consents', user.uid));
      setUserConsent(null);
      
      // Log withdrawal
      await logAction('consent_withdrawn', user.uid);
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  };

  // Log audit actions
  const logAction = async (action: string, resourceId?: string, details?: any) => {
    if (!user) return;
    
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Create audit log object and filter out undefined values
      const auditLogData: any = {
        userId: user.uid,
        action,
        timestamp: serverTimestamp(),
        ipAddress: 'unknown', // Would be set by backend in production
        userAgent: navigator.userAgent,
        resourceType: 'partner_support'
      };

      // Only add optional fields if they have values
      if (resourceId !== undefined) {
        auditLogData.resourceId = resourceId;
      }
      if (details !== undefined) {
        auditLogData.details = details;
      }

      await addDoc(collection(db, 'audit_logs'), auditLogData);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Onboard the partner user
        await onboardUser(user);
        
        // Load existing consent
        const existingConsent = await loadUserConsent(user.uid);
        
        // Show consent modal if no consent exists
        if (!existingConsent) {
          setShowConsentModal(true);
        }
        
        // Log sign-in action
        await logAction('user_signed_in', user.uid);
      } else {
        setUserConsent(null);
        setShowConsentModal(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const hasValidConsent = userConsent !== null && (
    userConsent.dataProcessing ||
    userConsent.sentimentAnalysis ||
    userConsent.anonymizedLicensing ||
    userConsent.researchParticipation
  );

  const value = {
    user,
    userConsent,
    loading,
    hasValidConsent,
    showConsentModal,
    updateConsent,
    withdrawConsent,
    logAction
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && (
        <>
          {children}
          {/* Consent Modal */}
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
