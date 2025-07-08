// Subscription Service for MenoWellness Premium Features
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface SubscriptionTier {
  id: 'free' | 'basic' | 'premium';
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  analyticsFeatures: string[];
  limits: {
    journalEntries: number | 'unlimited';
    analyticsHistory: number; // days
    pdfReports: number | 'unlimited';
    aiInsights: boolean;
    symptomTracking: boolean;
    trendAnalysis: boolean;
  };
}

export interface UserSubscription {
  userId: string;
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for compatibility with SubscriptionManager
export type AnalyticsUserSubscription = UserSubscription;

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic journal entries',
      'Simple mood tracking',
      'Basic privacy protection',
      'Community access'
    ],
    analyticsFeatures: [
      'Basic entry count',
      'Simple mood overview'
    ],
    limits: {
      journalEntries: 50,
      analyticsHistory: 7,
      pdfReports: 0,
      aiInsights: false,
      symptomTracking: false,
      trendAnalysis: false
    }
  },
  basic: {
    id: 'basic',
    name: 'Basic Analytics',
    price: 9.99,
    interval: 'month',
    features: [
      'Everything in Free',
      'Basic sentiment analysis',
      'Simple trend charts',
      'Monthly wellness summary',
      'Email support'
    ],
    analyticsFeatures: [
      'Sentiment tracking',
      'Basic emotion patterns',
      '30-day trend analysis',
      'Simple insights'
    ],
    limits: {
      journalEntries: 200,
      analyticsHistory: 30,
      pdfReports: 2,
      aiInsights: true,
      symptomTracking: true,
      trendAnalysis: false
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium Analytics',
    price: 19.99,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Advanced AI insights',
      'Detailed trend analysis',
      'Symptom correlation tracking',
      'Healthcare provider reports',
      'PDF export functionality',
      'Priority support',
      'Partner insights (when connected)'
    ],
    analyticsFeatures: [
      'Advanced sentiment analysis',
      'Detailed emotion patterns',
      'Unlimited trend analysis',
      'Symptom correlations',
      'Risk assessments',
      'Healthcare reports',
      'Predictive insights',
      'Custom date ranges'
    ],
    limits: {
      journalEntries: 'unlimited',
      analyticsHistory: 365,
      pdfReports: 'unlimited',
      aiInsights: true,
      symptomTracking: true,
      trendAnalysis: true
    }
  }
};

