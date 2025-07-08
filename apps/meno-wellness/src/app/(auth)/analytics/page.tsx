'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth-provider';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { JournalEntry } from '@metiscore/types';
import {
  AnalyticsService,
  AnalyticsData,
  SubscriptionService,
  AnalyticsUserSubscription,
  SimpleLineChart,
  EmotionDistribution,
  SymptomImpactChart,
  WellnessScoreGauge,
  PDFReportService
} from '@metiscore/ui';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [subscription, setSubscription] = useState<AnalyticsUserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadAnalyticsData();
  }, [user, router]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      // Load journal entries
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50) // Increased for better analytics
      );

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as JournalEntry[];

      setJournalEntries(entries);

      // Process analytics data using the service
      const analytics = AnalyticsService.processAnalyticsData(entries);
      setAnalyticsData(analytics);

      // Check subscription status
      const userSubscription = await SubscriptionService.getUserSubscription(user.uid, db);
      setSubscription(userSubscription);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };



  const generatePDFReport = async () => {
    if (!analyticsData || !user || !subscription) return;

    // Check if user has premium access
    if (!SubscriptionService.canAccessPremiumAnalytics(subscription)) {
      alert('PDF reports are a premium feature. Please upgrade your subscription to access this functionality.');
      return;
    }

    try {
      const userInfo = {
        name: user.displayName || user.email || 'MenoWellness User',
        email: user.email || '',
        userId: user.uid
      };

      await PDFReportService.generateAndDownloadReport(
        userInfo,
        journalEntries,
        analyticsData,
        'Last 30 days'
      );

      // Track usage for analytics
      console.log('PDF report generated successfully for user:', user.uid);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating report. Please try again or contact support.');
    }
  };

  const printPDFReport = async () => {
    if (!analyticsData || !user || !subscription) return;

    // Check if user has premium access
    if (!SubscriptionService.canAccessPremiumAnalytics(subscription)) {
      alert('PDF reports are a premium feature. Please upgrade your subscription to access this functionality.');
      return;
    }

    try {
      const userInfo = {
        name: user.displayName || user.email || 'MenoWellness User',
        email: user.email || '',
        userId: user.uid
      };

      await PDFReportService.generateAndPrintReport(
        userInfo,
        journalEntries,
        analyticsData,
        'Last 30 days'
      );

    } catch (error) {
      console.error('Error printing PDF report:', error);
      alert('Error printing report. Please try again or contact support.');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Analytics</h1>
                <p className="text-sm text-gray-600">AI-powered insights into your menopause journey</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={generatePDFReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📄</span>
                <span>Share With Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subscription Status and Upgrade Prompts */}
        {subscription && (
          <div className="mb-8">
            {/* Current Subscription Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    subscription.status === 'active' ? 'bg-green-500' :
                    subscription.status === 'trial' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {subscription.tier} Plan {subscription.status === 'trial' && '(Trial)'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {subscription.tier === 'free' ? 'Free forever' :
                       `${subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} ${subscription.currentPeriodEnd.toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {SubscriptionService.getAnalyticsFeatures(subscription).length} analytics features
                </div>
              </div>
            </div>

            {/* Upgrade Prompt for Non-Premium Users */}
            {!SubscriptionService.canAccessPremiumAnalytics(subscription) && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      🌟 {subscription.tier === 'free' ? 'Unlock Analytics' : 'Upgrade to Premium'}
                    </h2>
                    <p className="text-purple-100 mb-3">
                      {subscription.tier === 'free'
                        ? 'Get detailed insights, trend analysis, and AI-powered recommendations'
                        : 'Access advanced features, unlimited history, and healthcare reports'
                      }
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SubscriptionService.getAnalyticsFeatures(
                        subscription.tier === 'free' ?
                        { ...subscription, tier: 'basic' } :
                        { ...subscription, tier: 'premium' }
                      ).slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                  >
                    {subscription.tier === 'free' ? 'Start Free Trial' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Trial Expiration Warning */}
            {subscription.status === 'trial' && subscription.trialEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⏰</div>
                  <div>
                    <p className="text-yellow-800 font-medium">
                      Trial expires in {SubscriptionService.getDaysUntilExpiration(subscription)} days
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Upgrade now to keep your analytics history and insights
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium Export Buttons */}
        {subscription && SubscriptionService.canAccessPremiumAnalytics(subscription) && analyticsData && (
          <div className="flex justify-end mb-6 space-x-3">
            <button
              type="button"
              onClick={printPDFReport}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <span>🖨️</span>
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={generatePDFReport}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>📄</span>
              <span>Share with Doctor (PDF)</span>
            </button>
          </div>
        )}

        {/* Premium Feature Teaser for Non-Premium Users */}
        {subscription && !SubscriptionService.canAccessPremiumAnalytics(subscription) && analyticsData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 text-2xl">📄</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Healthcare Provider Reports</h3>
                  <p className="text-blue-700 text-sm">Generate comprehensive PDF reports to share with your doctor</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📈' },
                { id: 'sentiment', label: 'Sentiment Trends', icon: '😊' },
                { id: 'symptoms', label: 'Symptom Patterns', icon: '🌡️' },
                { id: 'insights', label: 'AI Insights', icon: '🧠' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Journal Entries</p>
                    <p className="text-2xl font-bold text-gray-900">{journalEntries.length}</p>
                  </div>
                  <div className="text-3xl">📝</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Sentiment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData ? (analyticsData.average_sentiment * 100).toFixed(0) : '--'}%
                    </p>
                  </div>
                  <div className="text-3xl">😊</div>
                </div>
                <p className={`text-xs mt-2 ${
                  analyticsData?.overall_trend === 'improving' ? 'text-green-600' :
                  analyticsData?.overall_trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analyticsData?.overall_trend === 'improving' ? '↗ Improving trend' :
                   analyticsData?.overall_trend === 'declining' ? '↘ Declining trend' : '→ Stable trend'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wellness Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData ? analyticsData.wellness_score.toFixed(1) : '--'}/10
                    </p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">Based on AI analysis</p>
              </div>

              {/* Risk Assessment Card */}
              {analyticsData?.riskAssessment && (
                <div className="md:col-span-3 mt-4">
                  <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                    analyticsData.riskAssessment.level === 'high' ? 'border-red-500' :
                    analyticsData.riskAssessment.level === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Wellness Assessment</h3>
                        <p className={`text-sm font-medium ${
                          analyticsData.riskAssessment.level === 'high' ? 'text-red-600' :
                          analyticsData.riskAssessment.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Risk Level: {analyticsData.riskAssessment.level.toUpperCase()}
                        </p>
                      </div>
                      <div className={`text-3xl ${
                        analyticsData.riskAssessment.level === 'high' ? '🚨' :
                        analyticsData.riskAssessment.level === 'medium' ? '⚠️' : '✅'
                      }`}></div>
                    </div>
                    {analyticsData.riskAssessment.factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Factors:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analyticsData.riskAssessment.factors.map((factor, index) => (
                            <li key={index}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analyticsData.riskAssessment.level !== 'low' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Consider discussing these patterns with your healthcare provider for personalized support.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wellness Score Gauge */}
              {analyticsData && (
                <div className="md:col-span-3 mt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <WellnessScoreGauge
                      score={analyticsData.wellness_score}
                      title="Overall Wellness Score"
                    />

                    <div className="md:col-span-2">
                      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journaling Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{analyticsData.totalEntries}</p>
                            <p className="text-sm text-gray-600">Total Entries</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {Math.round((new Date().getTime() - analyticsData.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-sm text-gray-600">Days Tracked</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {analyticsData.emotional_patterns.length > 0 ?
                                Math.round((analyticsData.totalEntries / Math.max(1, Math.round((new Date().getTime() - analyticsData.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)))) * 10) / 10
                                : 0}
                            </p>
                            <p className="text-sm text-gray-600">Avg Entries/Day</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {Object.keys(AnalyticsService.getEmotionDistribution(analyticsData.emotional_patterns)).length}
                            </p>
                            <p className="text-sm text-gray-600">Unique Emotions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trends Over Time</h3>
              {subscription && SubscriptionService.canAccessPremiumAnalytics(subscription) ? (
                <div className="space-y-6">
                  {/* Sentiment Trend Chart */}
                  {analyticsData && analyticsData.emotional_patterns.length > 0 ? (
                    <>
                      <SimpleLineChart
                        data={analyticsData.emotional_patterns.map(pattern => ({
                          date: pattern.date,
                          value: pattern.sentiment,
                          label: pattern.primary_emotion
                        }))}
                        title="Sentiment Over Time"
                        color="#8B5CF6"
                        height={250}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <EmotionDistribution
                          emotions={AnalyticsService.getEmotionDistribution(analyticsData.emotional_patterns)}
                          title="Emotion Distribution"
                        />

                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Trend Summary</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Overall trend:</span>
                              <span className={`font-medium capitalize ${
                                analyticsData.overall_trend === 'improving' ? 'text-green-600' :
                                analyticsData.overall_trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {analyticsData.overall_trend}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Average sentiment:</span>
                              <span className="font-medium">{(analyticsData.average_sentiment * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Entries analyzed:</span>
                              <span className="font-medium">{analyticsData.emotional_patterns.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Emotional intensity:</span>
                              <span className="font-medium">{(analyticsData.emotionalIntensityAverage * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Support system:</span>
                              <span className={`font-medium capitalize ${
                                analyticsData.supportSystemStrength === 'high' ? 'text-green-600' :
                                analyticsData.supportSystemStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {analyticsData.supportSystemStrength}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Consistency score:</span>
                              <span className="font-medium">{analyticsData.consistencyScore.toFixed(1)}/10</span>
                            </div>
                            {analyticsData.treatmentMentions > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Treatment mentions:</span>
                                <span className="font-medium">{analyticsData.treatmentMentions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No sentiment data available yet.</p>
                      <p className="text-sm mt-2">Start journaling to see your emotional patterns!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <p className="text-gray-600 mb-4">Premium feature - Upgrade to see detailed sentiment analysis</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="space-y-6">
              {analyticsData && analyticsData.symptom_correlations.length > 0 ? (
                <>
                  <SymptomImpactChart
                    symptoms={analyticsData.symptom_correlations}
                    title="Symptom Impact on Mood"
                  />

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Symptom Analysis</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {analyticsData.symptom_correlations.slice(0, 6).map((symptom, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {symptom.symptom.replace('_', ' ')}
                            </h4>
                            <span className={`text-sm font-medium ${
                              symptom.sentiment_impact < -0.2 ? 'text-red-600' :
                              symptom.sentiment_impact > 0.2 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {symptom.sentiment_impact > 0 ? '+' : ''}{(symptom.sentiment_impact * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Frequency: {symptom.frequency} times</div>
                            <div>Avg sentiment: {(symptom.averageSentiment * 100).toFixed(0)}%</div>
                            <div className={`text-xs ${
                              Math.abs(symptom.sentiment_impact) > 0.3 ? 'text-red-600' :
                              Math.abs(symptom.sentiment_impact) > 0.1 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {Math.abs(symptom.sentiment_impact) > 0.3 ? 'High impact' :
                               Math.abs(symptom.sentiment_impact) > 0.1 ? 'Moderate impact' : 'Low impact'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Pattern Analysis</h3>
                  <div className="text-center py-8 text-gray-500">
                    <p>No symptom patterns detected yet.</p>
                    <p className="text-sm mt-2">Journal about your symptoms to see correlations with your mood!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
              {analyticsData && analyticsData.insights.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl">💡</div>
                      <div>
                        <p className="text-blue-900">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No insights available yet.</p>
                  <p className="text-sm mt-2">Keep journaling to unlock personalized AI insights!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
