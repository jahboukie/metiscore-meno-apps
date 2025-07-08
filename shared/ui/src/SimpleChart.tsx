// Simple Chart Components for Analytics
'use client';

import React from 'react';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  height = 200,
  color = '#8B5CF6',
  showDots = true
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const width = 400;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Generate SVG path for the line
  const pathData = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-lg">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * chartHeight;
            const value = maxValue - ratio * range;
            return (
              <g key={index}>
                <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#9CA3AF" strokeWidth="1" />
                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {(value * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 5) === 0) {
              const x = padding + (index / (data.length - 1)) * chartWidth;
              return (
                <g key={index}>
                  <line x1={x} y1={height - padding} x2={x} y2={height - padding + 5} stroke="#9CA3AF" strokeWidth="1" />
                  <text x={x} y={height - padding + 18} textAnchor="middle" className="text-xs fill-gray-500">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                </g>
              );
            }
            return null;
          })}
          
          {/* Line */}
          <path d={pathData} fill="none" stroke={color} strokeWidth="2" />
          
          {/* Dots */}
          {showDots && data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + ((maxValue - point.value) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface EmotionDistributionProps {
  emotions: Record<string, number>;
  title?: string;
}

export const EmotionDistribution: React.FC<EmotionDistributionProps> = ({
  emotions,
  title = "Emotion Distribution"
}) => {
  const total = Object.values(emotions).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No emotion data available</p>
        </div>
      </div>
    );
  }

  const sortedEmotions = Object.entries(emotions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6); // Show top 6 emotions

  const colors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'
  ];

  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {sortedEmotions.map(([emotion, count], index) => {
          const percentage = (count / total) * 100;
          return (
            <div key={emotion} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 capitalize">
                {emotion.replace('_', ' ')}
              </div>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">
                {percentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SymptomImpactChartProps {
  symptoms: Array<{
    symptom: string;
    sentiment_impact: number;
    frequency: number;
  }>;
  title?: string;
}

export const SymptomImpactChart: React.FC<SymptomImpactChartProps> = ({
  symptoms,
  title = "Symptom Impact on Mood"
}) => {
  if (symptoms.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No symptom data available</p>
        </div>
      </div>
    );
  }

  const maxImpact = Math.max(...symptoms.map(s => Math.abs(s.sentiment_impact)));

  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {symptoms.slice(0, 8).map((symptom, index) => {
          const impactPercentage = Math.abs(symptom.sentiment_impact) / maxImpact * 100;
          const isNegative = symptom.sentiment_impact < 0;
          
          return (
            <div key={symptom.symptom} className="flex items-center">
              <div className="w-24 text-sm text-gray-600 capitalize">
                {symptom.symptom.replace('_', ' ')}
              </div>
              <div className="flex-1 mx-3 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isNegative ? 'bg-red-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${impactPercentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                <span className={isNegative ? 'text-red-600' : 'text-green-600'}>
                  {isNegative ? '' : '+'}{(symptom.sentiment_impact * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-12 text-xs text-gray-500 text-right">
                {symptom.frequency}x
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500 flex justify-between">
        <span>🔴 Negative impact</span>
        <span>🟢 Positive impact</span>
      </div>
    </div>
  );
};

interface WellnessScoreGaugeProps {
  score: number;
  title?: string;
}

export const WellnessScoreGauge: React.FC<WellnessScoreGaugeProps> = ({
  score,
  title = "Wellness Score"
}) => {
  const normalizedScore = Math.max(0, Math.min(10, score));
  const percentage = (normalizedScore / 10) * 100;
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  const getScoreColor = (score: number) => {
    if (score >= 7) return '#10B981'; // Green
    if (score >= 4) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="bg-white p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative w-32 h-16 mx-auto mb-4">
        <svg width="128" height="64" viewBox="0 0 128 64">
          {/* Background arc */}
          <path
            d="M 16 48 A 48 48 0 0 1 112 48"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 16 48 A 48 48 0 0 1 112 48"
            fill="none"
            stroke={getScoreColor(normalizedScore)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.51} 151`}
            className="transition-all duration-1000"
          />
          {/* Needle */}
          <line
            x1="64"
            y1="48"
            x2="64"
            y2="20"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${rotation} 64 48)`}
            className="transition-transform duration-1000"
          />
          {/* Center dot */}
          <circle cx="64" cy="48" r="3" fill="#374151" />
        </svg>
      </div>
      <div className="text-3xl font-bold" style={{ color: getScoreColor(normalizedScore) }}>
        {normalizedScore.toFixed(1)}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {getScoreLabel(normalizedScore)}
      </div>
    </div>
  );
};
