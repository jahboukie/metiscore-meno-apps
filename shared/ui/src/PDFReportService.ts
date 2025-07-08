// PDF Report Generation Service for Healthcare Providers
import { JournalEntry, SentimentAnalysisResponse } from '@metiscore/types';
import { AnalyticsData } from './AnalyticsService';

export interface PDFReportData {
  patientInfo: {
    name: string;
    email: string;
    reportDate: Date;
    reportPeriod: string;
    userId: string;
  };
  journalEntries: JournalEntry[];
  analyticsData: AnalyticsData;
  summary: {
    totalEntries: number;
    averageSentiment: number;
    commonEmotions: Array<{ emotion: string; frequency: number }>;
    symptomPatterns: Array<{ symptom: string; frequency: number; impact: number }>;
    riskAssessment: string;
    recommendations: string[];
    wellnessScore: number;
    consistencyScore: number;
    supportSystemStrength: string;
    treatmentMentions: number;
  };
}

export class PDFReportService {
  /**
   * Generate a comprehensive PDF report for healthcare providers
   */
  static async generateHealthcareReport(data: PDFReportData): Promise<Blob> {
    // For now, we'll create an HTML report that can be printed to PDF
    // In production, consider using libraries like jsPDF or Puppeteer
    const htmlContent = this.generateHTMLReport(data);
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return blob;
  }

