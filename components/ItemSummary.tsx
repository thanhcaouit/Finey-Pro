
import React, { useState, useMemo } from 'react';
import { Transaction, Category, CategoryGroup, Account, Label, AppSettings } from '../types';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  accounts: Account[];
  labels: Label[];
  settings: AppSettings;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const ItemSummary: React.FC<Props> = ({ 
  transactions, categories, categoryGroups, accounts, labels, settings,
  onUpdateTransaction, onDeleteTransaction 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewingCategoryId, setViewingCategoryId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(val));
    return isNegative ? `-${formatted}` : formatted;
  };

  // 1. Filter transactions for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  // 2. Aggregate data by category and split into Income/Expense
  const summaryData = useMemo(() => {
    const map = new Map<string, number>();
    
    monthTransactions.forEach(t => {
      if (t.type === 'Transfer') return; // Skip transfers for item summary
      const current = map.get(t.categoryId) || 0;
      map.set(t.categoryId, current + t.amount);
    });

    const expenseItems: any[] = [];
    const incomeItems: any[] = [];

    map.forEach((total, catId) => {
      if (total === 0) return;
      
      const category = categories.find(c => c.id === catId);
      const item = {
        id: catId,
        name: category?.name || 'Unknown',
        total: total,
        absTotal: Math.abs(total),
        type: total >= 0 ? 'Income' : 'Expense'
      };

      if (item.type === 'Expense') {
        expenseItems.push(item);
      } else {
        incomeItems.push(item);
      }
    });

    // Sort by absolute magnitude descending
    expenseItems.sort((a, b) => b.absTotal - a.absTotal);
    incomeItems.sort((a, b) => b.absTotal - a.absTotal);

    const maxAbsExpense = expenseItems.length > 0 ? expenseItems[0].absTotal : 1;
    const maxAbsIncome = incomeItems.length > 0 ? incomeItems[0].absTotal : 1;

    return { expenseItems, incomeItems, maxAbsExpense, maxAbsIncome };
  }, [monthTransactions, categories]);

  const activeCategory = categories.find(c => c.id === viewingCategoryId);
  const drillDownTransactions = monthTransactions.filter(t => t.categoryId === viewingCategoryId);

  const renderSection = (title: string, items: any[], maxAbs: number, colorText: string, barColor: string) => (
    <div className="mb-8">
      <div className="px-4 mb-3 flex justify-between items-end">
        <h2 className={`font-black text-[12px] tracking-[0.2em] uppercase ${colorText}`}>{title}</h2>
        <span className="text-[10px] font-black text-gray-400 uppercase">
          Total: {formatCurrency(items.reduce((s, i) => s + i.total, 0))}
        </span>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mx-1">
        {items.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {items.map(item => {
              const percentOfMax = (item.absTotal / maxAbs) * 100;
              return (
                <div 
                  key={item.id}
                  onClick={() => setViewingCategoryId(item.id)}
                  className="px-6 py-5 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-700 text-[15px]">{item.name}</span>
                    <span className={`font-black text-[15px] ${colorText}`}>
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50">
            <span className="text-3xl">🏜️</span>
            <p className="font-bold uppercase tracking-widest text-[9px]">No {title.toLowerCase()} data</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Month Selector */}
      <div className="bg-[#2196F3] rounded-full p-1 flex items-center justify-between shadow-lg mb-8 sticky top-0 z-10 mx-1">
        <button onClick={() => changeMonth(-1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="text-white text-[13px] font-black tracking-widest">
          {monthLabel} (1/1 - 1/{daysInMonth})
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Outcome Section (Expenses) - Priority TOP */}
      {renderSection(
        'EXPENSES', 
        summaryData.expenseItems, 
        summaryData.maxAbsExpense, 
        'text-red-500', 
        'bg-red-500'
      )}

      {/* Income Section */}
      {renderSection(
        'INCOME', 
        summaryData.incomeItems, 
        summaryData.maxAbsIncome, 
        'text-green-600', 
        'bg-green-500'
      )}

      {/* Drill-down Transaction List Overlay */}
      {viewingCategoryId && (
        <div className="fixed inset-0 bg-[#F5F7F9] z-[300] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-[#2196F3] text-white px-4 py-6 flex items-center gap-4 shadow-xl shrink-0">
            <button onClick={() => setViewingCategoryId(null)} className="p-2 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">HISTORY: {monthLabel}</p>
              <h2 className="text-xl font-black tracking-tight">{activeCategory?.name}</h2>
              <p className="text-sm font-bold opacity-90">Total: {formatCurrency(drillDownTransactions.reduce((s, t) => s + t.amount, 0))}</p>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            <TransactionList 
              transactions={drillDownTransactions}
              categories={categories}
              accounts={accounts}
              labels={labels}
              onDelete={(id) => { if(window.confirm('Delete transaction?')) onDeleteTransaction(id); }}
              onEdit={(t) => setEditingTransaction(t)}
            />
          </div>
        </div>
      )}

      {/* Shared Transaction Form for drill-down editing */}
      {editingTransaction && (
        // Added missing required settings prop for TransactionForm
        <TransactionForm 
          categories={categories}
          accounts={accounts}
          categoryGroups={categoryGroups}
          labels={labels}
          settings={settings}
          initialTransaction={editingTransaction}
          onSave={(data) => {
            onUpdateTransaction(editingTransaction.id, data);
            setEditingTransaction(null);
          }}
          onDelete={onDeleteTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default ItemSummary;
