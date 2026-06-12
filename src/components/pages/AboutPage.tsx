import React from 'react';
import StaticPage from './StaticPage';
import { Heart, Sparkles, Smile, MessageCircleHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <StaticPage title="About BubuWish">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">Creating Magic in Every message</h2>
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Welcome to <strong className="text-pink-600 font-bold">BubuWish</strong>, the cutest way to send greeting cards to your favorite people! We believe that sending wishes shouldn't just be a quick text message or a generic animated e-card. It should be an <strong>experience</strong>.
        </p>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-8 sm:p-12 rounded-[2rem] border border-pink-100 mb-16 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full mix-blend-overlay"></div>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 relative z-10">Our Story</h3>
        <p className="text-gray-700 leading-relaxed text-lg mb-4 relative z-10">
          BubuWish was created with the idea that the moments leading up to opening a gift are just as exciting as the gift itself. We noticed that in the digital age, sending a greeting card often felt hollow — just a link you click and glance at for 2 seconds.
        </p>
        <p className="text-gray-700 leading-relaxed text-lg relative z-10">
          We wanted to recreate that magical feeling of unwrapping, solving a mystery, and finally seeing the surprise inside, all in a beautiful digital format. By combining adorable Bubu & Dudu illustrations, 3D interactive elements, and AI magic, BubuWish was born.
        </p>
      </div>

      <h3 className="text-2xl sm:text-3xl font-black text-center text-gray-900 mb-10">What Makes Us Special?</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="bg-pink-100 w-14 h-14 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-gray-800 text-xl mb-3">Heartfelt Themes</h4>
          <p className="text-gray-600 font-medium">From custom birthday parties to sleepy bedside cuddles, our Bubu & Dudu themes bring your feelings to life.</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-gray-800 text-xl mb-3">Interactive Unwrapping</h4>
          <p className="text-gray-600 font-medium">From 3D boxes to puzzle sequences, our cards make the recipient work just a little bit for their reward!</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <MessageCircleHeart className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-gray-800 text-xl mb-3">AI Magic Assistance</h4>
          <p className="text-gray-600 font-medium">Having trouble finding the right words? Our AI integration helps you craft the perfect, cutest message instantly.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
             <Smile className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-gray-800 text-xl mb-3">Digital Keepsakes</h4>
          <p className="text-gray-600 font-medium">Cards never expire. They stay safely stored on BubuWish so you and your loved ones can look back at them.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl p-10 text-center border border-gray-100 max-w-4xl mx-auto mb-12">
         <h3 className="text-2xl font-black text-gray-800 mb-4">Start Spreading Joy</h3>
         <p className="text-gray-600 font-medium mb-8">Ready to create your first magical greeting card?</p>
         <Link to="/signup" className="inline-flex px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg transition-transform hover:-translate-y-0.5">
            Create A Free Card
         </Link>
      </div>

      <p className="text-lg sm:text-xl text-gray-500 font-medium leading-relaxed text-center italic max-w-3xl mx-auto">
        "Whether it's a birthday, an anniversary, or just a random Tuesday, BubuWish helps you create unforgettable digital moments for the people you love."
      </p>
    </StaticPage>
  );
}
