
import React from 'react';
import { Transaction, Category, Account, Label } from '../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  labels: Label[];
  onRestore: (id: string) => void;
  onEmpty: () => void;
  onDeletePermanently: (id: string) => void;
  onViewDetail?: (t: Transaction) => void;
}

const Trash: React.FC<Props> = ({ 
  transactions, categories, accounts, labels, onRestore, onEmpty, onDeletePermanently, onViewDetail 
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-black text-gray-700">Thùng rác</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{transactions.length} Giao dịch</p>
        </div>
        <button onClick={() => { if(window.confirm('Empty trash?')) onEmpty(); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 p-12 text-center">
            <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <p className="font-bold text-lg uppercase tracking-widest">Trống</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(t => {
              const cat = getCategory(t.categoryId);
              const acc = getAccount(t.accountId);
              const dateObj = new Date(t.date);
              const formattedDate = dateObj.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={t.id} onClick={() => onViewDetail?.(t)} className="p-4 flex items-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4 shrink-0 shadow-inner bg-gray-100 text-gray-400 relative">
                    {cat?.icon || '•'}
                    <div className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">✕</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-[15px] truncate leading-tight">{t.note || cat?.name || 'Giao dịch'}</p>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{cat?.name} | {acc?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[15px] text-gray-400">{formatCurrency(t.amount)}</p>
                        <p className="text-[10px] font-bold text-gray-400">{formattedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
