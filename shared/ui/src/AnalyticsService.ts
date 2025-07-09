// Analytics Service for MenoWellness
import { JournalEntry, SentimentAnalysisResponse } from '@metiscore/types';

export interface EmotionalPattern {
  date: string;
  sentiment: number;
  primary_emotion: string;
  emotional_intensity?: number;
}

export interface SymptomCorrelation {
  symptom: string;
  sentiment_impact: number;
  frequency: number;
  averageSentiment: number;
}

export interface AnalyticsData {
  overall_trend: 'improving' | 'declining' | 'stable';
  average_sentiment: number;
  emotional_patterns: EmotionalPattern[];
  symptom_correlations: SymptomCorrelation[];
  insights: string[];
  wellness_score: number;
  totalEntries: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  emotionalIntensityAverage: number;
  treatmentMentions: number;
  supportSystemStrength: 'low' | 'medium' | 'high';
  consistencyScore: number; // How consistent the journaling is
}

export interface SubscriptionStatus {
  isPremium: boolean;
  tier: 'free' | 'basic' | 'premium';
  features: string[];
}

export class AnalyticsService {
  private static readonly MENOPAUSE_SYMPTOMS = [
    'hot_flashes', 'hot_flash', 'night_sweats', 'night_sweat',
    'sleep_issues', 'insomnia', 'sleep_problems', 'sleepless',
    'mood_swings', 'mood_swing', 'irritability', 'irritable',
    'fatigue', 'tired', 'exhausted', 'energy',
    'anxiety', 'anxious', 'worried', 'stress',
    'depression', 'depressed', 'sad', 'down',
    'brain_fog', 'forgetful', 'memory', 'concentration',
    'joint_pain', 'aches', 'pain', 'stiff',
    'weight_gain', 'weight', 'bloating', 'bloated',
    'dry_skin', 'skin_changes', 'hair_loss', 'hair_thinning'
  ];

  private static readonly POSITIVE_EMOTIONS = [
    'happy', 'hopeful', 'content', 'optimistic', 'grateful',
    'peaceful', 'calm', 'confident', 'energetic', 'joyful'
  ];

  private static readonly NEGATIVE_EMOTIONS = [
    'anxious', 'frustrated', 'sad', 'angry', 'overwhelmed',
    'depressed', 'irritated', 'worried', 'stressed', 'lonely'
  ];

  /**
   * Process journal entries into comprehensive analytics data
   */
  static processAnalyticsData(entries: JournalEntry[]): AnalyticsData {
    if (entries.length === 0) {
      return this.getEmptyAnalyticsData();
    }

    const sortedEntries = entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const dateRange = {
      start: sortedEntries[0].createdAt,
      end: sortedEntries[sortedEntries.length - 1].createdAt
    };

    // Extract sentiment data and patterns
    const { sentimentScores, emotionalPatterns } = this.extractEmotionalData(entries);
    
    // Calculate symptom correlations
    const symptomCorrelations = this.calculateSymptomCorrelations(entries, sentimentScores);
    
    // Calculate overall metrics
    const averageSentiment = this.calculateAverageSentiment(sentimentScores);
    const overallTrend = this.calculateTrend(sentimentScores);
    const wellnessScore = this.calculateWellnessScore(averageSentiment, symptomCorrelations);
    
    // Calculate additional metrics for premium insights
    const emotionalIntensityAverage = emotionalPatterns.length > 0
      ? emotionalPatterns.reduce((sum, p) => sum + (p.emotional_intensity || 0.5), 0) / emotionalPatterns.length
      : 0.5;

    const treatmentMentions = this.countTreatmentMentions(entries);
    const supportSystemStrength = this.assessSupportSystem(entries);
    const consistencyScore = this.calculateConsistencyScore(entries, dateRange);

    // Generate insights
    const insights = this.generateInsights(
      averageSentiment,
      overallTrend,
      symptomCorrelations,
      entries.length,
      emotionalPatterns,
      treatmentMentions,
      supportSystemStrength
    );

    // Assess risk level
    const riskAssessment = this.assessRisk(entries, averageSentiment, symptomCorrelations);

    return {
      overall_trend: overallTrend,
      average_sentiment: averageSentiment,
      emotional_patterns: emotionalPatterns,
      symptom_correlations: symptomCorrelations,
      insights,
      wellness_score: wellnessScore,
      totalEntries: entries.length,
      dateRange,
      riskAssessment,
      emotionalIntensityAverage,
      treatmentMentions,
      supportSystemStrength,
      consistencyScore
    };
  }

