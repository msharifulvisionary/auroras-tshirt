import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, X, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setClickCount(0);
      setIsModalOpen(true);
      setError('');
      setSuccess(false);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'msharifulvisionary' && password === 'ahcphysics@adminlogin') {
      sessionStorage.setItem('isAdminMenuUnlocked', 'true');
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setUsername('');
        setPassword('');
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('admin-menu-unlocked-event'));
      }, 1500);
    } else {
      setError('ভুল ইউজারনেম অথবা পাসওয়ার্ড!');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 text-center mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4 relative z-10">
        <img 
          src="https://i.imgur.com/nIOAmb3.png" 
          alt="Batch Logo" 
          onClick={handleLogoClick}
          className="w-16 h-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer active:scale-90 select-none" 
        />
        <div className="space-y-1">
          <h3 className="text-white font-display font-bold uppercase tracking-widest">T-Shirt Program 2026</h3>
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Auroras-25</p>
        </div>
        <p className="text-sm max-w-md mx-auto text-slate-500 mt-4 leading-relaxed">
          আমাদের ব্যাচের ফাইনাল পরীক্ষার আগের বিশেষ স্মৃতি হিসেবে এই টি-শার্ট। সকল তথ্যের জন্য এডমিনের সাথে যোগাযোগ করুন।
        </p>
        <div className="border-t border-slate-800 w-full pt-6 mt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Auroras-25. All rights reserved.
        </div>
      </div>

      {/* Secret Unlock Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-950/50 border border-blue-900/50 text-blue-400 rounded-2xl">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-wide">সিক্রেট এডমিন লিংক আনলক</h3>
                  <p className="text-xs text-slate-500 font-medium">মেনুতে এডমিন লিংক দেখাতে লগইন করুন</p>
                </div>
              </div>

              {success ? (
                <div className="py-8 text-center space-y-3">
                  <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full animate-bounce">
                    <Key size={32} />
                  </div>
                  <h4 className="font-extrabold text-white text-lg">সফলভাবে আনলক হয়েছে!</h4>
                  <p className="text-slate-400 text-xs">এডমিন বাটনটি এখন মেনু বারে দৃশ্যমান।</p>
                </div>
              ) : (
                <form onSubmit={handleUnlockSubmit} className="space-y-4">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 bg-red-950/40 border border-red-900/40 p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <ShieldAlert size={16} /> {error}
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">ইউজারনেম</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Username"
                      value={username} 
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-600 focus:outline-none transition-all font-semibold font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="block text-xs font-semibold text-slate-400">পাসওয়ার্ড</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="Password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-600 focus:outline-none transition-all font-semibold font-mono" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-950/20 mt-6 active:scale-98"
                  >
                    লিংক আনলক করুন <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
