import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleHeart, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../App';

export default function AIAssistantWidget() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi there! 👋 I am the BubuWish assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-pink-100 w-[90vw] max-w-[360px] sm:w-[380px] h-[500px] max-h-[70vh] mb-4 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-4 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-pink-50" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">BubuWish Helper</h3>
                    <p className="text-[10px] text-pink-100 font-medium">Ask me anything!</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 transition p-1.5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-pink-500 text-white rounded-tr-sm" 
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                    )}>
                      {msg.role === 'assistant' ? (
                         <div className="markdown-body prose-sm prose-p:leading-snug prose-p:my-1 prose-a:text-pink-500 text-sm">
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                         </div>
                      ) : (
                         <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="self-start max-w-[85%] bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white p-3 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2 items-end bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about features, themes..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-800"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-rose-400 text-white p-4 rounded-full shadow-xl shadow-pink-200/50 hover:shadow-2xl hover:shadow-pink-300/60 transition flex items-center justify-center relative mt-4"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircleHeart className="w-6 h-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
