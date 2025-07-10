import { KeyManagementServiceClient } from '@google-cloud/kms';
import { logger } from 'firebase-functions/v2';
import { webcrypto } from 'crypto';

// Use Node.js crypto for server-side key generation
const crypto = webcrypto;

export type AppType = 'meno-wellness' | 'partner-support';

interface KMSConfig {
  projectId: string;
  locationId: string;
  keyRingId: string;
  menoWellnessKeyId: string;
  partnerSupportKeyId: string;
}

export class KMSService {
  private client: KeyManagementServiceClient | null = null;
  private config: KMSConfig;

  constructor() {
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
  private getClient(): KeyManagementServiceClient {
    if (!this.client) {
      try {
        this.client = new KeyManagementServiceClient();
        logger.info('KMS client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize KMS client:', error);
        throw new Error(`KMS client initialization failed: ${error}`);
      }
    }
    return this.client;
  }

  /**
   * Get the appropriate KMS key name based on app type
   */
  private getKeyName(appType: AppType): string {
    const keyId = appType === 'meno-wellness'
      ? this.config.menoWellnessKeyId
      : this.config.partnerSupportKeyId;

    return this.getClient().cryptoKeyPath(
      this.config.projectId,
      this.config.locationId,
      this.config.keyRingId,
      keyId
    );
  }

  /**
   * Encrypt a Data Encryption Key (DEK) using KMS
   */
  async encryptDEK(dek: Buffer, appType: AppType, userId: string): Promise<{
    encryptedDEK: string;
    keyVersion: string;
    appType: AppType;
    userId: string;
    createdAt: Date;
  }> {
    try {
      const keyName = this.getKeyName(appType);
      
      logger.info(`Encrypting DEK for user ${userId} using ${appType} key`);
      
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
    } catch (error) {
      logger.error(`KMS encryption failed for user ${userId}:`, error);
      throw new Error(`Failed to encrypt DEK: ${error}`);
    }
  }

  /**
   * Decrypt a Data Encryption Key (DEK) using KMS
   */
  async decryptDEK(encryptedDEK: string, appType: AppType, userId: string): Promise<Buffer> {
    try {
      const keyName = this.getKeyName(appType);
      const ciphertext = Buffer.from(encryptedDEK, 'base64');
      
      logger.info(`Decrypting DEK for user ${userId} using ${appType} key`);
      
      const [result] = await this.getClient().decrypt({
        name: keyName,
        ciphertext: ciphertext,
      });

      if (!result.plaintext) {
        throw new Error('KMS decryption failed - no plaintext returned');
      }

      return Buffer.from(result.plaintext);
    } catch (error) {
      logger.error(`KMS decryption failed for user ${userId}:`, error);
      throw new Error(`Failed to decrypt DEK: ${error}`);
    }
  }

  /**
   * Generate a new Data Encryption Key using KMS
   */
  async generateDEK(appType: AppType, userId: string): Promise<{
    plaintext: Buffer;
    encryptedDEK: string;
    keyVersion: string;
    appType: AppType;
    userId: string;
    createdAt: Date;
  }> {
    try {
      const keyName = this.getKeyName(appType);

      logger.info(`Generating new DEK for user ${userId} using ${appType} key`);

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
    } catch (error) {
      logger.error(`KMS DEK generation failed for user ${userId}:`, error);
      throw new Error(`Failed to generate DEK: ${error}`);
    }
  }

  /**
   * Get key information for audit purposes
   */
  async getKeyInfo(appType: AppType): Promise<{
    keyName: string;
    appType: AppType;
    location: string;
    keyRing: string;
    keyId: string;
  }> {
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
  async validateKMSAccess(): Promise<{
    menoWellnessKey: boolean;
    partnerSupportKey: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let menoWellnessKey = false;
    let partnerSupportKey = false;

    try {
      const menoKeyName = this.getKeyName('meno-wellness');
      await this.getClient().getCryptoKey({ name: menoKeyName });
      menoWellnessKey = true;
      logger.info('MenoWellness KMS key is accessible');
    } catch (error) {
      errors.push(`MenoWellness key error: ${error}`);
      logger.error('MenoWellness KMS key validation failed:', error);
    }

    try {
      const partnerKeyName = this.getKeyName('partner-support');
      await this.getClient().getCryptoKey({ name: partnerKeyName });
      partnerSupportKey = true;
      logger.info('Partner Support KMS key is accessible');
    } catch (error) {
      errors.push(`Partner Support key error: ${error}`);
      logger.error('Partner Support KMS key validation failed:', error);
    }

    return {
      menoWellnessKey,
      partnerSupportKey,
      errors,
    };
  }
}
