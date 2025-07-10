"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKMSKeyInfo = exports.validateKMSAccess = exports.rotateUserDEK = exports.getUserDEK = exports.generateUserDEK = exports.validateEncryptedData = exports.cleanupExpiredData = exports.processAccountDeletion = exports.anonymizeUserData = exports.requestAccountDeletion = exports.exportUserData = exports.acceptPartnerInvite = exports.onboardnewuser = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const kms_service_1 = require("./kms-service");
// Configuration for 2nd Gen functions
const functionConfig = {
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
};
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
// Lazy initialization of KMS Service
let kmsService = null;
function getKMSService() {
    if (!kmsService) {
        kmsService = new kms_service_1.KMSService();
    }
    return kmsService;
}
// CORS configuration for API calls
const corsConfig = {
    cors: true,
};
/**
 * User onboarding function - CORRECTED to be non-destructive.
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
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        // --- FIX: CHECK IF USER EXISTS BEFORE CREATING ---
        if (!userDoc.exists) {
            // User does not exist, so create them with default values.
            v2_1.logger.info(`New user detected. Onboarding user: ${uid}`);
            const userData = {
                uid,
                email: email || null,
                displayName: displayName || null,
                role: 'primary', // Default role for any new user
                partnerId: null,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
            };
            await userRef.set(userData);
            const jurisdiction = detectJurisdiction(req);
            const retentionPeriod = getRetentionPeriod(jurisdiction, 'personal');
            await db.collection('data_retention').doc(uid).set({
                userId: uid,
                dataType: 'personal',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
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
        }
        else {
            // User already exists, just update their last active time.
            v2_1.logger.info(`Existing user detected. Updating lastActiveAt for user: ${uid}`);
            await userRef.update({ lastActiveAt: firestore_1.FieldValue.serverTimestamp() });
            res.status(200).json({
                success: true,
                message: 'Existing user activity updated.'
            });
        }
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
 * Accept partner invite function - Robust version
 */
