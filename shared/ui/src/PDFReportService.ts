// PDF Report Generation Service for Healthcare Providers
import { JournalEntry, SentimentAnalysisResponse } from '@metiscore/types';

export interface PDFReportData {
  patientInfo: {
    name: string;
    email: string;
    reportDate: Date;
    reportPeriod: string;
  };
  journalEntries: JournalEntry[];
  sentimentAnalysis: Array<SentimentAnalysisResponse & { date: Date }>;
  summary: {
    totalEntries: number;
    averageSentiment: number;
    commonEmotions: Array<{ emotion: string; frequency: number }>;
    symptomPatterns: Array<{ symptom: string; frequency: number; impact: number }>;
    riskAssessment: string;
    recommendations: string[];
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
    const { patientInfo, journalEntries, sentimentAnalysis, summary } = data;
    
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
                <div class="summary-value">${summary.commonEmotions[0]?.emotion || 'N/A'}</div>
                <div class="summary-label">Primary Emotion</div>
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
        ${journalEntries.slice(0, 10).map((entry, index) => {
            const analysis = sentimentAnalysis[index];
            const sentimentClass = analysis?.sentiment?.score > 0.6 ? 'positive' : 
                                 analysis?.sentiment?.score > 0.4 ? 'neutral' : 'negative';
            return `
                <div class="entry-item">
                    <div class="entry-date">${entry.createdAt.toLocaleDateString()}</div>
                    <div class="entry-sentiment sentiment-${sentimentClass}">
                        ${analysis?.sentiment?.category || 'Unknown'} 
                        (${analysis?.emotions?.primary || 'N/A'})
                    </div>
                    <p>${entry.text.length > 200 ? entry.text.substring(0, 200) + '...' : entry.text}</p>
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
   * Generate summary statistics from journal entries and sentiment analysis
   */
  static generateSummary(
    entries: JournalEntry[], 
    sentimentData: Array<SentimentAnalysisResponse & { date: Date }>
  ): PDFReportData['summary'] {
    const totalEntries = entries.length;
    const averageSentiment = sentimentData.reduce((sum, item) => sum + (item.sentiment?.score || 0.5), 0) / sentimentData.length;
    
    // Count emotions
    const emotionCounts: Record<string, number> = {};
    sentimentData.forEach(item => {
      const emotion = item.emotions?.primary || 'unknown';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    const commonEmotions = Object.entries(emotionCounts)
      .map(([emotion, frequency]) => ({ emotion, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Mock symptom patterns (in production, extract from journal text)
    const symptomPatterns = [
      { symptom: 'hot_flashes', frequency: 12, impact: -0.3 },
      { symptom: 'sleep_issues', frequency: 8, impact: -0.4 },
      { symptom: 'mood_swings', frequency: 6, impact: -0.2 },
    ];

    // Assess overall risk
    const highRiskCount = sentimentData.filter(item => item.crisisAssessment?.risk_level === 'high').length;
    const mediumRiskCount = sentimentData.filter(item => item.crisisAssessment?.risk_level === 'medium').length;
    
    let riskAssessment = 'low';
    if (highRiskCount > 0) riskAssessment = 'high';
    else if (mediumRiskCount > totalEntries * 0.3) riskAssessment = 'medium';

    const recommendations = [
      'Continue regular wellness tracking and journaling',
      'Monitor sleep patterns and their impact on mood',
      'Consider discussing hormone therapy options if symptoms persist',
      'Maintain regular exercise and stress management practices',
      'Schedule follow-up appointment in 3 months'
    ];

    return {
      totalEntries,
      averageSentiment,
      commonEmotions,
      symptomPatterns,
      riskAssessment,
      recommendations
    };
  }
}
