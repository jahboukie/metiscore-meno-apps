export interface FAQItem {
  id: string;
  category: 'basics' | 'symptoms' | 'support' | 'communication' | 'lifestyle' | 'crisis';
  question: string;
  answer: string;
  tags: string[];
  helpful?: boolean;
}

export const faqData: FAQItem[] = [
  // BASICS CATEGORY
  {
    id: 'what-is-menopause',
    category: 'basics',
    question: 'What exactly is menopause and when does it happen?',
    answer: 'Menopause is the natural biological process when a woman\'s menstrual periods permanently stop, marking the end of reproductive years. It typically occurs between ages 45-55, with the average age being 51. Technically, menopause is diagnosed after 12 consecutive months without a period. The transition period leading up to this (perimenopause) can last 4-10 years and is when most symptoms occur.',
    tags: ['definition', 'age', 'timeline', 'biology']
  },
  {
    id: 'perimenopause-vs-menopause',
    category: 'basics',
    question: 'What\'s the difference between perimenopause and menopause?',
    answer: 'Perimenopause is the transitional phase before menopause when hormone levels fluctuate wildly. Periods may be irregular, heavier, or lighter. This phase can last 4-10 years. Menopause is the point when periods have stopped for 12 consecutive months. Post-menopause is the phase after menopause. Most symptoms occur during perimenopause when hormones are most unstable.',
    tags: ['stages', 'timeline', 'hormones', 'periods']
  },
  {
    id: 'hormone-changes',
    category: 'basics',
    question: 'What hormonal changes happen during menopause?',
    answer: 'The main changes involve declining estrogen and progesterone levels. Estrogen can drop by 90%, affecting everything from temperature regulation to mood, sleep, and bone density. Progesterone, which helps with calm and sleep, also decreases significantly. These fluctuations can be dramatic and unpredictable during perimenopause, which is why symptoms can be so intense and variable.',
    tags: ['hormones', 'estrogen', 'progesterone', 'biology']
  },

  // SYMPTOMS CATEGORY
  {
    id: 'hot-flash-frequency',
    category: 'symptoms',
    question: 'How often do hot flashes occur and how long do they last?',
    answer: 'Hot flashes vary greatly between individuals. Some women experience them several times per day, others weekly or monthly. They typically last 1-5 minutes but can feel much longer. They may start during perimenopause and can continue for years after menopause. About 75% of menopausal women experience hot flashes, and they can be triggered by stress, caffeine, alcohol, spicy foods, or warm environments.',
    tags: ['hot-flashes', 'frequency', 'duration', 'triggers']
  },
  {
    id: 'mood-changes',
    category: 'symptoms',
    question: 'Why do mood swings happen during menopause?',
    answer: 'Hormonal fluctuations directly affect brain chemistry and neurotransmitters like serotonin and dopamine, which regulate mood. Declining estrogen can cause increased irritability, anxiety, and depression. Sleep disruption from night sweats compounds mood issues. Many women describe feeling "not like themselves" - this is a real, biological response to hormonal changes, not a character flaw or weakness.',
    tags: ['mood', 'emotions', 'hormones', 'brain-chemistry']
  },
  {
    id: 'sleep-problems',
    category: 'symptoms',
    question: 'Why can\'t they sleep well during menopause?',
    answer: 'Sleep disruption is extremely common due to multiple factors: night sweats that wake them up, declining progesterone (which has calming effects), anxiety and racing thoughts, and changes in sleep architecture. Their body temperature regulation is disrupted, making it hard to maintain comfortable sleep. This creates a cycle where poor sleep worsens other menopause symptoms.',
    tags: ['sleep', 'insomnia', 'night-sweats', 'temperature']
  },
  {
    id: 'brain-fog',
    category: 'symptoms',
    question: 'What is "brain fog" and is it real?',
    answer: 'Brain fog is absolutely real and affects up to 60% of women during menopause. It includes difficulty concentrating, memory lapses, word-finding problems, and feeling mentally "cloudy." Estrogen affects cognitive function, and its decline can temporarily impact memory and thinking. This usually improves post-menopause as the brain adapts, but it can be very distressing during the transition.',
    tags: ['cognition', 'memory', 'concentration', 'brain-fog']
  },

  // SUPPORT CATEGORY  
  {
    id: 'best-support-strategies',
    category: 'support',
    question: 'What are the most effective ways to support my partner?',
    answer: 'The most powerful support comes from validation and understanding. Acknowledge that their symptoms are real and difficult. Offer practical help without being asked - take on household tasks, bring them cooling items during hot flashes, or suggest breaks when they seem overwhelmed. Learn about menopause so you can anticipate needs. Most importantly, be patient and remember that their reactions may be amplified by hormonal changes.',
    tags: ['validation', 'practical-help', 'patience', 'understanding']
  },
  {
    id: 'what-not-to-say',
    category: 'support',
    question: 'What should I avoid saying during this time?',
    answer: 'Avoid: "Is it your hormones?" "You\'re overreacting," "Just calm down," "It\'s all in your head," "You should exercise more," or "At least you\'re done with periods." These minimize their experience. Instead, try: "This sounds really difficult," "What would help right now?" "You\'re handling this so well," or "I\'m here for you." Focus on validation rather than solutions unless they specifically ask for advice.',
    tags: ['communication', 'validation', 'what-not-to-say', 'empathy']
  },
  {
    id: 'when-they-snap',
    category: 'support',
    question: 'How should I respond when they have mood swings or snap at me?',
    answer: 'Stay calm and don\'t take it personally - their emotional regulation is compromised by hormonal fluctuations. Give them space if needed, but let them know you\'re there when they\'re ready. Later, when they\'re calmer, you might gently acknowledge that it seemed like a tough moment and ask if there\'s anything you can do to help. Remember: their irritability is often about the discomfort they\'re feeling, not about you.',
    tags: ['mood-swings', 'emotional-regulation', 'patience', 'boundaries']
  },
  {
    id: 'intimacy-changes',
    category: 'support',
    question: 'How do I handle changes in intimacy and sexuality?',
    answer: 'Declining estrogen can cause vaginal dryness, reduced libido, and physical discomfort during intimacy. This is medical, not personal rejection. Have open, non-judgmental conversations about what feels good and what doesn\'t. Explore other forms of intimacy and connection. Consider couples counseling or encourage them to speak with their doctor about treatments. Patience, understanding, and creative adaptation are key.',
    tags: ['intimacy', 'sexuality', 'communication', 'medical-solutions']
  },

  // COMMUNICATION CATEGORY
  {
    id: 'conversation-starters',
    category: 'communication',
    question: 'How do I start conversations about menopause without making it awkward?',
    answer: 'Start with observation and care: "I\'ve noticed you haven\'t been sleeping well lately. How are you feeling?" or "You seem to be dealing with a lot right now. Is there anything I can do to help?" Share that you\'ve been learning about menopause and want to understand their experience better. Ask open-ended questions and listen without trying to fix everything immediately.',
    tags: ['conversation-starters', 'communication', 'empathy', 'listening']
  },
  {
    id: 'validate-feelings',
    category: 'communication',
    question: 'How do I validate their feelings without dismissing my own?',
    answer: 'Use "both/and" language: "I can see this is really hard for you, and I\'m feeling overwhelmed too. Let\'s figure out how to support each other." Acknowledge their struggle first, then express your needs. Set boundaries kindly: "I want to support you, and I also need some time to recharge." Remember that validation doesn\'t mean agreement with everything - it means acknowledging their emotional experience as real and valid.',
    tags: ['validation', 'boundaries', 'mutual-support', 'communication']
  },
  {
    id: 'difficult-conversations',
    category: 'communication',
    question: 'How do I bring up concerns about their health or behavior?',
    answer: 'Choose calm moments and use "I" statements: "I\'ve noticed you seem to be struggling with sleep, and I\'m worried about you. Have you considered talking to a doctor?" Frame it as caring concern, not criticism. Offer to help research options or accompany them to appointments. Avoid making it about how their symptoms affect you - focus on their wellbeing and your desire to support them.',
    tags: ['health-concerns', 'medical-help', 'caring-confrontation', 'support']
  },

  // LIFESTYLE CATEGORY
  {
    id: 'helpful-lifestyle-changes',
    category: 'lifestyle',
    question: 'What lifestyle changes can help with menopause symptoms?',
    answer: 'Regular exercise (especially strength training and yoga), a Mediterranean-style diet rich in phytoestrogens, stress management techniques, maintaining cool sleeping environments, limiting caffeine and alcohol, staying hydrated, and maintaining social connections all help. However, present these as options, not mandates. What works varies greatly between individuals, and they may need to experiment to find what helps them.',
    tags: ['exercise', 'diet', 'stress-management', 'lifestyle']
  },
  {
    id: 'cooling-strategies',
    category: 'lifestyle',
    question: 'How can I help them manage hot flashes and temperature regulation?',
    answer: 'Keep the house cooler, provide portable fans, suggest breathable cotton clothing and bedding, keep cold water bottles handy, and learn their triggers (stress, certain foods, wine). During a hot flash, offer a cold cloth, open windows, or just give them space. Don\'t take over their strategies - ask what helps them most. Some prefer distraction, others need quiet focus to get through it.',
    tags: ['hot-flashes', 'cooling', 'temperature', 'practical-help']
  },
  {
    id: 'stress-management',
    category: 'lifestyle',
    question: 'How can I help reduce their stress levels?',
    answer: 'Take initiative on household responsibilities, encourage stress-reducing activities they enjoy, protect their time and energy by handling logistics, suggest relaxation techniques but don\'t insist, and model calm behavior yourself. Sometimes the best stress relief is knowing they don\'t have to manage everything alone. Ask specifically: "What would take the most stress off your plate right now?"',
    tags: ['stress-reduction', 'household-help', 'emotional-support', 'practical-solutions']
  },

  // CRISIS CATEGORY
  {
    id: 'when-to-worry',
    category: 'crisis',
    question: 'When should I be concerned about their mental health?',
    answer: 'Seek immediate help if they express thoughts of self-harm, show signs of severe depression lasting weeks, have panic attacks that interfere with daily life, or exhibit behavior that\'s drastically different from their normal personality. Trust your instincts - if you\'re worried, it\'s worth discussing with their doctor. Many symptoms are normal, but severe mental health changes warrant professional evaluation.',
    tags: ['mental-health', 'depression', 'crisis', 'medical-help']
  },
  {
    id: 'medical-help',
    category: 'crisis',
    question: 'How do I encourage them to seek medical help?',
    answer: 'Frame it as empowerment, not inadequacy: "You deserve to feel better, and there are treatments that might help." Offer to research doctors who specialize in menopause, make appointments, or go with them. Share success stories of women who found relief through medical intervention. Emphasize that seeking help is a sign of strength and self-advocacy, not weakness or failure to cope.',
    tags: ['medical-help', 'healthcare', 'encouragement', 'advocacy']
  },
  {
    id: 'emergency-situations',
    category: 'crisis',
    question: 'What constitutes a menopause-related emergency?',
    answer: 'Heavy bleeding that soaks through a pad or tampon every hour for several hours, severe chest pain during a hot flash, thoughts of self-harm or suicide, panic attacks with chest pain or difficulty breathing, or any symptom that feels dramatically different from their normal experience. When in doubt, contact their healthcare provider or seek emergency care. Better to be cautious with health concerns.',
    tags: ['emergency', 'heavy-bleeding', 'crisis', 'medical-emergency']
  }
];

export const categories = [
  { id: 'all', name: 'All Topics', icon: '📚' },
  { id: 'basics', name: 'Menopause Basics', icon: '🧠' },
  { id: 'symptoms', name: 'Understanding Symptoms', icon: '🌡️' },
  { id: 'support', name: 'How to Support', icon: '🤝' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'lifestyle', name: 'Lifestyle & Wellness', icon: '🌿' },
  { id: 'crisis', name: 'When to Seek Help', icon: '🚨' }
];

export const searchFAQs = (query: string, category: string = 'all'): FAQItem[] => {
  let filteredFAQs = category === 'all' ? faqData : faqData.filter(faq => faq.category === category);
  
  if (query.trim() === '') {
    return filteredFAQs;
  }
  
  const searchTerm = query.toLowerCase();
  return filteredFAQs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) ||
    faq.answer.toLowerCase().includes(searchTerm) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};