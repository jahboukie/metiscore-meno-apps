// Security utilities for client-side encryption and compliance
import { UserConsent, AuditLog, EncryptedData } from '@metiscore/types';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Interface for stored key data
interface StoredKeyData {
  userId: string;
  key: ArrayBuffer;
  createdAt: Date;
  algorithm: string;
  version?: number;
}

// Interface for KMS-protected key data
interface KMSKeyData {
  userId: string;
  appType: 'meno-wellness' | 'partner-support';
  dek: string; // Base64 encoded Data Encryption Key
  keyVersion: string;
  createdAt: Date;
  isKMSProtected: true;
}

// Configuration for KMS integration
interface KMSConfig {
  enabled: boolean;
  appType: 'meno-wellness' | 'partner-support';
  hybridMode: boolean; // Support both KMS and local keys
}

// Client-side encryption utilities
export class SecurityUtils {
  private static readonly ENCRYPTION_KEY_SIZE = 32; // 256 bits
  private static readonly IV_SIZE = 16; // 128 bits
  private static readonly KEY_STORAGE_PREFIX = 'meno_key_';
  private static readonly KMS_KEY_STORAGE_PREFIX = 'kms_key_';

  // Get KMS configuration from environment
  private static getKMSConfig(): KMSConfig {
    return {
      enabled: process.env.NEXT_PUBLIC_KMS_ENABLED === 'true',
      appType: (process.env.NEXT_PUBLIC_APP_TYPE as 'meno-wellness' | 'partner-support') || 'meno-wellness',
      hybridMode: process.env.NEXT_PUBLIC_KMS_HYBRID_MODE === 'true',
    };
  }

  // Check if KMS is available and enabled
  static isKMSEnabled(): boolean {
    const config = this.getKMSConfig();
    return config.enabled && typeof window !== 'undefined';
  }

  // Get Firebase Functions instance for KMS operations
  private static getFunctionsInstance() {
    if (typeof window === 'undefined') {
      throw new Error('Firebase Functions not available in server environment');
    }

    // This will be injected by the consuming app
    // Apps should call SecurityUtils.setFirebaseApp(app) during initialization
    if (!SecurityUtils.firebaseApp) {
      throw new Error('Firebase app not initialized. Call SecurityUtils.setFirebaseApp(app) first.');
    }

    return getFunctions(SecurityUtils.firebaseApp, 'northamerica-northeast1');
  }

  // Firebase app instance (to be set by consuming applications)
  private static firebaseApp: any = null;

  // Set Firebase app instance (should be called by consuming applications)
  static setFirebaseApp(app: any): void {
    SecurityUtils.firebaseApp = app;
  }