export class SubscriptionService {
  /**
   * Get user's current subscription status
   */
  static async getUserSubscription(userId: string, db: any): Promise<UserSubscription> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        return {
          userId,
          tier: data.tier || 'free',
          status: data.status || 'active',
          currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          trialEnd: data.trialEnd?.toDate(),
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      } else {
        // Create default free subscription
        const defaultSubscription: UserSubscription = {
          userId,
          tier: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(subscriptionRef, {
          ...defaultSubscription,
          currentPeriodStart: serverTimestamp(),
          currentPeriodEnd: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return defaultSubscription;
      }
    } catch (error) {
      console.error('Error getting user subscription:', error);
      // Return default free subscription on error
      return {
        userId,
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * Check if user has access to specific feature
   */
  static hasFeatureAccess(subscription: UserSubscription, feature: keyof SubscriptionTier['limits']): boolean {
    if (subscription.status !== 'active') return false;
    
    const tier = SUBSCRIPTION_TIERS[subscription.tier];
    if (!tier) return false;

    const limit = tier.limits[feature];
    return limit === true || limit === 'unlimited' || (typeof limit === 'number' && limit > 0);
  }

  /**
   * Check if user can access analytics features
   */
  static canAccessAnalytics(subscription: UserSubscription): boolean {
    return subscription.status === 'active' && subscription.tier !== 'free';
  }

  /**
   * Check if user can access premium analytics
   */
  static canAccessPremiumAnalytics(subscription: UserSubscription): boolean {
    return subscription.status === 'active' && subscription.tier === 'premium';
  }

  /**
   * Get available features for user's subscription
   */
  static getAvailableFeatures(subscription: UserSubscription): string[] {
    const tier = SUBSCRIPTION_TIERS[subscription.tier];
    return tier ? tier.features : SUBSCRIPTION_TIERS.free.features;
  }

  /**
   * Get analytics features for user's subscription
   */
  static getAnalyticsFeatures(subscription: UserSubscription): string[] {
    const tier = SUBSCRIPTION_TIERS[subscription.tier];
    return tier ? tier.analyticsFeatures : SUBSCRIPTION_TIERS.free.analyticsFeatures;
  }

  /**
   * Check if subscription is expired
   */
  static isSubscriptionExpired(subscription: UserSubscription): boolean {
    if (subscription.tier === 'free') return false;
    return new Date() > subscription.currentPeriodEnd;
  }

  /**
   * Get days until subscription expires
   */
  static getDaysUntilExpiration(subscription: UserSubscription): number {
    if (subscription.tier === 'free') return Infinity;
    const now = new Date();
    const expiration = subscription.currentPeriodEnd;
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update subscription status
   */
  static async updateSubscription(
    userId: string, 
    updates: Partial<UserSubscription>,
    db: any
  ): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'user_subscriptions', userId);
      await updateDoc(subscriptionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(userId: string, db: any): Promise<void> {
    try {
      await this.updateSubscription(userId, {
        cancelAtPeriodEnd: true,
        status: 'cancelled'
      }, db);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  static async reactivateSubscription(userId: string, db: any): Promise<void> {
    try {
      await this.updateSubscription(userId, {
        cancelAtPeriodEnd: false,
        status: 'active'
      }, db);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Start free trial
   */
  static async startFreeTrial(userId: string, tier: 'basic' | 'premium', db: any): Promise<void> {
    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

      await this.updateSubscription(userId, {
        tier,
        status: 'trial',
        trialEnd,
        currentPeriodEnd: trialEnd
      }, db);
    } catch (error) {
      console.error('Error starting free trial:', error);
      throw error;
    }
  }

  /**
   * Get upgrade recommendations based on usage
   */
  static getUpgradeRecommendations(
    subscription: UserSubscription,
    usage: {
      journalEntries: number;
      analyticsViews: number;
      pdfDownloads: number;
    }
  ): {
    shouldUpgrade: boolean;
    recommendedTier: 'basic' | 'premium';
    reasons: string[];
  } {
    const currentTier = SUBSCRIPTION_TIERS[subscription.tier];
    const reasons: string[] = [];
    let shouldUpgrade = false;
    let recommendedTier: 'basic' | 'premium' = 'basic';

    // Check journal entry limits
    if (typeof currentTier.limits.journalEntries === 'number' && 
        usage.journalEntries >= currentTier.limits.journalEntries * 0.8) {
      reasons.push('Approaching journal entry limit');
      shouldUpgrade = true;
    }

    // Check analytics usage
    if (!currentTier.limits.aiInsights && usage.analyticsViews > 10) {
      reasons.push('Heavy analytics usage detected');
      shouldUpgrade = true;
      recommendedTier = 'basic';
    }

    // Check PDF usage
    if (typeof currentTier.limits.pdfReports === 'number' && 
        usage.pdfDownloads >= currentTier.limits.pdfReports) {
      reasons.push('PDF report limit reached');
      shouldUpgrade = true;
      recommendedTier = 'premium';
    }

    // Recommend premium for power users
    if (subscription.tier === 'basic' && 
        usage.journalEntries > 100 && 
        usage.analyticsViews > 50) {
      reasons.push('Power user - unlock advanced features');
      shouldUpgrade = true;
      recommendedTier = 'premium';
    }

    return {
      shouldUpgrade,
      recommendedTier,
      reasons
    };
  }
}
