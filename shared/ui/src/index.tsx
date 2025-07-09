// packages/shared/ui/src/index.tsx
export * from './Button';
export * from './Journal';
export * from './AnalysisReport';
export * from './ConsentManager';
export * from './SecurityAuthProvider';
export * from './security-utils';
export * from './UserDataManager';
export * from './KeyManager';
export * from './DataProcessingAgreement';
export * from './SentimentAnalysisService';
export * from './PDFReportService';
// Export SubscriptionManager components and types with aliases to avoid conflicts
export {
  SubscriptionManager
} from './SubscriptionManager';

export type {
  SubscriptionTier as SubscriptionManagerTier,
  UserSubscription as SubscriptionManagerUserSubscription
} from './SubscriptionManager';

export * from './AnalyticsService';

// Export SubscriptionService with original names (these are the main subscription types)
export * from './SubscriptionService';
export * from './SimpleChart';
