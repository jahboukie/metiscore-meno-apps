"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KMSService = void 0;
const kms_1 = require("@google-cloud/kms");
const v2_1 = require("firebase-functions/v2");
const crypto_1 = require("crypto");
// Use Node.js crypto for server-side key generation
const crypto = crypto_1.webcrypto;
class KMSService {
    constructor() {
        this.client = null;
        // Don't initialize the client immediately - use lazy initialization
        this.config = {
            // Use Firebase-provided project ID (GCLOUD_PROJECT is automatically available)
            projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'claude-code-meno-app',
            locationId: 'northamerica-northeast2',
            keyRingId: 'app-backend-meno-apps',
            menoWellnessKeyId: 'meno-app-encryption-key',
            partnerSupportKeyId: 'support-partner-app-encryption-key',
        };
    }
    /**
     * Lazy initialization of KMS client
     */
    getClient() {
        if (!this.client) {
            try {
                this.client = new kms_1.KeyManagementServiceClient();
                v2_1.logger.info('KMS client initialized successfully');
            }
            catch (error) {
                v2_1.logger.error('Failed to initialize KMS client:', error);
                throw new Error(`KMS client initialization failed: ${error}`);
            }
        }
        return this.client;
    }
    /**
     * Get the appropriate KMS key name based on app type
     */
    getKeyName(appType) {
        const keyId = appType === 'meno-wellness'
            ? this.config.menoWellnessKeyId
            : this.config.partnerSupportKeyId;
        return this.getClient().cryptoKeyPath(this.config.projectId, this.config.locationId, this.config.keyRingId, keyId);
    }
    /**
     * Encrypt a Data Encryption Key (DEK) using KMS
     */
    async encryptDEK(dek, appType, userId) {
        try {
            const keyName = this.getKeyName(appType);
            v2_1.logger.info(`Encrypting DEK for user ${userId} using ${appType} key`);
            const [result] = await this.getClient().encrypt({
                name: keyName,
                plaintext: dek,
            });
            if (!result.ciphertext) {
                throw new Error('KMS encryption failed - no ciphertext returned');
            }
            return {
                encryptedDEK: Buffer.from(result.ciphertext).toString('base64'),
                keyVersion: result.name || keyName,
                appType,
                userId,
                createdAt: new Date(),
            };
        }
        catch (error) {
            v2_1.logger.error(`KMS encryption failed for user ${userId}:`, error);
            throw new Error(`Failed to encrypt DEK: ${error}`);
        }
    }
    /**
     * Decrypt a Data Encryption Key (DEK) using KMS
     */
    async decryptDEK(encryptedDEK, appType, userId) {
        try {
            const keyName = this.getKeyName(appType);
            const ciphertext = Buffer.from(encryptedDEK, 'base64');
            v2_1.logger.info(`Decrypting DEK for user ${userId} using ${appType} key`);
            const [result] = await this.getClient().decrypt({
                name: keyName,
                ciphertext: ciphertext,
            });
            if (!result.plaintext) {
                throw new Error('KMS decryption failed - no plaintext returned');
            }
            return Buffer.from(result.plaintext);
        }
        catch (error) {
            v2_1.logger.error(`KMS decryption failed for user ${userId}:`, error);
            throw new Error(`Failed to decrypt DEK: ${error}`);
        }
    }
    /**
     * Generate a new Data Encryption Key using KMS
     */
    async generateDEK(appType, userId) {
        try {
            const keyName = this.getKeyName(appType);
            v2_1.logger.info(`Generating new DEK for user ${userId} using ${appType} key`);
            // Generate a random 256-bit key
            const plaintext = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
            // Encrypt the DEK with KMS
            const [result] = await this.getClient().encrypt({
                name: keyName,
                plaintext: plaintext,
            });
            if (!result.ciphertext) {
                throw new Error('KMS DEK generation failed - no ciphertext returned');
            }
            return {
                plaintext: plaintext,
                encryptedDEK: Buffer.from(result.ciphertext).toString('base64'),
                keyVersion: result.name || keyName,
                appType,
                userId,
                createdAt: new Date(),
            };
        }
        catch (error) {
            v2_1.logger.error(`KMS DEK generation failed for user ${userId}:`, error);
            throw new Error(`Failed to generate DEK: ${error}`);
        }
    }
    /**
     * Get key information for audit purposes
     */
    async getKeyInfo(appType) {
        const keyId = appType === 'meno-wellness'
            ? this.config.menoWellnessKeyId
            : this.config.partnerSupportKeyId;
        return {
            keyName: this.getKeyName(appType),
            appType,
            location: this.config.locationId,
            keyRing: this.config.keyRingId,
            keyId,
        };
    }
    /**
     * Validate that KMS keys are accessible
     */
    async validateKMSAccess() {
        const errors = [];
        let menoWellnessKey = false;
        let partnerSupportKey = false;
        try {
            const menoKeyName = this.getKeyName('meno-wellness');
            await this.getClient().getCryptoKey({ name: menoKeyName });
            menoWellnessKey = true;
            v2_1.logger.info('MenoWellness KMS key is accessible');
        }
        catch (error) {
            errors.push(`MenoWellness key error: ${error}`);
            v2_1.logger.error('MenoWellness KMS key validation failed:', error);
        }
        try {
            const partnerKeyName = this.getKeyName('partner-support');
            await this.getClient().getCryptoKey({ name: partnerKeyName });
            partnerSupportKey = true;
            v2_1.logger.info('Partner Support KMS key is accessible');
        }
        catch (error) {
            errors.push(`Partner Support key error: ${error}`);
            v2_1.logger.error('Partner Support KMS key validation failed:', error);
        }
        return {
            menoWellnessKey,
            partnerSupportKey,
            errors,
        };
    }
}
exports.KMSService = KMSService;