  // Generate a secure random key for field-level encryption
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Store encryption key securely in IndexedDB
  static async storeKey(userId: string, key: CryptoKey): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available - key storage skipped');
      return;
    }

    try {
      const db = await this.openKeyStore();
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');
      
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      await store.put({ 
        userId, 
        key: exportedKey,
        createdAt: new Date(),
        algorithm: 'AES-GCM'
      });
    } catch (error) {
      console.error('Failed to store encryption key:', error);
      throw new Error('Key storage failed');
    }
  }

  // Retrieve encryption key from IndexedDB
  static async retrieveKey(userId: string): Promise<CryptoKey | null> {
    try {
      const db = await this.openKeyStore();
      const transaction = db.transaction(['keys'], 'readonly');
      const store = transaction.objectStore('keys');

      const result = await store.get(userId) as unknown as StoredKeyData | undefined;
      if (!result) return null;

      // Convert ArrayBuffer to Uint8Array if needed
      const keyData = result.key instanceof ArrayBuffer
        ? new Uint8Array(result.key)
        : result.key;

      return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }

  // Initialize or retrieve user's encryption key
  static async getUserEncryptionKey(userId: string): Promise<CryptoKey> {
    let key = await this.retrieveKey(userId);
    
    if (!key) {
      key = await this.generateKey();
      await this.storeKey(userId, key);
    }
    
    return key;
  }

  // Open IndexedDB for key storage
  private static async openKeyStore(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MenoEncryptionStore', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        
        // Version 1: Initial key store
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('keys')) {
            const store = db.createObjectStore('keys', { keyPath: 'userId' });
            store.createIndex('createdAt', 'createdAt');
          }
        }
        
        // Version 2: Add key rotation support
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('keyRotations')) {
            const rotationStore = db.createObjectStore('keyRotations', { keyPath: 'id', autoIncrement: true });
            rotationStore.createIndex('userId', 'userId');
            rotationStore.createIndex('rotatedAt', 'rotatedAt');
          }
          
          if (!db.objectStoreNames.contains('keyBackups')) {
            const backupStore = db.createObjectStore('keyBackups', { keyPath: 'id', autoIncrement: true });
            backupStore.createIndex('userId', 'userId');
            backupStore.createIndex('createdAt', 'createdAt');
          }
        }
      };
    });
  }

  // Rotate encryption key (generates new key, keeps old for decryption)
  static async rotateUserKey(userId: string): Promise<CryptoKey> {
    try {
      const db = await this.openKeyStore();
      const transaction = db.transaction(['keys', 'keyRotations'], 'readwrite');
      const keyStore = transaction.objectStore('keys');
      const rotationStore = transaction.objectStore('keyRotations');
      
      // Get current key
      const currentKeyData = await keyStore.get(userId) as unknown as StoredKeyData | undefined;
      if (!currentKeyData) {
        throw new Error('No current key found for rotation');
      }

      // Generate new key
      const newKey = await this.generateKey();
      const exportedNewKey = await crypto.subtle.exportKey('raw', newKey);

      // Convert ArrayBuffer to Uint8Array if needed
      const keyData = currentKeyData.key instanceof ArrayBuffer
        ? new Uint8Array(currentKeyData.key)
        : currentKeyData.key;

      // Store rotation record
      await rotationStore.add({
        userId,
        oldKeyId: await this.getKeyId(await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        )),
        newKeyId: await this.getKeyId(newKey),
        rotatedAt: new Date(),
        reason: 'manual_rotation'
      });
      
      // Update main key
      await keyStore.put({
        userId,
        key: exportedNewKey,
        createdAt: new Date(),
        algorithm: 'AES-GCM',
        version: (currentKeyData.version || 1) + 1
      });
      
      return newKey;
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw new Error('Key rotation failed');
    }
  }

  // Create encrypted backup of user's key
  static async createKeyBackup(userId: string, backupPassword: string): Promise<string> {
    try {
      const userKey = await this.retrieveKey(userId);
      if (!userKey) {
        throw new Error('No key found to backup');
      }
      
      const exportedKey = await crypto.subtle.exportKey('raw', userKey);
      
      // Derive key from password
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(backupPassword),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Encrypt the user key
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedKey = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        exportedKey
      );
      
      // Combine salt, iv, and encrypted key
      const backup = new Uint8Array(salt.length + iv.length + encryptedKey.byteLength);
      backup.set(salt);
      backup.set(iv, salt.length);
      backup.set(new Uint8Array(encryptedKey), salt.length + iv.length);
      
      const backupString = btoa(String.fromCharCode.apply(null, Array.from(backup)));
      
      // Store backup metadata
      const db = await this.openKeyStore();
      const transaction = db.transaction(['keyBackups'], 'readwrite');
      const backupStore = transaction.objectStore('keyBackups');
      
      await backupStore.add({
        userId,
        createdAt: new Date(),
        backupId: await this.getKeyId(userKey),
        encrypted: true
      });
      
      return backupString;
    } catch (error) {
      console.error('Key backup failed:', error);
      throw new Error('Key backup failed');
    }
  }

  // Restore key from encrypted backup
  static async restoreKeyFromBackup(userId: string, backupString: string, backupPassword: string): Promise<void> {
    try {
      const backup = new Uint8Array(
        atob(backupString).split('').map(char => char.charCodeAt(0))
      );
      
      const salt = backup.slice(0, 16);
      const iv = backup.slice(16, 28);
      const encryptedKey = backup.slice(28);
      
      // Derive key from password
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(backupPassword),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Decrypt the user key
      const decryptedKeyBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        encryptedKey
      );
      
      // Import and store the restored key
      const restoredKey = await crypto.subtle.importKey(
        'raw',
        decryptedKeyBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
      
      await this.storeKey(userId, restoredKey);
    } catch (error) {
      console.error('Key restoration failed:', error);
      throw new Error('Key restoration failed - check password and backup data');
    }
  }

  // Get key rotation history
  static async getKeyRotationHistory(userId: string): Promise<any[]> {
    try {
      const db = await this.openKeyStore();
      const transaction = db.transaction(['keyRotations'], 'readonly');
      const store = transaction.objectStore('keyRotations');
      const index = store.index('userId');
      
      const rotations: any[] = [];
      return new Promise((resolve, reject) => {
        const request = index.openCursor(userId);
        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            rotations.push(cursor.value);
            cursor.continue();
          } else {
            resolve(rotations.sort((a, b) => b.rotatedAt.getTime() - a.rotatedAt.getTime()));
          }
        };
      });
    } catch (error) {
      console.error('Failed to get rotation history:', error);
      return [];
    }
  }

  // Encrypt sensitive data client-side
  static async encryptData(data: string, key: CryptoKey): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_SIZE));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
    combinedArray.set(iv);
    combinedArray.set(encryptedArray, iv.length);

    return {
      encryptedValue: btoa(String.fromCharCode.apply(null, Array.from(combinedArray))),
      keyId: await this.getKeyId(key),
      algorithm: 'AES-256-GCM',
      createdAt: new Date(),
    };
  }

  // Decrypt sensitive data client-side
  static async decryptData(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const combinedArray = new Uint8Array(
      atob(encryptedData.encryptedValue)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const iv = combinedArray.slice(0, this.IV_SIZE);
    const encryptedBuffer = combinedArray.slice(this.IV_SIZE);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  // Get a key identifier for tracking
  private static async getKeyId(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', exported);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode.apply(null, Array.from(hashArray))).substring(0, 16);
  }

  // Hash sensitive identifiers for anonymization
  static async hashIdentifier(identifier: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(identifier + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode.apply(null, Array.from(hashArray)));
  }

  // Remove direct identifiers from text (basic implementation)
  static sanitizeText(text: string): string {
    // Remove common PII patterns
    const patterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{1,5}\s\w+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi, // Addresses
    ];

    let sanitized = text;
    patterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  // ============================================================================
  // KMS Integration Methods
  // ============================================================================

  /**
   * Generate or retrieve a KMS-protected Data Encryption Key (DEK)
   */
  static async getKMSProtectedKey(userId: string): Promise<CryptoKey> {
    const config = this.getKMSConfig();

    if (!config.enabled) {
      // Fallback to local key management
      return this.getUserEncryptionKey(userId);
    }

    try {
      // First try to get existing KMS key from local storage
      const existingKey = await this.retrieveKMSKey(userId);
      if (existingKey) {
        return existingKey;
      }

      // Generate new KMS-protected key
      return await this.generateKMSProtectedKey(userId);
    } catch (error) {
      console.error('KMS key retrieval failed, falling back to local key:', error);

      if (config.hybridMode) {
        return this.getUserEncryptionKey(userId);
      }

      throw error;
    }
  }

  /**
   * Generate a new KMS-protected Data Encryption Key
   */
  private static async generateKMSProtectedKey(userId: string): Promise<CryptoKey> {
    const config = this.getKMSConfig();
    const functions = this.getFunctionsInstance();
    const generateDEK = httpsCallable(functions, 'generateUserDEK');

    try {
      const result = await generateDEK({ appType: config.appType });
      const dekData = result.data as any;

      // Convert base64 DEK to CryptoKey
      const dekBuffer = new Uint8Array(atob(dekData.dek).split('').map(c => c.charCodeAt(0)));
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        dekBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );

      // Store KMS key data locally for quick access
      await this.storeKMSKey(userId, {
        userId,
        appType: config.appType,
        dek: dekData.dek,
        keyVersion: dekData.keyVersion,
        createdAt: new Date(dekData.createdAt),
        isKMSProtected: true,
      });

      return cryptoKey;
    } catch (error) {
      console.error('Failed to generate KMS-protected key:', error);
      throw new Error('Failed to generate KMS-protected key');
    }
  }

  /**
   * Retrieve existing KMS-protected key from local storage
   */
  private static async retrieveKMSKey(userId: string): Promise<CryptoKey | null> {
    try {
      const kmsKeyData = await this.getStoredKMSKey(userId);
      if (!kmsKeyData) return null;

      // Convert base64 DEK to CryptoKey
      const dekBuffer = new Uint8Array(atob(kmsKeyData.dek).split('').map(c => c.charCodeAt(0)));
      return await crypto.subtle.importKey(
        'raw',
        dekBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to retrieve KMS key from local storage:', error);
      return null;
    }
  }

  /**
   * Rotate KMS-protected key
   */
  static async rotateKMSProtectedKey(userId: string): Promise<CryptoKey> {
    const config = this.getKMSConfig();

    if (!config.enabled) {
      return this.rotateUserKey(userId);
    }

    const functions = this.getFunctionsInstance();
    const rotateDEK = httpsCallable(functions, 'rotateUserDEK');

    try {
      const result = await rotateDEK({ appType: config.appType });
      const dekData = result.data as any;

      // Convert base64 DEK to CryptoKey
      const dekBuffer = new Uint8Array(atob(dekData.dek).split('').map(c => c.charCodeAt(0)));
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        dekBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );

      // Update stored KMS key data
      await this.storeKMSKey(userId, {
        userId,
        appType: config.appType,
        dek: dekData.dek,
        keyVersion: dekData.keyVersion,
        createdAt: new Date(dekData.createdAt),
        isKMSProtected: true,
      });

      return cryptoKey;
    } catch (error) {
      console.error('Failed to rotate KMS-protected key:', error);
      throw new Error('Failed to rotate KMS-protected key');
    }
  }

  /**
   * Store KMS key data in local storage for quick access
   */
  private static async storeKMSKey(userId: string, kmsKeyData: KMSKeyData): Promise<void> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available - KMS key storage skipped');
      return;
    }

    try {
      const storageKey = `${this.KMS_KEY_STORAGE_PREFIX}${userId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        ...kmsKeyData,
        createdAt: kmsKeyData.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('Failed to store KMS key data:', error);
    }
  }

  /**
   * Get stored KMS key data from local storage
   */
  private static async getStoredKMSKey(userId: string): Promise<KMSKeyData | null> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const storageKey = `${this.KMS_KEY_STORAGE_PREFIX}${userId}`;
      const stored = localStorage.getItem(storageKey);

      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    } catch (error) {
      console.error('Failed to retrieve stored KMS key data:', error);
      return null;
    }
  }

  /**
   * Validate KMS access and connectivity
   */
  static async validateKMSAccess(): Promise<{
    isValid: boolean;
    details: any;
    timestamp: Date;
  }> {
    const config = this.getKMSConfig();

    if (!config.enabled) {
      return {
        isValid: false,
        details: { error: 'KMS is not enabled' },
        timestamp: new Date(),
      };
    }

    try {
      const functions = this.getFunctionsInstance();
      const validateKMS = httpsCallable(functions, 'validateKMSAccess');

      const result = await validateKMS({});
      return result.data as any;
    } catch (error) {
      console.error('KMS validation failed:', error);
      return {
        isValid: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date(),
      };
    }
  }
}

// Compliance utilities
export class ComplianceUtils {
  // Detect user's jurisdiction based on various factors
  static detectJurisdiction(): 'US' | 'CA' | 'EU' | 'OTHER' {
    // This is a basic implementation - in production, you'd use more sophisticated detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    if (timezone.includes('America') && language.startsWith('en')) {
      return timezone.includes('Toronto') || timezone.includes('Montreal') ? 'CA' : 'US';
    } else if (timezone.includes('Europe') || language.startsWith('de') || language.startsWith('fr')) {
      return 'EU';
    } else if (timezone.includes('America') && language.startsWith('fr')) {
      return 'CA';
    }
    
    return 'OTHER';
  }

  // Get client IP address (requires server-side implementation)
  static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not detect IP address:', error);
      return '0.0.0.0';
    }
  }

  // Create audit log entry
  static createAuditLog(
    userId: string,
    action: string,
    resourceId?: string,
    resourceType?: string,
    details?: Record<string, any>
  ): Omit<AuditLog, 'id'> {
    // Build audit log object, excluding undefined fields for Firestore compatibility
    const auditLog: any = {
      userId,
      action,
      timestamp: new Date(),
      ipAddress: '0.0.0.0', // Will be updated by server
      userAgent: navigator.userAgent,
    };

    // Only add resourceId if it's defined
    if (resourceId !== undefined) {
      auditLog.resourceId = resourceId;
    }

    // Only add resourceType if it's defined
    if (resourceType !== undefined) {
      auditLog.resourceType = resourceType;
    }

    // Only add details if it's defined
    if (details !== undefined) {
      auditLog.details = details;
    }

    return auditLog;
  }

  // Validate consent requirements
  static validateConsentRequirements(
    consent: UserConsent,
    requiredConsents: (keyof UserConsent)[]
  ): boolean {
    return requiredConsents.every(requirement => {
      if (typeof consent[requirement] === 'boolean') {
        return consent[requirement] === true;
      }
      return consent[requirement] != null;
    });
  }

  // Calculate data retention period based on jurisdiction
  static getRetentionPeriod(jurisdiction: 'US' | 'CA' | 'EU' | 'OTHER', dataType: string): number {
    const retentionPeriods = {
      'US': { 'personal': 2555, 'anonymized': -1, 'aggregated': -1 }, // 7 years
      'CA': { 'personal': 2555, 'anonymized': -1, 'aggregated': -1 }, // 7 years
      'EU': { 'personal': 2555, 'anonymized': -1, 'aggregated': -1 }, // 7 years
      'OTHER': { 'personal': 2555, 'anonymized': -1, 'aggregated': -1 }, // 7 years
    };

    return retentionPeriods[jurisdiction][dataType as keyof typeof retentionPeriods[typeof jurisdiction]] || 2555;
  }
}

// Data minimization utilities
export class DataMinimization {
  // Ensure only necessary fields are collected
  static sanitizeUserData(userData: any): any {
    const allowedFields = ['uid', 'email', 'displayName', 'role', 'partnerId', 'createdAt', 'lastActiveAt'];
    return Object.keys(userData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = userData[key];
        return obj;
      }, {} as any);
  }

  // Ensure only necessary fields are collected for journal entries
  static sanitizeJournalData(journalData: any): any {
    const allowedFields = ['userId', 'text', 'isShared', 'createdAt', 'analysis', 'appOrigin'];
    return Object.keys(journalData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = journalData[key];
        return obj;
      }, {} as any);
  }
}
