
import React, { useState } from 'react';
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
}

const AccountManagement: React.FC<Props> = ({ 
  accounts, groups, onAddAccount, onUpdateAccount, onDeleteAccount, onAddGroup, onUpdateGroup, onDeleteGroup
}) => {
  const [editingGroup, setEditingGroup] = useState<AccountGroup | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState<{groupId?: string} | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

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

  // Improved Group Form Component
  const GroupForm = ({ group, onClose }: { group?: AccountGroup, onClose: () => void }) => {
    const [name, setName] = useState(group?.name || '');
    const [type, setType] = useState<'Asset' | 'Liabilities'>(group?.type || 'Asset');
    const [icon, setIcon] = useState(group?.icon || '🏦');
    const [description, setDescription] = useState(group?.description || '');

    const icons = ['🏦', '🏠', '📈', '💵', '💳', '🤝', '💎', '💰', '🛡️', '🚜'];

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-800">{group ? 'Sửa Nhóm Tài Khoản' : 'Thêm Nhóm Mới'}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">PHÂN LOẠI NGUỒN TIỀN CỦA BẠN</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">✕</button>
          </div>

          <div className="space-y-5">
            <div className="flex gap-3 p-1 bg-gray-100 rounded-2xl">
              {(['Asset', 'Liabilities'] as const).map((t) => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                >
                  {t === 'Asset' ? 'Tài Sản (+)' : 'Nợ (-)'}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Biểu tượng</label>
              <div className="flex flex-wrap gap-2">
                {icons.map((ic, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${icon === ic ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tên Nhóm</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-b border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-lg text-gray-800 bg-white" 
                placeholder="VD: Tài khoản Ngân hàng" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mô tả</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-medium text-sm text-gray-700 border border-gray-100 min-h-[60px]" 
                placeholder="Thêm chi tiết về nhóm này..."
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => {
                  if (group) onUpdateGroup(group.id, { name, type, icon, description });
                  else onAddGroup({ name, type, icon, description });
                  onClose();
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Cập Nhật Nhóm
              </button>
              {group && (
                <button 
                  onClick={() => { if(window.confirm('Xoá nhóm này?')) { onDeleteGroup(group.id); onClose(); } }}
                  className="w-full text-red-500 font-bold text-sm py-2"
                >
                  Xoá Nhóm Này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Improved Account Form Component based on screenshot
  const AccountForm = ({ account, groupId, onClose }: { account?: Account, groupId?: string, onClose: () => void }) => {
    const [name, setName] = useState(account?.name || '');
    const [balanceStart, setBalanceStart] = useState(account?.balanceStart || 0);
    const [balanceNew, setBalanceNew] = useState(account?.balanceNew || 0);
    const [currency, setCurrency] = useState<'VND' | 'USD'>(account?.currency || 'VND');
    const [description, setDescription] = useState(account?.description || '');
    const [selectedGroupId, setSelectedGroupId] = useState(account?.groupId || groupId || groups[0]?.id);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-800">{account ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản'}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">NƠI LƯU TRỮ TIỀN CỦA BẠN</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">✕</button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">NHÓM TÀI KHOẢN</label>
                <select 
                  value={selectedGroupId} 
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3.5 font-bold text-gray-700 text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">LOẠI TIỀN TỆ</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  {(['VND', 'USD'] as const).map(curr => (
                    <button 
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${currency === curr ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">TÊN TÀI KHOẢN</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-b-2 border-gray-100 focus:border-blue-500 py-3 outline-none font-bold text-xl text-gray-800 bg-white placeholder-gray-200" 
                placeholder="Tên tài khoản..." 
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Start Balance Field */}
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">SỐ DƯ ĐẦU KỲ</label>
                <div className="flex items-center">
                  <span className="text-lg font-black text-gray-400 mr-2">{currency === 'VND' ? '₫' : '$'}</span>
                  <input 
                    type="number" 
                    value={balanceStart || ''} 
                    onChange={e => setBalanceStart(Number(e.target.value))} 
                    className="w-full bg-transparent outline-none font-black text-xl text-gray-600" 
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Current Balance Field - Big Blue Box */}
              <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50 shadow-sm shadow-blue-50">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">SỐ DƯ HIỆN TẠI</label>
                <div className="flex items-center">
                  <span className="text-3xl font-black text-blue-600 mr-2">{currency === 'VND' ? '₫' : '$'}</span>
                  <input 
                    type="number" 
                    value={balanceNew || ''} 
                    onChange={e => setBalanceNew(Number(e.target.value))} 
                    className="w-full bg-transparent outline-none font-black text-4xl text-blue-700 placeholder-blue-200" 
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">GHI CHÚ & MÔ TẢ</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-gray-50 rounded-3xl p-4 outline-none font-medium text-sm text-gray-700 border border-gray-100 min-h-[100px] focus:ring-2 focus:ring-blue-100" 
                placeholder="Ghi chú thêm về tài khoản này..."
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (account) onUpdateAccount(account.id, { name, balanceStart, balanceNew, currency, description, groupId: selectedGroupId });
                  else onAddAccount({ name, groupId: selectedGroupId!, balanceStart, balanceNew, currency, description, dateStart: new Date().toISOString(), note: '', selectInAsset: false, selectAssetAndReport: false });
                  onClose();
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                {account ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </button>
              {account && (
                <button 
                  onClick={() => { if(window.confirm('Xoá tài khoản này?')) { onDeleteAccount(account.id); onClose(); } }}
                  className="w-full text-red-500 font-bold text-sm py-2 hover:text-red-600 transition-colors"
                >
                  Xoá Tài Khoản Này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, colorClass: string, groupsList: AccountGroup[], total: number) => (
    <div className="mb-8">
      <div className="px-4 py-2 flex justify-between items-center">
        <h2 className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>{title}</h2>
        <span className={`text-sm font-black ${colorClass}`}>{formatCurrency(total)}</span>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {groupsList.map(group => {
          const groupAccounts = accounts.filter(a => a.groupId === group.id);
          const groupTotal = groupAccounts.reduce((s, a) => s + a.balanceNew, 0);

          return (
            <div key={group.id}>
              <div 
                onClick={() => setEditingGroup(group)}
                className="px-6 py-4 bg-gray-50/50 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">{group.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-[15px]">{group.name}</h4>
                    {group.description && <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{group.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-black text-gray-700">{formatCurrency(groupTotal)}</span>
                  <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✎</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {groupAccounts.map(acc => (
                  <div 
                    key={acc.id} 
                    onClick={(e) => { e.stopPropagation(); setEditingAccount(acc); }}
                    className="pl-14 pr-6 py-4 flex justify-between items-center hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                      <div>
                        <p className="font-bold text-gray-700 text-[14px]">{acc.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">{acc.description || acc.currency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-[14px] ${acc.balanceNew >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatCurrency(acc.balanceNew)}
                      </p>
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
      <div className="px-4 py-8 text-center bg-white rounded-[2.5rem] mb-8 border border-gray-100 shadow-sm">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">TỔNG SỐ DƯ HÔM NAY</p>
        <p className="text-3xl font-black text-gray-800 mt-2">
          {formatCurrency(totalAssets + totalLiabilities)}
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="px-4 py-1.5 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 uppercase">TS: {formatCurrency(totalAssets)}</div>
          <div className="px-4 py-1.5 rounded-full bg-red-50 text-[10px] font-black text-red-500 uppercase">NỢ: {formatCurrency(Math.abs(totalLiabilities))}</div>
        </div>
      </div>

      {renderSection('TÀI SẢN (ASSETS)', 'text-blue-500', assetGroups, totalAssets)}
      {renderSection('KHOẢN NỢ (LIABILITIES)', 'text-red-500', liabilityGroups, totalLiabilities)}

      {/* Account Specific Speed Dial FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {isFabOpen && (
          <>
            <button 
              onClick={() => { setIsAddingGroup(true); setIsFabOpen(false); }}
              className="flex items-center gap-3 bg-white text-gray-700 px-5 py-3 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-2 duration-200 font-bold text-sm"
            >
              <span>Tạo Nhóm Mới</span>
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">📁</span>
            </button>
            <button 
              onClick={() => { setIsAddingAccount({}); setIsFabOpen(false); }}
              className="flex items-center gap-3 bg-white text-gray-700 px-5 py-3 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 font-bold text-sm"
            >
              <span>Tạo Tài Khoản Mới</span>
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg">🏦</span>
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

      {/* Backdrop for FAB menu */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* Modals */}
      {(isAddingGroup || editingGroup) && <GroupForm group={editingGroup || undefined} onClose={() => { setEditingGroup(null); setIsAddingGroup(false); }} />}
      {(isAddingAccount || editingAccount) && <AccountForm account={editingAccount || undefined} groupId={isAddingAccount?.groupId} onClose={() => { setEditingAccount(null); setIsAddingAccount(null); }} />}
    </div>
  );
};

export default AccountManagement;
