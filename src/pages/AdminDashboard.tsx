import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { Application, Settings, defaultSettings, Expense } from '../types';
import { Trash2, Edit, CheckCircle, MessageCircle, Copy, Download, Save, X, Image as ImageIcon, Plus, Search, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const ordersRef = React.useRef<HTMLDivElement>(null);
  const expensesRef = React.useRef<HTMLDivElement>(null);
  const tokenRef = React.useRef<HTMLDivElement>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSize, setFilterSize] = useState('ALL');
  const [activeTokenApp, setActiveTokenApp] = useState<Application | null>(null);
  const [activeReceiptApp, setActiveReceiptApp] = useState<Application | null>(null);

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
      navigate('/admin');
      return;
    }

    const appsRef = ref(db, 'applications');
    const unsubscribeApps = onValue(appsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const appsList: Application[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        // Sort by newest first
        setApplications(appsList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setApplications([]);
      }
    });

    const settingsRef = ref(db, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.val() });
      }
    });

    const expensesRefDb = ref(db, 'expenses');
    const unsubscribeExpenses = onValue(expensesRefDb, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expenseList: Expense[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setExpenses(expenseList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setExpenses([]);
      }
    });

    return () => {
      unsubscribeApps();
      unsubscribeSettings();
      unsubscribeExpenses();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin');
  };

  const handleUpdateStatus = async (id: string, status: 'pending' | 'confirmed') => {
    const appRef = ref(db, `applications/${id}`);
    await update(appRef, { status });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই আবেদনটি ডিলিট করতে চান?')) {
      const appRef = ref(db, `applications/${id}`);
      await remove(appRef);
    }
  };

  const handleSaveSettings = async () => {
    const settingsRef = ref(db, 'settings');
    await set(settingsRef, settings);
    setIsEditingSettings(false);
    alert('সেটিংস সেভ হয়েছে!');
  };

  const sendWhatsAppMsg = (app: Application) => {
    let formattedPhone = app.whatsapp.replace(/\D/g, ''); // remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '88' + formattedPhone;
    } else if (!formattedPhone.startsWith('88')) {
      formattedPhone = '880' + formattedPhone; 
    }

    const text = `আপনার টি-শার্টের জন্য আবেদন কনফার্ম করা হয়েছে।\nপিছনের নাম: ${app.backName}\nনম্বর: ${app.backNumber}\nসাইজ: ${app.size}\nস্লিভ: ${app.sleeve}\n\nদয়া করে ওয়েবসাইটের 'স্ট্যাটাস' পেজ থেকে আপনার টোকেনটি ডাউনলোড করে সংরক্ষণ করুন। টি-শার্ট বিতরণের সময় টোকেনটি দেখাতে হবে।\n\nটোকেন ডাউনলোড লিংক: ${window.location.origin}/track`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Stats
  const totalApplied = applications.length;
  const confirmedApps = applications.filter(a => a.status === 'confirmed');
  const confirmedHalf = confirmedApps.filter(a => a.sleeve === 'HALF').length;
  const confirmedFull = confirmedApps.filter(a => a.sleeve === 'FULL').length;
  const totalMoneyCollected = (confirmedHalf * settings.priceHalf) + (confirmedFull * settings.priceFull);
  const totalExpensesAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remainingBalance = totalMoneyCollected - totalExpensesAmount;

  // Sorting logic for export
  const sizeOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
  const sortApps = (apps: Application[]) => {
    return [...apps].sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
  };

  const generateCopyText = () => {
    const confirmedApps = applications.filter(a => a.status === 'confirmed');
    const halfSleeve = sortApps(confirmedApps.filter(a => a.sleeve === 'HALF'));
    const fullSleeve = sortApps(confirmedApps.filter(a => a.sleeve === 'FULL'));

    let text = "ALL HALF SLEEVE BELOW:\n\n";
    halfSleeve.forEach(a => {
      text += `${a.backName}-${a.backNumber}-${a.size}\n`;
    });

    text += "\nAll FULL SLEEVE BELOW:\n\n";
    fullSleeve.forEach(a => {
      text += `${a.backName}-${a.backNumber}-${a.size}\n`;
    });

    navigator.clipboard.writeText(text);
    alert('টেক্সট কপি করা হয়েছে!');
  };

  const exportCSV = () => {
    const confirmedApps = applications.filter(a => a.status === 'confirmed');
    const halfSleeve = sortApps(confirmedApps.filter(a => a.sleeve === 'HALF'));
    const fullSleeve = sortApps(confirmedApps.filter(a => a.sleeve === 'FULL'));

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Back Name,Back Number,Size\n";

    const addRows = (apps: Application[], type: string) => {
      apps.forEach(a => {
        const row = [
          type,
          `"${a.backName}"`,
          `"${a.backNumber}"`,
          a.size
        ].join(",");
        csvContent += row + "\n";
      });
    };

    addRows(halfSleeve, "HALF SLEEVE");
    addRows(fullSleeve, "FULL SLEEVE");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tshirt_orders_filtered.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveEditedApp = async () => {
    if (editingApp) {
      const appRef = ref(db, `applications/${editingApp.id}`);
      await update(appRef, editingApp);
      setEditingApp(null);
    }
  };

  const downloadImage = async (refElement: React.RefObject<HTMLDivElement>, filename: string) => {
    if (refElement.current) {
      try {
        const dataUrl = await toPng(refElement.current, { 
          backgroundColor: '#ffffff', 
          pixelRatio: 2,
          fontEmbedCSS: '',
        });
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image', err);
        alert('Image generation failed. Try again.');
      }
    }
  };

  const downloadToken = async (app: Application) => {
    setActiveTokenApp(app);
    setTimeout(async () => {
      if (tokenRef.current) {
        try {
          const dataUrl = await toPng(tokenRef.current, { 
            backgroundColor: '#ffffff', 
            pixelRatio: 2,
            fontEmbedCSS: '',
          });
          const link = document.createElement('a');
          link.download = `Token_${app.roll}_${app.fullName}.png`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error('Failed to generate token', err);
          alert('Token generation failed. Try again.');
        } finally {
          setActiveTokenApp(null);
        }
      }
    }, 200);
  };

  const downloadReceipt = async (app: Application) => {
    setActiveReceiptApp(app);
    setTimeout(async () => {
      if (receiptRef.current) {
        try {
          const dataUrl = await toPng(receiptRef.current, { 
            backgroundColor: '#ffffff', 
            pixelRatio: 2,
            fontEmbedCSS: '',
          });
          const link = document.createElement('a');
          link.download = `Receipt_${app.roll}_${app.fullName}.png`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error('Failed to generate receipt', err);
          alert('Receipt generation failed. Try again.');
        } finally {
          setActiveReceiptApp(null);
        }
      }
    }, 200);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newExpense.amount);
    if (!newExpense.name || isNaN(amount) || amount <= 0) return;
    const refDb = ref(db, 'expenses');
    await push(refDb, { name: newExpense.name, amount, createdAt: Date.now() });
    setNewExpense({ name: '', amount: '' });
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই খরচটি ডিলিট করতে চান?')) {
      await remove(ref(db, `expenses/${id}`));
    }
  };

  const saveEditedExpense = async () => {
    if (editingExpense) {
      await update(ref(db, `expenses/${editingExpense.id}`), {
        name: editingExpense.name,
        amount: Number(editingExpense.amount)
      });
      setEditingExpense(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.roll.includes(searchTerm) || 
                          app.whatsapp.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSize = filterSize === 'ALL' || app.size === filterSize;
    
    return matchesSearch && matchesStatus && matchesSize;
  });

  // Calculate datetime-local string
  const getDeadlineString = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ts = e.target.value ? new Date(e.target.value).getTime() : 0;
    setSettings({ ...settings, deadline: ts });
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">এডমিন ড্যাশবোর্ড</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">
            লগআউট
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">মোট আবেদন</p>
            <p className="text-2xl font-bold text-slate-800">{totalApplied}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">হাফ স্লিভ (কনফার্ম)</p>
            <p className="text-2xl font-bold text-slate-800">{confirmedHalf}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">ফুল স্লিভ (কনফার্ম)</p>
            <p className="text-2xl font-bold text-slate-800">{confirmedFull}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">টাকা উঠেছে</p>
            <p className="text-2xl font-bold text-green-600">৳ {totalMoneyCollected}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">মোট খরচ</p>
            <p className="text-2xl font-bold text-red-600">৳ {totalExpensesAmount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">অবশিষ্ট আছে</p>
            <p className="text-2xl font-bold text-blue-600">৳ {remainingBalance}</p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">ওয়েবসাইট সেটিংস</h2>
            {!isEditingSettings ? (
              <button onClick={() => setIsEditingSettings(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold">
                <Edit size={16} /> এডিট
              </button>
            ) : (
              <button onClick={handleSaveSettings} className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-semibold px-3 py-1 bg-green-50 rounded-lg">
                <Save size={16} /> সেভ
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ডেমো ইমেজ লিংক</label>
              <input type="text" disabled={!isEditingSettings} value={settings.demoImage} onChange={e => setSettings({...settings, demoImage: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ফাইনাল ইমেজ লিংক</label>
              <input type="text" disabled={!isEditingSettings} value={settings.finalImage} onChange={e => setSettings({...settings, finalImage: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">হাফ হাতা মূল্য</label>
              <input type="number" disabled={!isEditingSettings} value={settings.priceHalf} onChange={e => setSettings({...settings, priceHalf: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ফুল হাতা মূল্য</label>
              <input type="number" disabled={!isEditingSettings} value={settings.priceFull} onChange={e => setSettings({...settings, priceFull: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">ডেডলাইন (আবেদনের শেষ সময়)</label>
              <input type="datetime-local" disabled={!isEditingSettings} value={getDeadlineString(settings.deadline)} onChange={handleDeadlineChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">নোটিশ বোর্ড (খালি রাখলে নোটিশ লুকানো থাকবে)</label>
              <textarea rows={3} disabled={!isEditingSettings} value={settings.notice || ''} onChange={e => setSettings({...settings, notice: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 text-sm" placeholder="এখানে নোটিশ লিখুন..."></textarea>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-800">আবেদন সমূহ ({filteredApplications.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => downloadImage(ordersRef, 'orders.png')} className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition-colors">
                <ImageIcon size={16} /> HD Image
              </button>
              <button onClick={generateCopyText} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                <Copy size={16} /> Copy Text
              </button>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="নাম, রোল, হোয়াটসঅ্যাপ দিয়ে খুঁজুন..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500">
              <option value="ALL">সব স্ট্যাটাস</option>
              <option value="pending">পেন্ডিং</option>
              <option value="confirmed">কনফার্মড</option>
            </select>
            <select value={filterSize} onChange={e => setFilterSize(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500">
              <option value="ALL">সব সাইজ</option>
              {sizeOrder.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 font-semibold">নাম ও রোল</th>
                  <th className="p-3 font-semibold">পিছনের নাম ও নম্বর</th>
                  <th className="p-3 font-semibold">স্লিভ ও সাইজ</th>
                  <th className="p-3 font-semibold">পেমেন্ট</th>
                  <th className="p-3 font-semibold">স্ট্যাটাস</th>
                  <th className="p-3 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{app.fullName}</p>
                      <p className="text-xs text-slate-500">{app.roll} • {app.whatsapp}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{app.backName}</p>
                      <p className="text-xs text-slate-500">No: {app.backNumber}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold mr-2">{app.sleeve}</span>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{app.size}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${app.paymentMethod === 'BIKASH' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                        {app.paymentMethod}
                      </span>
                      {app.paymentMethod === 'BIKASH' && <p className="text-xs text-slate-500 mt-1">{app.bkashSender}</p>}
                    </td>
                    <td className="p-3">
                      {app.status === 'confirmed' ? (
                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Confirmed</span>
                      ) : (
                        <span className="text-amber-500 font-bold">Pending</span>
                      )}
                    </td>
                    <td className="p-3 flex items-center justify-end gap-2">
                      {app.status === 'pending' ? (
                        <button onClick={() => handleUpdateStatus(app.id, 'confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Confirm">
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => downloadToken(app)} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Download Token">
                            <Download size={18} />
                          </button>
                          <button onClick={() => downloadReceipt(app)} className="p-2 text-slate-800 hover:bg-slate-100 rounded" title="Download Receipt">
                            <FileText size={18} />
                          </button>
                          <button onClick={() => sendWhatsAppMsg(app)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Send WhatsApp MSG">
                            <MessageCircle size={18} />
                          </button>
                        </>
                      )}
                      <button onClick={() => setEditingApp(app)} className="p-2 text-slate-600 hover:bg-slate-100 rounded" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length === 0 && (
              <div className="text-center py-8 text-slate-500">কোনো আবেদন পাওয়া যায়নি।</div>
            )}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-800">খরচের হিসাব</h2>
            <button onClick={() => downloadImage(expensesRef, 'expenses.png')} className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition-colors">
              <ImageIcon size={16} /> HD Image
            </button>
          </div>

          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="text" placeholder="খরচের নাম (যেমন: ডিজাইন ফি)" className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" value={newExpense.name} onChange={e=>setNewExpense({...newExpense, name: e.target.value})} />
            <input type="number" placeholder="টাকা" className="w-full sm:w-32 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount: e.target.value})} />
            <button type="submit" className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Add
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 font-semibold rounded-tl-lg">খরচের বিবরণ</th>
                  <th className="p-3 font-semibold text-right">পরিমাণ (৳)</th>
                  <th className="p-3 font-semibold text-right rounded-tr-lg">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{exp.name}</td>
                    <td className="p-3 text-right font-bold text-slate-700">{exp.amount}</td>
                    <td className="p-3 flex items-center justify-end gap-2">
                      <button onClick={() => setEditingExpense(exp)} className="p-2 text-slate-600 hover:bg-slate-100 rounded" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="text-center py-8 text-slate-500">কোনো খরচ পাওয়া যায়নি।</div>
            )}
          </div>
        </div>

      </div>

      {/* Hidden Export Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-0 -z-50 overflow-hidden">
        {/* Orders Image Container */}
        <div ref={ordersRef} className="w-[1024px] bg-white p-12 font-sans text-slate-900">
          <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
            <h1 className="text-4xl font-black tracking-tight uppercase">T-Shirt Program 2026</h1>
            <p className="text-xl font-bold text-blue-600 tracking-widest mt-2 uppercase">Auroras-25 • Confirmed Orders</p>
          </div>
          <table className="w-full text-left border-collapse text-lg">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-4 font-bold border-r border-slate-200">Back Name</th>
                <th className="p-4 font-bold border-r border-slate-200 text-center">No.</th>
                <th className="p-4 font-bold border-r border-slate-200 text-center">Size</th>
                <th className="p-4 font-bold text-center">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              {sortApps(confirmedApps).map((app, idx) => (
                <tr key={app.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-4 border-r border-b border-slate-200 font-bold uppercase">{app.backName}</td>
                  <td className="p-4 border-r border-b border-slate-200 text-center">{app.backNumber}</td>
                  <td className="p-4 border-r border-b border-slate-200 text-center font-bold text-blue-700">{app.size}</td>
                  <td className="p-4 border-b border-slate-200 text-center font-semibold">{app.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 text-right font-semibold text-slate-500">
            Total Confirmed: {confirmedApps.length}
          </div>
        </div>

        {/* Expenses Image Container */}
        <div className="fixed top-0 left-[-9999px] -z-50 pointer-events-none">
          <div ref={expensesRef} className="w-[800px] bg-white p-10 font-sans text-slate-900 border-4 border-slate-900">
            <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
              <h1 className="text-4xl font-black tracking-tight uppercase m-0">T-Shirt Program 2026</h1>
              <p className="text-xl font-bold text-red-600 tracking-widest mt-2 uppercase mb-0">Auroras-25 • Expense Report</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
              <table className="w-full text-left text-lg">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="pb-4 font-bold text-slate-700">Expense Details</th>
                    <th className="pb-4 font-bold text-right text-slate-700">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-4 font-medium text-slate-800 pr-4 break-words">{exp.name}</td>
                      <td className="py-4 text-right font-bold whitespace-nowrap">{exp.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center bg-green-50 p-5 rounded-xl border border-green-200 flex-nowrap whitespace-nowrap">
                <span className="text-xl font-bold text-green-800">Total Collected:</span>
                <span className="text-2xl font-black text-green-700">BDT {totalMoneyCollected}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 p-5 rounded-xl border border-red-200 flex-nowrap whitespace-nowrap">
                <span className="text-xl font-bold text-red-800">Total Expenses:</span>
                <span className="text-2xl font-black text-red-700">BDT {totalExpensesAmount}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-5 rounded-xl border border-blue-200 flex-nowrap whitespace-nowrap">
                <span className="text-xl font-bold text-blue-800">Remaining Balance:</span>
                <span className="text-2xl font-black text-blue-700">BDT {remainingBalance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Token Reference */}
        {activeTokenApp && (
          <div className="fixed top-0 left-[-9999px] -z-50 pointer-events-none">
            <div ref={tokenRef} className="w-[600px] bg-white border-8 border-slate-900 font-sans p-8">
              <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-4 flex-nowrap">
                <h2 className="text-3xl font-black uppercase tracking-wider text-slate-900 m-0 whitespace-nowrap">Auroras-25</h2>
                <div className="px-4 py-1.5 bg-green-100 text-green-800 font-bold rounded-full text-sm tracking-widest border border-green-300 whitespace-nowrap">CONFIRMED TOKEN</div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                <div>
                  <span className="text-slate-500 text-sm block mb-1">Name:</span>
                  <span className="font-bold text-lg break-words leading-tight">{activeTokenApp.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-sm block mb-1">Roll:</span>
                  <span className="font-bold text-lg break-words leading-tight">{activeTokenApp.roll}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-sm block mb-1">Back Name:</span>
                  <span className="font-black text-xl text-blue-700 uppercase break-words leading-tight">{activeTokenApp.backName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-sm block mb-1">Back Number:</span>
                  <span className="font-black text-xl text-blue-700 leading-tight">{activeTokenApp.backNumber}</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t-2 border-slate-200 pt-4 flex-nowrap">
                <div className="whitespace-nowrap">
                  <span className="text-slate-500 text-xs block uppercase tracking-widest mb-1">Sleeve & Size</span>
                  <span className="font-black text-2xl tracking-tight text-slate-800 leading-none">{activeTokenApp.sleeve} • {activeTokenApp.size}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono text-right whitespace-nowrap">
                  ID: {activeTokenApp.id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Receipt Reference */}
        {activeReceiptApp && (
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
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.fullName}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">Roll Number</td>
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.roll}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">WhatsApp</td>
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.whatsapp}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">T-Shirt Size & Sleeve</td>
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.size} • {activeReceiptApp.sleeve}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">Name on Back</td>
                      <td className="py-4 font-black text-slate-800 uppercase">{activeReceiptApp.backName}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">Number on Back</td>
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.backNumber}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">Payment Amount</td>
                      <td className="py-4 font-black text-slate-800">BDT {activeReceiptApp.sleeve === 'HALF' ? settings.priceHalf : settings.priceFull}</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold text-slate-500">Payment Number</td>
                      <td className="py-4 font-black text-slate-800">{activeReceiptApp.bkashSender || 'N/A'} ({activeReceiptApp.paymentMethod})</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-green-50 p-6 rounded-xl border border-green-200 flex-nowrap">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <CheckCircle className="text-green-600" size={32} />
                  <span className="text-2xl font-bold text-green-800 m-0">Status: CONFIRMED</span>
                </div>
                <span className="text-sm font-mono text-slate-500 whitespace-nowrap text-right">Receipt ID: {activeReceiptApp.id}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Edit App Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">এডিট করুন</h3>
              <button onClick={() => setEditingApp(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
              <div><label className="text-sm font-semibold">নাম</label><input type="text" value={editingApp.fullName} onChange={e=>setEditingApp({...editingApp, fullName: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="text-sm font-semibold">রোল</label><input type="text" value={editingApp.roll} onChange={e=>setEditingApp({...editingApp, roll: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="text-sm font-semibold">হোয়াটসঅ্যাপ</label><input type="text" value={editingApp.whatsapp} onChange={e=>setEditingApp({...editingApp, whatsapp: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="text-sm font-semibold">পিছনের নাম</label><input type="text" value={editingApp.backName} onChange={e=>setEditingApp({...editingApp, backName: e.target.value.toUpperCase()})} className="w-full border rounded px-3 py-2 uppercase" /></div>
              <div><label className="text-sm font-semibold">পিছনের নম্বর</label><input type="text" value={editingApp.backNumber} onChange={e=>setEditingApp({...editingApp, backNumber: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold">স্লিভ</label>
                  <select value={editingApp.sleeve} onChange={e=>setEditingApp({...editingApp, sleeve: e.target.value as any})} className="w-full border rounded px-3 py-2">
                    <option value="HALF">HALF</option>
                    <option value="FULL">FULL</option>
                  </select>
                </div>
                <div><label className="text-sm font-semibold">সাইজ</label>
                  <select value={editingApp.size} onChange={e=>setEditingApp({...editingApp, size: e.target.value as any})} className="w-full border rounded px-3 py-2">
                    {sizeOrder.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={saveEditedApp} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl">সেভ করুন</button>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">খরচ এডিট করুন</h3>
              <button onClick={() => setEditingExpense(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-4 p-1">
              <div>
                <label className="text-sm font-semibold">খরচের বিবরণ</label>
                <input type="text" value={editingExpense.name} onChange={e=>setEditingExpense({...editingExpense, name: e.target.value})} className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-semibold">পরিমাণ (৳)</label>
                <input type="number" value={editingExpense.amount} onChange={e=>setEditingExpense({...editingExpense, amount: Number(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500" />
              </div>
            </div>
            <button onClick={saveEditedExpense} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">সেভ করুন</button>
          </div>
        </div>
      )}

    </div>
  );
}
