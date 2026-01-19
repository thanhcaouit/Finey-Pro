
import React from 'react';
import { Transaction, Category, Account, Label } from '../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  labels: Label[];
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, categories, accounts, labels, onDelete, onEdit }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  const groupedTransactions: { [date: string]: { items: Transaction[], dailyTotal: number } } = {};

  transactions.forEach(t => {
    const dateKey = new Date(t.date).toDateString();
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = { items: [], dailyTotal: 0 };
    }
    groupedTransactions[dateKey].items.push(t);
    groupedTransactions[dateKey].dailyTotal += t.amount;
  });

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {sortedDates.map(dateStr => {
        const dateObj = new Date(dateStr);
        const group = groupedTransactions[dateStr];
        const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase();
        const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });

        return (
          <div key={dateStr} className="border-b border-gray-100 last:border-0">
            <div className="bg-gray-50/80 px-4 py-2 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{dayName}</span>
                <span className="text-[13px] font-bold text-gray-600">{formattedDate}</span>
              </div>
              <span className={`text-[13px] font-black ${group.dailyTotal >= 0 ? 'text-gray-700' : 'text-red-500'}`}>
                {formatCurrency(group.dailyTotal)}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {group.items.map(t => {
                const cat = getCategory(t.categoryId);
                const acc = getAccount(t.accountId);
                
                return (
                  <div key={t.id} onClick={() => onEdit?.(t)} className="p-4 flex items-center hover:bg-gray-50 transition-colors group relative cursor-pointer">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4 shrink-0 shadow-inner" style={{ backgroundColor: cat?.color || '#cbd5e1', color: '#fff' }}>
                      {cat?.icon || '•'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800 text-[15px] truncate leading-tight">{t.note || cat?.name || 'Giao dịch'}</p>
                          <p className="text-[11px] font-medium text-gray-400 mt-0.5">{cat?.name} | {acc?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-[15px] ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(t.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