  /**
   * Extract emotional data from journal entries
   */
  private static extractEmotionalData(entries: JournalEntry[]): {
    sentimentScores: number[];
    emotionalPatterns: EmotionalPattern[];
  } {
    const sentimentScores: number[] = [];
    const emotionalPatterns: EmotionalPattern[] = [];
    const symptomCounts: { [key: string]: { count: number; totalSentiment: number } } = {};

    entries.forEach(entry => {
      const analysis = entry.analysis as SentimentAnalysisResponse;
      if (analysis?.sentiment?.score !== undefined) {
        const sentimentScore = analysis.sentiment.score;
        sentimentScores.push(sentimentScore);

        emotionalPatterns.push({
          date: entry.createdAt.toISOString().split('T')[0],
          sentiment: sentimentScore,
          primary_emotion: analysis.emotions?.primary || 'neutral',
          emotional_intensity: analysis.emotions?.emotional_intensity || 0.5
        });

        // Extract symptoms from text (basic keyword matching)
        const text = entry.text.toLowerCase();
        const symptoms = ['hot_flashes', 'sleep_issues', 'mood_swings', 'fatigue', 'anxiety', 'depression'];

        symptoms.forEach(symptom => {
          const keywords = symptom.replace('_', ' ').split(' ');
          const hasSymptom = keywords.some(keyword => text.includes(keyword));

          if (hasSymptom) {
            if (!symptomCounts[symptom]) {
              symptomCounts[symptom] = { count: 0, totalSentiment: 0 };
            }
            symptomCounts[symptom].count++;
            symptomCounts[symptom].totalSentiment += sentimentScore;
          }
        });
      }
    });

    return { sentimentScores, emotionalPatterns };
  }

  /**
   * Calculate symptom correlations with sentiment
   */
  private static calculateSymptomCorrelations(
    entries: JournalEntry[], 
    sentimentScores: number[]
  ): SymptomCorrelation[] {
    const symptomData: Record<string, { sentiments: number[]; count: number }> = {};
    const averageSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length || 0.5;

    entries.forEach((entry, index) => {
      const text = entry.text.toLowerCase();
      const sentiment = sentimentScores[index];
      
      if (sentiment !== undefined) {
        this.MENOPAUSE_SYMPTOMS.forEach(symptom => {
          const symptomKey = symptom.replace('_', ' ');
          if (text.includes(symptom) || text.includes(symptomKey)) {
            const normalizedSymptom = this.normalizeSymptomName(symptom);
            
            if (!symptomData[normalizedSymptom]) {
              symptomData[normalizedSymptom] = { sentiments: [], count: 0 };
            }
            
            symptomData[normalizedSymptom].sentiments.push(sentiment);
            symptomData[normalizedSymptom].count++;
          }
        });
      }
    });

    return Object.entries(symptomData)
      .filter(([, data]) => data.count >= 2) // Only include symptoms mentioned at least twice
      .map(([symptom, data]) => {
        const avgSymptomSentiment = data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length;
        return {
          symptom,
          frequency: data.count,
          sentiment_impact: avgSymptomSentiment - averageSentiment,
          averageSentiment: avgSymptomSentiment
        };
      })
      .sort((a, b) => Math.abs(b.sentiment_impact) - Math.abs(a.sentiment_impact));
  }

  /**
   * Normalize symptom names for consistent grouping
   */
  private static normalizeSymptomName(symptom: string): string {
    const normalizations: Record<string, string> = {
      'hot_flash': 'hot_flashes',
      'hot_flashes': 'hot_flashes',
      'night_sweat': 'night_sweats',
      'night_sweats': 'night_sweats',
      'mood_swing': 'mood_swings',
      'mood_swings': 'mood_swings',
      'sleep_issues': 'sleep_problems',
      'sleep_problems': 'sleep_problems',
      'insomnia': 'sleep_problems',
      'sleepless': 'sleep_problems',
      'brain_fog': 'cognitive_issues',
      'forgetful': 'cognitive_issues',
      'memory': 'cognitive_issues',
      'concentration': 'cognitive_issues',
      'joint_pain': 'physical_pain',
      'aches': 'physical_pain',
      'pain': 'physical_pain',
      'weight_gain': 'weight_changes',
      'weight': 'weight_changes',
      'bloating': 'weight_changes',
      'bloated': 'weight_changes'
    };

    return normalizations[symptom] || symptom;
  }

  /**
   * Calculate average sentiment score
   */
  private static calculateAverageSentiment(sentimentScores: number[]): number {
    if (sentimentScores.length === 0) return 0.5;
    return sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
  }

