import React from 'react';
import StaticPage from './StaticPage';
import { ChevronDown, HelpCircle, MessageCircleHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQPage() {
  const faqs = [
    {
      question: "How do magic cards work?",
      answer: "Magic cards are immersive, 3D digital greeting cards. When your recipient opens the link, they'll see an adorable Bubu & Dudu themed box. They can drag their mouse or finger to spin the box in 3D, and click to unwrap it! You can even lock the card behind fun puzzles or a date countdown."
    },
    {
      question: "Is BubuWish really free to use?",
      answer: "Yes, creating and sending magic cards is completely free! We want everyone to be able to spread joy to their loved ones without worrying about subscriptions."
    },
    {
      question: "Can I add music or voice notes?",
      answer: "Yes! While editing your card, you can choose from a library of cute background music loops. You can also record a personalized voice note directly from your browser that will play automatically when the recipient opens your card."
    },
    {
      question: "What is a Countdown Lock?",
      answer: "A Countdown Lock allows you to schedule your card to open at a specific time (e.g., midnight on their birthday). If the recipient tries to open the link early, they'll just see a cute lock screen with a live countdown timer ticking down to the exact second."
    },
    {
      question: "Can I share the card on WhatsApp or iMessage?",
      answer: "Yes! Every card generates a unique, beautiful short link. When you paste it into WhatsApp, iMessage, or Messenger, your recipient can click it and easily view it in their mobile browser without downloading any apps."
    },
    {
      question: "Do the cards expire after they are opened?",
      answer: "No, cards do not expire. The unique link will always work, so your recipient can keep it and revisit their special surprise whenever they want to smile."
    },
    {
      question: "Who can access my magic card?",
      answer: "Only people who have the unique, unguessable URL link generated for your specific card can view it. We do not make your cards publicly discoverable or search-engine indexed."
    },
    {
       question: "Can I use AI to write my message?",
       answer: "Yes! If you're struggling to find the right words, our 'Magic Write' feature automatically generates a heartfelt message based on your chosen theme and relationship to the recipient."
    }
  ];

  return (
    <StaticPage title="Frequently Asked Questions">
      <div className="space-y-6 max-w-3xl mx-auto w-full pb-10">
        
        <div className="bg-pink-50 rounded-3xl p-8 mb-12 text-center border border-pink-100 shadow-sm flex flex-col items-center">
           <HelpCircle className="w-12 h-12 text-pink-400 mb-4" />
           <h3 className="text-2xl font-black text-gray-800 mb-2">We're Here To Help!</h3>
           <p className="text-gray-600 mb-6 font-medium max-w-lg mx-auto">
             Find answers to common questions about creating, saving, and sharing magic cards below.
           </p>
           <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-bold rounded-full shadow-sm hover:shadow-md transition border border-pink-200">
             <MessageCircleHeart className="w-4 h-4" /> Contact Support Instead
           </Link>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-pink-200 transition-colors"
            >
              <summary className="flex items-center justify-between font-bold text-lg p-6 text-gray-800 list-none">
                {faq.question}
                <span className="transition-transform duration-300 group-open:rotate-180 text-pink-500 bg-pink-50 p-2 rounded-full">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="text-gray-600 px-6 pb-6 pt-0 leading-relaxed border-t border-gray-50 mt-2">
                <p className="pt-4 font-medium">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </StaticPage>
  );
}
