import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Settings, defaultSettings } from '../types';
import { ShieldAlert, Lock, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function PublicGuard() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.val() });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading settings in PublicGuard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If active, just render the child routes (Home, Apply, Track)
  if (settings.isRegistrationActive !== false) {
    return <Outlet />;
  }

  // If deactivated, show the beautiful suspension screen
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-full">
            <Lock size={40} className="animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">কার্যক্রম সাময়িকভাবে বন্ধ</h1>
          <p className="text-slate-500 text-sm font-medium">টি-শার্ট অর্ডার এবং রেজিস্ট্রেশন কার্যক্রম বর্তমানে নিষ্ক্রিয় রয়েছে।</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 text-slate-700 font-bold text-sm leading-relaxed text-center shadow-inner">
          {settings.registrationDisabledMessage || "টি-শার্ট অর্ডার কার্যক্রম সাময়িকভাবে বন্ধ আছে। দয়া করে পরবর্তী নোটিশের জন্য অপেক্ষা করুন।"}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
          <p className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
            যেকোনো প্রয়োজনে সংশ্লিষ্ট আয়োজক এর সাথে যোগাযোগ করুন।
          </p>
        </div>
      </motion.div>
    </div>
  );
}
