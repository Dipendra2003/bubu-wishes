import React from 'react';
import StaticPage from './StaticPage';
import { Heart, Sparkles, Smile, MessageCircleHeart, Users, Palette, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BubuDuduLove } from '../ThemeGraphics';

const features = [
  { icon: <Heart className="w-7 h-7" />, title: "Heartfelt Themes", desc: "From custom birthday parties to sleepy bedside cuddles, our Bubu & Dudu themes bring your feelings to life.", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50" },
  { icon: <Sparkles className="w-7 h-7" />, title: "Interactive Unwrapping", desc: "From 3D boxes to puzzle sequences, our cards make the recipient work just a little bit for their reward!", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
  { icon: <MessageCircleHeart className="w-7 h-7" />, title: "AI Magic Assistance", desc: "Having trouble finding the right words? Our Gemini AI integration crafts perfect, cutest messages instantly.", gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-50" },
  { icon: <Smile className="w-7 h-7" />, title: "Digital Keepsakes", desc: "Cards never expire. They stay safely stored on BubuWish so you and your loved ones can revisit them.", gradient: "from-purple-500 to-violet-500", bg: "bg-purple-50" },
];

const stats = [
  { number: "50K+", label: "Magic Moments Sent" },
  { number: "12+", label: "Adorable Themes" },
  { number: "99.9%", label: "Uptime Guaranteed" },
  { number: "4.9★", label: "User Rating" },
];

export default function AboutPage() {
  return (
    <StaticPage title="About BubuWish" subtitle="The cutest way to send greeting cards to your favorite people. Creating magic in every message.">

      {/* Intro */}
      <div className="text-center mb-12 sm:mb-16">
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Welcome to <strong className="text-pink-600 font-bold">BubuWish</strong>, where sending wishes isn't just a quick text message or a generic e-card — it's an <strong className="text-gray-800">experience</strong>. We combine adorable characters, 3D interactions, and AI magic to create unforgettable digital moments.
        </p>
      </div>

      {/* Stats bar */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:border-pink-200 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-linear-to-br from-pink-600 to-rose-400 mb-1 font-display">{stat.number}</div>
            <div className="text-xs sm:text-sm font-bold text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Our Story */}
      <motion.div
        className="relative bg-linear-to-br from-pink-50 via-rose-50 to-white rounded-2xl sm:rounded-4xl border border-pink-100/80 mb-12 sm:mb-16 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/40 blur-3xl rounded-full mix-blend-overlay pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6 sm:p-10 lg:p-12 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 text-pink-600 text-xs font-bold mb-4">
              <Heart className="w-3.5 h-3.5" /> Our Journey
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-4 sm:mb-6 font-display leading-tight">The Story Behind BubuWish</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
              BubuWish was created with the idea that the moments leading up to opening a gift are just as exciting as the gift itself. We noticed that in the digital age, sending a greeting card often felt hollow — just a link you click and glance at for 2 seconds.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We wanted to recreate that magical feeling of unwrapping, solving a mystery, and finally seeing the surprise inside — all in a beautiful digital format. By combining adorable Bubu & Dudu illustrations, 3D interactive elements, and AI magic, BubuWish was born.
            </p>
          </div>
          <div className="lg:w-72 flex items-center justify-center p-6 sm:p-8">
            <div className="w-40 h-40 sm:w-48 sm:h-48 transform hover:scale-105 hover:-rotate-3 transition-transform duration-300">
              <BubuDuduLove />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <div className="mb-12 sm:mb-16">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 font-display">What Makes Us Special?</h3>
          <p className="text-gray-500 font-medium text-sm sm:text-base max-w-xl mx-auto">Features that make your greetings stand out from the ordinary.</p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          {features.map((ft, i) => (
            <motion.div
              key={i}
              className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-linear-to-br ${ft.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}></div>
              <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br ${ft.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  {ft.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 group-hover:text-pink-600 transition-colors font-display">{ft.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm">{ft.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        className="bg-linear-to-br from-pink-500 via-rose-500 to-pink-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-3 font-display">Start Spreading Joy Today</h3>
          <p className="text-pink-100 font-medium mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">Ready to create your first magical greeting card? It's free, fun, and takes less than a minute.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-pink-600 font-black rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base">
            Create A Free Card <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.p
        className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed text-center italic max-w-3xl mx-auto mt-10 sm:mt-14"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        "Whether it's a birthday, an anniversary, or just a random Tuesday, BubuWish helps you create unforgettable digital moments for the people you love."
      </motion.p>
    </StaticPage>
  );
}
