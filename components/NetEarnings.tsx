
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
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const NetEarnings: React.FC<Props> = ({ 
  transactions, categories, categoryGroups, accountGroups, accounts, labels, settings,
  onUpdateTransaction, onDeleteTransaction 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewingItem, setViewingItem] = useState<{ id: string, type: 'category' | 'group', name: string, month: Date } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

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

  const getMonthData = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const income = filtered.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const expense = Math.abs(filtered.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0));
    
    return { transactions: filtered, income, expense, net: income - expense };
  };

  const currData = useMemo(() => getMonthData(currentDate), [transactions, currentDate]);
  const prevData = useMemo(() => getMonthData(prevMonthDate), [transactions, prevMonthDate]);

  const monthLabelShort = (date: Date) => `${date.getMonth() + 1}/1 - ${date.getMonth() + 1}/${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}`;

  const reportStructure = useMemo(() => {
    const buildSection = (type: 'Income' | 'Outcome') => {
      const relevantGroups = categoryGroups.filter(g => g.type === type);
      
      const groupData = relevantGroups.map(group => {
        const groupCats = categories.filter(c => c.groupId === group.id);
        const calcVal = (ts: Transaction[], catIds: string[]) => 
          Math.abs(ts.filter(t => catIds.includes(t.categoryId)).reduce((s, t) => s + t.amount, 0));

        const valPrev = calcVal(prevData.transactions, groupCats.map(c => c.id));
        const valCurr = calcVal(currData.transactions, groupCats.map(c => c.id));

        const itemData = groupCats.map(cat => ({
          ...cat,
          prev: calcVal(prevData.transactions, [cat.id]),
          curr: calcVal(currData.transactions, [cat.id])
        })).filter(item => item.prev !== 0 || item.curr !== 0);

        return { ...group, prev: valPrev, curr: valCurr, items: itemData };
      }).filter(g => g.prev !== 0 || g.curr !== 0);

      return { groups: groupData, totalPrev: groupData.reduce((s, g) => s + g.prev, 0), totalCurr: groupData.reduce((s, g) => s + g.curr, 0) };
    };

    return { income: buildSection('Income'), expense: buildSection('Outcome') };
  }, [currData, prevData, categories, categoryGroups]);

  const drillDownTransactions = useMemo(() => {
    if (!viewingItem) return [];
    const targetMonth = viewingItem.month;
    const monthTs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
    });
    if (viewingItem.type === 'category') return monthTs.filter(t => t.categoryId === viewingItem.id);
    const groupCategoryIds = categories.filter(c => c.groupId === viewingItem.id).map(c => c.id);
    return monthTs.filter(t => groupCategoryIds.includes(t.categoryId));
  }, [viewingItem, transactions, categories]);

  const RowItem = ({ icon, color, name, valPrev, valCurr, isGroup = false, id, type, sectionType }: any) => {
    const diff = valCurr - valPrev;
    const percent = valPrev > 0 ? (diff / valPrev) * 100 : 0;
    const isIncrease = diff > 0;
    const colorText = sectionType === 'Income' ? 'text-green-600' : 'text-red-500';

    return (
      <div 
        onClick={() => setViewingItem({ id, type, name, month: currentDate })}
        className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors ${isGroup ? 'bg-gray-50/60' : ''}`}
      >
        <div className="p-4 space-y-2">
          {/* Line 1: Icon, Name and Percentage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-sm mr-3 shrink-0`}
                style={{ backgroundColor: color || '#94a3b8' }}
              >
                {icon || '•'}
              </div>
              <span className={`font-bold text-gray-700 truncate ${isGroup ? 'uppercase tracking-wide text-[11px]' : 'text-[14px]'}`}>{name}</span>
              {valPrev !== 0 && (
                <span className="ml-2 text-[9px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded shrink-0">
                  {Math.abs(percent).toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          {/* Line 2: Amounts - Stacked beneath Name/Icon for spacing */}
          <div className="flex items-center pl-10">
            {/* Previous Month Column */}
            <div 
              className="flex-1 text-left p-1 rounded"
              onClick={(e) => {
                // If user specifically wants to see previous month history
                e.stopPropagation();
                setViewingItem({ id, type, name, month: prevMonthDate });
              }}
            >
              <p className="text-[13px] font-black text-gray-400">{formatCurrency(valPrev)}</p>
            </div>
            {/* Current Month Column */}
            <div className="flex-1 text-right p-1 rounded flex justify-end items-center gap-1.5">
              <p className={`text-[13px] font-black ${colorText}`}>{formatCurrency(valCurr)}</p>
              {diff !== 0 && (
                <span className={`text-[16px] font-black leading-none shrink-0 ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                  {isIncrease ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Month Selector bar */}
      <div className="bg-[#2196F3] rounded-2xl p-1 flex items-center justify-between shadow-lg mb-6 sticky top-0 z-10 mx-1">
        <button onClick={() => changeMonth(-1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="flex-1 grid grid-cols-2 divide-x divide-white/20">
          <div className="text-center px-1">
             <p className="text-[10px] text-white/70 font-black uppercase">QUÁ KHỨ</p>
             <p className="text-[10px] text-white font-black truncate">{monthLabelShort(prevMonthDate)}</p>
          </div>
          <div className="text-center px-1">
             <p className="text-[10px] text-white/70 font-black uppercase">HIỆN TẠI</p>
             <p className="text-[10px] text-white font-black truncate">{monthLabelShort(currentDate)}</p>
          </div>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Net Earnings Summary Card - Fixed overlap */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 mx-1">
        <div className="text-center mb-4">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">NET EARNINGS</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div 
            className="text-center px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setViewingItem({ id: 'total', type: 'group', name: 'Net Earnings (Quá khứ)', month: prevMonthDate })}
          >
            <p className="text-sm font-black text-gray-400">{formatCurrency(prevData.net)}</p>
          </div>
          <div 
            className="text-center px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setViewingItem({ id: 'total', type: 'group', name: 'Net Earnings (Hiện tại)', month: currentDate })}
          >
            <p className={`text-sm font-black ${currData.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(currData.net)}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center px-4 mb-2">
          <h2 className="text-[#2196F3] font-black text-[12px] tracking-[0.2em] uppercase">EXPENSES</h2>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mx-1">
          <div className="bg-gray-50/50 p-3 flex justify-between items-center border-b border-gray-100">
             <span className="text-[10px] font-black text-gray-400 uppercase">TỔNG KỲ TRƯỚC: {formatCurrency(reportStructure.expense.totalPrev)}</span>
             <span className="text-[10px] font-black text-red-500 uppercase">TỔNG KỲ NÀY: {formatCurrency(reportStructure.expense.totalCurr)}</span>
          </div>
          {reportStructure.expense.groups.map(group => (
            <React.Fragment key={group.id}>
              <RowItem 
                id={group.id} type="group" name={group.name} icon={group.icon} color="#f8fafc" 
                valPrev={group.prev} valCurr={group.curr} isGroup={true} sectionType="Outcome"
              />
              {group.items.map(item => (
                <RowItem 
                  key={item.id} id={item.id} type="category" name={item.name} icon={item.icon} 
                  color={item.color} valPrev={item.prev} valCurr={item.curr} sectionType="Outcome"
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Income Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center px-4 mb-2">
          <h2 className="text-[#10B981] font-black text-[12px] tracking-[0.2em] uppercase">INCOME</h2>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mx-1">
          <div className="bg-gray-50/50 p-3 flex justify-between items-center border-b border-gray-100">
             <span className="text-[10px] font-black text-gray-400 uppercase">TỔNG KỲ TRƯỚC: {formatCurrency(reportStructure.income.totalPrev)}</span>
             <span className="text-[10px] font-black text-green-600 uppercase">TỔNG KỲ NÀY: {formatCurrency(reportStructure.income.totalCurr)}</span>
          </div>
          {reportStructure.income.groups.map(group => (
            <React.Fragment key={group.id}>
              <RowItem 
                id={group.id} type="group" name={group.name} icon={group.icon} color="#f8fafc" 
                valPrev={group.prev} valCurr={group.curr} isGroup={true} sectionType="Income"
              />
              {group.items.map(item => (
                <RowItem 
                  key={item.id} id={item.id} type="category" name={item.name} icon={item.icon} 
                  color={item.color} valPrev={item.prev} valCurr={item.curr} sectionType="Income"
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Overlay Transaction List */}
      {viewingItem && (
        <div className="fixed inset-0 bg-[#F5F7F9] z-[300] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-[#2196F3] text-white px-4 py-6 flex items-center gap-4 shadow-xl shrink-0">
            <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">HISTORY: {monthLabelShort(viewingItem.month)}</p>
              <h2 className="text-xl font-black tracking-tight">{viewingItem.name}</h2>
              <p className="text-sm font-bold opacity-90">Total: {formatCurrency(drillDownTransactions.reduce((s, t) => s + Math.abs(t.amount), 0))}</p>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {drillDownTransactions.length > 0 ? (
              <TransactionList 
                transactions={drillDownTransactions} categories={categories} accounts={accounts} 
                labels={labels} onDelete={onDeleteTransaction} onEdit={setEditingTransaction}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
                <span className="text-6xl">📭</span>
                <p className="font-bold uppercase tracking-widest text-xs">No transactions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {editingTransaction && (
        <TransactionForm 
          categories={categories} accounts={accounts} categoryGroups={categoryGroups} 
          accountGroups={accountGroups} labels={labels} settings={settings} initialTransaction={editingTransaction}
          onSave={(data) => { onUpdateTransaction(editingTransaction.id, data); setEditingTransaction(null); }}
          onDelete={onDeleteTransaction} onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default NetEarnings;
