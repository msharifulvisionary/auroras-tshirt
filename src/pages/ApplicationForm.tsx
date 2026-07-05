import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { SleeveSize } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    roll: '',
    whatsapp: '',
    backName: '',
    backNumber: '',
    size: 'M' as SleeveSize,
    paymentMethod: 'BIKASH' as 'CASH' | 'BIKASH',
    sleeve: 'HALF' as 'HALF' | 'FULL',
    bkashSender: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'backName' ? value.toUpperCase() : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const appsRef = ref(db, 'applications');
      const newAppRef = push(appsRef);
      await set(newAppRef, {
        ...formData,
        status: 'pending',
        createdAt: Date.now()
      });
      alert('আপনার আবেদন সফলভাবে জমা হয়েছে!');
      navigate('/');
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

  return (
    <div className="min-h-screen bg-slate-50 w-full py-8 px-4 sm:px-6">
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
              <option value="BIKASH">BIKASH</option>
              <option value="CASH">CASH</option>
            </select>
          </div>

          {formData.paymentMethod === 'BIKASH' && (
            <div>
              <label htmlFor="bkashSender" className="block text-sm font-semibold text-slate-700 mb-1">বিকাশ সেন্ডার নম্বর *</label>
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
