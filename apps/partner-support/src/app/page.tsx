'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/auth-provider';
import { AuthButton } from './components/auth-button';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Use router.push instead of router.replace for better navigation
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // If user is authenticated, show loading while redirecting
  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Redirecting to dashboard...</p>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="block">Transform From</span>
                <span className="block text-red-600">"Clueless"</span>
                <span className="block">to</span>
                <span className="block text-blue-600">Champion</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                The world's first AI-guided app that transforms anyone into a menopause support expert. 
                No medical degree required—just compassion and the right guidance.
              </p>
            </div>

            {/* CTA Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Become Their Champion 💪
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-6 text-lg font-semibold mb-8">
                <span className="flex items-center text-green-600">
                  💯 7-day free trial
                </span>
                <span className="flex items-center text-blue-600">
                  🚀 Results in 5 minutes
                </span>
                <span className="flex items-center text-purple-600">
                  🏆 Used by 10,000+ partners
                </span>
              </div>
              
              <div className="space-y-4">
                <AuthButton />
                <p className="text-sm text-gray-500">
                  Start your free trial • No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Problem Every Caring Partner Faces
            </h2>
            <p className="text-xl text-gray-600">
              You care deeply. You want to help. But menopause feels like a mystery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Walking on Eggshells</h3>
              <p className="text-gray-700 italic">
                "Everything I say seems wrong. I'm afraid to even ask how they're feeling."
              </p>
            </div>

            {/* Problem 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">🤷</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Information Overload</h3>
              <p className="text-gray-700 italic">
                "I've read about hormones and hot flashes, but what do they actually need from me?"
              </p>
            </div>

            {/* Problem 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">💔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Feeling Helpless</h3>
              <p className="text-gray-700 italic">
                "They're struggling and I don't know how to make it better. We're growing apart."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your AI Support Coach Has Arrived
            </h2>
            <p className="text-xl text-blue-100">
              Transform from confused to confident in minutes, not months
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Know What to Do */}
            <div className="bg-white rounded-xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🎯</span>
                <h3 className="text-2xl font-bold text-gray-900">Know Exactly What to Do</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Real-time guidance for difficult moments
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Daily support missions tailored to their needs
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Emergency scripts for crisis situations
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Surprise gesture ideas that actually work
                </li>
              </ul>
            </div>

            {/* Say the Right Things */}
            <div className="bg-white rounded-xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">💬</span>
                <h3 className="text-2xl font-bold text-gray-900">Say the Right Things</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Conversation starters that open hearts
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Validation phrases that heal
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  "What NOT to say" warnings
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Empathy-building communication training
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Transformations, Real Relationships
            </h2>
            <p className="text-xl text-gray-600">
              See how SupportPartner is strengthening relationships worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">💚</div>
                <h4 className="font-bold text-gray-900">Alex & Jordan</h4>
                <p className="text-sm text-gray-600">Together 18 years</p>
              </div>
              <p className="text-gray-700 italic">
                "We went from constant arguments to deeper intimacy. I finally understand what they're going through, 
                and they feel truly supported for the first time."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">💙</div>
                <h4 className="font-bold text-gray-900">Sam & Casey</h4>
                <p className="text-sm text-gray-600">Together 12 years</p>
              </div>
              <p className="text-gray-700 italic">
                "I was completely lost before SupportPartner. Now I'm their rock. The daily tips and emergency 
                guidance saved our relationship during the worst symptoms."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">💜</div>
                <h4 className="font-bold text-gray-900">Riley & Morgan</h4>
                <p className="text-sm text-gray-600">Together 25 years</p>
              </div>
              <p className="text-gray-700 italic">
                "Our friends are amazed at how strong we've become. My partner says I'm the best menopause 
                support they know. This app taught me everything."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built Through Revolutionary Human-Claude Collaboration
            </h2>
            <p className="text-xl text-gray-300">
              SupportPartner combines human relationship wisdom with Claude AI's technical excellence to create 
              something unprecedented: technology that actually strengthens human connection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Human Expertise */}
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🧠</span>
                <h3 className="text-2xl font-bold">Human Expertise</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Deep understanding of relationship dynamics
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Real-world empathy and emotional intelligence
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Vision for global relationship transformation
                </li>
              </ul>
            </div>

            {/* Claude AI */}
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🤖</span>
                <h3 className="text-2xl font-bold">Claude AI</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Intelligent content personalization
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Real-time guidance and adaptation
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Scalable technology for global impact
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Become Their Champion?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of partners who've transformed their relationships with AI-guided support
          </p>
          
          <div className="space-y-4">
            <AuthButton />
            <p className="text-sm text-red-100">
              7-day free trial • Cancel anytime • No credit card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
