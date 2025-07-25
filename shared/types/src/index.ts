export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'primary' | 'partner' | 'provider'; // Expanded for future use
  partnerId?: string | null; // The UID of the linked partner/primary user
  // Security and compliance fields
  createdAt?: Date;
  lastActiveAt?: Date;
  // We can add more fields here later for Dr. Alex AI, like 'authorizedPatientIds'
}

export interface JournalEntry {
  id: string; // The Firestore document ID
  userId: string; // The UID of the user who wrote it
  createdAt: Date; // JavaScript Date object
  text: string; // The raw text for analysis (might be handled ephemerally)
  encryptedText?: EncryptedData; // End-to-end encrypted text
  isEncrypted?: boolean; // Whether the text field is encrypted
  analysis: Record<string, any>; // The structured JSON from the sentiment service
  isShared: boolean;
  appOrigin: string; // e.g., 'MenoWellness', 'SoberPal', etc.
  mood?: string; // For mood entries
  type?: string; // Entry type (e.g., 'mood_entry')
}

export interface Invite {
  id: string; // The Firestore document ID
  fromUserId: string; // UID of the user who sent the invite
  toEmail: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

// Add this new interface to the file

export interface SentimentAnalysisResponse {
  insights?: {
    overall_assessment?: string;
  };
  sentiment?: {
    category?: string;
    score?: number;
  };
  emotions?: {
    primary?: string;
    emotional_intensity?: number;
  };
  crisisAssessment?: {
    risk_level?: string;
  };
  // We can add any other fields from your API here
}

export interface RichAnalysisResponse extends SentimentAnalysisResponse {
  partnerInsights?: {
    supportRecommendations?: string[];
    relationshipImpact?: string;
    actionableSteps?: string[];
  };
  partnerSupportInsights?: {
    relationshipHealth?: string;
    supportRecommendations?: string[];
    relationshipImpact?: string;
    actionableSteps?: string[];
  };
  relationshipSupport?: string[];
  riskAssessment?: {
    concernLevel?: 'low' | 'medium' | 'high';
    recommendedActions?: string[];
    riskLevel?: string;
  };
  // Enhanced analysis for partners
}

// Security and Compliance Types
export interface UserConsent {
  userId: string;
  dataProcessing: boolean;
  sentimentAnalysis: boolean;
  anonymizedLicensing: boolean;
  researchParticipation: boolean;
  consentTimestamp: Date;
  ipAddress: string;
  userAgent: string;
  jurisdiction: 'US' | 'CA' | 'EU' | 'OTHER';
  version: string; // Consent version for tracking changes
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
}

export interface DataRetention {
  userId: string;
  dataType: 'personal' | 'anonymized' | 'aggregated';
  createdAt: Date;
  retentionPeriod: number; // in days
  scheduledDeletion?: Date;
  jurisdiction: 'US' | 'CA' | 'EU' | 'OTHER';
}

export interface EncryptedData {
  encryptedValue: string;
  keyId: string;
  algorithm: 'AES-256-GCM';
  createdAt: Date;
}

export interface AnonymizedJournalEntry {
  id: string;
  anonymizedUserId: string;
  anonymizedText: string;
  sentimentScore: number;
  emotionalIntensity: number;
  timestamp: Date; // Rounded to hour for privacy
  cohortId: string;
  privacyBudgetUsed: number;
}

export interface DeletionRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confirmationText: string;
  ipAddress: string;
  userAgent: string;
  processedAt?: Date;
  notes?: string;
}