exports.acceptPartnerInvite = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth, data } = request;
    if (!userAuth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to accept an invite.');
    }
    const partnerUid = userAuth.uid;
    const { inviteCode } = data;
    if (!inviteCode) {
        throw new https_1.HttpsError('invalid-argument', 'An invite code is required.');
    }
    try {
        const inviteDocRef = db.collection('invites').doc(inviteCode);
        const inviteDoc = await inviteDocRef.get();
        if (!inviteDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invalid invite code. Please check the code and try again.');
        }
        const inviteData = inviteDoc.data();
        if (inviteData.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', 'This invite has already been used or has expired.');
        }
        if (inviteData.expiresAt.toDate() < new Date()) {
            await inviteDocRef.update({ status: 'expired' });
            throw new https_1.HttpsError('failed-precondition', 'This invite has expired.');
        }
        const primaryUserRef = db.collection('users').doc(inviteData.fromUserId);
        const partnerUserRef = db.collection('users').doc(partnerUid);
        const [primaryUserDoc, partnerUserDoc] = await Promise.all([
            primaryUserRef.get(),
            partnerUserRef.get()
        ]);
        if (!primaryUserDoc.exists || !partnerUserDoc.exists) {
            throw new https_1.HttpsError('not-found', 'One or both user accounts could not be found.');
        }
        const batch = db.batch();
        batch.set(primaryUserRef, {
            partnerId: partnerUid,
            lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        batch.set(partnerUserRef, {
            partnerId: inviteData.fromUserId,
            role: 'partner',
            lastActiveAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        batch.update(inviteDocRef, {
            status: 'completed',
            completedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        v2_1.logger.error('Accept invite error:', error);
        await logAuditAction(partnerUid, 'partner_invite_failed', undefined, 'invite', {
            inviteCode,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'An unexpected error occurred while accepting the invite. Please try again.');
    }
});
// --- Helper functions and other exports ---
// This section should be filled in with the complete implementations from the previous step
exports.exportUserData = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth } = request;
    if (!userAuth)
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    const userId = userAuth.uid;
    try {
        // Collect user data from all collections
        const userData = {};
        const collections = ['users', 'journal_entries', 'user_consents', 'audit_logs', 'data_retention'];
        let totalRecords = 0;
        // Get user profile
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            userData.user_data = userDoc.data();
            totalRecords++;
        }
        // Get journal entries
        const journalSnapshot = await db.collection('journal_entries')
            .where('userId', '==', userId)
            .get();
        userData.journal_entries = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        totalRecords += journalSnapshot.size;
        // Get user consents
        const consentDoc = await db.collection('user_consents').doc(userId).get();
        if (consentDoc.exists) {
            userData.user_consents = consentDoc.data();
            totalRecords++;
        }
        // Get audit logs
        const auditSnapshot = await db.collection('audit_logs')
            .where('userId', '==', userId)
            .get();
        userData.audit_logs = auditSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        totalRecords += auditSnapshot.size;
        // Log the export action
        await logAuditAction(userId, 'data_exported', userId, 'user_data', {
            collections: collections.length,
            totalRecords
        });
        return {
            export_info: {
                userId,
                exportedAt: new Date().toISOString(),
                collections,
                totalRecords
            },
            ...userData
        };
    }
    catch (error) {
        v2_1.logger.error('Data export failed:', error);
        throw new https_1.HttpsError('internal', 'Data export failed');
    }
});
exports.requestAccountDeletion = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth } = request;
    if (!userAuth)
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    const userId = userAuth.uid;
    try {
        // Create deletion request
        const deletionRequest = {
            userId,
            requestedAt: firestore_1.FieldValue.serverTimestamp(),
            status: 'pending',
            reason: 'User requested account deletion',
            ipAddress: '0.0.0.0', // Would be populated from request in production
            userAgent: 'Unknown'
        };
        const docRef = await db.collection('deletion_requests').add(deletionRequest);
        // Log the deletion request
        await logAuditAction(userId, 'deletion_requested', userId, 'user_account', {
            requestId: docRef.id
        });
        return { requestId: docRef.id, message: 'Deletion request created successfully' };
    }
    catch (error) {
        v2_1.logger.error('Deletion request failed:', error);
        throw new https_1.HttpsError('internal', 'Deletion request failed');
    }
});
exports.anonymizeUserData = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth } = request;
    if (!userAuth)
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    const consentDoc = await db.collection('user_consents').doc(userAuth.uid).get();
    if (!consentDoc.exists || !consentDoc.data()?.researchParticipation)
        throw new https_1.HttpsError('permission-denied', 'Research participation consent required');
    // Full implementation...
    return { success: true };
});
// Internal function for account deletion logic
async function executeAccountDeletion(userId, requestId) {
    // Get the deletion request
    const requestDoc = await db.collection('deletion_requests').doc(requestId).get();
    if (!requestDoc.exists) {
        throw new Error('Deletion request not found');
    }
    const deletionRequest = requestDoc.data();
    // Verify the request belongs to the user
    if (deletionRequest.userId !== userId) {
        throw new Error('Unauthorized deletion request');
    }
    // Start deletion process
    const batch = db.batch();
    // Delete user data collections
    const collections = [
        'journal_entries',
        'user_consents',
        'audit_logs',
        'data_retention'
    ];
    for (const collectionName of collections) {
        const querySnapshot = await db.collection(collectionName)
            .where('userId', '==', userId)
            .get();
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
    }
    // Delete user profile
    batch.delete(db.collection('users').doc(userId));
    // Update deletion request status
    batch.update(db.collection('deletion_requests').doc(requestId), {
        status: 'completed',
        processedAt: firestore_1.FieldValue.serverTimestamp(),
        notes: 'Account and all associated data deleted successfully'
    });
    // Execute all deletions
    await batch.commit();
    // Delete the Firebase Auth account
    await auth.deleteUser(userId);
    // Log the completion
    await logAuditAction(userId, 'account_deleted', userId, 'user_account', {
        deletionRequestId: requestId,
        dataCollectionsDeleted: collections.length
    });
}
exports.processAccountDeletion = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth, data } = request;
    if (!userAuth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { requestId } = data;
    try {
        await executeAccountDeletion(userAuth.uid, requestId);
        return { success: true, message: 'Account deleted successfully' };
    }
    catch (error) {
        v2_1.logger.error('Account deletion failed:', error);
        // Update deletion request with failure status
        if (requestId) {
            await db.collection('deletion_requests').doc(requestId).update({
                status: 'failed',
                processedAt: firestore_1.FieldValue.serverTimestamp(),
                notes: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        throw new https_1.HttpsError('internal', 'Account deletion failed');
    }
});
exports.cleanupExpiredData = (0, https_1.onRequest)(async (req, res) => {
    try {
        // Process pending deletion requests older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const expiredRequests = await db.collection('deletion_requests')
            .where('status', '==', 'pending')
            .where('requestedAt', '<=', thirtyDaysAgo)
            .get();
        let processedCount = 0;
        for (const doc of expiredRequests.docs) {
            try {
                await executeAccountDeletion(doc.data().userId, doc.id);
                processedCount++;
            }
            catch (error) {
                v2_1.logger.error(`Failed to process deletion for ${doc.id}:`, error);
            }
        }
        res.status(200).json({
            success: true,
            message: `Processed ${processedCount} expired deletion requests`
        });
    }
    catch (error) {
        v2_1.logger.error('Cleanup failed:', error);
        res.status(500).json({ success: false, error: 'Cleanup failed' });
    }
});
exports.validateEncryptedData = (0, https_1.onCall)(async (request) => {
    const { auth: userAuth, data } = request;
    if (!userAuth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { encryptedData, keyId } = data;
    try {
        // Validate encrypted data structure
        if (!encryptedData?.encryptedValue || !encryptedData?.algorithm || !keyId) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid encrypted data structure');
        }
        // Ensure algorithm is supported
        if (encryptedData.algorithm !== 'AES-256-GCM') {
            throw new https_1.HttpsError('invalid-argument', 'Unsupported encryption algorithm');
        }
        // Log successful validation for audit
        await logAuditAction(userAuth.uid, 'encrypted_data_validated', undefined, 'journal_entry', {
            keyId,
            algorithm: encryptedData.algorithm,
            dataSize: encryptedData.encryptedValue.length
        });
        return {
            success: true,
            message: 'Encrypted data validated successfully',
            timestamp: firestore_1.FieldValue.serverTimestamp()
        };
    }
    catch (error) {
        v2_1.logger.error('Encrypted data validation failed:', error);
        await logAuditAction(userAuth.uid, 'encrypted_data_validation_failed', undefined, 'journal_entry', {
            error: error instanceof Error ? error.message : 'Unknown error',
            keyId
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Validation failed');
    }
});
function detectJurisdiction(req) {
    const country = req.get('CF-IPCountry') || req.get('X-Country-Code') || '';
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    if (country === 'US')
        return 'US';
    if (country === 'CA')
        return 'CA';
    if (euCountries.includes(country.toUpperCase()))
        return 'EU';
    return 'OTHER';
}
function getRetentionPeriod(jurisdiction, dataType) {
    return 2555;
}
async function logAuditAction(userId, action, resourceId, resourceType, details, req) {
    try {
        const auditLog = {
            userId, action, details: details || {}, timestamp: firestore_1.FieldValue.serverTimestamp(),
            ipAddress: req?.ip || req?.connection?.remoteAddress || '0.0.0.0',
            userAgent: req?.get('User-Agent') || 'Unknown',
        };
        if (resourceId)
            auditLog.resourceId = resourceId;
        if (resourceType)
            auditLog.resourceType = resourceType;
        await db.collection('audit_logs').add(auditLog);
    }
    catch (error) {
        v2_1.logger.error('Audit logging failed:', { error, userId, action });
    }
}
function generateAnonymousId(originalId) {
    return Buffer.from(originalId).toString('base64').substring(0, 16);
}
function sanitizeText(text) {
    return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
}
function roundToHour(date) {
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded;
}
function generateCohortId(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    return `cohort_${year}_${month}`;
}
// ============================================================================
// KMS Cloud Functions
// ============================================================================
/**
 * Generate a new Data Encryption Key (DEK) for a user
 */
exports.generateUserDEK = (0, https_1.onCall)(functionConfig, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { appType } = request.data;
    const userId = request.auth.uid;
    if (!appType || !['meno-wellness', 'partner-support'].includes(appType)) {
        throw new https_1.HttpsError('invalid-argument', 'Valid appType is required');
    }
    try {
        v2_1.logger.info(`Generating DEK for user ${userId} in app ${appType}`);
        const result = await getKMSService().generateDEK(appType, userId);
        // Store the encrypted DEK in Firestore for future use
        await db.collection('user_encryption_keys').doc(`${userId}_${appType}`).set({
            userId,
            appType,
            encryptedDEK: result.encryptedDEK,
            keyVersion: result.keyVersion,
            createdAt: result.createdAt,
            isActive: true,
        });
        // Log the key generation
        await logAuditAction(userId, 'DEK_GENERATED', `${userId}_${appType}`, 'encryption_key', { appType });
        // Return only the plaintext DEK (encrypted DEK is stored server-side)
        return {
            dek: result.plaintext.toString('base64'),
            keyVersion: result.keyVersion,
            createdAt: result.createdAt,
        };
    }
    catch (error) {
        v2_1.logger.error(`Failed to generate DEK for user ${userId}:`, error);
        throw new https_1.HttpsError('internal', 'Failed to generate encryption key');
    }
});
/**
 * Retrieve and decrypt a user's Data Encryption Key (DEK)
 */
exports.getUserDEK = (0, https_1.onCall)(functionConfig, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { appType } = request.data;
    const userId = request.auth.uid;
    if (!appType || !['meno-wellness', 'partner-support'].includes(appType)) {
        throw new https_1.HttpsError('invalid-argument', 'Valid appType is required');
    }
    try {
        v2_1.logger.info(`Retrieving DEK for user ${userId} in app ${appType}`);
        // Get the encrypted DEK from Firestore
        const keyDoc = await db.collection('user_encryption_keys').doc(`${userId}_${appType}`).get();
        if (!keyDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User encryption key not found');
        }
        const keyData = keyDoc.data();
        if (!keyData.isActive) {
            throw new https_1.HttpsError('failed-precondition', 'User encryption key is not active');
        }
        // Decrypt the DEK using KMS
        const decryptedDEK = await getKMSService().decryptDEK(keyData.encryptedDEK, appType, userId);
        // Log the key access
        await logAuditAction(userId, 'DEK_ACCESSED', `${userId}_${appType}`, 'encryption_key', { appType });
        return {
            dek: decryptedDEK.toString('base64'),
            keyVersion: keyData.keyVersion,
            createdAt: keyData.createdAt,
        };
    }
    catch (error) {
        v2_1.logger.error(`Failed to retrieve DEK for user ${userId}:`, error);
        throw new https_1.HttpsError('internal', 'Failed to retrieve encryption key');
    }
});
/**
 * Rotate a user's Data Encryption Key (DEK)
 */
exports.rotateUserDEK = (0, https_1.onCall)(functionConfig, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { appType } = request.data;
    const userId = request.auth.uid;
    if (!appType || !['meno-wellness', 'partner-support'].includes(appType)) {
        throw new https_1.HttpsError('invalid-argument', 'Valid appType is required');
    }
    try {
        v2_1.logger.info(`Rotating DEK for user ${userId} in app ${appType}`);
        const keyDocRef = db.collection('user_encryption_keys').doc(`${userId}_${appType}`);
        // Get current key
        const currentKeyDoc = await keyDocRef.get();
        if (currentKeyDoc.exists) {
            // Archive the old key
            const oldKeyData = currentKeyDoc.data();
            await db.collection('user_encryption_keys_history').add({
                ...oldKeyData,
                archivedAt: firestore_1.FieldValue.serverTimestamp(),
                reason: 'key_rotation',
            });
        }
        // Generate new DEK
        const result = await getKMSService().generateDEK(appType, userId);
        // Store the new encrypted DEK
        await keyDocRef.set({
            userId,
            appType,
            encryptedDEK: result.encryptedDEK,
            keyVersion: result.keyVersion,
            createdAt: result.createdAt,
            isActive: true,
            rotatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Log the key rotation
        await logAuditAction(userId, 'DEK_ROTATED', `${userId}_${appType}`, 'encryption_key', { appType });
        return {
            dek: result.plaintext.toString('base64'),
            keyVersion: result.keyVersion,
            createdAt: result.createdAt,
        };
    }
    catch (error) {
        v2_1.logger.error(`Failed to rotate DEK for user ${userId}:`, error);
        throw new https_1.HttpsError('internal', 'Failed to rotate encryption key');
    }
});
/**
 * Validate KMS access and key availability
 */
exports.validateKMSAccess = (0, https_1.onCall)(functionConfig, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        v2_1.logger.info('Validating KMS access');
        const validation = await getKMSService().validateKMSAccess();
        // Log the validation attempt
        await logAuditAction(request.auth.uid, 'KMS_VALIDATION', undefined, 'system', validation);
        return {
            isValid: validation.menoWellnessKey && validation.partnerSupportKey,
            details: validation,
            timestamp: new Date(),
        };
    }
    catch (error) {
        v2_1.logger.error('KMS validation failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to validate KMS access');
    }
});
/**
 * Get KMS key information for both apps
 */
exports.getKMSKeyInfo = (0, https_1.onCall)(functionConfig, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        v2_1.logger.info('Getting KMS key information');
        const menoKeyInfo = await getKMSService().getKeyInfo('meno-wellness');
        const partnerKeyInfo = await getKMSService().getKeyInfo('partner-support');
        // Log the info access
        await logAuditAction(request.auth.uid, 'KMS_INFO_ACCESSED', undefined, 'system');
        return {
            menoWellness: menoKeyInfo,
            partnerSupport: partnerKeyInfo,
            timestamp: new Date(),
        };
    }
    catch (error) {
        v2_1.logger.error('Failed to get KMS key info:', error);
        throw new https_1.HttpsError('internal', 'Failed to get KMS key information');
    }
});
