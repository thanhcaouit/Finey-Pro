
import React, { useState } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import AccountManagement from './components/AccountManagement';
import CategoryManagement from './components/CategoryManagement';
import BalanceSheet from './components/BalanceSheet';
import BudgetSummary from './components/BudgetSummary';
import NetEarnings from './components/NetEarnings';
import ItemSummary from './components/ItemSummary';
import LabelsSummary from './components/LabelsSummary';
import Trash from './components/Trash';
import Settings from './components/Settings';
import GlobalSearch from './components/GlobalSearch';
import { Transaction } from './types';

type TabType = 'DASHBOARD' | 'TRANSACTIONS' | 'ACCOUNTS' | 'CATEGORY_BUDGET' | 'BALANCE_SHEET' | 'BUDGET_SUMMARY' | 'NET_EARNINGS' | 'ITEMS_SUMMARY' | 'LABELS_SUMMARY' | 'TRASH' | 'SETTINGS' | 'USER';

const App: React.FC = () => {
  const { 
    transactions, deletedTransactions, accounts, accountGroups, categories, categoryGroups, labels, settings,
    updateSettings, resetTransactions, addTransaction, updateTransaction, deleteTransaction, restoreTransaction, emptyTrash, permanentlyDeleteTransaction,
    addAccountGroup, updateAccountGroup, deleteAccountGroup,
    addAccount, updateAccount, deleteAccount,
    addCategoryGroup, updateCategoryGroup, deleteCategoryGroup,
    addCategory, updateCategory, deleteCategory,
    addLabel, updateLabel, deleteLabel
  } = useFinanceStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTrashDetailOpen, setIsTrashDetailOpen] = useState(false);
  const [viewingTrashItem, setViewingTrashItem] = useState<Transaction | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');

  const primaryNavItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: '📊', shortLabel: 'Dashboard' },
    { id: 'TRANSACTIONS', label: 'Giao dịch', icon: '📝', shortLabel: 'Trans' },
    { id: 'BUDGET_SUMMARY', label: 'Ngân sách', icon: '📈', shortLabel: 'Budget' },
    { id: 'BALANCE_SHEET', label: 'Tài sản', icon: '⚖️', shortLabel: 'Assets' },
    { id: 'USER', label: 'Tài khoản', icon: '👤', shortLabel: 'User' },
  ];

  const secondaryNavItems = [
    { id: 'NET_EARNINGS', label: 'Thu nhập ròng', icon: '📉' },
    { id: 'ACCOUNTS', label: 'Quản lý tài khoản', icon: '🏦' },
    { id: 'CATEGORY_BUDGET', label: 'Thiết lập danh mục', icon: '⚙️' },
    { id: 'ITEMS_SUMMARY', label: 'Tóm tắt khoản mục', icon: '🏷️' },
    { id: 'LABELS_SUMMARY', label: 'Tóm tắt nhãn', icon: '🔖' },
    { id: 'TRASH', label: 'Thùng rác', icon: '🗑️' },
    { id: 'SETTINGS', label: 'Cài đặt', icon: '⚙️' },
  ];

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
    setIsSearchOpen(false);
  };

  const handleSelectAccountSearch = (accountId: string) => {
    setActiveTab('BALANCE_SHEET');
    setIsSearchOpen(false);
  };

  const handleSelectCategorySearch = (categoryId: string) => {
    setActiveTab('ITEMS_SUMMARY');
    setIsSearchOpen(false);
  };

  const handleViewTrashDetail = (t: Transaction) => {
    setViewingTrashItem(t);
    setIsTrashDetailOpen(true);
  };

  const handleSaveTransaction = (data: any) => {
    if (data.id) {
      updateTransaction(data.id, data);
    } else {
      addTransaction(data);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const currentTabLabel = [...primaryNavItems, ...secondaryNavItems].find(i => i.id === activeTab)?.label;

  const UserProfile = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner mx-auto">👤</div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mt-4">Tester User</h2>
        <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 inline-block px-3 py-1 rounded-full mt-2">Premium Member</p>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-gray-400 uppercase">Giao dịch</p>
            <p className="text-lg font-black text-gray-800">{transactions.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-gray-400 uppercase">Tài khoản</p>
            <p className="text-lg font-black text-gray-800">{accounts.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          <button onClick={() => setActiveTab('SETTINGS')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-xl">⚙️</span>
              <span className="font-bold text-gray-700">Cài đặt ứng dụng</span>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-xl">💳</span>
              <span className="font-bold text-gray-700">Gói đăng ký</span>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <button className="w-full py-4 text-red-500 font-black text-sm uppercase tracking-widest">Đăng xuất</button>
    </div>
  );

  return (
    <div className={`h-screen w-screen overflow-hidden font-sans flex flex-col md:flex-row bg-[#F5F7F9] ${settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-900'}`}>
      
      {/* Backdrop for Mobile Sidebar */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setIsDrawerOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r border-gray-100 h-full shrink-0
      `}>
        <div className="p-8 border-b border-gray-100 bg-blue-600 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black shadow-lg">B</div>
            <div>
              <h2 className="text-xl font-black tracking-tight">BlueFinance</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Premium Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
          <div>
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Chính</p>
            <div className="space-y-1">
              {primaryNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsDrawerOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Tiện ích & Cài đặt</p>
            <div className="space-y-1">
              {secondaryNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsDrawerOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP BAR */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 shrink-0 z-50 fixed top-0 left-0 right-0 md:relative md:bg-white md:backdrop-blur-none">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl md:hidden text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-black text-gray-800">{currentTabLabel}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
             <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-6xl mx-auto pt-20 pb-32 md:pt-4 md:pb-8 scroll-smooth">
          {activeTab === 'DASHBOARD' && <Dashboard transactions={transactions} accounts={accounts} categoryGroups={categoryGroups} accountGroups={accountGroups} />}
          {activeTab === 'TRANSACTIONS' && <TransactionList transactions={transactions} categories={categories} accounts={accounts} labels={labels} onDelete={deleteTransaction} onEdit={handleEditTransaction} />}
          {activeTab === 'ACCOUNTS' && <AccountManagement accounts={accounts} groups={accountGroups} onAddAccount={addAccount} onUpdateAccount={updateAccount} onDeleteAccount={deleteAccount} onAddGroup={addAccountGroup} onUpdateGroup={updateAccountGroup} onDeleteGroup={deleteAccountGroup} />}
          {activeTab === 'CATEGORY_BUDGET' && <CategoryManagement categories={categories} groups={categoryGroups} transactions={transactions} accounts={accounts} labels={labels} categoryGroups={categoryGroups} settings={settings} onAddCategory={addCategory} onUpdateCategory={updateCategory} onDeleteCategory={deleteCategory} onAddGroup={addCategoryGroup} onUpdateGroup={updateCategoryGroup} onDeleteGroup={deleteCategoryGroup} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'ITEMS_SUMMARY' && <ItemSummary transactions={transactions} categories={categories} categoryGroups={categoryGroups} accounts={accounts} labels={labels} settings={settings} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'LABELS_SUMMARY' && <LabelsSummary transactions={transactions} categories={categories} categoryGroups={categoryGroups} accounts={accounts} labels={labels} settings={settings} onAddLabel={addLabel} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'BALANCE_SHEET' && <BalanceSheet accounts={accounts} accountGroups={accountGroups} transactions={transactions} categories={categories} categoryGroups={categoryGroups} labels={labels} settings={settings} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'BUDGET_SUMMARY' && <BudgetSummary transactions={transactions} categories={categories} categoryGroups={categoryGroups} accounts={accounts} labels={labels} settings={settings} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'NET_EARNINGS' && <NetEarnings transactions={transactions} categories={categories} categoryGroups={categoryGroups} accounts={accounts} labels={labels} settings={settings} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'TRASH' && <Trash transactions={deletedTransactions} categories={categories} accounts={accounts} labels={labels} onRestore={restoreTransaction} onEmpty={emptyTrash} onDeletePermanently={permanentlyDeleteTransaction} onViewDetail={handleViewTrashDetail} />}
          {activeTab === 'SETTINGS' && <Settings settings={settings} onUpdate={updateSettings} onResetData={resetTransactions} />}
          {activeTab === 'USER' && <UserProfile />}
        </main>

        {/* BOTTOM NAVIGATION (Mobile only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-2 py-3 z-50 shadow-lg">
          {primaryNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.shortLabel}</span>
            </button>
          ))}
        </nav>

        {/* FAB (Floating Action Button) */}
        {['TRANSACTIONS', 'DASHBOARD', 'BUDGET_SUMMARY', 'BALANCE_SHEET'].includes(activeTab) && (
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} 
            className="fixed bottom-24 md:bottom-10 right-6 w-14 h-14 bg-[#FF5722] text-white rounded-full shadow-[0_10px_25px_-5px_rgba(255,87,34,0.4)] flex items-center justify-center ring-4 ring-white z-[45] active:scale-90 transition-transform"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          </button>
        )}
      </div>

      {/* Modals */}
      {isSearchOpen && (
        <GlobalSearch 
          onClose={() => setIsSearchOpen(false)}
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          labels={labels}
          onEditTransaction={handleEditTransaction}
          onSelectAccount={handleSelectAccountSearch}
          onSelectCategory={handleSelectCategorySearch}
        />
      )}

      {isFormOpen && (
        <TransactionForm 
          categories={categories} 
          accounts={accounts} 
          categoryGroups={categoryGroups} 
          labels={labels} 
          settings={settings} 
          initialTransaction={editingTransaction || undefined} 
          onSave={handleSaveTransaction} 
          onDelete={deleteTransaction} 
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
        />
      )}

      {isTrashDetailOpen && viewingTrashItem && (
        <TransactionForm 
          categories={categories} 
          accounts={accounts} 
          categoryGroups={categoryGroups} 
          labels={labels} 
          settings={settings} 
          initialTransaction={viewingTrashItem} 
          isTrashMode={true} 
          onRestore={restoreTransaction} 
          onDelete={permanentlyDeleteTransaction} 
          onClose={() => { setIsTrashDetailOpen(false); setViewingTrashItem(null); }} 
          onSave={() => {}} 
        />
      )}
    </div>
  );
};

export default App;
