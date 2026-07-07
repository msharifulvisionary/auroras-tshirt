import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageModal } from '../components/ImageModal';
import { db } from '../lib/firebase';
import { ref, onValue, push } from 'firebase/database';
import { Application, Settings, defaultSettings } from '../types';
import { Copy, Check, ChevronDown, HelpCircle, Ruler, MessageSquarePlus, Send, X, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [confirmedStudents, setConfirmedStudents] = useState<Application[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activePaymentIndex, setActivePaymentIndex] = useState(0);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryRoll, setQueryRoll] = useState('');
  const [queryWhatsapp, setQueryWhatsapp] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);

  const activeMethods = settings.paymentMethods?.filter(p => p.active) || [];

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName || !queryWhatsapp || !queryMessage) return;

    setIsSubmittingQuery(true);
    try {
      await push(ref(db, 'faq_questions'), {
        name: queryName,
        roll: queryRoll || 'N/A',
        whatsapp: queryWhatsapp,
        message: queryMessage,
        timestamp: Date.now()
      });
      setQuerySuccess(true);
      setQueryName('');
      setQueryRoll('');
      setQueryWhatsapp('');
      setQueryMessage('');
      setTimeout(() => {
        setIsQueryModalOpen(false);
        setQuerySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting query:", error);
      alert('জিজ্ঞাসা জমা দিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const faqData = [
    {
      question: "টি-শার্টের সাইজ কীভাবে নির্বাচন করব এবং সাইজ চার্টটি কতটা সঠিক?",
      answer: "আমাদের সাইজ চার্টে বুক (Chest) এবং লম্বা (Length) পরিমাপের নিখুঁত বিবরণ দেওয়া রয়েছে। ইঞ্চি ফিতা দিয়ে আপনার নিয়মিত পরা প্রিয় যেকোনো টি-শার্ট মেপে নিয়ে চার্টের সাথে মিলিয়ে দেখতে পারেন। ফ্যাব্রিক হিটপ্রেস হওয়ার কারণে ফাইনাল সাইজ থেকে সামান্য (হাফ ইঞ্চি মতো) কম-বেশি হওয়ার সম্ভাবনা থাকে, তাই কনফিউশন থাকলে সর্বদা এক সাইজ বড় অর্ডার করার পরামর্শ রইল।"
    },
    {
      question: "টাকা পরিশোধ বা পেমেন্ট করার সুনির্দিষ্ট নিয়ম কী?",
      answer: "বিকাশ, নগদ বা রকেট (যা সক্রিয় আছে) পার্সোনাল নাম্বারে 'Send Money' করার পর ট্রানজেকশন আইডি (TxnID) এবং যে নাম্বার থেকে টাকা পাঠিয়েছেন তা আবেদন ফরমে নির্ভুলভাবে প্রদান করতে হবে। এডমিন প্যানেল থেকে পেমেন্ট ভেরিফাই হওয়ার পর আপনার স্ট্যাটাস দেখতে পারবেন।"
    },
    {
      question: "আবেদন সম্পন্ন করার পর সাইজ বা অন্য তথ্য পরিবর্তন করা সম্ভব?",
      answer: "ফর্ম সাবমিট হয়ে যাওয়ার পর নিজে থেকে তথ্য বা সাইজ পরিবর্তনের কোনো সুযোগ নেই। তবে কোনো প্রকার অনিচ্ছাকৃত বড় ভুল সংশোধনের প্রয়োজন হলে, বিলম্ব না করে অতিসত্বর সংশ্লিষ্ট পরিচালনা কমিটির প্রতিনিধিদের সাথে সরাসরি যোগাযোগ করুন।"
    },
    {
      question: "হাফ হাতা ও ফুল হাতা উভয় অপশনই কি কলার সহ পাওয়া যাবে?",
      answer: "হ্যাঁ, হাফ হাতা এবং ফুল হাতা উভয় প্রকার টি-শার্টই চমৎকার কলার সহ (Polo style) তৈরি করা হবে। আপনার পছন্দ অনুযায়ী হাফ হাতা বা ফুল হাতা সিলেক্ট করে ফর্ম পূরণ করতে পারবেন।"
    }
  ];

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const merged = { ...defaultSettings, ...snapshot.val() };
        setSettings(merged);
        
        // Update Open Graph and Twitter Meta Tags for dynamic image sharing
        if (merged.finalImage) {
          const ogImageMeta = document.querySelector('meta[property="og:image"]');
          if (ogImageMeta) {
            ogImageMeta.setAttribute('content', merged.finalImage);
          }
          const twitterImageMeta = document.querySelector('meta[property="twitter:image"]');
          if (twitterImageMeta) {
            twitterImageMeta.setAttribute('content', merged.finalImage);
          }
        }
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
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-100 text-center space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold text-blue-900">টি-শার্ট নিতে আগ্রহী?</h2>
          
          {activeMethods.length > 0 ? (
            <>
              <p className="text-blue-800 text-lg">
                আপনি যদি টি-শার্ট নিতে আগ্রহী হন তাহলে নিম্নোক্ত পেমেন্ট নাম্বারে টাকা পাঠিয়ে দিয়ে নিচের আবেদন ফরম পূরণ করুন।
              </p>
              
              {/* Tabs for Multiple Payment Methods */}
              {activeMethods.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {activeMethods.map((method, index) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setActivePaymentIndex(index);
                        setCopiedNumber(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        activePaymentIndex === index
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {method.logo && (
                        <img src={method.logo} alt={method.name} className="h-5 w-auto object-contain rounded-sm" />
                      )}
                      <span>{method.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Payment Method Details */}
              {activeMethods[activePaymentIndex] && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 inline-block mx-auto w-full max-w-md transition-all">
                  {activeMethods[activePaymentIndex].logo && (
                    <img
                      src={activeMethods[activePaymentIndex].logo}
                      alt={activeMethods[activePaymentIndex].name}
                      className="h-10 mx-auto mb-3 object-contain"
                    />
                  )}
                  <h3 className="font-bold text-slate-700 text-base mb-2">
                    {activeMethods[activePaymentIndex].name} পার্সোনাল নম্বর
                  </h3>
                  
                  <div 
                    onClick={() => copyNumber(activeMethods[activePaymentIndex].number)}
                    className="flex items-center justify-center gap-3 cursor-pointer group hover:bg-slate-50 p-3 rounded-xl transition-all border border-slate-150 bg-slate-50/50"
                  >
                    <p className="text-2xl font-black tracking-wider text-pink-600">
                      {activeMethods[activePaymentIndex].number}
                    </p>
                    <button 
                      className={`p-2 rounded-lg transition-colors ${
                        copiedNumber === activeMethods[activePaymentIndex].number
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white text-slate-500 group-hover:bg-pink-100 group-hover:text-pink-600 border border-slate-200 shadow-sm'
                      }`}
                      title="Copy number"
                    >
                      {copiedNumber === activeMethods[activePaymentIndex].number ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  {copiedNumber === activeMethods[activePaymentIndex].number && (
                    <p className="text-xs text-green-600 font-bold mt-2 text-center animate-pulse">কপি করা হয়েছে!</p>
                  )}

                  {activeMethods[activePaymentIndex].qrImage && (
                    <div className="rounded-xl overflow-hidden shadow-inner mt-5 border border-slate-100 max-w-xs mx-auto">
                      <img
                        src={activeMethods[activePaymentIndex].qrImage}
                        alt={`${activeMethods[activePaymentIndex].name} QR`}
                        className="w-full h-auto object-cover max-h-[280px] mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500">কোনো পেমেন্ট মেথড সক্রিয় নেই।</p>
          )}

          <Link 
            to="/apply"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg transition-transform active:scale-95 text-center mt-8"
          >
            আবেদন ফরম পূরণ করুন
          </Link>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-150 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <HelpCircle className="text-blue-600 animate-pulse" size={24} />
            <h2 className="text-xl font-bold text-slate-800">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-blue-200 bg-blue-50/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-slate-900 transition-colors gap-3"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`} 
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100/80 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Action buttons inside FAQ */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-750 font-bold py-3.5 px-5 rounded-xl border border-blue-200/60 shadow-sm transition-all text-sm select-none active:scale-98 cursor-pointer"
            >
              <Ruler size={18} className="text-blue-600 animate-pulse" />
              টি-শার্ট সাইজ চার্ট দেখুন
            </button>
            
            <button
              type="button"
              onClick={() => setIsQueryModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 font-bold py-3.5 px-5 rounded-xl border border-slate-200 shadow-sm transition-all text-sm select-none active:scale-98 cursor-pointer"
            >
              <MessageSquarePlus size={18} className="text-slate-500" />
              অন্য কোনো প্রশ্ন থাকলে বলুন
            </button>
          </div>
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

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative border border-slate-100 text-left max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl shrink-0">
                  <Ruler size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">টি-শার্ট সাইজ চার্ট (Size Chart)</h3>
                  <p className="text-xs text-slate-500 font-semibold">সব পরিমাপ ইঞ্চি (Inch) ইউনিটে হিসাব করা হয়েছে</p>
                </div>
              </div>

              {/* Sizing Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50 mb-5">
                <table className="w-full text-center text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                      <th className="py-3 px-2">Size</th>
                      <th className="py-3 px-2">Chest (বুক)</th>
                      <th className="py-3 px-2">Length (লম্বা)</th>
                      <th className="py-3 px-2">Shoulder (কাধ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-bold text-slate-600 text-sm">
                    <tr className="hover:bg-slate-100/30 transition-colors">
                      <td className="py-3.5 px-2 text-blue-600 font-black">M</td>
                      <td className="py-3.5 px-2">৩৮" ইঞ্চি</td>
                      <td className="py-3.5 px-2">২৭" ইঞ্চি</td>
                      <td className="py-3.5 px-2">১৬.৫" ইঞ্চি</td>
                    </tr>
                    <tr className="hover:bg-slate-100/30 transition-colors">
                      <td className="py-3.5 px-2 text-blue-600 font-black">L</td>
                      <td className="py-3.5 px-2">৪০" ইঞ্চি</td>
                      <td className="py-3.5 px-2">২৮" ইঞ্চি</td>
                      <td className="py-3.5 px-2">১৭.৫" ইঞ্চি</td>
                    </tr>
                    <tr className="hover:bg-slate-100/30 transition-colors">
                      <td className="py-3.5 px-2 text-blue-600 font-black">XL</td>
                      <td className="py-3.5 px-2">৪২" ইঞ্চি</td>
                      <td className="py-3.5 px-2">২৯" ইঞ্চি</td>
                      <td className="py-3.5 px-2">১৮.৫" ইঞ্চি</td>
                    </tr>
                    <tr className="hover:bg-slate-100/30 transition-colors">
                      <td className="py-3.5 px-2 text-blue-600 font-black">XXL</td>
                      <td className="py-3.5 px-2">৪৪" ইঞ্চি</td>
                      <td className="py-3.5 px-2">৩০" ইঞ্চি</td>
                      <td className="py-3.5 px-2">১৯.৫" ইঞ্চি</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pro Tip Alert */}
              <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-2.5 mb-6 text-slate-700">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                  <span className="font-extrabold text-amber-900 block mb-0.5">গুরুত্বপূর্ণ টিপস:</span>
                  সহজ পরিমাপের জন্য আপনার ঘরে থাকা প্রিয় যেকোনো একটি কলারযুক্ত পোলো শার্ট ইঞ্চি ফিতা দিয়ে মেপে নিয়ে ওপরের চার্টের সাথে মিলিয়ে সাইজ নির্বাচন করুন। কনফিউশন থাকলে এক সাইজ বড় নির্বাচন করা নিরাপদ।
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSizeChartOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors active:scale-98 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Question Submission Modal */}
      <AnimatePresence>
        {isQueryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative border border-slate-100 text-left max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                disabled={isSubmittingQuery}
                onClick={() => {
                  setIsQueryModalOpen(false);
                  setQuerySuccess(false);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all disabled:opacity-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl shrink-0">
                  <MessageSquarePlus size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">যেকোনো জিজ্ঞাসা পাঠান</h3>
                  <p className="text-xs text-slate-500 font-semibold">আপনার কোনো প্রশ্ন থাকলে নিচে লিখে পাঠান</p>
                </div>
              </div>

              {querySuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-bounce">
                    <Check size={32} className="stroke-[3]" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-lg">সফলভাবে পাঠানো হয়েছে!</h4>
                  <p className="text-slate-500 text-xs font-semibold">আপনার প্রশ্নটি সফলভাবে জমা হয়েছে। দ্রুত উত্তর দেওয়া হবে।</p>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">আপনার নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      disabled={isSubmittingQuery}
                      value={queryName}
                      onChange={e => setQueryName(e.target.value)}
                      placeholder="যেমন: শরীফুল ইসলাম"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">রোল নম্বর (Roll No) <span className="text-slate-400 font-medium">(ঐচ্ছিক)</span></label>
                    <input
                      type="text"
                      disabled={isSubmittingQuery}
                      value={queryRoll}
                      onChange={e => setQueryRoll(e.target.value)}
                      placeholder="যেমন: ১২৩৪৫৬"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">হোয়াটসঅ্যাপ নম্বর (WhatsApp No) <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      disabled={isSubmittingQuery}
                      value={queryWhatsapp}
                      onChange={e => setQueryWhatsapp(e.target.value)}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">আপনার প্রশ্ন/জিজ্ঞাসা <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      required
                      disabled={isSubmittingQuery}
                      value={queryMessage}
                      onChange={e => setQueryMessage(e.target.value)}
                      placeholder="এখানে আপনার প্রশ্নটি বিস্তারিত লিখুন..."
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingQuery}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-200 disabled:opacity-50 select-none active:scale-98 mt-6 cursor-pointer"
                  >
                    {isSubmittingQuery ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        জিজ্ঞাসা সাবমিট করুন <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
