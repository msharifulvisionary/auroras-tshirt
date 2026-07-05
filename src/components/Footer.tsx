import React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4">
        <img src="https://i.imgur.com/nIOAmb3.png" alt="Batch Logo" className="w-16 h-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-300" />
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
    </footer>
  );
}
