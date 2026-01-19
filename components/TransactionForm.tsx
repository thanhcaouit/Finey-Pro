
import React, { useState, useEffect } from 'react';
import { Category, Account, TransactionType, CategoryGroup, Label, TransactionStatus, Transaction, AppSettings } from '../types';

interface Props {
  categories: Category[];
  accounts: Account[];
  categoryGroups: CategoryGroup[];
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
  categories, accounts, categoryGroups, labels, settings,
  onSave, onClose, onDelete, onRestore,
  initialTransaction, isTrashMode = false 
}) => {
  const defaultAccountId = (settings.rememberLastAccount && settings.lastAccountId) ? settings.lastAccountId : (accounts[0]?.id || '');
  const defaultCategoryId = (settings.rememberLastCategory && settings.lastCategoryId) ? settings.lastCategoryId : '';

  const [type, setType] = useState<TransactionType>(initialTransaction?.type || 'Expense');
  const [amount, setAmount] = useState<string>(initialTransaction ? Math.abs(initialTransaction.amount).toString() : "0");
  const [categoryId, setCategoryId] = useState(initialTransaction?.categoryId || defaultCategoryId);
  const [accountId, setAccountId] = useState(initialTransaction?.accountId || defaultAccountId);
  const [toAccountId, setToAccountId] = useState(initialTransaction?.toAccountId || accounts[1]?.id || '');
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isTrashMode) return;
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

  const handleDeleteClick = () => {
    if (initialTransaction && onDelete) {
      if (window.confirm('Bạn có chắc chắn muốn chuyển giao dịch này vào Thùng rác không?')) {
        onDelete(initialTransaction.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black text-gray-800">
            {initialTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
          
          {/* Transaction Type Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
            {(['Expense', 'Income', 'Transfer'] as const).map((t) => (
              <button 
                key={t}
                disabled={isTrashMode}
                onClick={() => setType(t)}
                className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
              >
                {t === 'Expense' ? 'Chi tiêu' : t === 'Income' ? 'Thu nhập' : 'Chuyển'}
              </button>
            ))}
          </div>

          {/* Amount Display */}
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền ({settings.defaultCurrency})</p>
            <div className="relative inline-block w-full">
              <input 
                readOnly={isTrashMode}
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full text-center text-5xl font-black outline-none bg-transparent ${type === 'Income' ? 'text-green-500' : 'text-red-500'}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tài khoản</label>
              <select 
                disabled={isTrashMode}
                value={accountId} 
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
              >
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                >
                  {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <select 
                  disabled={isTrashMode}
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                >
                  {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Ngày tháng</label>
              <input 
                readOnly={isTrashMode}
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Trạng thái</label>
              <select 
                disabled={isTrashMode}
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
              >
                <option value="None">None</option>
                <option value="Cleared">Cleared</option>
                <option value="Reconciled">Reconciled</option>
              </select>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nhãn (Labels)</label>
            <div className="flex flex-wrap gap-2">
              {labels.map(l => (
                <button 
                  key={l.id} 
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${selectedLabels.includes(l.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
                >
                  #{l.name}
                </button>
              ))}
              {labels.length === 0 && <span className="text-gray-300 italic text-xs">Chưa có nhãn</span>}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Ghi chú</label>
            <textarea 
              readOnly={isTrashMode}
              value={note} 
              onChange={e => setNote(e.target.value)} 
              rows={2}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 placeholder-gray-300" 
              placeholder="Thêm thông tin giao dịch..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-4">
            {isTrashMode ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => onRestore?.(initialTransaction!.id)} 
                  className="flex-1 bg-green-500 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-green-100 text-lg hover:bg-green-600 transition-all active:scale-95"
                >
                  KHÔI PHỤC
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Xoá vĩnh viễn giao dịch này? Hành động này không thể hoàn tác.')) {
                      onDelete?.(initialTransaction!.id);
                      onClose();
                    }
                  }} 
                  className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-100 hover:bg-red-600 transition-all active:scale-90"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleSubmit} 
                  className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  {initialTransaction ? 'CẬP NHẬT GIAO DỊCH' : 'LƯU GIAO DỊCH'}
                </button>
                
                {initialTransaction && (
                  <div className="flex justify-center mt-2 px-10">
                    <button 
                      onClick={handleDeleteClick}
                      className="w-full py-4 border border-gray-200 rounded-[1.5rem] text-red-500 font-bold text-sm shadow-sm hover:bg-red-50 transition-all active:scale-95"
                    >
                      Xoá Giao Dịch
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
