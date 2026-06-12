import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircleHeart, Users, Lock, Share, UserPlus, LogIn, ChevronRight, CheckCircle2, Gift, Sparkles, Star, Heart, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';
import { BubuDuduParty, BubuDuduLove, BubuDuduValentine, BubuDuduSleepy } from '../ThemeGraphics';
import { useAuth } from '../../App';

export default function LandingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const [reviews, setReviews] = React.useState<any[]>([]);

  useEffect(() => {
    if (params.get('c') || params.get('id')) {
      navigate(`/card?${params.toString()}`);
    }
    
    // Fetch featured reviews
    fetch('/api/reviews/featured')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error("Could not load reviews", err));
  }, [params, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex-1 w-full bg-[#FFF0F5] text-gray-900 font-sans flex flex-col font-medium overflow-x-hidden">
      {/* Navigation */}
      <nav className="p-4 sm:p-6 w-full max-w-7xl mx-auto flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 rounded-full p-2 shadow-sm">
            <MessageCircleHeart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">
            BubuWish
          </span>
        </div>
        <div className="flex items-center gap-4 font-bold text-sm sm:text-base">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-bold text-pink-600">Hello, {user.name}</span>
              <span className="hidden sm:block text-xs font-bold px-2 py-1 rounded-full bg-pink-100 text-pink-700 uppercase tracking-widest">{user.role}</span>
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block px-4 py-2 text-pink-600 hover:text-pink-700 transition">Log In</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg shadow-pink-200 transition transform hover:-translate-y-0.5">
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FFD1DC] rounded-full blur-[140px] pointer-events-none z-0"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#B0E0E6] rounded-full blur-[140px] pointer-events-none z-0"
          />
          
          <motion.div 
            style={{ opacity, scale }}
            className="relative z-10 max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12"
          >
            <div className="flex-1 text-left">
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-pink-200 text-pink-600 font-bold text-sm mb-6 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                The Cutest Way To Send Greetings
              </motion.div>
              
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 tracking-tight mb-6 leading-tight pb-2"
              >
                Create Magic For<br /> Your Favorite People
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                className="text-lg sm:text-xl text-pink-700/80 mb-10 max-w-xl font-medium"
              >
                Design adorable, interactive 3D greeting cards featuring Bubu & Dudu. Complete with music, puzzles, countdown locks, and voice messages.
              </motion.p>
              
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link 
                  to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'} 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-full shadow-xl shadow-pink-200/50 hover:shadow-2xl hover:shadow-pink-300/60 transition transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                >
                  {user ? 'Go to Dashboard' : 'Start Creating Free'} <ChevronRight className="w-5 h-5" />
                </Link>
                {!user && <p className="text-sm font-bold text-pink-500/80 hidden sm:block">No credit card required</p>}
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.4 }}
              className="flex-1 w-full max-w-lg relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-rose-100 rounded-[3rem] blur-3xl opacity-50 transform -rotate-6"></div>
              <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-pink-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="bg-pink-50 rounded-3xl p-6 h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-50">
                       <BubuDuduParty />
                    </div>
                    {/* Decorative UI overlays */}
                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md text-xs font-bold text-pink-500 flex items-center gap-2 animate-bounce">
                      <Gift className="w-4 h-4" /> Surprise Inside
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white p-3 rounded-2xl shadow-md flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                         <span className="text-xl">🎵</span>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-gray-800">Happy Birthday</p>
                         <p className="text-[10px] text-gray-500">Playing now...</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="w-full py-24 bg-gradient-to-b from-white via-pink-50/30 to-white relative z-10 overflow-hidden">
           {/* Decorative background elements */}
           <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl"></div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">Send Magic In 3 Steps</h2>
                <p className="text-lg sm:text-xl text-gray-600 font-medium mb-20 max-w-3xl mx-auto">It only takes a minute to create a moment they will remember forever.</p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                 {[
                   { step: "1", title: "Choose a Theme", desc: "Select from adorable Bubu & Dudu themes like Party, Romantic, Sleepy, or Seasonal specials.", icon: <Sparkles className="w-8 h-8 text-white" />, gradient: "from-pink-500 to-rose-500" },
                   { step: "2", title: "Add Your Touch", desc: "Write a sweet message, record a voice note, add music, and hide a custom photo inside.", icon: <Heart className="w-8 h-8 text-white" />, gradient: "from-rose-500 to-pink-600" },
                   { step: "3", title: "Send the Link", desc: "Instantly generate a beautiful share link. Lock it behind a puzzle or countdown timer!", icon: <Share className="w-8 h-8 text-white" />, gradient: "from-pink-600 to-rose-600" }
                 ].map((s, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.6, delay: i * 0.2 }}
                     className="relative group"
                   >
                      {/* Card background with hover effect */}
                      <div className="absolute inset-0 bg-white rounded-3xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300"></div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      {/* Card content */}
                      <div className="relative p-8 flex flex-col items-center">
                         {/* Step number badge */}
                         <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                            <span className="text-white font-black text-lg">{s.step}</span>
                         </div>
                         
                         {/* Icon */}
                         <div className={`w-20 h-20 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pink-300/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            {s.icon}
                         </div>
                         
                         {/* Title */}
                         <h3 className="text-2xl font-black text-gray-900 mb-4">{s.title}</h3>
                         
                         {/* Description */}
                         <p className="text-gray-600 font-medium leading-relaxed">{s.desc}</p>
                         
                         {/* Connector line for desktop */}
                         {i < 2 && (
                           <div className="hidden md:block absolute top-12 -right-8 lg:-right-12 w-16 lg:w-24 h-0.5 bg-gradient-to-r from-pink-300 to-transparent"></div>
                         )}
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Themes Showcase */}
        <section className="w-full py-24 bg-gradient-to-b from-pink-50/50 to-white relative z-10 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">Themes For Every Occasion</h2>
              <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-3xl mx-auto">Not just for birthdays! Celebrate anniversaries, holidays, or just send a random smile.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { name: "Love & Romance", component: <BubuDuduLove />, gradient: "from-rose-100 to-pink-100", hoverGradient: "from-rose-200 to-pink-200" },
                 { name: "Valentine's Special", component: <BubuDuduValentine />, gradient: "from-red-100 to-rose-100", hoverGradient: "from-red-200 to-rose-200" },
                 { name: "Sleepy Bears", component: <BubuDuduSleepy />, gradient: "from-indigo-100 to-blue-100", hoverGradient: "from-indigo-200 to-blue-200" },
                 { name: "Birthday Party", component: <BubuDuduParty />, gradient: "from-amber-100 to-yellow-100", hoverGradient: "from-amber-200 to-yellow-200" },
               ].map((th, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: i * 0.1 }}
                   className="group relative"
                 >
                    <div className={`absolute inset-0 bg-gradient-to-br ${th.gradient} rounded-3xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${th.hoverGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-white shadow-lg group-hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
                       <div className="w-44 h-44 mb-4 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                          {th.component}
                       </div>
                       <h4 className="font-black text-gray-900 text-lg group-hover:text-pink-600 transition-colors">{th.name}</h4>
                    </div>
                 </motion.div>
               ))}
            </div>
            
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
               <Link 
                 to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'} 
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 border-2 border-pink-300 font-black rounded-full shadow-lg hover:shadow-xl hover:bg-pink-50 hover:scale-105 transition-all duration-300"
               >
                  {user ? 'Explore All Themes' : 'Sign Up to Explore Themes'} 
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-white relative z-10 overflow-hidden">
          {/* Animated background gradients */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Everything You Need To Impress</h2>
              <p className="text-gray-600 font-medium text-lg sm:text-xl max-w-3xl mx-auto">Detailed features that make your greetings stand out from the ordinary.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <CheckCircle2 className="w-8 h-8 text-white" />, gradient: "from-blue-500 to-blue-600", title: "Interactive Puzzles", desc: "Make them solve a math question or match emojis before they can read the card." },
                { icon: <Sparkles className="w-8 h-8 text-white" />, gradient: "from-purple-500 to-purple-600", title: "AI Magic Helper", desc: "Stuck on what to write? Our Gemini AI integration crafts perfect messages." },
                { icon: <Lock className="w-8 h-8 text-white" />, gradient: "from-rose-500 to-rose-600", title: "Countdown Locks", desc: "Schedule it! The card won't open until the countdown reaches zero." },
                { icon: <MessageCircleHeart className="w-8 h-8 text-white" />, gradient: "from-teal-500 to-teal-600", title: "Voice Notes", desc: "Record a personal audio message right from the browser to auto-play inside." },
                { icon: <Users className="w-8 h-8 text-white" />, gradient: "from-amber-500 to-amber-600", title: "Contact Manager", desc: "Save birthdays and get automated email reminders so you never forget." },
                { icon: <Gift className="w-8 h-8 text-white" />, gradient: "from-pink-500 to-pink-600", title: "Virtual Unwrap", desc: "A satisfying 3D unboxing experience before the card is revealed." },
              ].map((ft, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative"
                >
                  {/* Card glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${ft.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border-2 border-gray-100 group-hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-300 h-full">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${ft.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {ft.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">{ft.title}</h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed font-medium">{ft.desc}</p>
                    
                    {/* Decorative corner element */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-24 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
           <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
             <motion.div 
               className="text-center mb-20"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
             >
                <h2 className="text-4xl sm:text-5xl font-black mb-6">Loved By Thousands</h2>
                <div className="flex justify-center gap-2 text-yellow-300 mb-4">
                   {[...Array(5)].map((_, i) => (
                     <motion.div
                       key={i}
                       initial={{ opacity: 0, scale: 0 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.3, delay: i * 0.1 }}
                     >
                       <Star className="w-8 h-8" fill="currentColor" />
                     </motion.div>
                   ))}
                </div>
                <p className="font-bold text-xl text-pink-100">Over 50,000 magic moments sent worldwide.</p>
             </motion.div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                       <p className="text-lg font-medium leading-relaxed mb-6 italic">"{r.comment}"</p>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                             {r.userName ? r.userName[0].toUpperCase() : 'A'}
                          </div>
                          <div>
                             <h4 className="font-bold">{r.userName || "Anonymous"}</h4>
                             <p className="text-sm text-pink-200">
                                {Array(parseInt(r.rating) || 5).fill(0).map((_, idx) => (
                                   <Star key={idx} className="inline w-3 h-3 text-yellow-300" fill="currentColor" />
                                ))}
                             </p>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  [
                    { name: "Sarah J.", role: "Girlfriend", quote: "I sent the Valentine's theme to my boyfriend with a voice note. He literally cried. The unboxing animation is so satisfying!" },
                    { name: "Mike T.", role: "Best Friend", quote: "The math puzzle lock is hilarious. I made my friend solve algebra before he could see my birthday message." },
                    { name: "Emily W.", role: "Long Distance", quote: "I live across the country from my mom. Being able to send a full 3D interactive card makes it feel so much more special." }
                  ].map((t, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                       <p className="text-lg font-medium leading-relaxed mb-6 italic">"{t.quote}"</p>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">{t.name[0]}</div>
                          <div>
                             <h4 className="font-bold">{t.name}</h4>
                             <p className="text-sm text-pink-200">{t.role}</p>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-32 bg-gradient-to-br from-pink-50 via-white to-rose-50 text-center px-4 relative overflow-hidden">
           {/* Animated background elements */}
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
           
           <motion.div
             className="max-w-4xl mx-auto relative z-10"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
           >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                {user ? 'Ready to Create Your Next Card?' : 'Ready to make someone smile?'}
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 font-medium mb-12 max-w-2xl mx-auto">
                {user ? 'Head to your dashboard and start creating magic.' : 'Create an account for free and start drafting your first magic card.'}
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'} 
                  className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-black rounded-full shadow-2xl shadow-pink-300/50 hover:shadow-3xl hover:shadow-pink-400/60 transition-all duration-300 text-xl group"
                >
                  {user ? 'Go to Dashboard' : 'Create Your First Card Now'}
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
              
              {!user && (
                <motion.p 
                  className="mt-6 text-sm font-bold text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  ✨ No credit card required • Free forever • Start in seconds
                </motion.p>
              )}
           </motion.div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-12 text-center text-gray-500 font-medium bg-gray-50 border-t border-gray-100 z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 rounded-full p-1.5">
              <MessageCircleHeart className="w-5 h-5 text-pink-500" />
            </div>
            <span className="text-xl font-black text-gray-800">
              BubuWish
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
            <Link to="/about" className="hover:text-pink-500 transition">About</Link>
            <Link to="/contact" className="hover:text-pink-500 transition">Contact</Link>
            <Link to="/faq" className="hover:text-pink-500 transition">FAQ</Link>
            <Link to="/privacy" className="hover:text-pink-500 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-pink-500 transition">Terms</Link>
          </div>
          
          <p className="text-sm">&copy; {new Date().getFullYear()} BubuWish Magic Cards.</p>
        </div>
      </footer>
    </div>
  );
}