  /**
   * Calculate overall trend from sentiment scores
   */
  private static calculateTrend(sentimentScores: number[]): 'improving' | 'declining' | 'stable' {
    if (sentimentScores.length < 4) return 'stable';

    const midPoint = Math.floor(sentimentScores.length / 2);
    const firstHalf = sentimentScores.slice(0, midPoint);
    const secondHalf = sentimentScores.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;

    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Calculate wellness score (1-10 scale)
   */
  private static calculateWellnessScore(
    averageSentiment: number, 
    symptomCorrelations: SymptomCorrelation[]
  ): number {
    let baseScore = averageSentiment * 10;

    // Adjust for symptom impact
    const negativeSymptoms = symptomCorrelations.filter(s => s.sentiment_impact < -0.2);
    const positiveSymptoms = symptomCorrelations.filter(s => s.sentiment_impact > 0.2);

    baseScore -= negativeSymptoms.length * 0.5;
    baseScore += positiveSymptoms.length * 0.3;

    return Math.max(1, Math.min(10, baseScore));
  }

  /**
   * Count treatment mentions in journal entries
   */
  private static countTreatmentMentions(entries: JournalEntry[]): number {
    const treatmentKeywords = [
      'hormone therapy', 'hrt', 'estrogen', 'progesterone',
      'medication', 'treatment', 'doctor', 'physician',
      'therapy', 'counseling', 'supplement', 'vitamins'
    ];

    let count = 0;
    entries.forEach(entry => {
      const text = entry.text.toLowerCase();
      treatmentKeywords.forEach(keyword => {
        if (text.includes(keyword)) count++;
      });
    });

    return count;
  }

  /**
   * Assess support system strength from journal entries
   */
  private static assessSupportSystem(entries: JournalEntry[]): 'low' | 'medium' | 'high' {
    const supportKeywords = [
      'partner', 'husband', 'spouse', 'family', 'friend',
      'support', 'understanding', 'help', 'care', 'love'
    ];

    let supportMentions = 0;
    let totalWords = 0;

    entries.forEach(entry => {
      const text = entry.text.toLowerCase();
      const words = text.split(' ').length;
      totalWords += words;

      supportKeywords.forEach(keyword => {
        if (text.includes(keyword)) supportMentions++;
      });
    });

    const supportRatio = totalWords > 0 ? supportMentions / totalWords : 0;

    if (supportRatio > 0.02) return 'high';
    if (supportRatio > 0.01) return 'medium';
    return 'low';
  }

  /**
   * Calculate journaling consistency score
   */
  private static calculateConsistencyScore(entries: JournalEntry[], dateRange: { start: Date; end: Date }): number {
    if (entries.length === 0) return 0;

    const totalDays = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const journalingDays = new Set(entries.map(entry => entry.createdAt.toISOString().split('T')[0])).size;

    return Math.min(10, (journalingDays / totalDays) * 10);
  }

  /**
   * Generate personalized insights
   */
  private static generateInsights(
    avgSentiment: number,
    trend: string,
    symptoms: SymptomCorrelation[],
    entryCount: number,
    emotionalPatterns: EmotionalPattern[],
    treatmentMentions?: number,
    supportSystemStrength?: 'low' | 'medium' | 'high'
  ): string[] {
    const insights: string[] = [];

    if (entryCount === 0) {
      insights.push('Start journaling regularly to see personalized insights about your wellness journey.');
      return insights;
    }

    // Sentiment-based insights
    if (avgSentiment > 0.7) {
      insights.push('Your overall emotional wellness is strong. Keep up the positive momentum!');
    } else if (avgSentiment < 0.4) {
      insights.push('Your recent entries show some challenges. Consider reaching out to your healthcare provider for support.');
    } else {
      insights.push('Your emotional wellness shows a balanced pattern with opportunities for improvement.');
    }

    // Trend-based insights
    if (trend === 'improving') {
      insights.push('Excellent progress! Your emotional wellness has been improving over time.');
    } else if (trend === 'declining') {
      insights.push('Your wellness trend shows some decline. Consider focusing on self-care strategies and professional support.');
    }

    // Symptom-based insights
    if (symptoms.length > 0) {
      const mostImpactfulSymptom = symptoms[0];
      if (Math.abs(mostImpactfulSymptom.sentiment_impact) > 0.15) {
        const symptomName = mostImpactfulSymptom.symptom.replace('_', ' ');
        if (mostImpactfulSymptom.sentiment_impact < 0) {
          insights.push(`${symptomName} appears to significantly impact your mood. Consider discussing management strategies with your healthcare provider.`);
        } else {
          insights.push(`Interestingly, ${symptomName} seems to correlate with better mood days.`);
        }
      }
    }

    // Emotional pattern insights
    if (emotionalPatterns.length >= 7) {
      const emotionCounts: Record<string, number> = {};
      emotionalPatterns.forEach(pattern => {
        emotionCounts[pattern.primary_emotion] = (emotionCounts[pattern.primary_emotion] || 0) + 1;
      });
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (dominantEmotion && dominantEmotion[1] > emotionalPatterns.length * 0.4) {
        const emotion = dominantEmotion[0].replace('_', ' ');
        insights.push(`You've been experiencing ${emotion} feelings frequently. Consider exploring what triggers these emotions.`);
      }
    }

    // Treatment-related insights (basic, without revealing detailed analysis)
    if (treatmentMentions && treatmentMentions > 0) {
      if (treatmentMentions >= 3) {
        insights.push('You\'re actively exploring treatment options. This proactive approach is beneficial for your wellness journey.');
      } else {
        insights.push('Consider discussing treatment options with your healthcare provider if you haven\'t already.');
      }
    }

    // Support system insights (basic)
    if (supportSystemStrength) {
      if (supportSystemStrength === 'high') {
        insights.push('Your strong support system is a valuable asset in your menopause journey.');
      } else if (supportSystemStrength === 'low') {
        insights.push('Building a stronger support network could enhance your wellness experience.');
      }
    }

    // Entry frequency insight
    if (entryCount < 5) {
      insights.push('More regular journaling will help provide better insights into your wellness patterns.');
    } else if (entryCount >= 20) {
      insights.push('Great job maintaining consistent journaling! This helps create more accurate wellness insights.');
    }

    return insights;
  }

  /**
   * Assess risk level based on journal data
   */
  private static assessRisk(
    entries: JournalEntry[],
    avgSentiment: number,
    symptoms: SymptomCorrelation[]
  ): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    // Check sentiment levels
    if (avgSentiment < 0.3) {
      riskScore += 3;
      factors.push('Consistently low mood scores');
    } else if (avgSentiment < 0.5) {
      riskScore += 1;
      factors.push('Below-average mood scores');
    }

    // Check for crisis indicators in recent entries
    const recentEntries = entries.slice(0, 5);
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'hopeless', 'worthless'];
    
