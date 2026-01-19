
import React, { useState, useEffect } from 'react';
import { Category, Account, TransactionType, CategoryGroup, AccountGroup, Label, TransactionStatus, Transaction, AppSettings } from '../types';

interface Props {
  categories: Category[];
  accounts: Account[];
  categoryGroups: CategoryGroup[];
  accountGroups: AccountGroup[];
  labels: Label[];
  settings: AppSettings;
  onSave: (transaction: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  initialTransaction?: Transaction;
  isTrashMode?: boolean;
}

const TransactionForm: React.FC<Props> = ({ 
  categories, accounts, categoryGroups, accountGroups, labels, settings,
  onSave, onClose, onDelete, onRestore,
  initialTransaction, isTrashMode = false 
}) => {
  // Lọc danh sách tài khoản: Chỉ hiện những tài khoản được phép chọn, 
  // hoặc tài khoản hiện tại của giao dịch đang sửa (dù nó có bị ẩn đi sau này).
  const selectableAccounts = accounts.filter(a => a.showInSelection || a.id === initialTransaction?.accountId || a.id === initialTransaction?.toAccountId);

  const defaultAccountId = (settings.rememberLastAccount && settings.lastAccountId && selectableAccounts.find(a => a.id === settings.lastAccountId)) 
    ? settings.lastAccountId 
    : (selectableAccounts[0]?.id || '');
    
  const defaultCategoryId = (settings.rememberLastCategory && settings.lastCategoryId) ? settings.lastCategoryId : '';

  const [type, setType] = useState<TransactionType>(initialTransaction?.type || 'Expense');
  const [amount, setAmount] = useState<string>(initialTransaction ? Math.abs(initialTransaction.amount).toString() : "0");
  const [categoryId, setCategoryId] = useState(initialTransaction?.categoryId || defaultCategoryId);
  const [accountId, setAccountId] = useState(initialTransaction?.accountId || defaultAccountId);
  const [toAccountId, setToAccountId] = useState(initialTransaction?.toAccountId || selectableAccounts.find(a => a.id !== accountId)?.id || '');
  const [note, setNote] = useState(initialTransaction?.note || '');
  const [date, setDate] = useState(initialTransaction ? new Date(initialTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialTransaction?.labels || []);
  const [status, setStatus] = useState<TransactionStatus>(initialTransaction?.status || 'Cleared');

  const getFilteredCategories = () => {
    let targetType: string = 'Outcome';
    if (type === 'Income') targetType = 'Income';
    if (type === 'Transfer') targetType = 'Transfer';
    return categories.filter(cat => categoryGroups.find(g => g.id === cat.groupId)?.type === targetType);
  };

  const filteredCats = getFilteredCategories();

  useEffect(() => {
    if (filteredCats.length > 0 && !filteredCats.find(c => c.id === categoryId)) {
      if (!initialTransaction) setCategoryId(filteredCats[0].id);
    }
  }, [type, filteredCats, categoryId, initialTransaction]);

  const toggleLabel = (id: string) => {
    if (isTrashMode) return;
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (isTrashMode) return;
    if (!amount || parseFloat(amount) <= 0) return alert('Vui lòng nhập số tiền');
    onSave({
      ...(initialTransaction ? { id: initialTransaction.id } : {}),
      type,
      amount: parseFloat(amount),
      categoryId,
      accountId,
      toAccountId: type === 'Transfer' ? toAccountId : undefined,
      note,
      date: new Date(date).toISOString(),
      labels: selectedLabels,
      status
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialTransaction && onDelete) {
      if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
        onDelete(initialTransaction.id);
        onClose();
      }
    }
  };

  const getAccountDisplayName = (acc: Account) => {
    const group = accountGroups.find(g => g.id === acc.groupId);
    return group ? `${group.name} -> ${acc.name}` : acc.name;
  };

  const getCategoryDisplayName = (cat: Category) => {
    const group = categoryGroups.find(g => g.id === cat.groupId);
    return group ? `${group.name} -> ${cat.name}` : cat.name;
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        
        {/* Header cố định */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-800">
              {initialTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}
            </h3>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">LỊCH SỬ CHI TIÊU</p>
          </div>
          <div className="flex items-center gap-2">
            {!isTrashMode && initialTransaction && (
              <button onClick={handleDelete} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
          <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
            {(['Expense', 'Income', 'Transfer'] as const).map((t) => (
              <button 
                key={t}
                disabled={isTrashMode}
                onClick={() => setType(t)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                {t === 'Expense' ? 'Chi tiêu' : t === 'Income' ? 'Thu nhập' : 'Chuyển'}
              </button>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền ({settings.defaultCurrency})</p>
            <input 
              readOnly={isTrashMode}
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full text-center text-5xl font-black outline-none bg-transparent ${type === 'Income' ? 'text-green-500' : 'text-red-500'}`}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tài khoản</label>
              <select 
                disabled={isTrashMode}
                value={accountId} 
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none"
              >
                {selectableAccounts.map(a => <option key={a.id} value={a.id}>{getAccountDisplayName(a)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                {type === 'Transfer' ? 'Đến tài khoản' : 'Danh mục'}
              </label>
              {type === 'Transfer' ? (
                <select 
                  disabled={isTrashMode}
                  value={toAccountId} 
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none"
                >
                  {selectableAccounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{getAccountDisplayName(a)}</option>)}
                </select>
              ) : (
                <select 
                  disabled={isTrashMode}
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none"
                >
                  {filteredCats.map(c => <option key={c.id} value={c.id}>{getCategoryDisplayName(c)}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Ngày & Trạng thái</label>
            <div className="grid grid-cols-2 gap-4">
               <input 
                readOnly={isTrashMode}
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-700 outline-none" 
              />
              <select 
                disabled={isTrashMode}
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-700 outline-none"
              >
                <option value="None">None</option>
                <option value="Cleared">Cleared</option>
                <option value="Reconciled">Reconciled</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nhãn (Labels)</label>
            <div className="flex flex-wrap gap-2">
              {labels.map(l => (
                <button 
                  key={l.id} 
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  className={`px-4 py-2 rounded-full text-[11px] font-black border transition-all ${selectedLabels.includes(l.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                >
                  #{l.name.toUpperCase()}
                </button>
              ))}
              <button 
                type="button"
                onClick={() => {
                  const name = prompt('Nhập tên nhãn mới:');
                  if (name && name.trim()) {
                    alert('Sử dụng chức năng quản lý nhãn để thêm mới.');
                  }
                }}
                className="px-4 py-2 rounded-full text-[11px] font-black border border-dashed border-gray-300 text-gray-400"
              >
                + THÊM NHÃN
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Ghi chú</label>
            <textarea 
              readOnly={isTrashMode}
              value={note} 
              onChange={e => setNote(e.target.value)} 
              rows={2}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100" 
              placeholder="Ghi chú cho giao dịch này..."
            />
          </div>
        </div>

        {/* Footer cố định */}
        <div className="px-8 py-5 border-t border-gray-50 shrink-0 bg-white">
          {isTrashMode ? (
            <button 
              onClick={() => onRestore?.(initialTransaction!.id)} 
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all"
            >
              KHÔI PHỤC GIAO DỊCH
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
            >
              {initialTransaction ? 'LƯU THAY ĐỔI' : 'TẠO GIAO DỊCH MỚI'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
