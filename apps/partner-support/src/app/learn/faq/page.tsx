'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth-provider';
import { useRouter } from 'next/navigation';
import { faqData, categories, searchFAQs, FAQItem } from '@/data/faq-content';
import { Button } from '@metiscore/ui';

export default function FAQPage() {
  const { user, loading, logAction } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(faqData);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const results = searchFAQs(searchQuery, selectedCategory);
    setFilteredFAQs(results);
  }, [searchQuery, selectedCategory]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecting to sign in...</div>;
  }

  const handleFAQClick = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    if (user && expandedFAQ !== faqId) {
      logAction('faq_viewed', faqId, { category: selectedCategory, searchQuery });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (user) {
      logAction('faq_category_selected', category, { category });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Menopause Support FAQ
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get expert answers to the most common questions about supporting someone through menopause.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers... (e.g., 'hot flashes', 'mood swings', 'how to help')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or selecting a different category.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Show All FAQs
              </Button>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div 
                key={faq.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => handleFAQClick(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {categories.find(c => c.id === faq.category)?.name}
                        </span>
                        <div className="flex gap-1">
                          {faq.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {faq.tags.map((tag) => (
                              <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            Was this helpful?
                            <button className="ml-2 text-green-600 hover:text-green-700">👍</button>
                            <button className="ml-1 text-red-600 hover:text-red-700">👎</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 text-purple-100">
            Connect with your partner to get personalized insights, or explore our comprehensive learning center.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-white text-purple-600 hover:bg-gray-100 py-2 px-6 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.href = '/learn'}
              className="bg-purple-700 hover:bg-purple-800 text-white py-2 px-6 rounded-lg font-semibold"
            >
              Explore Learning Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}