"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, Plus, Globe, LogOut,
  ArrowUpRight, ArrowDownRight, Calendar, Lock, Mail, User,
  AlertCircle, Loader2, X, Tag, DollarSign, Type, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

// --- ТИПІЗАЦІЯ (Закриваємо питання з any) ---
interface Category {
  _id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  monthlyLimit: number;
  spent: number;
}

interface Stats {
  totalIncome: number;
  totalExpenses: number;
  paidExpenses: number;
  unpaidExpenses: number;
  balance: number;
  period?: {
    label: string;
    startDate: string;
    endDate: string;
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// --- КОНФІГУРАЦІЯ ---
const getApiUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

const UI_LANGS = {
  UA: {
    balance: "Залишок",
    income: "Доходи",
    expenses: "Витрати",
    paid: "Сплачено",
    unpaid: "Очікує",
    addTransaction: "Додати операцію",
    categories: "Категорії",
    history: "Історія за",
    currency: "PLN",
    logout: "Вихід",
    login: "Вхід",
    register: "Реєстрація",
    email: "Електронна пошта",
    password: "Пароль",
    name: "Ваше ім'я",
    noAccount: "Немає акаунту?",
    haveAccount: "Вже є акаунт?",
    newCategory: "Нова категорія",
    catName: "Назва (напр. Продукти)",
    catLimit: "Місячний ліміт",
    save: "Зберегти",
    cancel: "Скасувати",
    amount: "Сума",
    title: "Назва операції",
    selectCategory: "Виберіть категорію"
  }
};

// --- МОДАЛЬНЕ ВІКНО (Base) ---
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 pb-8">{children}</div>
      </div>
    </div>
  );
};

