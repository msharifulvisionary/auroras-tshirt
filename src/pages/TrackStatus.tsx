import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import { Application, Settings, defaultSettings } from '../types';
import { Search, CheckCircle, Clock, Download, ArrowLeft, FileText, LogOut } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';

export default function TrackStatus() {
  const navigate = useNavigate();
  const [roll, setRoll] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [result, setResult] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const tokenRef = React.useRef<HTMLDivElement>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.val() });
      }
    });

    const savedRoll = localStorage.getItem('trackRoll');
    const savedWhatsapp = localStorage.getItem('trackWhatsapp');
    
    if (savedRoll && savedWhatsapp) {
      setRoll(savedRoll);
      setWhatsapp(savedWhatsapp);
      fetchStatus(savedRoll, savedWhatsapp);
    }

    return () => unsubscribe();
  }, []);

  const fetchStatus = async (rollToSearch: string, whatsappToSearch: string) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const appsRef = ref(db, 'applications');
      const snapshot = await get(appsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const appsList: Application[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        
        const found = appsList.find(app => app.roll === rollToSearch && app.whatsapp === whatsappToSearch);
        if (found) {
          setResult(found);
          localStorage.setItem('trackRoll', rollToSearch);
          localStorage.setItem('trackWhatsapp', whatsappToSearch);
        } else {
          setError('আপনার দেওয়া তথ্য অনুযায়ী কোনো আবেদন পাওয়া যায়নি। রোল এবং হোয়াটসঅ্যাপ নাম্বার চেক করুন।');
          localStorage.removeItem('trackRoll');
          localStorage.removeItem('trackWhatsapp');
        }
      } else {
        setError('কোনো আবেদন পাওয়া যায়নি।');
      }
    } catch (err) {
      setError('তথ্য খুঁজতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(roll, whatsapp);
  };

  const handleLogout = () => {
    setResult(null);
    setRoll('');
    setWhatsapp('');
    localStorage.removeItem('trackRoll');
    localStorage.removeItem('trackWhatsapp');
  };

  const downloadToken = async () => {
    if (tokenRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(tokenRef.current, { 
          backgroundColor: '#ffffff', 
          pixelRatio: 2,
          fontEmbedCSS: '',
        });
        const link = document.createElement('a');
        link.download = `Token_${result?.roll}_${result?.fullName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate token', err);
        alert('Token generation failed. Try again.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      setIsDownloadingReceipt(true);
      try {
        const dataUrl = await toPng(receiptRef.current, { 
          backgroundColor: '#ffffff', 
          pixelRatio: 2,
          fontEmbedCSS: '',
        });
        const link = document.createElement('a');
        link.download = `Receipt_${result?.roll}_${result?.fullName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate receipt', err);
        alert('Receipt generation failed. Try again.');
      } finally {
        setIsDownloadingReceipt(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full py-12 px-4 relative overflow-hidden">
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 w-fit">
            <ArrowLeft size={16} /> হোম পেজে ফিরে যান
          </button>
          {result && (
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-red-200 w-fit">
              <LogOut size={16} /> লগআউট (Logout)
            </button>
          )}
        </div>
        
        {!result && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">স্ট্যাটাস চেক করুন</h2>
            <p className="text-slate-500 text-sm text-center mb-6">আপনার রোল এবং হোয়াটসঅ্যাপ নাম্বার দিয়ে টি-শার্টের আবেদনের স্ট্যাটাস জানুন</p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">রোল নম্বর</label>
                <input required type="text" value={roll} onChange={e => setRoll(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="আপনার রোল নম্বর" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                <input required type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="01XXXXXXXXX" />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} /> {isLoading ? 'খুঁজছে...' : 'সার্চ করুন'}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-800 text-center mb-4 border-b pb-4">আবেদনের তথ্য</h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-500">নাম:</div>
              <div className="font-bold text-slate-800 text-right">{result.fullName}</div>
              
              <div className="text-slate-500">পিছনের নাম:</div>
              <div className="font-bold text-slate-800 text-right">{result.backName}</div>
              
              <div className="text-slate-500">পিছনের নম্বর:</div>
              <div className="font-bold text-slate-800 text-right">{result.backNumber}</div>
              
              <div className="text-slate-500">সাইজ ও স্লিভ:</div>
              <div className="font-bold text-slate-800 text-right">{result.size} - {result.sleeve}</div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <span className="font-bold text-slate-700">স্ট্যাটাস:</span>
                {result.status === 'confirmed' ? (
                  <span className="text-green-600 font-bold flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={18}/> কনফার্মড
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Clock size={18}/> পেন্ডিং
                  </span>
                )}
              </div>
            </div>
            
            {result.status === 'confirmed' && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-xs text-center text-slate-500 mb-3">
                  আপনার আবেদনটি কনফার্ম করা হয়েছে। টি-শার্ট বিতরণের সময় এই টোকেনটি দেখাতে হবে।
                </p>
                <button 
                  onClick={downloadToken}
                  disabled={isDownloading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
                >
                  <Download size={18} /> {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'টোকেন ডাউনলোড করুন'}
                </button>
                <button 
                  onClick={downloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FileText size={18} /> {isDownloadingReceipt ? 'ডাউনলোড হচ্ছে...' : 'রিসিপ্ট ডাউনলোড করুন (Receipt)'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden Token Reference */}
      {result && result.status === 'confirmed' && (
        <>
        <div className="fixed top-0 left-[-9999px] -z-50 pointer-events-none">
          <div ref={tokenRef} className="w-[600px] bg-white border-8 border-slate-900 font-sans p-8">
            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-4 flex-nowrap">
              <h2 className="text-3xl font-black uppercase tracking-wider text-slate-900 m-0 whitespace-nowrap">Auroras-25</h2>
              <div className="px-4 py-1.5 bg-green-100 text-green-800 font-bold rounded-full text-sm tracking-widest border border-green-300 whitespace-nowrap">CONFIRMED TOKEN</div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
              <div>
                <span className="text-slate-500 text-sm block mb-1">Name:</span>
                <span className="font-bold text-lg break-words leading-tight">{result.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm block mb-1">Roll:</span>
                <span className="font-bold text-lg break-words leading-tight">{result.roll}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm block mb-1">Back Name:</span>
                <span className="font-black text-xl text-blue-700 uppercase break-words leading-tight">{result.backName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm block mb-1">Back Number:</span>
                <span className="font-black text-xl text-blue-700 leading-tight">{result.backNumber}</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t-2 border-slate-200 pt-4 flex-nowrap">
              <div className="whitespace-nowrap">
                <span className="text-slate-500 text-xs block uppercase tracking-widest mb-1">Sleeve & Size</span>
                <span className="font-black text-2xl tracking-tight text-slate-800 leading-none">{result.sleeve} • {result.size}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono text-right whitespace-nowrap">
                ID: {result.id}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Receipt Reference */}
        <div className="fixed top-0 left-[-9999px] -z-50 pointer-events-none">
          <div ref={receiptRef} className="w-[800px] bg-white p-12 font-sans text-slate-900">
            <div className="text-center mb-10 border-b-2 border-slate-200 pb-8">
              <h1 className="text-4xl font-black tracking-tight uppercase m-0">Auroras-25</h1>
              <p className="text-xl font-bold text-slate-500 tracking-widest mt-2 uppercase mb-0">Official Application Receipt</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 mb-8">
              <table className="w-full text-left text-lg">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-4 font-bold text-slate-500 w-1/3">Applicant Name</td>
                    <td className="py-4 font-black text-slate-800">{result.fullName}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">Roll Number</td>
                    <td className="py-4 font-black text-slate-800">{result.roll}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">WhatsApp</td>
                    <td className="py-4 font-black text-slate-800">{result.whatsapp}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">T-Shirt Size & Sleeve</td>
                    <td className="py-4 font-black text-slate-800">{result.size} • {result.sleeve}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">Name on Back</td>
                    <td className="py-4 font-black text-slate-800 uppercase">{result.backName}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">Number on Back</td>
                    <td className="py-4 font-black text-slate-800">{result.backNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">Payment Amount</td>
                    <td className="py-4 font-black text-slate-800">BDT {result.sleeve === 'HALF' ? settings.priceHalf : settings.priceFull}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-500">Payment Number</td>
                    <td className="py-4 font-black text-slate-800">{result.bkashSender || 'N/A'} ({result.paymentMethod})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-green-50 p-6 rounded-xl border border-green-200 flex-nowrap">
              <div className="flex items-center gap-3 whitespace-nowrap">
                <CheckCircle className="text-green-600" size={32} />
                <span className="text-2xl font-bold text-green-800 m-0">Status: CONFIRMED</span>
              </div>
              <span className="text-sm font-mono text-slate-500 whitespace-nowrap text-right">Receipt ID: {result.id}</span>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
