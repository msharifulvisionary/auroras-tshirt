import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, push, set, onValue } from 'firebase/database';
import { SleeveSize, Settings, defaultSettings } from '../types';
import { ArrowLeft, CheckCircle2, MessageSquare, Home, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [formData, setFormData] = useState({
    fullName: '',
    roll: '',
    whatsapp: '',
    backName: '',
    backNumber: '',
    size: 'M' as SleeveSize,
    paymentMethod: 'bKash',
    sleeve: 'HALF' as 'HALF' | 'FULL',
    bkashSender: ''
  });

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const mergedSettings = { ...defaultSettings, ...val };
        setSettings(mergedSettings);
        
        const activeMethods = mergedSettings.paymentMethods?.filter(p => p.active) || [];
        if (activeMethods.length > 0) {
          setFormData(prev => {
            // Only set default if no paymentMethod is currently configured or is default 'BIKASH'
            if (!prev.paymentMethod || prev.paymentMethod === 'BIKASH') {
              return { ...prev, paymentMethod: activeMethods[0].name };
            }
            return prev;
          });
        }
      }
    });

    const savedData = localStorage.getItem('draftApplicationForm');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error("Error parsing saved form data from localStorage", e);
      }
    }

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { 
        ...prev, 
        [name]: name === 'backName' ? value.toUpperCase() : value 
      };
      localStorage.setItem('draftApplicationForm', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const appsRef = ref(db, 'applications');
      const newAppRef = push(appsRef);
      const price = formData.sleeve === 'HALF' ? settings.priceHalf : settings.priceFull;

      await set(newAppRef, {
        ...formData,
        status: 'pending',
        createdAt: Date.now(),
        amountPaid: price
      });
      localStorage.removeItem('draftApplicationForm');
      setSubmittedId(newAppRef.key || '');
      setIsSubmitted(true);
      setShowToast(true);
    } catch (error) {
      console.error("Error submitting application: ", error);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (Firebase Rule চেক করুন)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeChart = [
    { size: 'S', chest: 36, length: 26 },
    { size: 'M', chest: 38, length: 27 },
    { size: 'L', chest: 40, length: 28 },
    { size: 'XL', chest: 42, length: 29 },
    { size: '2XL', chest: 44, length: 30 },
    { size: '3XL', chest: 46, length: 31 },
    { size: '4XL', chest: 48, length: 32 },
    { size: '5XL', chest: 50, length: 33 },
    { size: '6XL', chest: 52, length: 34 },
  ];

  const activeMethods = settings.paymentMethods?.filter(p => p.active) || [];

  if (isSubmitted) {
    const amountPaid = formData.sleeve === 'HALF' ? settings.priceHalf : settings.priceFull;
    const whatsappMsg = `আসসালামু আলাইকুম। আমি আবেদন সম্পন্ন করেছি এবং টাকা পাঠিয়েছি। অনুগ্রহ করে আমার আবেদনটি কনফার্ম করুন।

*আবেদনের বিবরণ:*
📝 নাম: ${formData.fullName}
🎓 রোল: ${formData.roll}
📱 হোয়াটস্যাপ নম্বর: ${formData.whatsapp}
👕 টি-শার্টের বিবরণ: ${formData.sleeve === 'HALF' ? 'Half Sleeve' : 'Full Sleeve'} (${formData.size} size)
✍️ পিছনে প্রিন্ট করার নাম: ${formData.backName}
🔢 পিছনে প্রিন্ট করার নম্বর: ${formData.backNumber}
💳 পেমেন্ট মাধ্যম: ${formData.paymentMethod}
📞 পেমেন্ট নম্বর / সেন্ডার নম্বর: ${formData.bkashSender || 'CASH (হাতে নগদ)'}
💰 পেমেন্টের পরিমাণ: BDT ${amountPaid}
🔢 আবেদন আইডি: ${submittedId}

ধন্যবাদ!`;

    const handleSendWhatsapp = () => {
      const formattedAdminPhone = settings.adminWhatsapp ? settings.adminWhatsapp.replace(/\D/g, '') : '';
      const adminPhone = (formattedAdminPhone.length === 11 && formattedAdminPhone.startsWith('01')) ? '88' + formattedAdminPhone : formattedAdminPhone;
      const encodedText = encodeURIComponent(whatsappMsg);
      window.open(`https://wa.me/${adminPhone}?text=${encodedText}`, '_blank');
    };

    return (
      <div className="min-h-screen bg-slate-50 w-full py-8 px-4 sm:px-6 flex flex-col items-center justify-center relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-xl border border-emerald-500 max-w-sm text-left"
            >
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                <Check size={20} className="stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm tracking-wide">সফল হয়েছে!</h4>
                <p className="text-xs font-semibold opacity-90 mt-0.5 leading-snug">টি-শার্ট আবেদনটি সফলভাবে সিস্টেমে জমা করা হয়েছে।</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowToast(false)} 
                className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">আবেদন সফলভাবে জমা হয়েছে!</h1>
            <p className="text-slate-500 text-sm mt-1">আপনার আবেদনটি পেন্ডিং অবস্থায় রয়েছে। কনফার্মেশনের জন্য এডমিনকে মেসেজ দিন।</p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left space-y-3">
            <h3 className="font-bold text-slate-700 text-sm border-b border-slate-200/60 pb-2 mb-1">আবেদনের সারসংক্ষেপ:</h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">নাম:</span>
              <span className="font-bold text-slate-800 text-right">{formData.fullName}</span>
              
              <span className="font-semibold text-slate-500">রোল নম্বর:</span>
              <span className="font-bold text-slate-800 text-right">{formData.roll}</span>
              
              <span className="font-semibold text-slate-500">টি-শার্ট ও সাইজ:</span>
              <span className="font-bold text-slate-800 text-right">{formData.sleeve === 'HALF' ? 'Half Sleeve' : 'Full Sleeve'} • {formData.size}</span>
              
              <span className="font-semibold text-slate-500">পিছনের নাম:</span>
              <span className="font-bold text-slate-800 text-right uppercase">{formData.backName} ({formData.backNumber})</span>
              
              <span className="font-semibold text-slate-500">পেমেন্ট মাধ্যম:</span>
              <span className="font-bold text-slate-800 text-right">{formData.paymentMethod}</span>

              {formData.paymentMethod !== 'CASH' && (
                <>
                  <span className="font-semibold text-slate-500">সেন্ডার নম্বর:</span>
                  <span className="font-bold text-slate-800 text-right">{formData.bkashSender}</span>
                </>
              )}

              <span className="font-semibold text-slate-500">পরিশোধিত টাকা:</span>
              <span className="font-bold text-green-600 text-right">৳ {amountPaid}</span>

              <span className="font-semibold text-slate-500">আবেদন আইডি:</span>
              <span className="font-mono font-bold text-blue-600 text-right">{submittedId}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSendWhatsapp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-emerald-200"
            >
              <MessageSquare size={20} /> হোয়াটস্যাপে এডমিনকে মেসেজ দিন
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
            >
              <Home size={18} /> হোম পেজে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full py-8 px-4 sm:px-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-xl border border-emerald-500 max-w-sm text-left"
          >
            <div className="bg-white/20 p-2 rounded-xl shrink-0">
              <Check size={20} className="stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm tracking-wide">সফল হয়েছে!</h4>
              <p className="text-xs font-semibold opacity-90 mt-0.5 leading-snug">টি-শার্ট আবেদনটি সফলভাবে সিস্টেমে জমা করা হয়েছে।</p>
            </div>
            <button 
              type="button"
              onClick={() => setShowToast(false)} 
              className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto mb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 w-fit">
          <ArrowLeft size={16} /> হোম পেজে ফিরে যান
        </button>
      </div>

      <div className="max-w-xl mx-auto mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">টি-শার্ট সাইজ চার্ট</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 font-semibold rounded-tl-lg">সাইজ</th>
                <th className="p-3 font-semibold">বুক (Chest)</th>
                <th className="p-3 font-semibold rounded-tr-lg">লম্বা (Length)</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{row.size}</td>
                  <td className="p-3">{row.chest}″</td>
                  <td className="p-3">{row.length}″</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 font-medium">উপরের চার্ট অনুযায়ী আপনার সঠিক সাইজ নির্বাচন করুন</p>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">টি-শার্ট আবেদন ফরম</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">শিক্ষার্থীর পূর্ণ নাম *</label>
            <input required type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="আপনার নাম লিখুন" />
          </div>
          
          <div>
            <label htmlFor="roll" className="block text-sm font-semibold text-slate-700 mb-1">রোল নম্বর *</label>
            <input required type="text" id="roll" name="roll" value={formData.roll} onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="আপনার রোল নম্বর" />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর *</label>
            <input required type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="01XXXXXXXXX" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="backName" className="block text-sm font-semibold text-slate-700 mb-1">টি-শার্টের পিছনের নাম *</label>
              <input required type="text" id="backName" name="backName" value={formData.backName} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow uppercase placeholder:normal-case" placeholder="YOUR NAME" />
            </div>
            <div>
              <label htmlFor="backNumber" className="block text-sm font-semibold text-slate-700 mb-1">পিছনের নম্বর *</label>
              <input required type="number" id="backNumber" name="backNumber" value={formData.backNumber} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="e.g. 10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sleeve" className="block text-sm font-semibold text-slate-700 mb-1">স্লিভ সিলেক্ট করুন *</label>
              <select id="sleeve" name="sleeve" value={formData.sleeve} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
                <option value="HALF">HALF SLEEVE</option>
                <option value="FULL">FULL SLEEVE</option>
              </select>
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-semibold text-slate-700 mb-1">সাইজ সিলেক্ট করুন *</label>
              <select id="size" name="size" value={formData.size} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
                {['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-semibold text-slate-700 mb-1">টাকা পাঠানোর মাধ্যম *</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
              {activeMethods.map(method => (
                <option key={method.id} value={method.name}>{method.name}</option>
              ))}
              <option value="CASH">CASH (হাতে নগদ)</option>
            </select>
          </div>

          {formData.paymentMethod !== 'CASH' && (
            <div>
              <label htmlFor="bkashSender" className="block text-sm font-semibold text-slate-700 mb-1">
                {formData.paymentMethod} সেন্ডার নম্বর *
              </label>
              <input required type="tel" id="bkashSender" name="bkashSender" value={formData.bkashSender} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-md transition-all active:scale-95 mt-4"
          >
            {isSubmitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
