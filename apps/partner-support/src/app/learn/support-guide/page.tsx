'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@metiscore/ui';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: {
    overview: string;
    keyPoints: string[];
    actionItems: string[];
    examples: string[];
    warnings?: string[];
  };
}

const supportGuides: GuideSection[] = [
  {
    id: 'emotional-support',
    title: 'Providing Emotional Support',
    icon: '❤️',
    content: {
      overview: 'Emotional support is often more valuable than trying to "fix" things. Your partner is dealing with significant physical and emotional changes that are largely beyond their control.',
      keyPoints: [
        'Validate their feelings without trying to minimize or rationalize them',
        'Listen actively without immediately offering solutions',
        'Acknowledge that menopause symptoms are real and challenging',
        'Be patient with mood swings and emotional volatility',
        'Offer reassurance that they\'re not "going crazy" or "being dramatic"'
      ],
      actionItems: [
        'Use phrases like "That sounds really difficult" or "I can see why that would be frustrating"',
        'Ask "What would help you feel better right now?" instead of assuming',
        'Give them space when they need it, but let them know you\'re available',
        'Remind them of their strengths and how well they\'re handling everything',
        'Share positive observations: "I noticed you handled that stressful situation really well"'
      ],
      examples: [
        'Instead of "You seem fine to me" → "I can see you\'re struggling even when you\'re trying to seem okay"',
        'Instead of "Just relax" → "This seems overwhelming. What can I do to help?"',
        'Instead of "You\'re overreacting" → "Your feelings make complete sense given what you\'re going through"'
      ],
      warnings: [
        'Don\'t minimize their experience by comparing it to other people\'s menopause',
        'Avoid suggesting they "just need to exercise more" or other oversimplified solutions',
        'Don\'t take their emotional reactions personally - they\'re often not about you'
      ]
    }
  },
  {
    id: 'practical-support',
    title: 'Practical Daily Support',
    icon: '🏠',
    content: {
      overview: 'Small practical gestures can make a huge difference when someone is dealing with menopause symptoms. The goal is to reduce their daily stress and physical discomfort.',
      keyPoints: [
        'Take initiative rather than waiting to be asked',
        'Pay attention to their patterns and anticipate needs',
        'Handle temperature control and comfort measures',
        'Manage household tasks that might be overwhelming',
        'Create a supportive physical environment'
      ],
      actionItems: [
        'Keep the house cooler than usual and have fans readily available',
        'Stock up on comfortable, breathable clothing and bedding',
        'Handle meal planning and preparation when they\'re struggling',
        'Take over tasks that require sustained concentration when they have brain fog',
        'Create quiet, comfortable spaces where they can retreat when needed'
      ],
      examples: [
        'Automatically adjusting the thermostat when you see them getting warm',
        'Bringing them a cold drink and a fan during a hot flash',
        'Taking over bill paying or complex tasks when they\'re having concentration issues',
        'Suggesting takeout on days when cooking feels overwhelming',
        'Setting up a cooling station by their bed with ice packs and a towel'
      ],
      warnings: [
        'Don\'t rearrange everything without asking - they may have specific preferences',
        'Avoid taking over completely - they still want agency and independence',
        'Don\'t assume what worked yesterday will work today - symptoms fluctuate'
      ]
    }
  },
  {
    id: 'communication-strategies',
    title: 'Effective Communication',
    icon: '💬',
    content: {
      overview: 'Communication during menopause requires extra patience and awareness. Hormonal changes can affect emotional regulation, memory, and processing speed.',
      keyPoints: [
        'Choose timing carefully - avoid important conversations during difficult symptom periods',
        'Use "I" statements to express your own needs without blame',
        'Be prepared for conversations to take longer or need to be revisited',
        'Focus on one topic at a time to accommodate potential brain fog',
        'Confirm understanding rather than assuming they remember everything'
      ],
      actionItems: [
        'Ask "Is this a good time to talk?" before bringing up important topics',
        'Write down key points if they\'re having memory issues',
        'Summarize agreements and decisions at the end of conversations',
        'Check in regularly: "How are you feeling about our conversation yesterday?"',
        'Be willing to pause and return to discussions later if emotions escalate'
      ],
      examples: [
        '"I\'ve noticed we both seem stressed about finances. When would be a good time to talk about our budget?"',
        '"I want to make sure I understood correctly - are you saying you\'d prefer I handle the grocery shopping this week?"',
        '"You seemed upset when I brought up vacation planning. Should we talk about it later or is there something I said wrong?"'
      ],
      warnings: [
        'Don\'t bring up serious topics right after they\'ve had a difficult symptom episode',
        'Avoid saying "We already talked about this" if they don\'t remember - memory issues are common',
        'Don\'t use their emotional state against them in arguments'
      ]
    }
  },
  {
    id: 'intimacy-support',
    title: 'Supporting Intimacy & Connection',
    icon: '💕',
    content: {
      overview: 'Physical and emotional intimacy often changes during menopause due to hormonal shifts, physical discomfort, and emotional challenges. Patience and creativity are essential.',
      keyPoints: [
        'Understand that changes in libido and physical comfort are medical, not personal',
        'Focus on emotional intimacy and non-sexual physical connection',
        'Be patient with the time it may take to find new rhythms',
        'Encourage medical consultation for physical symptoms',
        'Explore new ways to connect and show affection'
      ],
      actionItems: [
        'Initiate non-sexual physical touch like hugging, hand-holding, or massage',
        'Plan intimate time together that doesn\'t center on sexual activity',
        'Ask directly what feels good and what doesn\'t, and be prepared for this to change',
        'Research and discuss potential medical solutions together',
        'Focus on quality time and emotional connection as foundations'
      ],
      examples: [
        'Offering a back rub or foot massage without sexual expectations',
        'Planning special date nights focused on conversation and connection',
        'Saying "I love being close to you" without pressure for more',
        'Suggesting couples counseling to navigate changes together',
        'Creating romantic gestures that don\'t involve physical intimacy'
      ],
      warnings: [
        'Don\'t take rejection personally - it\'s often about physical discomfort, not attraction',
        'Avoid pressuring them to "get back to normal" - this may be the new normal',
        'Don\'t assume they don\'t want any physical connection just because sexual intimacy has changed'
      ]
    }
  },
  {
    id: 'crisis-support',
    title: 'Recognizing When to Seek Help',
    icon: '🚨',
    content: {
      overview: 'While many menopause symptoms are normal, some situations require professional intervention. Know when to advocate for additional help.',
      keyPoints: [
        'Severe depression or anxiety that interferes with daily life',
        'Thoughts of self-harm or expressions of hopelessness',
        'Panic attacks or severe emotional instability',
        'Physical symptoms that seem extreme or dangerous',
        'Substance use as a coping mechanism'
      ],
      actionItems: [
        'Document concerning symptoms to share with healthcare providers',
        'Research menopause specialists in your area',
        'Offer to attend medical appointments for support and advocacy',
        'Contact crisis hotlines if there are immediate safety concerns',
        'Connect with support groups or counselors who specialize in menopause'
      ],
      examples: [
        'Keeping a symptom diary to show doctors',
        'Saying "I\'m worried about you and think talking to a specialist might help"',
        'Researching hormone therapy options to discuss together',
        'Finding local menopause support groups',
        'Contacting their doctor if you\'re concerned about severe symptoms'
      ],
      warnings: [
        'Don\'t wait for them to ask for help if you\'re genuinely concerned about their safety',
        'Avoid trying to diagnose or treat serious symptoms yourself',
        'Don\'t dismiss concerns about unusual or severe symptoms as "just menopause"'
      ]
    }
  }
];

