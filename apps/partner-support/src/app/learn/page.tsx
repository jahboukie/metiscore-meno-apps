'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@metiscore/ui';

interface ContentSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  topics: string[];
  readTime: string;
}

const contentSections: ContentSection[] = [
  {
    id: 'menopause-basics',
    title: 'Understanding Menopause',
    icon: '🧠',
    description: 'Learn the medical basics, stages, and what to expect during menopause.',
    topics: ['Menopause stages', 'Hormonal changes', 'Timeline expectations', 'Medical terminology'],
    readTime: '10 min read'
  },
  {
    id: 'symptoms',
    title: 'Recognizing Symptoms',
    icon: '🌡️',
    description: 'Comprehensive guide to menopause symptoms and their management.',
    topics: ['Hot flashes', 'Mood changes', 'Sleep disturbances', 'Physical symptoms'],
    readTime: '15 min read'
  },
  {
    id: 'support-strategies',
    title: 'Being a Supportive Partner',
    icon: '🤝',
    description: 'Practical strategies for providing emotional and practical support.',
    topics: ['Active listening', 'Emotional validation', 'Practical help', 'Self-care boundaries'],
    readTime: '12 min read'
  },
  {
    id: 'communication',
    title: 'Communication Guide',
    icon: '💬',
    description: 'Scripts, conversation starters, and communication techniques.',
    topics: ['Conversation starters', 'What to say', 'What NOT to say', 'Crisis communication'],
    readTime: '8 min read'
  },
  {
    id: 'wellness',
    title: 'Wellness & Lifestyle',
    icon: '🌿',
    description: 'Lifestyle recommendations for managing menopause symptoms.',
    topics: ['Nutrition tips', 'Exercise guidance', 'Stress management', 'Sleep hygiene'],
    readTime: '20 min read'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: '❓',
    description: 'Quick answers to the most common menopause support questions.',
    topics: ['Common concerns', 'Quick solutions', 'Expert advice', 'Myth busting'],
    readTime: '5 min read'
  }
];

export default function LearnPage() {
  const { user, loading, hasValidConsent, logAction } = useAuth();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecting to sign in...</div>;
  }

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (user) {
      logAction('educational_content_accessed', sectionId, { contentType: 'learning_section' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Menopause Support Learning Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform from confused to confident with expert guidance, practical strategies, 
              and evidence-based support techniques.
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentSections.map((section) => (
            <div 
              key={section.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{section.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {section.readTime}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">What you'll learn:</h4>
                <ul className="space-y-1">
                  {section.topics.map((topic, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick(section.id);
                  }}
                >
                  Start Learning
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Supportive Partners</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-purple-100">Partners Educated</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-purple-100">Report Better Communication</div>
            </div>
            <div>
              <div className="text-3xl font-bold">85%</div>
              <div className="text-purple-100">Feel More Confident</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready for Personalized Guidance?
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with your partner to receive personalized insights and support recommendations 
              based on their actual experiences.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}