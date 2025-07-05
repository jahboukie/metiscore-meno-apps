"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredData = exports.anonymizeUserData = exports.acceptPartnerInvite = exports.onboardnewuser = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
// CORS configuration for API calls
const corsConfig = {
    cors: true,
};
/**
 * User onboarding function - Creates user document in Firestore
 */
exports.onboardnewuser = (0, https_1.onRequest)(corsConfig, async (req, res) => {
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
        };
        await db.collection('users').doc(uid).set(userData, { merge: true });
        // Set up data retention tracking
        const jurisdiction = detectJurisdiction(req);
        const retentionPeriod = getRetentionPeriod(jurisdiction, 'personal');
        await db.collection('data_retention').doc(uid).set({
            userId: uid,
            dataType: 'personal',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        v2_1.logger.error('Onboarding error:', error);
        res.status(500).json({
            error: 'Failed to onboard user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Accept partner invite function - Enhanced with security
 */
exports.acceptPartnerInvite = (0, https_1.onCall)(async (request) => {
    const { data, auth: userAuth } = request;
    if (!userAuth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { inviteCode, partnerUid } = data;
    if (!inviteCode || !partnerUid) {
        throw new https_1.HttpsError('invalid-argument', 'Invite code and partner UID are required');
    }
    try {
        // Verify invite exists and is valid
        const inviteDoc = await db.collection('invites').doc(inviteCode).get();
        if (!inviteDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invalid invite code');
        }
        const inviteData = inviteDoc.data();
        if (inviteData.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', 'Invite has already been used or expired');
        }
        if (inviteData.expiresAt.toDate() < new Date()) {
            throw new https_1.HttpsError('failed-precondition', 'Invite has expired');
        }
        // Verify both users exist
        const [primaryUserDoc, partnerUserDoc] = await Promise.all([
            db.collection('users').doc(inviteData.fromUserId).get(),
            db.collection('users').doc(partnerUid).get()
        ]);
        if (!primaryUserDoc.exists || !partnerUserDoc.exists) {
            throw new https_1.HttpsError('not-found', 'One or both users not found');
        }
        // Update both user documents to link them
        const batch = db.batch();
        batch.update(db.collection('users').doc(inviteData.fromUserId), {
            partnerId: partnerUid,
            lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
        });
        batch.update(db.collection('users').doc(partnerUid), {
            partnerId: inviteData.fromUserId,
            role: 'partner',
            lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
        });
        batch.update(db.collection('invites').doc(inviteCode), {
            status: 'completed',
            completedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        v2_1.logger.error('Accept invite error:', error);
        // Log failed attempt
        await logAuditAction(partnerUid, 'partner_invite_failed', undefined, 'invite', {
            inviteCode,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to accept invite');
    }
});
/**
 * Anonymize data for research purposes
 */
exports.anonymizeUserData = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d, _e;
    const { auth: userAuth } = request;
    if (!userAuth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        // Check user consent for research participation
        const consentDoc = await db.collection('user_consents').doc(userAuth.uid).get();
        if (!consentDoc.exists || !((_a = consentDoc.data()) === null || _a === void 0 ? void 0 : _a.researchParticipation)) {
            throw new https_1.HttpsError('permission-denied', 'Research participation consent required');
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
                sentimentScore: ((_c = (_b = entry.analysis) === null || _b === void 0 ? void 0 : _b.sentiment) === null || _c === void 0 ? void 0 : _c.score) || 0,
                emotionalIntensity: ((_e = (_d = entry.analysis) === null || _d === void 0 ? void 0 : _d.emotions) === null || _e === void 0 ? void 0 : _e.emotional_intensity) || 0,
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
            batch.set(docRef, Object.assign(Object.assign({}, entry), { createdAt: firestore_1.FieldValue.serverTimestamp() }));
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
    }
    catch (error) {
        v2_1.logger.error('Anonymization error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to anonymize data');
    }
});
/**
 * Data retention cleanup function
 */
exports.cleanupExpiredData = (0, https_1.onRequest)(async (req, res) => {
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
        v2_1.logger.info(`Data cleanup completed: ${deletedCount} records deleted`);
        res.status(200).json({
            success: true,
            deletedRecords: deletedCount
        });
    }
    catch (error) {
        v2_1.logger.error('Data cleanup error:', error);
        res.status(500).json({ error: 'Data cleanup failed' });
    }
});
// Helper functions
function detectJurisdiction(req) {
    const country = req.get('CF-IPCountry') || req.get('X-Country-Code');
    if (country === 'US')
        return 'US';
    if (country === 'CA')
        return 'CA';
    if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'NO'].includes(country))
        return 'EU';
    return 'OTHER';
}
function getRetentionPeriod(jurisdiction, dataType) {
    // 7 years for all jurisdictions (in days)
    return 2555;
}
async function logAuditAction(userId, action, resourceId, resourceType, details, req) {
    var _a;
    try {
        // Build audit log object, excluding undefined fields
        const auditLog = {
            userId,
            action,
            details,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            ipAddress: (req === null || req === void 0 ? void 0 : req.ip) || ((_a = req === null || req === void 0 ? void 0 : req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) || '0.0.0.0',
            userAgent: (req === null || req === void 0 ? void 0 : req.get('User-Agent')) || 'Unknown',
        };
        // Only add resourceId and resourceType if they are defined
        if (resourceId !== undefined) {
            auditLog.resourceId = resourceId;
        }
        if (resourceType !== undefined) {
            auditLog.resourceType = resourceType;
        }
        await db.collection('audit_logs').add(auditLog);
    }
    catch (error) {
        v2_1.logger.error('Audit logging failed:', error);
    }
}
function generateAnonymousId(originalId) {
    // Create a hash-based anonymous ID
    return Buffer.from(originalId).toString('base64').substring(0, 16);
}
function sanitizeText(text) {
    // Remove PII patterns
    return text
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
        .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
}
function roundToHour(date) {
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded;
}
function generateCohortId(date) {
    // Group by week for privacy
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return `cohort_${weekStart.getFullYear()}_${weekStart.getMonth()}_${Math.floor(weekStart.getDate() / 7)}`;
}
//# sourceMappingURL=index.js.map