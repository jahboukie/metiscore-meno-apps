// Sentiment Analysis Service for MenoWellness
import { SentimentAnalysisResponse, RichAnalysisResponse } from '@metiscore/types';

export interface SentimentAnalysisRequest {
  text: string;
  userId: string;
  context?: 'menopause' | 'general';
  includePartnerInsights?: boolean;
}

export class SentimentAnalysisService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_SENTIMENT_API_URL || 'https://api.openai.com/v1/chat/completions';
  private static readonly TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Analyze text sentiment with menopause-specific context
   * Uses real API but filters response to protect proprietary insights
   */
  static async analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse | RichAnalysisResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      // Call the real sentiment analysis API
      const response = await this.callRealSentimentAPI(request);

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Call the real sentiment analysis API and filter the response
   */
  private static async callRealSentimentAPI(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse | RichAnalysisResponse> {
    try {
      const apiResponse = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          context: request.context || 'menopause',
          includePartnerInsights: request.includePartnerInsights || false
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const fullResponse = await apiResponse.json();

      // Filter the response to show only basic insights (protect the secret sauce)
      return this.filterAPIResponse(fullResponse, request.includePartnerInsights || false);

    } catch (error) {
      console.error('Real API call failed, falling back to basic analysis:', error);
      // Fallback to basic analysis if API fails
      return this.basicSentimentAnalysis(request);
    }
  }

  /**
   * Filter the rich API response to show only essential information
   * This protects the proprietary insights while still providing value
   */
  private static filterAPIResponse(fullResponse: any, includePartnerInsights: boolean): SentimentAnalysisResponse | RichAnalysisResponse {
    // Extract only basic sentiment information
    const basicResponse: SentimentAnalysisResponse = {
      sentiment: {
        category: fullResponse.sentiment?.category || 'neutral',
        score: fullResponse.sentiment?.score || 0.5
      },
      emotions: {
        primary: fullResponse.emotions?.primary || 'neutral',
        emotional_intensity: fullResponse.emotions?.emotional_intensity || 0.5
      },
      crisisAssessment: {
        risk_level: fullResponse.crisisAssessment?.risk_level || 'low'
      },
      insights: {
        // Provide only high-level assessment, not detailed recommendations
        overall_assessment: this.generateBasicAssessment(
          fullResponse.sentiment?.category,
          fullResponse.emotions?.primary,
          fullResponse.crisisAssessment?.risk_level
        )
      }
    };

    // For partner insights, add minimal additional information
    if (includePartnerInsights) {
      const richResponse: RichAnalysisResponse = {
        ...basicResponse,
        relationshipSupport: this.generateBasicSupportTips(fullResponse.emotions?.primary),
        riskAssessment: {
          concernLevel: this.mapRiskLevel(fullResponse.crisisAssessment?.risk_level),
          recommendedActions: this.getBasicRecommendations(fullResponse.crisisAssessment?.risk_level),
          riskLevel: fullResponse.crisisAssessment?.risk_level || 'low'
        }
      };
      return richResponse;
    }

    return basicResponse;
  }

  /**
   * Generate a basic assessment without revealing detailed insights
   */
  private static generateBasicAssessment(sentimentCategory: string, primaryEmotion: string, riskLevel: string): string {
    if (riskLevel === 'high') {
      return 'Your recent entry shows some concerning patterns. Consider reaching out for support.';
    }

    if (sentimentCategory === 'positive') {
      return 'Your entry reflects a positive emotional state. Keep up the good work!';
    } else if (sentimentCategory === 'negative') {
      return 'Your entry shows some challenges. Remember that ups and downs are normal during menopause.';
    }

    return 'Your emotional state appears balanced. Continue monitoring your wellness journey.';
  }

  /**
   * Generate basic support tips without revealing proprietary insights
   */
  private static generateBasicSupportTips(primaryEmotion: string): string[] {
    const basicTips = [
      'Regular communication about feelings can strengthen your relationship',
      'Consider sharing your wellness journey with your partner',
      'Professional counseling can provide additional support strategies'
    ];

    // Add emotion-specific tip without revealing detailed analysis
    if (primaryEmotion === 'anxious' || primaryEmotion === 'worried') {
      basicTips.unshift('Anxiety is common during menopause - support and understanding are key');
    } else if (primaryEmotion === 'frustrated' || primaryEmotion === 'angry') {
      basicTips.unshift('Mood changes are normal - patience and communication help');
    } else if (primaryEmotion === 'hopeful' || primaryEmotion === 'optimistic') {
      basicTips.unshift('Positive outlook is beneficial - continue current support strategies');
    }

    return basicTips.slice(0, 3); // Limit to 3 tips
  }

  /**
   * Map detailed risk levels to basic categories
   */
  private static mapRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' {
    if (riskLevel === 'high' || riskLevel === 'critical') return 'high';
    if (riskLevel === 'medium' || riskLevel === 'elevated') return 'medium';
    return 'low';
  }

  /**
   * Get basic recommendations without revealing detailed analysis
   */
  private static getBasicRecommendations(riskLevel: string): string[] {
    if (riskLevel === 'high') {
      return ['Consider speaking with a healthcare provider', 'Reach out to your support network'];
    }
    if (riskLevel === 'medium') {
      return ['Monitor your wellness patterns', 'Practice self-care strategies'];
    }
    return ['Continue current wellness practices'];
  }

  /**
   * Basic sentiment analysis fallback when API is unavailable
   * Provides minimal analysis without revealing proprietary methods
   */
  private static async basicSentimentAnalysis(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse | RichAnalysisResponse> {
    // Basic sentiment analysis without revealing proprietary methods
    const text = request.text.toLowerCase();

    // Simple keyword-based analysis (much less sophisticated than the real API)
    const positiveWords = ['good', 'great', 'happy', 'better', 'improving', 'hopeful'];
    const negativeWords = ['bad', 'terrible', 'frustrated', 'sad', 'overwhelmed', 'anxious'];
    const crisisWords = ['hopeless', 'worthless', 'can\'t go on'];

    let sentimentScore = 0.5; // Neutral baseline
    let primaryEmotion = 'neutral';
    let riskLevel = 'low';

    // Basic sentiment calculation
    positiveWords.forEach(word => {
      if (text.includes(word)) sentimentScore += 0.1;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) sentimentScore -= 0.1;
    });

    // Check for crisis indicators
    crisisWords.forEach(word => {
      if (text.includes(word)) {
        riskLevel = 'high';
        sentimentScore = Math.min(sentimentScore, 0.2);
      }
    });

    // Determine primary emotion based on simple rules
    if (sentimentScore > 0.7) primaryEmotion = 'hopeful';
    else if (sentimentScore > 0.6) primaryEmotion = 'content';
    else if (sentimentScore > 0.4) primaryEmotion = 'neutral';
    else if (sentimentScore > 0.3) primaryEmotion = 'frustrated';
    else primaryEmotion = 'anxious';

    // Assess basic risk level
    if (sentimentScore < 0.2) {
      riskLevel = 'medium';
    }

    // Clamp values
    sentimentScore = Math.max(0, Math.min(1, sentimentScore));

    const sentimentCategory = sentimentScore > 0.6 ? 'positive' : sentimentScore > 0.4 ? 'neutral' : 'negative';

    const baseResponse: SentimentAnalysisResponse = {
      insights: {
        overall_assessment: this.generateBasicAssessment(sentimentCategory, primaryEmotion, riskLevel)
      },
      sentiment: {
        category: sentimentCategory,
        score: sentimentScore
      },
      emotions: {
        primary: primaryEmotion,
        emotional_intensity: 0.5 // Keep basic for fallback
      },
      crisisAssessment: {
        risk_level: riskLevel
      }
    };

    // Add basic partner insights if requested (without revealing detailed analysis)
    if (request.includePartnerInsights) {
      const richResponse: RichAnalysisResponse = {
        ...baseResponse,
        relationshipSupport: this.generateBasicSupportTips(primaryEmotion),
        riskAssessment: {
          concernLevel: this.mapRiskLevel(riskLevel),
          recommendedActions: this.getBasicRecommendations(riskLevel),
          riskLevel: riskLevel
        }
      };
      return richResponse;
    }

    return baseResponse;
  }








  private static getFallbackResponse(): SentimentAnalysisResponse {
    return {
      insights: {
        overall_assessment: 'Analysis temporarily unavailable. Please try again later.'
      },
      sentiment: {
        category: 'neutral',
        score: 0.5
      },
      emotions: {
        primary: 'neutral',
        emotional_intensity: 0.5
      },
      crisisAssessment: {
        risk_level: 'low'
      }
    };
  }

  /**
   * Batch analyze multiple journal entries for trend analysis
   */
  static async batchAnalyze(entries: Array<{ text: string; date: Date }>): Promise<Array<SentimentAnalysisResponse & { date: Date }>> {
    const results = [];
    
    for (const entry of entries) {
      try {
        const analysis = await this.analyzeSentiment({
          text: entry.text,
          userId: 'batch-analysis',
          context: 'menopause'
        }) as SentimentAnalysisResponse;
        
        results.push({
          ...analysis,
          date: entry.date
        });
      } catch (error) {
        console.error('Batch analysis error for entry:', error);
        results.push({
          ...this.getFallbackResponse(),
          date: entry.date
        });
      }
    }
    
    return results;
  }
}
