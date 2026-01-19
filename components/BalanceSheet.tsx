
import React, { useState } from 'react';
import { Account, AccountGroup, Transaction, Category, Label, CategoryGroup, AppSettings } from '../types';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

interface Props {
  accounts: Account[];
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  labels: Label[];
  settings: AppSettings;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const BalanceSheet: React.FC<Props> = ({ 
  accounts, accountGroups, transactions, categories, categoryGroups, labels, settings,
  onUpdateTransaction, onDeleteTransaction 
}) => {
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const assets = accounts.filter(a => accountGroups.find(g => g.id === a.groupId)?.type === 'Asset');
  const liabilities = accounts.filter(a => accountGroups.find(g => g.id === a.groupId)?.type === 'Liabilities');

  const totalAssets = assets.reduce((s, a) => s + a.balanceNew, 0);
  const totalLiabilities = Math.abs(liabilities.reduce((s, a) => s + a.balanceNew, 0));

  const filteredTransactions = transactions.filter(t => t.accountId === viewingAccountId || t.toAccountId === viewingAccountId);
  const activeAccount = accounts.find(a => a.id === viewingAccountId);

  const renderAccountItem = (acc: Account, totalInGroup: number) => (
    <div 
      key={acc.id}
      onClick={() => setViewingAccountId(acc.id)}
      className="pl-12 pr-6 py-4 flex justify-between items-center hover:bg-blue-50/30 cursor-pointer group transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-200"></div>
        <div>
          <p className="font-bold text-gray-700 text-[14px]">{acc.name}</p>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {totalInGroup > 0 ? Math.round((acc.balanceNew / totalInGroup) * 100) : 0}%
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[14px] font-black ${acc.balanceNew >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {formatCurrency(acc.balanceNew)}
        </p>
      </div>
    </div>
  );

  const renderGroup = (group: AccountGroup) => {
    const groupAccounts = accounts.filter(a => a.groupId === group.id);
    const groupTotal = groupAccounts.reduce((s, a) => s + a.balanceNew, 0);

    return (
      <div key={group.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="px-6 py-4 bg-gray-50/50 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">{group.icon}</div>
            <h4 className="font-black text-gray-800 text-[15px]">{group.name}</h4>
          </div>
          <span className="text-[15px] font-black text-gray-700">{formatCurrency(groupTotal)}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {groupAccounts.map(acc => renderAccountItem(acc, groupTotal))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 space-y-6">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <p className="text-blue-100 text-[11px] font-black uppercase tracking-widest">NET WORTH TODAY</p>
        <h2 className="text-4xl font-black mt-2">{formatCurrency(totalAssets - totalLiabilities)}</h2>
        <div className="mt-6 flex gap-6">
          <div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">TOTAL ASSETS</p>
            <p className="font-black text-white">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">TOTAL DEBT</p>
            <p className="font-black text-red-300">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
      </div>

      {/* Assets Section */}
      <div>
        <div className="px-4 py-2 mb-2">
          <h2 className="text-[#3B82F6] font-black text-[11px] tracking-[0.2em] uppercase">ASSETS</h2>
        </div>
        <div>
          {accountGroups.filter(g => g.type === 'Asset').map(renderGroup)}
        </div>
      </div>

      {/* Liabilities Section */}
      <div>
        <div className="px-4 py-2 mb-2">
          <h2 className="text-red-500 font-black text-[11px] tracking-[0.2em] uppercase">LIABILITIES</h2>
        </div>
        <div>
          {accountGroups.filter(g => g.type === 'Liabilities').map(renderGroup)}
        </div>
      </div>

      {/* Filtered Account Transactions List Modal */}
      {viewingAccountId && (
        <div className="fixed inset-0 bg-gray-50 z-[230] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-blue-600 text-white px-4 py-6 flex items-center gap-4 shadow-xl shrink-0">
            <button onClick={() => setViewingAccountId(null)} className="p-2 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Account History</p>
              <h2 className="text-xl font-black tracking-tight">{activeAccount?.name}</h2>
              <p className="text-sm font-bold opacity-90">{formatCurrency(activeAccount?.balanceNew || 0)}</p>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {filteredTransactions.length > 0 ? (
              <TransactionList 
                transactions={filteredTransactions}
                categories={categories}
                accounts={accounts}
                labels={labels}
                onDelete={(id) => { if(window.confirm('Xoá giao dịch này?')) onDeleteTransaction(id); }}
                onEdit={(t) => setEditingTransaction(t)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
                <span className="text-6xl">📭</span>
                <p className="font-bold">Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-modal for editing transaction */}
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

export default BalanceSheet;
