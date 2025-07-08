'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionManagerProps {
  currentSubscription: UserSubscription;
  onUpgrade: (tierId: string) => Promise<void>;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic journal entries',
      'Simple mood tracking',
      'Basic privacy protection',
      'Community access'
    ]
  },
  {
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
    ]
  },
  {
    id: 'premium',
    name: 'Premium Analytics',
    price: 19.99,
    interval: 'month',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced AI insights',
      'Detailed trend analysis',
      'Symptom correlation tracking',
      'Healthcare provider reports',
      'PDF export functionality',
      'Priority support',
      'Partner insights (when connected)'
    ]
  }
];

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  currentSubscription,
  onUpgrade,
  onCancel,
  onReactivate
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleUpgrade = async (tierId: string) => {
    setLoading(true);
    setSelectedTier(tierId);
    try {
      await onUpgrade(tierId);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
      setSelectedTier(null);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel();
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await onReactivate();
    } catch (error) {
      console.error('Reactivation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentTier = (tierId: string) => {
    return currentSubscription.tier === tierId && currentSubscription.status === 'active';
  };

  const canUpgradeTo = (tierId: string) => {
    const tierOrder = ['free', 'basic', 'premium'];
    const currentIndex = tierOrder.indexOf(currentSubscription.tier);
    const targetIndex = tierOrder.indexOf(tierId);
    return targetIndex > currentIndex;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current Subscription Status */}
      {currentSubscription.tier !== 'free' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {currentSubscription.tier} Plan
              </p>
              <p className="text-sm text-gray-600">
                Status: <span className={`font-medium ${
                  currentSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentSubscription.status}
                </span>
              </p>
              {currentSubscription.currentPeriodEnd && (
                <p className="text-sm text-gray-600">
                  {currentSubscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                  {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd && (
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              )}
              {currentSubscription.cancelAtPeriodEnd && (
                <Button
                  onClick={handleReactivate}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
              tier.popular ? 'border-purple-500' : 'border-gray-200'
            } ${isCurrentTier(tier.id) ? 'ring-2 ring-green-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            {isCurrentTier(tier.id) && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold text-gray-900">
                ${tier.price}
                <span className="text-lg font-normal text-gray-600">/{tier.interval}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {isCurrentTier(tier.id) ? (
                <Button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Current Plan
                </Button>
              ) : canUpgradeTo(tier.id) ? (
                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    tier.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${loading && selectedTier === tier.id ? 'opacity-50' : ''}`}
                >
                  {loading && selectedTier === tier.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Upgrading...
                    </div>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </Button>
              ) : tier.id === 'free' ? (
                <Button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Downgrade Not Available
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Lower Tier
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Free</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Basic</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Journal Entries', free: '✓', basic: '✓', premium: '✓' },
                { feature: 'Mood Tracking', free: '✓', basic: '✓', premium: '✓' },
                { feature: 'Basic Analytics', free: '✗', basic: '✓', premium: '✓' },
                { feature: 'Sentiment Analysis', free: '✗', basic: 'Basic', premium: 'Advanced' },
                { feature: 'Trend Charts', free: '✗', basic: 'Simple', premium: 'Detailed' },
                { feature: 'Healthcare Reports', free: '✗', basic: '✗', premium: '✓' },
                { feature: 'PDF Export', free: '✗', basic: '✗', premium: '✓' },
                { feature: 'Partner Insights', free: '✗', basic: '✗', premium: '✓' },
                { feature: 'Priority Support', free: '✗', basic: '✗', premium: '✓' },
              ].map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.free}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.basic}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription at any time?</h3>
            <p className="text-gray-700 text-sm">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Is my health data secure?</h3>
            <p className="text-gray-700 text-sm">Absolutely. We use end-to-end encryption and comply with HIPAA, PIPEDA, PHIPA, and GDPR regulations to protect your personal health information.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens to my data if I downgrade?</h3>
            <p className="text-gray-700 text-sm">Your data is always preserved. If you downgrade, you'll lose access to premium features but can upgrade again at any time to regain full access.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