    recentEntries.forEach(entry => {
      const text = entry.text.toLowerCase();
      const analysis = entry.analysis as SentimentAnalysisResponse;
      
      if (analysis?.crisisAssessment?.risk_level === 'high') {
        riskScore += 4;
        factors.push('High crisis risk detected in recent entries');
      }
      
      crisisKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          riskScore += 2;
          factors.push('Concerning language patterns detected');
        }
      });
    });

    // Check symptom severity
    const severeSymptoms = symptoms.filter(s => s.sentiment_impact < -0.3 && s.frequency >= 5);
    if (severeSymptoms.length >= 2) {
      riskScore += 2;
      factors.push('Multiple severe symptoms affecting mood');
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 5) {
      level = 'high';
    } else if (riskScore >= 2) {
      level = 'medium';
    }

    return { level, factors };
  }

  /**
   * Get empty analytics data structure
   */
  private static getEmptyAnalyticsData(): AnalyticsData {
    return {
      overall_trend: 'stable',
      average_sentiment: 0.5,
      emotional_patterns: [],
      symptom_correlations: [],
      insights: ['Start journaling regularly to see personalized insights about your wellness journey.'],
      wellness_score: 5.0,
      totalEntries: 0,
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      riskAssessment: {
        level: 'low',
        factors: []
      },
      emotionalIntensityAverage: 0.5,
      treatmentMentions: 0,
      supportSystemStrength: 'low',
      consistencyScore: 0
    };
  }

  /**
   * Check subscription status (placeholder for actual implementation)
   */
  static async checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    // TODO: Implement actual subscription check
    return {
      isPremium: false,
      tier: 'free',
      features: ['Basic journal entries', 'Simple mood tracking', 'Basic privacy protection']
    };
  }

  /**
   * Get emotion distribution from patterns
   */
  static getEmotionDistribution(patterns: EmotionalPattern[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    patterns.forEach(pattern => {
      const emotion = pattern.primary_emotion;
      distribution[emotion] = (distribution[emotion] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Calculate sentiment trend over time periods
   */
  static calculatePeriodTrends(patterns: EmotionalPattern[], periodDays: number = 7): Array<{
    period: string;
    averageSentiment: number;
    entryCount: number;
  }> {
    if (patterns.length === 0) return [];

    const sortedPatterns = patterns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const periods: Array<{ period: string; averageSentiment: number; entryCount: number }> = [];
    
    const startDate = new Date(sortedPatterns[0].date);
    const endDate = new Date(sortedPatterns[sortedPatterns.length - 1].date);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + periodDays - 1);
      
      const periodPatterns = sortedPatterns.filter(pattern => {
        const patternDate = new Date(pattern.date);
        return patternDate >= currentDate && patternDate <= periodEnd;
      });
      
      if (periodPatterns.length > 0) {
        const avgSentiment = periodPatterns.reduce((sum, p) => sum + p.sentiment, 0) / periodPatterns.length;
        periods.push({
          period: `${currentDate.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
          averageSentiment: avgSentiment,
          entryCount: periodPatterns.length
        });
      }
      
      currentDate.setDate(currentDate.getDate() + periodDays);
    }
    
    return periods;
  }
}
