
import React, { useState, useEffect } from 'react';
import { Account, AccountGroup } from '../types';

interface Props {
  accounts: Account[];
  groups: AccountGroup[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onAddGroup: (group: Omit<AccountGroup, 'id'>) => void;
  onUpdateGroup: (id: string, updates: Partial<AccountGroup>) => void;
  onDeleteGroup: (id: string) => void;
  // Props mới để đồng bộ với FAB của App.tsx
  externalAddAccount?: boolean;
  setExternalAddAccount?: (val: boolean) => void;
  externalAddGroup?: boolean;
  setExternalAddGroup?: (val: boolean) => void;
}

const AccountManagement: React.FC<Props> = ({ 
  accounts, groups, onAddAccount, onUpdateAccount, onDeleteAccount, onAddGroup, onUpdateGroup, onDeleteGroup,
  externalAddAccount, setExternalAddAccount, externalAddGroup, setExternalAddGroup
}) => {
  const [editingGroup, setEditingGroup] = useState<AccountGroup | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState<{groupId?: string} | null>(null);

  // Theo dõi tín hiệu từ App.tsx
  useEffect(() => {
    if (externalAddAccount) {
      setIsAddingAccount({});
      setExternalAddAccount?.(false);
    }
  }, [externalAddAccount]);

  useEffect(() => {
    if (externalAddGroup) {
      setIsAddingGroup(true);
      setExternalAddGroup?.(false);
    }
  }, [externalAddGroup]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const assetGroups = groups.filter(g => g.type === 'Asset');
  const liabilityGroups = groups.filter(g => g.type === 'Liabilities');

  const totalAssets = accounts
    .filter(a => groups.find(g => g.id === a.groupId)?.type === 'Asset')
    .reduce((s, a) => s + a.balanceNew, 0);

  const totalLiabilities = accounts
    .filter(a => groups.find(g => g.id === a.groupId)?.type === 'Liabilities')
    .reduce((s, a) => s + a.balanceNew, 0);

  // Modal Layout chuẩn hóa
  const ModalLayout = ({ 
    title, subtitle, onClose, onDelete, onSave, saveLabel, children 
  }: { 
    title: string, subtitle: string, onClose: () => void, onDelete?: () => void, onSave: () => void, saveLabel: string, children: React.ReactNode 
  }) => (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header cố định */}
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

        {/* Nội dung có thể cuộn */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
          {children}
        </div>

        {/* Footer cố định chứa nút Lưu */}
        <div className="px-8 py-5 border-t border-gray-50 shrink-0 bg-white">
          <button 
            onClick={onSave}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );

  const GroupForm = ({ group, onClose }: { group?: AccountGroup, onClose: () => void }) => {
    const [name, setName] = useState(group?.name || '');
    const [type, setType] = useState<'Asset' | 'Liabilities'>(group?.type || 'Asset');
    const [icon, setIcon] = useState(group?.icon || '🏦');
    const [description, setDescription] = useState(group?.description || '');

    const icons = ['🏦', '🏠', '📈', '💵', '💳', '🤝', '💎', '💰', '🛡️', '🚜', '🗳️', '💼'];

    const handleDelete = () => {
      if (!group) return;
      if (window.confirm('Bạn có chắc chắn muốn xóa nhóm này không?')) {
        onDeleteGroup(group.id);
        onClose();
      }
    };

    const handleSave = () => {
      if (!name) return alert('Vui lòng nhập tên nhóm');
      if (group) onUpdateGroup(group.id, { name, type, icon, description });
      else onAddGroup({ name, type, icon, description });
      onClose();
    };

    return (
      <ModalLayout 
        title={group ? 'Sửa Nhóm' : 'Thêm Nhóm'} 
        subtitle="QUẢN LÝ PHÂN LOẠI"
        onClose={onClose}
        onDelete={group ? handleDelete : undefined}
        onSave={handleSave}
        saveLabel={group ? 'CẬP NHẬT NHÓM' : 'TẠO NHÓM MỚI'}
      >
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            {(['Asset', 'Liabilities'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                {t === 'Asset' ? 'Tài Sản (+)' : 'Nợ (-)'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Biểu tượng</label>
            <div className="flex flex-wrap gap-2.5">
              {icons.map((ic, idx) => (
                <button 
                  key={idx}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${icon === ic ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tên Nhóm</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="VD: Tiết kiệm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Mô tả</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-medium text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]" 
                placeholder="Mô tả mục đích..."
              />
            </div>
          </div>
        </div>
      </ModalLayout>
    );
  };

  const AccountForm = ({ account, groupId, onClose }: { account?: Account, groupId?: string, onClose: () => void }) => {
    const [name, setName] = useState(account?.name || '');
    const [balanceStart, setBalanceStart] = useState(account?.balanceStart || 0);
    const [currency, setCurrency] = useState<'VND' | 'USD'>(account?.currency || 'VND');
    const [description, setDescription] = useState(account?.description || '');
    const [selectedGroupId, setSelectedGroupId] = useState(account?.groupId || groupId || groups[0]?.id);
    const [showInSelection, setShowInSelection] = useState(account?.showInSelection ?? true);

    const handleDelete = () => {
      if (!account) return;
      if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
        onDeleteAccount(account.id);
        onClose();
      }
    };

    const handleSave = () => {
      if (!name) return alert('Vui lòng nhập tên tài khoản');
      if (account) onUpdateAccount(account.id, { name, balanceStart, currency, description, groupId: selectedGroupId, showInSelection });
      else onAddAccount({ name, groupId: selectedGroupId!, balanceStart, balanceNew: balanceStart, currency, description, dateStart: new Date().toISOString(), note: '', selectInAsset: false, selectAssetAndReport: false, showInSelection });
      onClose();
    };

    return (
      <ModalLayout 
        title={account ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản'} 
        subtitle="CHI TIẾT TÀI SẢN/NỢ"
        onClose={onClose}
        onDelete={account ? handleDelete : undefined}
        onSave={handleSave}
        saveLabel={account ? 'CẬP NHẬT TÀI KHOẢN' : 'TẠO TÀI KHOẢN'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nhóm</label>
              <select 
                value={selectedGroupId} 
                onChange={e => setSelectedGroupId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none"
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tiền tệ</label>
              <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1">
                {(['VND', 'USD'] as const).map(curr => (
                  <button 
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${currency === curr ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tên Tài Khoản</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-black text-2xl text-gray-800 bg-white" 
              placeholder="VD: Ví tiền mặt" 
            />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 text-center">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Số Dư Ban Đầu</label>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-black text-blue-400 mr-2">{currency === 'VND' ? '₫' : '$'}</span>
              <input 
                type="number" 
                value={balanceStart || ''} 
                onChange={e => setBalanceStart(Number(e.target.value))} 
                className="bg-transparent outline-none font-black text-4xl text-blue-700 w-full text-center" 
                placeholder="0"
              />
            </div>
          </div>

          {/* New Visibility Setting */}
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700 text-sm">Hiển thị khi chọn tài khoản</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Dùng trong form thu chi</p>
            </div>
            <button 
              onClick={() => setShowInSelection(!showInSelection)}
              className={`w-12 h-6 rounded-full transition-all relative ${showInSelection ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showInSelection ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Ghi chú</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-medium text-sm text-gray-600 min-h-[100px]" 
              placeholder="Thêm thông tin..."
            />
          </div>
        </div>
      </ModalLayout>
    );
  };

  const renderSection = (title: string, colorClass: string, groupsList: AccountGroup[], total: number) => (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-5 py-3 flex justify-between items-center">
        <h2 className={`text-[11px] font-black uppercase tracking-[0.2em] ${colorClass}`}>{title}</h2>
        <span className={`text-sm font-black ${colorClass}`}>{formatCurrency(total)}</span>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 mx-1">
        {groupsList.map(group => {
          const groupAccounts = accounts.filter(a => a.groupId === group.id);
          const groupTotal = groupAccounts.reduce((s, a) => s + a.balanceNew, 0);

          return (
            <div key={group.id} className="group/parent">
              <div 
                onClick={() => setEditingGroup(group)}
                className="px-6 py-5 bg-gray-50/40 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-all border-l-4 border-transparent hover:border-blue-400"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl group-hover/parent:scale-110 transition-transform">{group.icon}</div>
                  <div>
                    <h4 className="font-black text-gray-800 text-[15px]">{group.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{groupAccounts.length} Tài khoản</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-black text-gray-700">{formatCurrency(groupTotal)}</span>
                  <div className="w-6 h-6 rounded-full bg-gray-200/50 flex items-center justify-center opacity-0 group-hover/parent:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50 bg-white">
                {groupAccounts.map(acc => (
                  <div 
                    key={acc.id} 
                    onClick={(e) => { e.stopPropagation(); setEditingAccount(acc); }}
                    className="pl-16 pr-6 py-5 flex justify-between items-center hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-700 text-[14px]">{acc.name}</p>
                          {!acc.showInSelection && (
                            <span className="text-[8px] font-black bg-gray-100 text-gray-400 px-1 rounded uppercase tracking-tighter">Ẩn</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{acc.description || 'Không có ghi chú'}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className={`font-black text-[14px] ${acc.balanceNew >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatCurrency(acc.balanceNew)}
                      </p>
                      <svg className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </div>
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
    <div className="relative space-y-2 pb-32">
      <div className="px-4 py-10 text-center bg-white rounded-[2.5rem] mb-10 border border-gray-100 shadow-sm mx-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400"></div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">SỐ DƯ TỔNG THỂ</p>
        <p className="text-4xl font-black text-gray-800 mt-3 tracking-tighter">
          {formatCurrency(totalAssets + totalLiabilities)}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <div className="px-5 py-2 rounded-2xl bg-blue-50 text-[10px] font-black text-blue-600 uppercase border border-blue-100/50 shadow-sm shadow-blue-50">TS: {formatCurrency(totalAssets)}</div>
          <div className="px-5 py-2 rounded-2xl bg-red-50 text-[10px] font-black text-red-500 uppercase border border-red-100/50 shadow-sm shadow-red-50">NỢ: {formatCurrency(Math.abs(totalLiabilities))}</div>
        </div>
      </div>

      {renderSection('TÀI SẢN (ASSETS)', 'text-blue-500', assetGroups, totalAssets)}
      {renderSection('KHOẢN NỢ (LIABILITIES)', 'text-red-500', liabilityGroups, totalLiabilities)}

      {/* FAB Container đã được dời lên App.tsx */}

      {/* Modals */}
      {(isAddingGroup || editingGroup) && <GroupForm group={editingGroup || undefined} onClose={() => { setEditingGroup(null); setIsAddingGroup(false); }} />}
      {(isAddingAccount || editingAccount) && <AccountForm account={editingAccount || undefined} groupId={isAddingAccount?.groupId} onClose={() => { setEditingAccount(null); setIsAddingAccount(null); }} />}
    </div>
  );
};

export default AccountManagement;
