
import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { api } from '../services/api';

const PAYOUT_METHODS = [
  { 
    id: 'paypal', 
    name: 'PayPal', 
    min: 10, 
    icon: 'fa-brands fa-paypal', 
    color: 'bg-blue-600',
    processing: 'Within 24 hours',
    fee: '2% Service Fee',
    description: 'Direct transfer to your PayPal email address.'
  },
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    min: 50, 
    icon: 'fa-solid fa-building-columns', 
    color: 'bg-indigo-600',
    processing: '3 - 5 Business Days',
    fee: '$1.00 Flat Fee',
    description: 'Secure transfer to any international bank account.'
  },
  { 
    id: 'amazon', 
    name: 'Amazon Gift Card', 
    min: 5, 
    icon: 'fa-brands fa-amazon', 
    color: 'bg-orange-500',
    processing: 'Instant Delivery',
    fee: 'No Fee',
    description: 'Digital code sent directly to your inbox.'
  },
];

interface PayoutsProps {
  balance: number;
}

const Payouts: React.FC<PayoutsProps> = ({ balance }) => {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchHistory = async () => {
    const data = await api.wallet.getHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleWithdraw = async (method: typeof PAYOUT_METHODS[0]) => {
    if (balance < method.min) return;
    
    setSubmitting(method.id);
    try {
      await api.wallet.requestPayout(method.min, method.name);
      alert(`Success! Your $${method.min} withdrawal via ${method.name} is being processed.`);
      fetchHistory();
      // Reload page to update layout balance (simplified state management for demo)
      window.location.reload();
    } catch (e) {
      alert("Withdrawal failed. Please check your balance.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Withdraw Funds</h2>
             <p className="text-sm text-gray-400 font-medium mt-1">Convert your virtual earnings into real value.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <i className="fa-solid fa-shield-check text-green-600"></i>
            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Insured Payouts</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAYOUT_METHODS.map((method) => (
            <div key={method.id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 ${method.color} text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                  <i className={method.icon}></i>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Min. Yield</p>
                  <p className="text-2xl font-black text-gray-900">${method.min}</p>
                </div>
              </div>

              <h3 className="font-black text-gray-900 text-xl mb-2">{method.name}</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed flex-grow">{method.description}</p>
              
              <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">Processing</span>
                  <span className="text-gray-900">{method.processing}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">Platform Fee</span>
                  <span className={method.fee.includes('No') ? 'text-green-600' : 'text-gray-900'}>{method.fee}</span>
                </div>
              </div>

              <button 
                onClick={() => handleWithdraw(method)}
                disabled={balance < method.min || !!submitting}
                className="w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest bg-gray-900 text-white shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting === method.id ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : balance < method.min ? (
                  `Need $${(method.min - balance).toFixed(2)}`
                ) : (
                  'Request Withdrawal'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-gray-900">Activity Log</h2>
          <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">{history.length}</span>
        </div>
        
        <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-32 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deciphering History...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center gap-6 opacity-40">
              <i className="fa-solid fa-folder-open text-7xl text-gray-200"></i>
              <div>
                <p className="text-gray-900 font-black text-xl uppercase tracking-widest">No Records</p>
                <p className="text-sm font-medium text-gray-400 mt-2">Earn rewards to see them listed here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Detail</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Security Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${tx.type === 'Earning' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <i className={tx.type === 'Earning' ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-solid fa-arrow-down-left-and-arrow-up-right-to-center'}></i>
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-[13px]">{tx.description}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{tx.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          tx.status === 'Pending' ? 'bg-orange-100 text-orange-700 animate-pulse' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-xl">
                        <span className={tx.type === 'Earning' ? 'text-green-600' : 'text-gray-900'}>
                          {tx.type === 'Earning' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payouts;
