
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
    id: 'gift', 
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

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await api.wallet.getHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Withdraw Funds</h2>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <i className="fa-solid fa-shield-check text-green-500"></i>
            Secure Payouts
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAYOUT_METHODS.map((method) => (
            <div key={method.id} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 ${method.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                  <i className={method.icon}></i>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Min. Amount</p>
                  <p className="text-lg font-bold text-gray-800">${method.min}</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-800 text-xl mb-1">{method.name}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-grow">{method.description}</p>
              
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-clock text-blue-500 w-4"></i>
                  <span className="text-gray-400 font-medium">Processing:</span>
                  <span className="text-gray-700 font-bold ml-auto">{method.processing}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-ticket text-orange-500 w-4"></i>
                  <span className="text-gray-400 font-medium">Fee:</span>
                  <span className={`font-bold ml-auto ${method.fee.includes('No') ? 'text-green-600' : 'text-gray-700'}`}>{method.fee}</span>
                </div>
              </div>

              <button 
                disabled={balance < method.min}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none active:scale-95"
              >
                {balance < method.min ? `Need $${(method.min - balance).toFixed(2)} more` : 'Withdraw Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">{history.length}</span>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center text-3xl">
                <i className="fa-solid fa-receipt"></i>
              </div>
              <div>
                <p className="text-gray-800 font-bold">No transactions found</p>
                <p className="text-sm text-gray-400 mt-1">Start completing tasks to see your earnings here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'Earning' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <i className={tx.type === 'Earning' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{tx.description}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{tx.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600">{tx.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-sm">
                        <span className={tx.type === 'Earning' ? 'text-green-600' : 'text-red-600'}>
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