  /**
   * Generate HTML report that can be printed to PDF
   */
  private static generateHTMLReport(data: PDFReportData): string {
    const { patientInfo, journalEntries, analyticsData, summary } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MenoWellness Healthcare Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 20px;
            color: #374151;
            margin: 0;
        }
        .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .summary-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
        }
        .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .chart-placeholder {
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            margin: 20px 0;
        }
        .entry-item {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .entry-date {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }
        .entry-sentiment {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .sentiment-positive { background: #dcfce7; color: #166534; }
        .sentiment-neutral { background: #fef3c7; color: #92400e; }
        .sentiment-negative { background: #fee2e2; color: #991b1b; }
        .recommendations {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
        }
        .risk-assessment {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
        }
        .risk-low { border-left-color: #10b981; background: #f0fdf4; }
        .risk-medium { border-left-color: #f59e0b; background: #fffbeb; }
        .risk-high { border-left-color: #ef4444; background: #fef2f2; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🌸 MenoWellness</div>
        <h1 class="report-title">Healthcare Provider Report</h1>
        <p>Menopause Wellness Tracking & Sentiment Analysis</p>
    </div>

    <div class="patient-info">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${patientInfo.name}</p>
        <p><strong>Email:</strong> ${patientInfo.email}</p>
        <p><strong>Report Date:</strong> ${patientInfo.reportDate.toLocaleDateString()}</p>
        <p><strong>Report Period:</strong> ${patientInfo.reportPeriod}</p>
    </div>

    <div class="section">
        <h2 class="section-title">📊 Executive Summary</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-value">${summary.totalEntries}</div>
                <div class="summary-label">Journal Entries</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${(summary.averageSentiment * 100).toFixed(0)}%</div>
                <div class="summary-label">Average Sentiment</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${summary.wellnessScore.toFixed(1)}/10</div>
                <div class="summary-label">Wellness Score</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${summary.commonEmotions[0]?.emotion || 'N/A'}</div>
                <div class="summary-label">Primary Emotion</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${summary.consistencyScore.toFixed(1)}/10</div>
                <div class="summary-label">Journaling Consistency</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${summary.supportSystemStrength}</div>
                <div class="summary-label">Support System</div>
            </div>
        </div>
        
        <div class="risk-assessment risk-${summary.riskAssessment.toLowerCase()}">
            <h3>Risk Assessment: ${summary.riskAssessment.toUpperCase()}</h3>
            <p>Based on sentiment analysis and emotional patterns over the reporting period.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">📈 Sentiment Trends</h2>
        <div class="chart-placeholder">
            📈 Sentiment trend chart would be displayed here<br>
            (Average sentiment: ${(summary.averageSentiment * 100).toFixed(1)}%)
        </div>
        
        <h3>Common Emotional Patterns</h3>
        <ul>
            ${summary.commonEmotions.map(emotion => 
                `<li><strong>${emotion.emotion}:</strong> ${emotion.frequency} occurrences</li>`
            ).join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">🌡️ Symptom Patterns</h2>
        ${summary.symptomPatterns.map(symptom => `
            <div class="entry-item">
                <strong>${symptom.symptom.replace('_', ' ').toUpperCase()}</strong>
                <p>Frequency: ${symptom.frequency} times | Sentiment Impact: ${(symptom.impact * 100).toFixed(0)}%</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2 class="section-title">📝 Recent Journal Entries</h2>
        ${journalEntries.slice(0, 10).map((entry) => {
            const analysis = entry.analysis as SentimentAnalysisResponse;
            const sentimentScore = analysis?.sentiment?.score || 0.5;
            const sentimentClass = sentimentScore > 0.6 ? 'positive' :
                                 sentimentScore > 0.4 ? 'neutral' : 'negative';
            return `
                <div class="entry-item">
                    <div class="entry-date">${entry.createdAt.toLocaleDateString()}</div>
                    <div class="entry-sentiment sentiment-${sentimentClass}">
                        ${analysis?.sentiment?.category || 'Unknown'}
                        (${analysis?.emotions?.primary || 'N/A'})
                        - ${(sentimentScore * 100).toFixed(0)}%
                    </div>
                    <p>${entry.text.length > 300 ? entry.text.substring(0, 300) + '...' : entry.text}</p>
                </div>
            `;
        }).join('')}
    </div>

    <div class="section">
        <h2 class="section-title">💡 Clinical Recommendations</h2>
        <div class="recommendations">
            <h3>AI-Generated Insights</h3>
            <ul>
                ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>Disclaimer:</strong> This report is generated from patient self-reported data and AI analysis. 
        It should be used as supplementary information alongside clinical assessment and not as a sole diagnostic tool.</p>
        <p>Generated by MenoWellness AI Analytics | Report ID: ${Date.now()}</p>
        <p><strong>Privacy Notice:</strong> This report contains personal health information and should be handled according to applicable privacy laws (HIPAA, PIPEDA, PHIPA, GDPR).</p>
    </div>
</body>
</html>`;
  }

  /**
   * Download the report as an HTML file that can be printed to PDF
   */
  static async downloadReport(data: PDFReportData, filename?: string): Promise<void> {
    const blob = await this.generateHealthcareReport(data);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `menowellness-report-${data.patientInfo.reportDate.toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Open the report in a new window for printing
   */
  static async printReport(data: PDFReportData): Promise<void> {
    const htmlContent = this.generateHTMLReport(data);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  }

  /**
   * Generate summary statistics from analytics data
   */
  static generateSummary(
    entries: JournalEntry[],
    analyticsData: AnalyticsData
  ): PDFReportData['summary'] {
    const totalEntries = analyticsData.totalEntries;
    const averageSentiment = analyticsData.average_sentiment;

    // Extract emotion distribution from analytics data
    const emotionCounts: Record<string, number> = {};
    analyticsData.emotional_patterns.forEach(pattern => {
      const emotion = pattern.primary_emotion || 'unknown';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const commonEmotions = Object.entries(emotionCounts)
      .map(([emotion, frequency]) => ({ emotion, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Use real symptom patterns from analytics
    const symptomPatterns = analyticsData.symptom_correlations.map(symptom => ({
      symptom: symptom.symptom,
      frequency: symptom.frequency,
      impact: symptom.sentiment_impact
    }));

    // Use real risk assessment
    const riskAssessment = analyticsData.riskAssessment.level;

    // Generate healthcare-specific recommendations based on analytics
    const recommendations = this.generateHealthcareRecommendations(analyticsData);

    return {
      totalEntries,
      averageSentiment,
      commonEmotions,
      symptomPatterns,
      riskAssessment,
      recommendations,
      wellnessScore: analyticsData.wellness_score,
      consistencyScore: analyticsData.consistencyScore,
      supportSystemStrength: analyticsData.supportSystemStrength,
      treatmentMentions: analyticsData.treatmentMentions
    };
  }

  /**
   * Generate healthcare-specific recommendations based on analytics data
   */
  private static generateHealthcareRecommendations(analyticsData: AnalyticsData): string[] {
    const recommendations: string[] = [];

    // Base recommendations
    recommendations.push('Continue regular wellness tracking and journaling');

    // Sentiment-based recommendations
    if (analyticsData.average_sentiment < 0.4) {
      recommendations.push('Consider evaluation for mood support interventions');
      recommendations.push('Discuss potential benefits of counseling or therapy');
    } else if (analyticsData.average_sentiment > 0.7) {
      recommendations.push('Current coping strategies appear effective - maintain current approach');
    }

    // Trend-based recommendations
    if (analyticsData.overall_trend === 'declining') {
      recommendations.push('Monitor for worsening symptoms and consider treatment adjustments');
    } else if (analyticsData.overall_trend === 'improving') {
      recommendations.push('Current treatment approach showing positive results');
    }

    // Symptom-specific recommendations
    const severeSymptoms = analyticsData.symptom_correlations.filter(s => s.sentiment_impact < -0.3);
    if (severeSymptoms.length > 0) {
      recommendations.push(`Address high-impact symptoms: ${severeSymptoms.map(s => s.symptom.replace('_', ' ')).join(', ')}`);
    }

    // Support system recommendations
    if (analyticsData.supportSystemStrength === 'low') {
      recommendations.push('Consider referral to support groups or family counseling');
    }

    // Treatment engagement
    if (analyticsData.treatmentMentions === 0) {
      recommendations.push('Discuss treatment options and patient education resources');
    } else if (analyticsData.treatmentMentions > 5) {
      recommendations.push('Patient actively engaged in treatment - monitor effectiveness');
    }

    // Consistency recommendations
    if (analyticsData.consistencyScore < 3) {
      recommendations.push('Encourage more regular journaling for better symptom tracking');
    }

    // Risk-based recommendations
    if (analyticsData.riskAssessment.level === 'high') {
      recommendations.push('URGENT: Consider immediate mental health evaluation');
      recommendations.push('Implement safety planning and increased monitoring');
    } else if (analyticsData.riskAssessment.level === 'medium') {
      recommendations.push('Monitor mood closely and consider preventive interventions');
    }

    // Follow-up
    recommendations.push('Schedule follow-up appointment in 4-6 weeks');

    return recommendations;
  }

  /**
   * Create PDF report data from user information and analytics
   */
  static createReportData(
    userInfo: { name: string; email: string; userId: string },
    journalEntries: JournalEntry[],
    analyticsData: AnalyticsData,
    reportPeriod: string = 'Last 30 days'
  ): PDFReportData {
    const summary = this.generateSummary(journalEntries, analyticsData);

    return {
      patientInfo: {
        name: userInfo.name,
        email: userInfo.email,
        userId: userInfo.userId,
        reportDate: new Date(),
        reportPeriod
      },
      journalEntries,
      analyticsData,
      summary
    };
  }

  /**
   * Generate and download healthcare report for premium users
   */
  static async generateAndDownloadReport(
    userInfo: { name: string; email: string; userId: string },
    journalEntries: JournalEntry[],
    analyticsData: AnalyticsData,
    reportPeriod: string = 'Last 30 days'
  ): Promise<void> {
    const reportData = this.createReportData(userInfo, journalEntries, analyticsData, reportPeriod);
    await this.downloadReport(reportData);
  }

  /**
   * Generate and print healthcare report for premium users
   */
  static async generateAndPrintReport(
    userInfo: { name: string; email: string; userId: string },
    journalEntries: JournalEntry[],
    analyticsData: AnalyticsData,
    reportPeriod: string = 'Last 30 days'
  ): Promise<void> {
    const reportData = this.createReportData(userInfo, journalEntries, analyticsData, reportPeriod);
    await this.printReport(reportData);
  }
}
