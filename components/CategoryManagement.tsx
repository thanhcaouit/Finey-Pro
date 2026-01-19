
import React, { useState } from 'react';
import { Category, CategoryGroup, CategoryGroupType, Transaction, Account, Label, AppSettings } from '../types';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

interface Props {
  categories: Category[];
  groups: CategoryGroup[];
  transactions: Transaction[];
  accounts: Account[];
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
}

const CategoryManagement: React.FC<Props> = ({ 
  categories, groups, transactions, accounts, labels, categoryGroups, settings,
  onAddCategory, onUpdateCategory, onDeleteCategory, 
  onAddGroup, onUpdateGroup, onDeleteGroup,
  onUpdateTransaction, onDeleteTransaction
}) => {
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState<{groupId?: string} | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  // New state for filtered transaction list
  const [viewingTransactionsCategoryId, setViewingTransactionsCategoryId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const expenseGroups = groups.filter(g => g.type === 'Outcome');
  const incomeGroups = groups.filter(g => g.type === 'Income');

  // Filtered transactions for the selected category
  const filteredTransactions = transactions.filter(t => t.categoryId === viewingTransactionsCategoryId);
  const activeCategory = categories.find(c => c.id === viewingTransactionsCategoryId);

  // Category Group Form
  const GroupForm = ({ group, onClose }: { group?: CategoryGroup, onClose: () => void }) => {
    const [name, setName] = useState(group?.name || '');
    const [type, setType] = useState<CategoryGroupType>(group?.type || 'Outcome');
    const [budget, setBudget] = useState(group?.budget || 0);
    const [enableBudget, setEnableBudget] = useState(group?.enableBudget || false);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-800">{group ? 'Edit Category Group' : 'Add New Category Group'}</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">✕</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Name</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-xl text-gray-800 placeholder-gray-300" 
                placeholder="Category Group Name" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Type</label>
              <div className="flex gap-6">
                {(['Outcome', 'Income'] as const).map(t => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => setType(t)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${type === t ? 'border-[#FF5722]' : 'border-gray-200'}`}>
                      {type === t && <div className="w-3 h-3 rounded-full bg-[#FF5722]"></div>}
                    </div>
                    <span className={`font-bold text-sm ${type === t ? 'text-gray-900' : 'text-gray-400'}`}>
                      {t === 'Outcome' ? 'Expense' : 'Income'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-b border-gray-50">
              <span className="font-bold text-gray-700">Enable budgeting at the group level</span>
              <button 
                onClick={() => setEnableBudget(!enableBudget)}
                className={`w-12 h-6 rounded-full transition-all relative ${enableBudget ? 'bg-[#FF5722]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enableBudget ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {enableBudget && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Budget</label>
                  <select className="bg-transparent font-bold text-gray-700 outline-none">
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="text-right">
                  <input 
                    type="number" 
                    value={budget} 
                    onChange={e => setBudget(Number(e.target.value))}
                    className="bg-transparent outline-none text-right font-black text-2xl text-gray-800 w-32"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div className="pt-8 space-y-3">
              <button 
                onClick={() => {
                  if (group) onUpdateGroup(group.id, { name, type, budget, enableBudget });
                  else onAddGroup({ name, type, budget, enableBudget, calculatorBudget: true, description: '', icon: '📁' });
                  onClose();
                }}
                className="w-full bg-[#3B82F6] text-white py-4 rounded-full font-black text-lg uppercase shadow-lg shadow-blue-100"
              >
                SAVE
              </button>
              {group && (
                <button 
                  onClick={() => { if(window.confirm('Delete this group?')) { onDeleteGroup(group.id); onClose(); } }}
                  className="w-full text-red-500 font-bold text-sm"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category Form
  const CategoryForm = ({ category, groupId, onClose }: { category?: Category, groupId?: string, onClose: () => void }) => {
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '📦');
    const [color, setColor] = useState(category?.color || '#FF5722');
    const [selectedGroupId, setSelectedGroupId] = useState(category?.groupId || groupId || groups[0]?.id);
    const [enableBudget, setEnableBudget] = useState(category?.enableBudget || false);
    const [budget, setBudget] = useState(category?.budget || 0);

    const icons = ['🍔', '🚗', '🏠', '⚡', '🛍️', '🎁', '🏥', '🎓', '🎮', '🛠️', '🔄'];
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#64748B'];

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-800">{category ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">✕</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Name</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-xl text-gray-800 placeholder-gray-300" 
                placeholder="Category Name" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Select Icon</label>
              <div className="flex flex-wrap gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white"
                  style={{ backgroundColor: color, color: '#fff' }}
                >
                  {icon}
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {icons.map(ic => (
                    <button key={ic} onClick={() => setIcon(ic)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm hover:bg-gray-100">{ic}</button>
                  ))}
                  {colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ backgroundColor: c }}></button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Group</label>
              <select 
                value={selectedGroupId} 
                onChange={e => setSelectedGroupId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none cursor-pointer"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-b border-gray-50">
              <span className="font-bold text-gray-700">Enable budgeting</span>
              <button 
                onClick={() => setEnableBudget(!enableBudget)}
                className={`w-12 h-6 rounded-full transition-all relative ${enableBudget ? 'bg-[#FF5722]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enableBudget ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {enableBudget && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Budget</label>
                  <select className="bg-transparent font-bold text-gray-700 outline-none">
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-gray-800 mr-2">$</span>
                  <input 
                    type="number" 
                    value={budget} 
                    onChange={e => setBudget(Number(e.target.value))}
                    className="bg-transparent outline-none text-right font-black text-2xl text-gray-800 w-32"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div className="pt-8 space-y-4">
              <button 
                type="button"
                onClick={() => {
                  if (category) {
                    setViewingTransactionsCategoryId(category.id);
                    onClose();
                  }
                }}
                className="w-full bg-[#3B82F6] text-white py-4 rounded-full font-black text-lg uppercase shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
              >
                LIST OF TRANSACTIONS
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (category) onUpdateCategory(category.id, { name, icon, color, groupId: selectedGroupId, enableBudget, budget });
                  else onAddCategory({ name, icon, color, groupId: selectedGroupId!, enableBudget, budget, calculatorBudget: true, description: '' });
                  onClose();
                }}
                className="w-full border-2 border-[#3B82F6] text-[#3B82F6] py-3 rounded-full font-black text-sm uppercase"
              >
                SAVE
              </button>
              
              {category && (
                <button 
                  type="button"
                  onClick={() => { if(window.confirm('Delete category?')) { onDeleteCategory(category.id); onClose(); } }}
                  className="w-full text-red-500 font-bold text-sm"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
                    {group.enableBudget ? `Budget: ${formatCurrency(group.budget)}` : 'Not budgeted'}
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
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white shadow-inner"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-[14px]">{cat.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {cat.enableBudget ? `Monthly: ${formatCurrency(cat.budget)}` : 'Not budgeted'}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity">✎</span>
                  </div>
                ))}
                <button 
                  onClick={() => setIsAddingCategory({ groupId: group.id })}
                  className="w-full py-3 text-left pl-4 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700"
                >
                  + Add Category to {group.name}
                </button>
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
        <h1 className="text-xl font-black text-gray-800">Category Group Setup</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Organize your flows</p>
      </div>

      {renderSection('EXPENSE', 'text-[#3B82F6]', expenseGroups)}
      {renderSection('INCOME', 'text-[#10B981]', incomeGroups)}

      {/* Speed Dial FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {isFabOpen && (
          <>
            <button 
              onClick={() => { setIsAddingGroup(true); setIsFabOpen(false); }}
              className="flex items-center gap-3 bg-white text-gray-700 px-5 py-3 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-2 duration-200 font-bold text-sm"
            >
              <span>Add New Group</span>
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">📁</span>
            </button>
            <button 
              onClick={() => { setIsAddingCategory({}); setIsFabOpen(false); }}
              className="flex items-center gap-3 bg-white text-gray-700 px-5 py-3 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 font-bold text-sm"
            >
              <span>New Category</span>
              <span className="w-8 h-8 bg-[#FF5722] text-white rounded-lg flex items-center justify-center text-lg">🛍️</span>
            </button>
          </>
        )}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ring-4 ring-white ${isFabOpen ? 'bg-gray-800 rotate-45' : 'bg-[#FF5722]'}`}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>

      {isFabOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setIsFabOpen(false)} />}

      {/* Modals */}
      {(isAddingGroup || editingGroup) && <GroupForm group={editingGroup || undefined} onClose={() => { setEditingGroup(null); setIsAddingGroup(false); }} />}
      {(isAddingCategory || editingCategory) && <CategoryForm category={editingCategory || undefined} groupId={isAddingCategory?.groupId} onClose={() => { setEditingCategory(null); setIsAddingCategory(null); }} />}

      {/* Filtered Transactions List Modal */}
      {viewingTransactionsCategoryId && (
        <div className="fixed inset-0 bg-gray-100 z-[230] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="bg-[#3B82F6] text-white px-4 py-4 flex items-center gap-4 shadow-md shrink-0">
            <button onClick={() => setViewingTransactionsCategoryId(null)} className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold">Lịch sử: {activeCategory?.name}</h2>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-80">{filteredTransactions.length} giao dịch</p>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {filteredTransactions.length > 0 ? (
              <TransactionList 
                transactions={filteredTransactions} 
                categories={categories} 
                accounts={accounts} 
                labels={labels} 
                onDelete={(id) => { if(window.confirm('Delete transaction?')) onDeleteTransaction(id); }}
                onEdit={(t) => setEditingTransaction(t)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
                <span className="text-6xl">📭</span>
                <p className="font-bold">Chưa có giao dịch nào cho danh mục này</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-modal for editing transaction within filtered view */}
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

export default CategoryManagement;
