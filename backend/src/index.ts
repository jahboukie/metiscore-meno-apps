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
 * User onboarding function - Creates user document in Firestore
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

    // Verify the user exists in Firebase Auth
    await auth.getUser(uid);

    // Create user document with security metadata
    const userData = {
      uid,
      email: email || null,
      displayName: displayName || null,
      role: 'primary',
      partnerId: null,
      createdAt: FieldValue.serverTimestamp(),
      lastActiveAt: FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userData, { merge: true });

    // Set up data retention tracking
    const jurisdiction = detectJurisdiction(req);
    const retentionPeriod = getRetentionPeriod(jurisdiction, 'personal');
    
    await db.collection('data_retention').doc(uid).set({
      userId: uid,
      dataType: 'personal',
      createdAt: FieldValue.serverTimestamp(),
      retentionPeriod,
      jurisdiction,
    });

    // Log onboarding action
    await logAuditAction(uid, 'user_onboarded', uid, 'user', {
      email,
      displayName,
      jurisdiction,
    }, req);

    res.status(200).json({ 
      success: true, 
      message: 'User onboarded successfully',
      userData 
    });

  } catch (error) {
    logger.error('Onboarding error:', error);
    res.status(500).json({ 
      error: 'Failed to onboard user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Accept partner invite function - Enhanced with security
 */
export const acceptPartnerInvite = onCall(async (request) => {
  const { data, auth: userAuth } = request;
  
  if (!userAuth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { inviteCode, partnerUid } = data;

  if (!inviteCode || !partnerUid) {
    throw new HttpsError('invalid-argument', 'Invite code and partner UID are required');
  }

  try {
    // Verify invite exists and is valid
    const inviteDoc = await db.collection('invites').doc(inviteCode).get();
    
    if (!inviteDoc.exists) {
      throw new HttpsError('not-found', 'Invalid invite code');
    }

    const inviteData = inviteDoc.data()!;
    
    if (inviteData.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'Invite has already been used or expired');
    }

    if (inviteData.expiresAt.toDate() < new Date()) {
      throw new HttpsError('failed-precondition', 'Invite has expired');
    }

    // Verify both users exist
    const [primaryUserDoc, partnerUserDoc] = await Promise.all([
      db.collection('users').doc(inviteData.fromUserId).get(),
      db.collection('users').doc(partnerUid).get()
    ]);

    if (!primaryUserDoc.exists || !partnerUserDoc.exists) {
      throw new HttpsError('not-found', 'One or both users not found');
    }

    // Update both user documents to link them
    const batch = db.batch();
    
    batch.update(db.collection('users').doc(inviteData.fromUserId), {
      partnerId: partnerUid,
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    
    batch.update(db.collection('users').doc(partnerUid), {
      partnerId: inviteData.fromUserId,
      role: 'partner',
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    
    batch.update(db.collection('invites').doc(inviteCode), {
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      acceptedBy: partnerUid,
    });

    await batch.commit();

    // Log successful partner connection
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
      message: 'Partner connection established successfully',
      primaryUserId: inviteData.fromUserId,
      partnerUserId: partnerUid
    };

  } catch (error) {
    logger.error('Accept invite error:', error);
    
    // Log failed attempt
    await logAuditAction(partnerUid, 'partner_invite_failed', undefined, 'invite', {
      inviteCode,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to accept invite');
  }
});

/**
 * Anonymize data for research purposes
 */
export const anonymizeUserData = onCall(async (request) => {
  const { auth: userAuth } = request;
  
  if (!userAuth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Check user consent for research participation
    const consentDoc = await db.collection('user_consents').doc(userAuth.uid).get();
    
    if (!consentDoc.exists || !consentDoc.data()?.researchParticipation) {
      throw new HttpsError('permission-denied', 'Research participation consent required');
    }

    // Get user's journal entries
    const entriesSnapshot = await db.collection('journal_entries')
      .where('userId', '==', userAuth.uid)
      .get();

    const anonymizedEntries = [];
    
    for (const doc of entriesSnapshot.docs) {
      const entry = doc.data();
      
      // Anonymize the entry
      const anonymized = {
        id: generateAnonymousId(doc.id),
        anonymizedUserId: generateAnonymousId(userAuth.uid),
        anonymizedText: sanitizeText(entry.text),
        sentimentScore: entry.analysis?.sentiment?.score || 0,
        emotionalIntensity: entry.analysis?.emotions?.emotional_intensity || 0,
        timestamp: roundToHour(entry.createdAt.toDate()),
        cohortId: generateCohortId(entry.createdAt.toDate()),
        privacyBudgetUsed: 0.1, // Example privacy budget
      };

      anonymizedEntries.push(anonymized);
    }

    // Store anonymized data
    const batch = db.batch();
    anonymizedEntries.forEach((entry) => {
      const docRef = db.collection('research_data').doc();
      batch.set(docRef, {
        ...entry,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    // Log anonymization action
    await logAuditAction(userAuth.uid, 'data_anonymized', undefined, 'research_data', {
      entriesCount: anonymizedEntries.length,
      hasConsent: true,
    });

    return {
      success: true,
      message: `${anonymizedEntries.length} entries anonymized for research`,
      entriesProcessed: anonymizedEntries.length
    };

  } catch (error) {
    logger.error('Anonymization error:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to anonymize data');
  }
});

/**
 * Data retention cleanup function
 */
export const cleanupExpiredData = onRequest(async (req, res) => {
  try {
    const now = new Date();

    // Find expired data
    const expiredUsers = await db.collection('data_retention')
      .where('scheduledDeletion', '<=', now)
      .get();

    const batch = db.batch();
    let deletedCount = 0;

    for (const doc of expiredUsers.docs) {
      const retentionData = doc.data();
      
      // Delete user's personal data
      const userDataSnapshot = await db.collection('journal_entries')
        .where('userId', '==', retentionData.userId)
        .get();

      userDataSnapshot.docs.forEach((entryDoc) => {
        batch.delete(entryDoc.ref);
        deletedCount++;
      });

      // Delete user document
      batch.delete(db.collection('users').doc(retentionData.userId));
      batch.delete(db.collection('user_consents').doc(retentionData.userId));
      batch.delete(doc.ref);
    }

    await batch.commit();

    logger.info(`Data cleanup completed: ${deletedCount} records deleted`);
    res.status(200).json({ 
      success: true, 
      deletedRecords: deletedCount 
    });

  } catch (error) {
    logger.error('Data cleanup error:', error);
    res.status(500).json({ error: 'Data cleanup failed' });
  }
});

// Helper functions

function detectJurisdiction(req: any): 'US' | 'CA' | 'EU' | 'OTHER' {
  const country = req.get('CF-IPCountry') || req.get('X-Country-Code');
  
  if (country === 'US') return 'US';
  if (country === 'CA') return 'CA';
  if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'NO'].includes(country)) return 'EU';
  
  return 'OTHER';
}

function getRetentionPeriod(jurisdiction: string, dataType: string): number {
  // 7 years for all jurisdictions (in days)
  return 2555;
}

async function logAuditAction(
  userId: string, 
  action: string, 
  resourceId?: string, 
  resourceType?: string, 
  details?: any,
  req?: any
) {
  try {
    // Build audit log object, excluding undefined fields
    const auditLog: any = {
      userId,
      action,
      details,
      timestamp: FieldValue.serverTimestamp(),
      ipAddress: req?.ip || req?.connection?.remoteAddress || '0.0.0.0',
      userAgent: req?.get('User-Agent') || 'Unknown',
    };

    // Only add resourceId and resourceType if they are defined
    if (resourceId !== undefined) {
      auditLog.resourceId = resourceId;
    }
    if (resourceType !== undefined) {
      auditLog.resourceType = resourceType;
    }

    await db.collection('audit_logs').add(auditLog);
  } catch (error) {
    logger.error('Audit logging failed:', error);
  }
}

function generateAnonymousId(originalId: string): string {
  // Create a hash-based anonymous ID
  return Buffer.from(originalId).toString('base64').substring(0, 16);
}

function sanitizeText(text: string): string {
  // Remove PII patterns
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
}

function roundToHour(date: Date): Date {
  const rounded = new Date(date);
  rounded.setMinutes(0, 0, 0);
  return rounded;
}

function generateCohortId(date: Date): string {
  // Group by week for privacy
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return `cohort_${weekStart.getFullYear()}_${weekStart.getMonth()}_${Math.floor(weekStart.getDate() / 7)}`;
}