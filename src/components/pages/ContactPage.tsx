import React, { useState } from 'react';
import StaticPage from './StaticPage';
import { Mail, MessageCircle, Send, Clock, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const contactMethods = [
  { icon: <Mail className="w-6 h-6" />, title: "Email Us", info: "hello@bubuwish.com", sub: "We'll respond within 24 hours", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50" },
  { icon: <MessageCircle className="w-6 h-6" />, title: "Live Chat", info: "Available Mon-Fri", sub: "9am - 5pm EST", gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-50" },
  { icon: <Clock className="w-6 h-6" />, title: "Response Time", info: "< 24 hours", sub: "Usually much faster!", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <StaticPage title="Contact Us" subtitle="Have a question, need help, or just want to say hello? We'd love to hear from you!">

      {/* Contact method cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
        {contactMethods.map((method, i) => (
          <motion.div
            key={i}
            className="group relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-pink-200 transition-all duration-300 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br ${method.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
              {method.icon}
            </div>
            <h3 className="font-black text-gray-900 text-base sm:text-lg mb-1 font-display">{method.title}</h3>
            <p className="text-pink-600 font-bold text-sm sm:text-base mb-1">{method.info}</p>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">{method.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Form section */}
      <motion.div
        className="grid lg:grid-cols-5 gap-6 sm:gap-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Left info */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-4 font-display leading-tight">Send Us a Message</h2>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base mb-6 sm:mb-8">
            Fill out the form and our team will get back to you as soon as possible. We're here to help with anything — account issues, feature requests, or just a friendly hello!
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-600">Typical reply within a few hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-600">Friendly & helpful support team</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-600">No question is too small</span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 lg:p-10">
            {isSubmitted ? (
              <motion.div
                className="text-center py-8 sm:py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <Send className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 font-display">Message Sent! 🎉</h3>
                <p className="text-gray-500 font-medium mb-6 sm:mb-8 max-w-sm mx-auto text-sm sm:text-base">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-3 bg-pink-50 text-pink-600 font-bold rounded-full hover:bg-pink-100 transition text-sm"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-bold text-gray-700 mb-1.5">Your Name</label>
                    <input 
                      type="text" 
                      id="contact-name" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      id="contact-email" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                  <select 
                    id="contact-subject" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base"
                  >
                    <option>General Question</option>
                    <option>Account Help</option>
                    <option>Feature Request</option>
                    <option>Bug Report</option>
                    <option>Partnership Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
                  <textarea 
                    id="contact-message" 
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-xl shadow-lg shadow-pink-200/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </StaticPage>
  );
}
