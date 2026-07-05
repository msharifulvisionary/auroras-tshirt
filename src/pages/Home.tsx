import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageModal } from '../components/ImageModal';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Application, Settings, defaultSettings } from '../types';
import { Copy, Check } from 'lucide-react';

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [confirmedStudents, setConfirmedStudents] = useState<Application[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedBkash, setCopiedBkash] = useState(false);

  const copyBkashNumber = () => {
    navigator.clipboard.writeText('01735757133');
    setCopiedBkash(true);
    setTimeout(() => setCopiedBkash(false), 2000);
  };

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    const applicationsRef = ref(db, 'applications');
    const unsubscribeApps = onValue(applicationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const appsList: Application[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setConfirmedStudents(appsList.filter(app => app.status === 'confirmed'));
      }
    });

    return () => {
      unsubscribeSettings();
      unsubscribeApps();
    };
  }, []);

  useEffect(() => {
    if (!settings.deadline) return;
    const interval = setInterval(() => {
      const distance = settings.deadline - Date.now();
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.deadline]);

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
    <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-10">
        
        {/* Notice Board */}
        {settings.notice && (
          <section className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-200">
            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
              নোটিশ বোর্ড
            </h2>
            <p className="text-amber-800 whitespace-pre-wrap">{settings.notice}</p>
          </section>
        )}

        {/* Countdown Timer */}
        {settings.deadline > Date.now() && (
          <section className="bg-slate-900 rounded-2xl p-6 shadow-sm text-center text-white">
            <h2 className="text-lg font-bold mb-4 text-slate-300">আবেদনের শেষ সময়</h2>
            <div className="flex justify-center gap-4 text-center">
              <div className="bg-slate-800 p-3 rounded-xl w-20">
                <div className="text-3xl font-black text-blue-400">{timeLeft.days}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">দিন</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl w-20">
                <div className="text-3xl font-black text-blue-400">{timeLeft.hours}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">ঘণ্টা</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl w-20">
                <div className="text-3xl font-black text-blue-400">{timeLeft.minutes}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">মিনিট</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl w-20">
                <div className="text-3xl font-black text-blue-400">{timeLeft.seconds}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">সেকেন্ড</div>
              </div>
            </div>
          </section>
        )}

        {/* Welcome Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 text-center space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
            আমরা আমাদের ব্যাচ থেকে ফাইনাল পরীক্ষার আগে টি শার্ট বানাবো!
          </h1>
          <p className="text-slate-600 text-lg">
            টি-শার্টের ক্ষেত্রে নিচের ডিজাইনের টি-শার্ট পছন্দ করা হয়েছে।
          </p>
          
          <div 
            className="mt-6 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow border border-slate-200"
            onClick={() => setIsDemoModalOpen(true)}
          >
            <img src={settings.demoImage} alt="Demo T-Shirt" className="w-full h-auto object-cover" />
          </div>
          <p className="text-sm text-slate-400">ছবিটি বড় করে দেখতে ইমেজের উপর ক্লিক করুন</p>
        </section>

        {/* Details Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">টি-শার্টের বিস্তারিত বিবরণ</h2>
          <div className="grid gap-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">টি শার্ট ফেব্রিক্স:</span>
              <span className="text-slate-600">leaf jaquard</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">GSM:</span>
              <span className="text-slate-600">170-180</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">হাফ হাতা (কলার সহ):</span>
              <span className="text-blue-600 font-bold">{settings.priceHalf} টাকা</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">ফুল হাতা (কলার সহ):</span>
              <span className="text-blue-600 font-bold">{settings.priceFull} টাকা</span>
            </div>
          </div>
        </section>

        {/* Size Chart Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">সাইজ লিস্ট</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 font-semibold rounded-tl-lg">সাইজ</th>
                  <th className="p-3 font-semibold">বুক (Chest)</th>
                  <th className="p-3 font-semibold rounded-tr-lg">লম্বা (Length)</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, index) => (
                  <tr key={row.size} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{row.size}</td>
                    <td className="p-3">{row.chest}″</td>
                    <td className="p-3">{row.length}″</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm font-medium text-center">
            ফ্যাব্রিক হিটপ্রেস হওয়ার কারণে এই সাইজ থেকে হাফ ইঞ্চি মতো সাইজ কম হওয়ার সম্ভাবনা থাকে।
          </div>
        </section>

        {/* Final Design Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 text-center space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">ফাইনাল ডিজাইন</h2>
          <div 
            className="rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow border border-slate-200"
            onClick={() => setIsFinalModalOpen(true)}
          >
            <img src={settings.finalImage} alt="Final T-Shirt Design" className="w-full h-auto object-cover" />
          </div>
          <p className="text-sm text-slate-400">ছবিটি বড় করে দেখতে ইমেজের উপর ক্লিক করুন</p>
        </section>

        {/* Payment & Application */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-100 text-center space-y-6">
          <h2 className="text-xl font-bold text-blue-900">টি-শার্ট নিতে আগ্রহী?</h2>
          <p className="text-blue-800 text-lg">
            আপনি যদি টি-শার্ট নিতে আগ্রহী হন তাহলে নিম্নোক্ত বিকাশ নাম্বারে টাকা পাঠিয়ে দিয়ে নিচের আবেদন ফরম পূরণ করুন।
          </p>
          
          <div className="bg-white p-6 rounded-xl shadow-sm inline-block mx-auto mt-4 w-full sm:w-auto">
            <img src="https://i.imgur.com/vFVqKck.png" alt="bKash" className="h-10 mx-auto mb-4 object-contain" />
            <p className="text-sm text-slate-500 mb-1">বিকাশ পার্সোনাল নম্বর</p>
            <div 
              onClick={copyBkashNumber}
              className="flex items-center justify-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100"
            >
              <p className="text-2xl font-bold tracking-wider text-pink-600">01735757133</p>
              <button 
                className={`p-2 rounded-lg transition-colors ${copiedBkash ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-pink-100 group-hover:text-pink-600'}`}
                title="Copy number"
              >
                {copiedBkash ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {copiedBkash && <p className="text-xs text-green-600 font-bold mt-1 text-center">কপি করা হয়েছে!</p>}
          </div>

          <div className="rounded-xl overflow-hidden shadow-sm mt-6 border border-slate-200">
            <img src="https://i.imgur.com/eDa2vbE.jpeg" alt="bKash QR" className="w-full h-auto object-cover" />
          </div>

          <Link 
            to="/apply"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg transition-transform active:scale-95 text-center mt-8"
          >
            আবেদন ফরম পূরণ করুন
          </Link>
        </section>

        {/* Confirmed Students */}
        {confirmedStudents.length > 0 && (
          <section className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-slate-800 text-center">
              আবেদন সম্পন্ন হয়েছে ({confirmedStudents.length} জন)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {confirmedStudents.map(student => (
                <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl uppercase">
                    {student.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{student.fullName}</h3>
                    <p className="text-sm text-slate-500">Roll: {student.roll}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <ImageModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        imageUrl={settings.demoImage} 
      />
      <ImageModal 
        isOpen={isFinalModalOpen} 
        onClose={() => setIsFinalModalOpen(false)} 
        imageUrl={settings.finalImage} 
      />
    </div>
  );
}
