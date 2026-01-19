
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, Account, Category, Label } from '../types';

interface Props {
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  labels: Label[];
  onEditTransaction: (t: Transaction) => void;
  onSelectAccount: (accountId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

const GlobalSearch: React.FC<Props> = ({ 
  onClose, transactions, accounts, categories, labels, 
  onEditTransaction, onSelectAccount, onSelectCategory 
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    if (!query.trim()) return { transactions: [], accounts: [], categories: [] };
    
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredTransactions = transactions.filter(t => {
      const catName = categories.find(c => c.id === t.categoryId)?.name || '';
      const accName = accounts.find(a => a.id === t.accountId)?.name || '';
      const content = `${t.note} ${catName} ${accName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return content.includes(q);
    }).slice(0, 10);

    const filteredAccounts = accounts.filter(a => {
      const content = `${a.name} ${a.description}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return content.includes(q);
    });

    const filteredCategories = categories.filter(c => {
      const content = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return content.includes(q);
    });

    return {
      transactions: filteredTransactions,
      accounts: filteredAccounts,
      categories: filteredCategories
    };
  }, [query, transactions, accounts, categories]);

  const totalResults = results.transactions.length + results.accounts.length + results.categories.length;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[500] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Search Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 shrink-0">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm giao dịch, tài khoản..."
            className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button onClick={onClose} className="px-4 py-2 font-black text-blue-600 uppercase text-xs tracking-widest">Đóng</button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {query.trim() === '' ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl">🔍</div>
            <p className="font-bold text-sm uppercase tracking-widest">Nhập để tìm kiếm mọi thứ</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl">🏜️</div>
            <p className="font-bold text-sm uppercase tracking-widest">Không tìm thấy kết quả</p>
          </div>
        ) : (
          <>
            {/* Accounts Results */}
            {results.accounts.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Tài khoản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.accounts.map(acc => (
                    <button 
                      key={acc.id}
                      onClick={() => onSelectAccount(acc.id)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏦</span>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{acc.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{acc.description}</p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-blue-600">{formatCurrency(acc.balanceNew)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Results */}
            {results.categories.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Danh mục</h3>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span className="font-bold text-xs text-gray-700">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Results */}
            {results.transactions.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Giao dịch gần đây</h3>
                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden divide-y divide-gray-50">
                  {results.transactions.map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    return (
                      <div 
                        key={t.id} 
                        onClick={() => onEditTransaction(t)}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat?.color || '#cbd5e1' }}
                        >
                          {cat?.icon || '•'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{t.note || cat?.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {formatCurrency(t.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
