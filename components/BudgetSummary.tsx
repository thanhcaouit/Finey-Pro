
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

const BudgetSummary: React.FC<Props> = ({ 
  transactions, categories, categoryGroups, accountGroups, accounts, labels, settings,
  onUpdateTransaction, onDeleteTransaction 
}) => {
  // Mặc định hiển thị tháng 1/2026 dựa trên dữ liệu mẫu
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewingItem, setViewingItem] = useState<{ id: string, type: 'category' | 'group', name: string } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
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

  const budgetData = useMemo(() => {
    let totalSpentAcrossBudgeted = 0;
    let totalBudgetGlobal = 0;
    let totalExpenseActual = 0;

    const expenseGroups = categoryGroups.filter(g => g.type === 'Outcome');

    const groups = expenseGroups.map(group => {
      const groupCategories = categories.filter(c => c.groupId === group.id);
      
      let groupSpent = 0;
      let groupBudget = group.enableBudget ? group.budget : 0;

      const items = groupCategories.map(cat => {
        const catSpent = Math.abs(monthTransactions
          .filter(t => t.categoryId === cat.id && t.type === 'Expense')
          .reduce((sum, t) => sum + t.amount, 0));
        
        const catBudget = cat.enableBudget ? cat.budget : 0;
        
        if (!group.enableBudget && cat.enableBudget) {
          groupBudget += catBudget;
        }

        groupSpent += catSpent;

        return {
          ...cat,
          spent: catSpent,
          budget: catBudget,
          hasBudget: cat.enableBudget && cat.budget > 0,
          percent: cat.budget > 0 ? (catSpent / cat.budget) * 100 : 0
        };
      });

      if (group.enableBudget) {
        const allCatsInGroup = categories.filter(c => c.groupId === group.id);
        groupSpent = Math.abs(monthTransactions
          .filter(t => allCatsInGroup.some(c => c.id === t.categoryId) && t.type === 'Expense')
          .reduce((sum, t) => sum + t.amount, 0));
      }

      totalSpentAcrossBudgeted += groupBudget > 0 ? groupSpent : 0;
      totalBudgetGlobal += groupBudget;
      totalExpenseActual += groupSpent;

      return {
        ...group,
        items,
        spent: groupSpent,
        budget: groupBudget,
        hasBudget: groupBudget > 0,
        percent: groupBudget > 0 ? (groupSpent / groupBudget) * 100 : 0
      };
    });

    return { groups, totalSpentAcrossBudgeted, totalBudgetGlobal, totalExpenseActual };
  }, [monthTransactions, categories, categoryGroups]);

  const totalPercent = budgetData.totalBudgetGlobal > 0 ? (budgetData.totalExpenseActual / budgetData.totalBudgetGlobal) * 100 : 0;

  // Transactions filtered for the drill-down view
  const drillDownTransactions = useMemo(() => {
    if (!viewingItem) return [];
    
    if (viewingItem.type === 'category') {
      return monthTransactions.filter(t => t.categoryId === viewingItem.id);
    } else {
      const groupCategoryIds = categories.filter(c => c.groupId === viewingItem.id).map(c => c.id);
      return monthTransactions.filter(t => groupCategoryIds.includes(t.categoryId));
    }
  }, [viewingItem, monthTransactions, categories]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Month Selector */}
      <div className="bg-[#2196F3] rounded-full p-1 flex items-center justify-between shadow-lg mb-6">
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

      {/* Global Summary */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-[#2196F3] font-black text-lg tracking-tight">EXPENSE SUMMARY</h2>
            {budgetData.totalBudgetGlobal > 0 ? (
              <p className={`text-[11px] font-black ${budgetData.totalExpenseActual > budgetData.totalBudgetGlobal ? 'text-red-500' : 'text-green-500'}`}>
                {totalPercent.toLocaleString(undefined, {maximumFractionDigits: 0})}% 
                <span className="ml-1 opacity-80">
                  {budgetData.totalExpenseActual > budgetData.totalBudgetGlobal 
                    ? `${formatCurrency(budgetData.totalExpenseActual - budgetData.totalBudgetGlobal)} over ${formatCurrency(budgetData.totalBudgetGlobal)}`
                    : `${formatCurrency(budgetData.totalBudgetGlobal - budgetData.totalExpenseActual)} left from ${formatCurrency(budgetData.totalBudgetGlobal)}`
                  }
                </span>
              </p>
            ) : (
              <p className="text-[11px] font-black text-gray-400">NO BUDGET DEFINED</p>
            )}
          </div>
          <span className="text-2xl font-black text-gray-800">{formatCurrency(budgetData.totalExpenseActual)}</span>
        </div>
        
        {budgetData.totalBudgetGlobal > 0 && (
          <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
            <div 
              className={`h-full transition-all duration-1000 ${totalPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 z-10"></div>
          </div>
        )}
      </div>

      {/* Group and Category Breakdown */}
      <div className="space-y-6">
        {budgetData.groups.map(group => (
          <div key={group.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div 
                className="flex justify-between items-start mb-2 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-xl transition-colors"
                onClick={() => setViewingItem({ id: group.id, type: 'group', name: group.name })}
              >
                <div>
                  <h3 className="text-gray-700 font-black text-base">{group.name}</h3>
                  {group.hasBudget ? (
                    <p className={`text-[11px] font-black ${group.spent > group.budget ? 'text-red-500' : 'text-green-500'}`}>
                      {group.percent.toFixed(0)}%
                      <span className="ml-1 opacity-80">
                        {group.spent > group.budget 
                          ? `${formatCurrency(group.spent - group.budget)} over ${formatCurrency(group.budget)}`
                          : `${formatCurrency(group.budget - group.spent)} left from ${formatCurrency(group.budget)}`
                        }
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-black text-gray-300">ACTUAL SPENDING</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-gray-700">{formatCurrency(group.spent)}</span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
              
              {group.hasBudget && (
                <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3 mb-6">
                  <div 
                    className={`h-full transition-all duration-700 ${group.percent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(group.percent, 100)}%` }}
                  />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300/50"></div>
                </div>
              )}

              {/* Sub Categories */}
              <div className={`space-y-4 ${group.hasBudget ? '' : 'mt-4'}`}>
                {group.items.map(cat => (
                  <div key={cat.id} className="relative group">
                    <div 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-xl transition-colors"
                      onClick={() => setViewingItem({ id: cat.id, type: 'category', name: cat.name })}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.icon}
                        </div>
                        <span className="font-bold text-gray-600 text-[14px]">{cat.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-[14px] font-black text-gray-700">{formatCurrency(cat.spent)}</p>
                          {cat.hasBudget && (
                            <p className={`text-[9px] font-black ${cat.spent > cat.budget ? 'text-red-500' : 'text-green-500'}`}>
                              {cat.spent > cat.budget 
                                ? `${formatCurrency(cat.spent - cat.budget)} over ${formatCurrency(cat.budget)}`
                                : `${formatCurrency(cat.budget - cat.spent)} left from ${formatCurrency(cat.budget)}`
                              }
                            </p>
                          )}
                        </div>
                        <svg className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                    {cat.hasBudget && (
                      <div className="relative h-1 w-full bg-gray-50 rounded-full overflow-hidden mt-2 ml-11 max-w-[calc(100%-2.75rem)]">
                        <div 
                          className={`h-full transition-all duration-500 ${cat.percent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(cat.percent, 100)}%` }}
                        />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drill-down Transaction List Overlay */}
      {viewingItem && (
        <div className="fixed inset-0 bg-[#F5F7F9] z-[230] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-[#2196F3] text-white px-4 py-6 flex items-center gap-4 shadow-xl shrink-0">
            <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">{monthLabel} HISTORY</p>
              <h2 className="text-xl font-black tracking-tight">{viewingItem.name}</h2>
              <p className="text-sm font-bold opacity-90">Total: {formatCurrency(drillDownTransactions.reduce((s, t) => s + Math.abs(t.amount), 0))}</p>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {drillDownTransactions.length > 0 ? (
              <TransactionList 
                transactions={drillDownTransactions}
                categories={categories}
                accounts={accounts}
                labels={labels}
                onDelete={(id) => { if(window.confirm('Xóa giao dịch này?')) onDeleteTransaction(id); }}
                onEdit={(t) => setEditingTransaction(t)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
                <div className="text-6xl bg-gray-200 w-24 h-24 flex items-center justify-center rounded-full">📭</div>
                <p className="font-bold uppercase tracking-widest text-sm">Chưa có giao dịch nào trong tháng</p>
              </div>
            )}
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

export default BudgetSummary;
