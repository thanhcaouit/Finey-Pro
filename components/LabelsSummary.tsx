
import React, { useState, useMemo } from 'react';
import { Transaction, Category, CategoryGroup, Account, AccountGroup, Label, AppSettings } from '../types';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  accountGroups: AccountGroup[];
  accounts: Account[];
  labels: Label[];
  settings: AppSettings;
  onAddLabel: (name: string) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const LabelsSummary: React.FC<Props> = ({ 
  transactions, categories, categoryGroups, accountGroups, accounts, labels, settings,
  onAddLabel, onUpdateTransaction, onDeleteTransaction 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewingLabelId, setViewingLabelId] = useState<string | null>(null); // 'none' for no labels
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(val));
    return isNegative ? `-${formatted}` : formatted;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  const summaryData = useMemo(() => {
    const labelTotals = new Map<string, number>();
    let noLabelsTotal = 0;

    monthTransactions.forEach(t => {
      if (t.type === 'Transfer') return;
      if (t.labels.length === 0) {
        noLabelsTotal += t.amount;
      } else {
        t.labels.forEach(labelId => {
          const current = labelTotals.get(labelId) || 0;
          labelTotals.set(labelId, current + t.amount);
        });
      }
    });

    const items = labels.map(label => ({
      id: label.id,
      name: label.name,
      total: labelTotals.get(label.id) || 0,
      absTotal: Math.abs(labelTotals.get(label.id) || 0)
    })).filter(item => item.total !== 0);

    if (noLabelsTotal !== 0) {
      items.push({
        id: 'none',
        name: '(No Labels)',
        total: noLabelsTotal,
        absTotal: Math.abs(noLabelsTotal)
      });
    }

    // Sort by absolute amount descending
    items.sort((a, b) => b.absTotal - a.absTotal);
    const maxAbs = items.length > 0 ? items[0].absTotal : 1;

    return { items, maxAbs };
  }, [monthTransactions, labels]);

  const drillDownTransactions = useMemo(() => {
    if (!viewingLabelId) return [];
    if (viewingLabelId === 'none') return monthTransactions.filter(t => t.labels.length === 0);
    return monthTransactions.filter(t => t.labels.includes(viewingLabelId));
  }, [viewingLabelId, monthTransactions]);

  const activeLabelName = viewingLabelId === 'none' ? '(No Labels)' : labels.find(l => l.id === viewingLabelId)?.name;

  const handleAddLabelPrompt = () => {
    const name = window.prompt('Enter new label name:');
    if (name && name.trim()) {
      onAddLabel(name.trim());
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Month Selector */}
      <div className="bg-[#2196F3] rounded-full p-1 flex items-center justify-between shadow-lg mb-4 sticky top-0 z-10 mx-1">
        <button onClick={() => changeMonth(-1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="text-white text-[13px] font-black tracking-widest uppercase">
          {monthLabel} (1/1 - 1/{daysInMonth})
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Add Label Inline Button */}
      <div className="px-1 mb-6">
        <button 
          onClick={handleAddLabelPrompt}
          className="w-full bg-white border border-dashed border-blue-300 py-3 rounded-2xl text-blue-500 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          ADD NEW LABEL
        </button>
      </div>

      {/* Labels List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mx-1">
        {summaryData.items.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {summaryData.items.map(item => {
              const percentOfMax = (item.absTotal / summaryData.maxAbs) * 100;
              const isIncome = item.total >= 0;
              const barColor = isIncome ? 'bg-green-500' : 'bg-red-500';
              const textColor = isIncome ? 'text-green-600' : 'text-red-500';

              return (
                <div 
                  key={item.id}
                  onClick={() => setViewingLabelId(item.id)}
                  className="px-6 py-5 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       {item.id === 'none' ? (
                         <span className="text-gray-400 font-bold italic">{item.name}</span>
                       ) : (
                         <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight">
                           {item.name}
                         </span>
                       )}
                    </div>
                    <span className={`font-black text-[15px] ${textColor}`}>
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
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
            <span className="text-6xl">🏷️</span>
            <p className="font-bold uppercase tracking-widest text-xs">No labeled transactions found</p>
          </div>
        )}
      </div>

      {/* Drill-down Transaction List Overlay */}
      {viewingLabelId && (
        <div className="fixed inset-0 bg-[#F5F7F9] z-[300] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-[#2196F3] text-white px-4 py-6 flex items-center gap-4 shadow-xl shrink-0">
            <button onClick={() => setViewingLabelId(null)} className="p-2 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">LABEL HISTORY: {monthLabel}</p>
              <h2 className="text-xl font-black tracking-tight">{activeLabelName}</h2>
              <p className="text-sm font-bold opacity-90">Net: {formatCurrency(drillDownTransactions.reduce((s, t) => s + t.amount, 0))}</p>
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
        <TransactionForm 
          categories={categories}
          accounts={accounts}
          categoryGroups={categoryGroups}
          accountGroups={accountGroups}
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

export default LabelsSummary;