export default function SupportGuidePage() {
  const { user, loading, logAction } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(supportGuides[0].id);

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
    setActiveSection(sectionId);
    if (user) {
      logAction('support_guide_section_viewed', sectionId);
    }
  };

  const activeGuide = supportGuides.find(guide => guide.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Partner Support Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Practical strategies, communication techniques, and expert advice for supporting 
              your partner through menopause with confidence and compassion.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Guide Sections</h3>
              <nav className="space-y-2">
                {supportGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => handleSectionClick(guide.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeSection === guide.id
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-2">{guide.icon}</span>
                    {guide.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeGuide && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Section Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{activeGuide.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{activeGuide.title}</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{activeGuide.content.overview}</p>
                </div>

                {/* Key Points */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Principles</h3>
                  <ul className="space-y-3">
                    {activeGuide.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 flex-shrink-0 mt-1">•</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Action Steps</h3>
                  <div className="space-y-3">
                    {activeGuide.content.actionItems.map((action, index) => (
                      <div key={index} className="flex items-start bg-green-50 p-3 rounded-lg">
                        <span className="text-green-600 mr-3 flex-shrink-0 mt-1">✓</span>
                        <span className="text-gray-800">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Examples</h3>
                  <div className="space-y-4">
                    {activeGuide.content.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-800 italic">"{example}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {activeGuide.content.warnings && (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Reminders</h3>
                    <div className="space-y-3">
                      {activeGuide.content.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <span className="text-amber-600 mr-3 flex-shrink-0 mt-1">⚠️</span>
                          <span className="text-gray-800">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => {
                  const currentIndex = supportGuides.findIndex(g => g.id === activeSection);
                  if (currentIndex > 0) {
                    handleSectionClick(supportGuides[currentIndex - 1].id);
                  }
                }}
                disabled={activeSection === supportGuides[0].id}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                ← Previous Section
              </Button>
              <Button
                onClick={() => {
                  const currentIndex = supportGuides.findIndex(g => g.id === activeSection);
                  if (currentIndex < supportGuides.length - 1) {
                    handleSectionClick(supportGuides[currentIndex + 1].id);
                  }
                }}
                disabled={activeSection === supportGuides[supportGuides.length - 1].id}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                Next Section →
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Put This Into Practice?</h2>
          <p className="mb-6 text-purple-100">
            Connect with your partner to start receiving personalized insights and support recommendations.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-white text-purple-600 hover:bg-gray-100 py-3 px-8 rounded-lg font-semibold"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}