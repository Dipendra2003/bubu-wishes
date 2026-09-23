import React, { useState } from 'react';
import StaticPage from './StaticPage';
import { ChevronDown, HelpCircle, MessageCircleHeart, Search, Sparkles, Lock, Music, Share2, Brain, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const faqCategories = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'getting-started', label: 'Getting Started', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'features', label: 'Features', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'sharing', label: 'Sharing', icon: <Share2 className="w-3.5 h-3.5" /> },
];

const faqs = [
  {
    question: "How do magic cards work?",
    answer: "Magic cards are immersive, 3D digital greeting cards. When your recipient opens the link, they'll see an adorable Bubu & Dudu themed box. They can drag their mouse or finger to spin the box in 3D, and click to unwrap it! You can even lock the card behind fun puzzles or a date countdown.",
    category: 'getting-started',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    question: "Is BubuWish really free to use?",
    answer: "Yes, creating and sending magic cards is completely free! We want everyone to be able to spread joy to their loved ones without worrying about subscriptions.",
    category: 'getting-started',
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    question: "Can I add music or voice notes?",
    answer: "Yes! While editing your card, you can choose from a library of cute background music loops. You can also record a personalized voice note directly from your browser that will play automatically when the recipient opens your card.",
    category: 'features',
    icon: <Music className="w-4 h-4" />,
  },
  {
    question: "What is a Countdown Lock?",
    answer: "A Countdown Lock allows you to schedule your card to open at a specific time (e.g., midnight on their birthday). If the recipient tries to open the link early, they'll just see a cute lock screen with a live countdown timer ticking down to the exact second.",
    category: 'features',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    question: "Can I share the card on WhatsApp or iMessage?",
    answer: "Yes! Every card generates a unique, beautiful short link. When you paste it into WhatsApp, iMessage, or Messenger, your recipient can click it and easily view it in their mobile browser without downloading any apps.",
    category: 'sharing',
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    question: "Do the cards expire after they are opened?",
    answer: "No, cards do not expire. The unique link will always work, so your recipient can keep it and revisit their special surprise whenever they want to smile.",
    category: 'sharing',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    question: "Who can access my magic card?",
    answer: "Only people who have the unique, unguessable URL link generated for your specific card can view it. We do not make your cards publicly discoverable or search-engine indexed.",
    category: 'sharing',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    question: "Can I use AI to write my message?",
    answer: "Yes! If you're struggling to find the right words, our 'Magic Write' feature powered by Google Gemini automatically generates a heartfelt message based on your chosen theme and relationship to the recipient.",
    category: 'features',
    icon: <Brain className="w-4 h-4" />,
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className={`bg-white rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${
          isOpen ? 'shadow-lg border-pink-200 ring-1 ring-pink-100' : 'shadow-sm border-gray-100 hover:border-pink-200 hover:shadow-md'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
            isOpen ? 'bg-linear-to-br from-pink-500 to-rose-500 text-white shadow-md' : 'bg-pink-50 text-pink-500'
          }`}>
            {faq.icon}
          </div>
          <h3 className="flex-1 font-bold text-sm sm:text-base lg:text-lg text-gray-800 pr-2">{faq.question}</h3>
          <span className={`transition-transform duration-300 text-pink-500 bg-pink-50 p-1.5 sm:p-2 rounded-full shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 pl-13 sm:pl-18">
                <div className="h-px bg-gray-100 mb-4"></div>
                <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <StaticPage title="Frequently Asked Questions" subtitle="Find answers to common questions about creating, saving, and sharing magic cards.">

      {/* Search bar */}
      <motion.div
        className="max-w-2xl mx-auto mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/50'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-200 hover:text-pink-600'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </motion.div>

      {/* FAQ items */}
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))
        ) : (
          <motion.div
            className="text-center py-12 bg-white rounded-2xl border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg mb-1">No results found</p>
            <p className="text-gray-400 text-sm">Try a different search term or category</p>
          </motion.div>
        )}
      </div>

      {/* Contact CTA */}
      <motion.div
        className="bg-linear-to-br from-pink-50 via-rose-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center border border-pink-100/80 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg text-white">
          <MessageCircleHeart className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-2 font-display">Still Have Questions?</h3>
        <p className="text-gray-500 mb-5 sm:mb-6 font-medium max-w-md mx-auto text-sm sm:text-base">
          Can't find what you're looking for? Our support team is always happy to help.
        </p>
        <Link to="/contact" className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base">
          <MessageCircleHeart className="w-4 h-4" /> Contact Support
        </Link>
      </motion.div>
    </StaticPage>
  );
}
