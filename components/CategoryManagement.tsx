
import React, { useState, useEffect } from 'react';
import { Category, CategoryGroup, CategoryGroupType, Transaction, Account, AccountGroup, Label, AppSettings } from '../types';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

interface Props {
  categories: Category[];
  groups: CategoryGroup[];
  transactions: Transaction[];
  accounts: Account[];
  accountGroups: AccountGroup[];
  labels: Label[];
  categoryGroups: CategoryGroup[];
  settings: AppSettings;
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onAddGroup: (group: Omit<CategoryGroup, 'id'>) => void;
  onUpdateGroup: (id: string, updates: Partial<CategoryGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  // Props mới để đồng bộ với FAB của App.tsx
  externalAddCategory?: boolean;
  setExternalAddCategory?: (val: boolean) => void;
  externalAddGroup?: boolean;
  setExternalAddGroup?: (val: boolean) => void;
}

const CategoryManagement: React.FC<Props> = ({ 
  categories, groups, transactions, accounts, accountGroups, labels, categoryGroups, settings,
  onAddCategory, onUpdateCategory, onDeleteCategory, 
  onAddGroup, onUpdateGroup, onDeleteGroup,
  onUpdateTransaction, onDeleteTransaction,
  externalAddCategory, setExternalAddCategory, externalAddGroup, setExternalAddGroup
}) => {
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState<{groupId?: string} | null>(null);
  
  const [viewingTransactionsCategoryId, setViewingTransactionsCategoryId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Theo dõi tín hiệu từ App.tsx
  useEffect(() => {
    if (externalAddCategory) {
      setIsAddingCategory({});
      setExternalAddCategory?.(false);
    }
  }, [externalAddCategory]);

  useEffect(() => {
    if (externalAddGroup) {
      setIsAddingGroup(true);
      setExternalAddGroup?.(false);
    }
  }, [externalAddGroup]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const expenseGroups = groups.filter(g => g.type === 'Outcome');
  const incomeGroups = groups.filter(g => g.type === 'Income');

  const filteredTransactions = transactions.filter(t => t.categoryId === viewingTransactionsCategoryId);
  const activeCategory = categories.find(c => c.id === viewingTransactionsCategoryId);

  // Modal Layout chuẩn hóa
  const ModalLayout = ({ 
    title, subtitle, onClose, onDelete, onSave, saveLabel, children 
  }: { 
    title: string, subtitle: string, onClose: () => void, onDelete?: () => void, onSave: () => void, saveLabel: string, children: React.ReactNode 
  }) => (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-800 truncate">{title}</h3>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button onClick={onDelete} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            )}
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
          {children}
        </div>
        <div className="px-8 py-5 border-t border-gray-50 shrink-0 bg-white">
          <button 
            onClick={onSave}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );

  const GroupForm = ({ group, onClose }: { group?: CategoryGroup, onClose: () => void }) => {
    const [name, setName] = useState(group?.name || '');
    const [type, setType] = useState<CategoryGroupType>(group?.type || 'Outcome');
    const [budget, setBudget] = useState(group?.budget || 0);
    const [enableBudget, setEnableBudget] = useState(group?.enableBudget || false);

    const handleSave = () => {
      if (!name) return alert('Vui lòng nhập tên');
      if (group) onUpdateGroup(group.id, { name, type, budget, enableBudget });
      else onAddGroup({ name, type, budget, enableBudget, calculatorBudget: true, description: '', icon: '📁' });
      onClose();
    };

    return (
      <ModalLayout 
        title={group ? 'Sửa Nhóm' : 'Thêm Nhóm'} 
        subtitle="PHÂN LOẠI DANH MỤC"
        onClose={onClose}
        onDelete={group ? () => { if(window.confirm('Delete this group?')) { onDeleteGroup(group.id); onClose(); } } : undefined}
        onSave={handleSave}
        saveLabel="LƯU THÔNG TIN"
      >
        <div className="space-y-6">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-xl text-gray-800" 
            placeholder="Tên nhóm danh mục" 
          />
          <div className="flex gap-4">
            {(['Outcome', 'Income'] as const).map(t => (
              <button 
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${type === t ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
              >
                {t === 'Outcome' ? 'Chi tiêu' : 'Thu nhập'}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center py-4 border-t border-gray-50">
            <span className="font-bold text-gray-700">Bật ngân sách nhóm</span>
            <button 
              onClick={() => setEnableBudget(!enableBudget)}
              className={`w-12 h-6 rounded-full transition-all relative ${enableBudget ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enableBudget ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {enableBudget && (
            <input 
              type="number" 
              value={budget} 
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-right font-black text-2xl"
              placeholder="0.00"
            />
          )}
        </div>
      </ModalLayout>
    );
  };

  const CategoryForm = ({ category, groupId, onClose }: { category?: Category, groupId?: string, onClose: () => void }) => {
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '📦');
    const [color, setColor] = useState(category?.color || '#FF5722');
    const [selectedGroupId, setSelectedGroupId] = useState(category?.groupId || groupId || groups[0]?.id);
    const [enableBudget, setEnableBudget] = useState(category?.enableBudget || false);
    const [budget, setBudget] = useState(category?.budget || 0);

    const icons = ['🍔', '🚗', '🏠', '⚡', '🛍️', '🎁', '🏥', '🎓', '🎮', '🛠️', '🔄'];
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#64748B'];

    const handleSave = () => {
      if (!name) return alert('Vui lòng nhập tên');
      if (category) onUpdateCategory(category.id, { name, icon, color, groupId: selectedGroupId, enableBudget, budget });
      else onAddCategory({ name, icon, color, groupId: selectedGroupId!, enableBudget, budget, calculatorBudget: true, description: '' });
      onClose();
    };

    return (
      <ModalLayout 
        title={category ? 'Sửa Danh Mục' : 'Thêm Danh Mục'} 
        subtitle="CHI TIẾT PHÂN LOẠI"
        onClose={onClose}
        onDelete={category ? () => { if(window.confirm('Delete category?')) { onDeleteCategory(category.id); onClose(); } } : undefined}
        onSave={handleSave}
        saveLabel="LƯU DANH MỤC"
      >
        <div className="space-y-6">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-xl text-gray-800" 
            placeholder="Tên danh mục" 
          />
          <div className="flex flex-wrap gap-2.5">
            {icons.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${icon === ic ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50'}`}>{ic}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
            ))}
          </div>
          <select 
            value={selectedGroupId} 
            onChange={e => setSelectedGroupId(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none"
          >
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="flex justify-between items-center py-4 border-t border-gray-50">
            <span className="font-bold text-gray-700">Thiết lập ngân sách</span>
            <button 
              onClick={() => setEnableBudget(!enableBudget)}
              className={`w-12 h-6 rounded-full transition-all relative ${enableBudget ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enableBudget ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {enableBudget && (
            <input 
              type="number" 
              value={budget} 
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-right font-black text-2xl"
              placeholder="0.00"
            />
          )}
          {category && (
            <button 
              onClick={() => { setViewingTransactionsCategoryId(category.id); onClose(); }}
              className="w-full py-3 text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 rounded-xl"
            >
              Xem lịch sử giao dịch
            </button>
          )}
        </div>
      </ModalLayout>
    );
  };

  const renderSection = (title: string, colorClass: string, groupsList: CategoryGroup[]) => (
    <div className="mb-8">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className={`text-xs font-black uppercase tracking-[0.15em] ${colorClass}`}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-100 bg-white shadow-sm overflow-hidden">
        {groupsList.map(group => {
          const groupCats = categories.filter(c => c.groupId === group.id);
          return (
            <div key={group.id} className="group">
              <div 
                onClick={() => setEditingGroup(group)}
                className="px-6 py-5 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-[16px]">{group.name}</h4>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                    {group.enableBudget ? `Ngân sách: ${formatCurrency(group.budget)}` : 'Chưa đặt NS'}
                  </p>
                </div>
                <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
              </div>
              <div className="pl-12 bg-gray-50/30 divide-y divide-gray-50">
                {groupCats.map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => setEditingCategory(cat)}
                    className="pr-6 py-4 flex justify-between items-center hover:bg-blue-50/50 cursor-pointer transition-colors group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white shadow-inner" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
                      <div>
                        <p className="font-bold text-gray-700 text-[14px]">{cat.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {cat.enableBudget ? `Tháng: ${formatCurrency(cat.budget)}` : 'Chưa đặt NS'}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity">✎</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative pb-32">
      <div className="bg-white p-6 mb-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h1 className="text-xl font-black text-gray-800">Thiết lập danh mục</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">QUẢN LÝ DÒNG TIỀN</p>
      </div>

      {renderSection('CHI TIÊU (EXPENSE)', 'text-blue-600', expenseGroups)}
      {renderSection('THU NHẬP (INCOME)', 'text-green-600', incomeGroups)}

      {/* FAB đã được dời lên App.tsx */}

      {(isAddingGroup || editingGroup) && <GroupForm group={editingGroup || undefined} onClose={() => { setEditingGroup(null); setIsAddingGroup(false); }} />}
      {(isAddingCategory || editingCategory) && <CategoryForm category={editingCategory || undefined} groupId={isAddingCategory?.groupId} onClose={() => { setEditingCategory(null); setIsAddingCategory(null); }} />}

      {viewingTransactionsCategoryId && (
        <div className="fixed inset-0 bg-gray-100 z-[300] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-blue-600 text-white px-4 py-4 flex items-center gap-4 shadow-md shrink-0">
            <button onClick={() => setViewingTransactionsCategoryId(null)} className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
              <h2 className="text-lg font-bold">Lịch sử: {activeCategory?.name}</h2>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-80">{filteredTransactions.length} giao dịch</p>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            <TransactionList 
              transactions={filteredTransactions} 
              categories={categories} accounts={accounts} labels={labels} 
              onDelete={onDeleteTransaction} onEdit={setEditingTransaction}
            />
          </div>
        </div>
      )}

      {editingTransaction && (
        <TransactionForm 
          categories={categories} 
          accounts={accounts} 
          categoryGroups={categoryGroups} 
          accountGroups={accountGroups}
          labels={labels} 
          settings={settings}
          initialTransaction={editingTransaction}
          onSave={(data) => { onUpdateTransaction(editingTransaction.id, data); setEditingTransaction(null); }}
          onDelete={onDeleteTransaction} onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
