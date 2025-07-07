import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const auth = getAuth();

// CORS configuration for API calls
const corsConfig = {
  cors: true,
};

/**
 * User onboarding function - CORRECTED to be non-destructive.
 */
export const onboardnewuser = onRequest(corsConfig, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { uid, email, displayName } = req.body;
    if (!uid) {
      res.status(400).json({ error: 'UID is required' });
      return;
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // --- FIX: CHECK IF USER EXISTS BEFORE CREATING ---
    if (!userDoc.exists) {
      // User does not exist, so create them with default values.
      logger.info(`New user detected. Onboarding user: ${uid}`);
      
      const userData = {
        uid,
        email: email || null,
        displayName: displayName || null,
        role: 'primary', // Default role for any new user
        partnerId: null,
        createdAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
      };
      await userRef.set(userData);

      const jurisdiction = detectJurisdiction(req);
      const retentionPeriod = getRetentionPeriod(jurisdiction, 'personal');
      
      await db.collection('data_retention').doc(uid).set({
        userId: uid,
        dataType: 'personal',
        createdAt: FieldValue.serverTimestamp(),
        retentionPeriod,
        jurisdiction,
      });

      await logAuditAction(uid, 'user_onboarded', uid, 'user', {
        email,
        displayName,
        jurisdiction,
      }, req);

      res.status(200).json({ 
        success: true, 
        message: 'New user onboarded successfully',
        userData 
      });

    } else {
      // User already exists, just update their last active time.
      logger.info(`Existing user detected. Updating lastActiveAt for user: ${uid}`);
      await userRef.update({ lastActiveAt: FieldValue.serverTimestamp() });
      res.status(200).json({ 
        success: true, 
        message: 'Existing user activity updated.' 
      });
    }

  } catch (error) {
    logger.error('Onboarding error:', error);
    res.status(500).json({ 
      error: 'Failed to onboard user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


/**
 * Accept partner invite function - Robust version
 */
export const acceptPartnerInvite = onCall(async (request) => {
  const { auth: userAuth, data } = request;
  
  if (!userAuth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to accept an invite.');
  }

  const partnerUid = userAuth.uid;
  const { inviteCode } = data;

  if (!inviteCode) {
    throw new HttpsError('invalid-argument', 'An invite code is required.');
  }

  try {
    const inviteDocRef = db.collection('invites').doc(inviteCode);
    const inviteDoc = await inviteDocRef.get();
    
    if (!inviteDoc.exists) {
      throw new HttpsError('not-found', 'Invalid invite code. Please check the code and try again.');
    }

    const inviteData = inviteDoc.data()!;
    
    if (inviteData.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'This invite has already been used or has expired.');
    }

    if (inviteData.expiresAt.toDate() < new Date()) {
      await inviteDocRef.update({ status: 'expired' });
      throw new HttpsError('failed-precondition', 'This invite has expired.');
    }

    const primaryUserRef = db.collection('users').doc(inviteData.fromUserId);
    const partnerUserRef = db.collection('users').doc(partnerUid);

    const [primaryUserDoc, partnerUserDoc] = await Promise.all([
      primaryUserRef.get(),
      partnerUserRef.get()
    ]);

    if (!primaryUserDoc.exists || !partnerUserDoc.exists) {
      throw new HttpsError('not-found', 'One or both user accounts could not be found.');
    }

    const batch = db.batch();
    
    batch.set(primaryUserRef, {
      partnerId: partnerUid,
      lastActiveAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    batch.set(partnerUserRef, {
      partnerId: inviteData.fromUserId,
      role: 'partner',
      lastActiveAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    batch.update(inviteDocRef, {
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      acceptedBy: partnerUid,
    });

    await batch.commit();

    await Promise.all([
      logAuditAction(inviteData.fromUserId, 'partner_connected', partnerUid, 'user', {
        inviteCode,
        partnerRole: 'partner',
      }),
      logAuditAction(partnerUid, 'partner_accepted_invite', inviteData.fromUserId, 'user', {
        inviteCode,
        primaryRole: 'primary',
      })
    ]);

    return { 
      success: true, 
      message: 'Partner connection established successfully!',
      primaryUserId: inviteData.fromUserId,
      partnerUserId: partnerUid
    };

  } catch (error) {
    logger.error('Accept invite error:', error);
    
    await logAuditAction(partnerUid, 'partner_invite_failed', undefined, 'invite', {
      inviteCode,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An unexpected error occurred while accepting the invite. Please try again.');
  }
});


// --- Helper functions and other exports ---
// This section should be filled in with the complete implementations from the previous step

export const anonymizeUserData = onCall(async (request) => {
  const { auth: userAuth } = request;
  if (!userAuth) throw new HttpsError('unauthenticated', 'User must be authenticated');
  const consentDoc = await db.collection('user_consents').doc(userAuth.uid).get();
  if (!consentDoc.exists || !consentDoc.data()?.researchParticipation) throw new HttpsError('permission-denied', 'Research participation consent required');
  // Full implementation...
  return { success: true };
});

export const cleanupExpiredData = onRequest(async (req, res) => {
  // Full implementation...
  res.status(200).json({ success: true });
});

function detectJurisdiction(req: any): 'US' | 'CA' | 'EU' | 'OTHER' {
  const country = req.get('CF-IPCountry') || req.get('X-Country-Code') || '';
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  if (country === 'US') return 'US';
  if (country === 'CA') return 'CA';
  if (euCountries.includes(country.toUpperCase())) return 'EU';
  return 'OTHER';
}

function getRetentionPeriod(jurisdiction: string, dataType: string): number {
  return 2555;
}

async function logAuditAction(userId: string, action: string, resourceId?: string, resourceType?: string, details?: any, req?: any) {
  try {
    const auditLog: any = {
      userId, action, details: details || {}, timestamp: FieldValue.serverTimestamp(),
      ipAddress: req?.ip || req?.connection?.remoteAddress || '0.0.0.0',
      userAgent: req?.get('User-Agent') || 'Unknown',
    };
    if (resourceId) auditLog.resourceId = resourceId;
    if (resourceType) auditLog.resourceType = resourceType;
    await db.collection('audit_logs').add(auditLog);
  } catch (error) {
    logger.error('Audit logging failed:', { error, userId, action });
  }
}

function generateAnonymousId(originalId: string): string {
  return Buffer.from(originalId).toString('base64').substring(0, 16);
}

function sanitizeText(text: string): string {
  return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
}

function roundToHour(date: Date): Date {
  const rounded = new Date(date);
  rounded.setMinutes(0, 0, 0);
  return rounded;
}

function generateCohortId(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `cohort_${year}_${month}`;
}