// --- КОМПОНЕНТ АВТОРИЗАЦІЇ ---
const AuthForm = ({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Помилка авторизації');

      localStorage.setItem('grosz_token', data.token);
      onLoginSuccess(data.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Сталася невідома помилка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200 mb-4">G</div>
          <h1 className="text-2xl font-bold text-slate-800">Grosz</h1>
          <p className="text-slate-500 text-sm">Керуй фінансами розумно</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Ім'я"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email"
              required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Пароль"
              required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Увійти' : 'Створити акаунт')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-semibold text-sm hover:underline"
          >
            {isLogin ? "Немає акаунту? Реєстрація" : "Вже є акаунт? Увійти"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ APP ---
export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Модальні вікна
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  
  // Дані для нових записів
  const [newCat, setNewCat] = useState({ name: '', type: 'EXPENSE', color: '#4f46e5', monthlyLimit: '' });
  const [newTrans, setNewTrans] = useState({ title: '', categoryId: '', amountOriginal: '', currency: 'PLN', isPaid: true });

  const t = UI_LANGS['UA'];

  const fetchDashboardData = useCallback(async (authToken: string) => {
    try {
      setLoading(true);
      const [statsRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/stats`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch(`${API_URL}/analytics/categories`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);

      if (statsRes.status === 401) {
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      const catsData = await catsRes.json();

      setStats(statsData);
      setCategories(catsData);
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('grosz_token') : null;
    if (savedToken) {
      setToken(savedToken);
      fetchDashboardData(savedToken);
    } else {
      setLoading(false);
    }
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('grosz_token');
    setToken(null);
    setStats(null);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newCat, monthlyLimit: Number(newCat.monthlyLimit) || 0 })
      });
      if (res.ok) {
        setIsCatModalOpen(false);
        setNewCat({ name: '', type: 'EXPENSE', color: '#4f46e5', monthlyLimit: '' });
        fetchDashboardData(token!);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTrans, amountOriginal: Number(newTrans.amountOriginal) })
      });
      if (res.ok) {
        setIsTransModalOpen(false);
        setNewTrans({ title: '', categoryId: '', amountOriginal: '', currency: 'PLN', isPaid: true });
        fetchDashboardData(token!);
      }
    } catch (err) { console.error(err); }
  };

  if (!token) {
    return <AuthForm onLoginSuccess={(newToken) => {
      setToken(newToken);
      fetchDashboardData(newToken);
    }} />;
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const chartData = stats ? [
    { name: t.paid, value: stats.paidExpenses || 0, color: '#10b981' },
    { name: t.unpaid, value: stats.unpaidExpenses || 0, color: '#f43f5e' }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Навігація */}
      <nav className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">G</div>
            <span className="font-black text-2xl tracking-tight text-slate-800">Grosz</span>
          </div>
          <button className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl transition-all" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Статистика */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <span className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">{t.balance}</span>
              <Wallet className="w-6 h-6 text-indigo-200" />
            </div>
            <h2 className="text-4xl font-black">{stats?.balance?.toLocaleString() || 0} <span className="text-xl font-medium opacity-60">PLN</span></h2>
          </div>

          <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{t.income}</p>
              <p className="text-2xl font-black text-slate-800">+{stats?.totalIncome || 0} <span className="text-sm font-medium">PLN</span></p>
            </div>
          </div>

          <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
              <ArrowDownRight className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{t.expenses}</p>
              <p className="text-2xl font-black text-slate-800">-{stats?.totalExpenses || 0} <span className="text-sm font-medium">PLN</span></p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Графік */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{stats?.period?.label || 'Поточний місяць'}</h3>
            </div>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.every(d => d.value === 0) ? [{name: 'Empty', value: 1, color: '#f1f5f9'}] : chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {(chartData.every(d => d.value === 0) ? [{name: 'Empty', value: 1, color: '#f1f5f9'}] : chartData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">
                  {stats && stats.totalExpenses > 0 ? Math.round((stats.paidExpenses / stats.totalExpenses) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.paid}</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.paid}</p>
                <p className="font-black text-emerald-600">{stats?.paidExpenses || 0} <span className="text-[10px]">PLN</span></p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.unpaid}</p>
                <p className="font-black text-rose-500">{stats?.unpaidExpenses || 0} <span className="text-[10px]">PLN</span></p>
              </div>
            </div>
          </div>

          {/* Категорії */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{t.categories}</h3>
              <button onClick={() => setIsCatModalOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {categories.length > 0 ? categories.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block mb-0.5">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{cat.type === 'INCOME' ? 'Дохід' : 'Витрати'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-800 text-sm">{cat.spent?.toFixed(2) || '0.00'}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/ {cat.monthlyLimit} PLN</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{ 
                        width: `${Math.min(100, (cat.spent/cat.monthlyLimit)*100 || 0)}%`,
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-10">
                  <FolderPlus className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs font-medium">Категорій ще немає</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Швидка дія */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[240px] px-4">
        <button 
          onClick={() => setIsTransModalOpen(true)}
          className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          {t.addTransaction}
        </button>
      </div>

      {/* --- MODALS --- */}
      
      {/* Створення категорії */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={t.newCategory}>
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3 h-3" /> {t.catName}
            </label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newCat.name}
              onChange={(e) => setNewCat({...newCat, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Type className="w-3 h-3" /> Тип
              </label>
              <select 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                value={newCat.type}
                onChange={(e) => setNewCat({...newCat, type: e.target.value as 'INCOME' | 'EXPENSE'})}
              >
                <option value="EXPENSE">Витрати</option>
                <option value="INCOME">Дохід</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> {t.catLimit}
              </label>
              <input 
                type="number"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                value={newCat.monthlyLimit}
                onChange={(e) => setNewCat({...newCat, monthlyLimit: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-4">{t.save}</button>
        </form>
      </Modal>

      {/* Створення транзакції */}
      <Modal isOpen={isTransModalOpen} onClose={() => setIsTransModalOpen(false)} title={t.addTransaction}>
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" /> {t.title}
            </label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
              value={newTrans.title}
              onChange={(e) => setNewTrans({...newTrans, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3 h-3" /> {t.selectCategory}
            </label>
            <select 
              required
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
              value={newTrans.categoryId}
              onChange={(e) => setNewTrans({...newTrans, categoryId: e.target.value})}
            >
              <option value="">-- {t.selectCategory} --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> {t.amount}
              </label>
              <input 
                required
                type="number"
                step="0.01"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                value={newTrans.amountOriginal}
                onChange={(e) => setNewTrans({...newTrans, amountOriginal: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Валюта
              </label>
              <select 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                value={newTrans.currency}
                onChange={(e) => setNewTrans({...newTrans, currency: e.target.value})}
              >
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="isPaid" 
              checked={newTrans.isPaid}
              onChange={(e) => setNewTrans({...newTrans, isPaid: e.target.checked})}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <label htmlFor="isPaid" className="text-sm font-bold text-slate-600 uppercase tracking-tight">Вже оплачено</label>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg mt-4">{t.save}</button>
        </form>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}

// Іконка для порожнього стану
const FolderPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);