
import React from 'react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
  onResetData?: () => void;
}

const Settings: React.FC<Props> = ({ settings, onUpdate, onResetData }) => {
  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ lịch sử giao dịch không? \n\nLưu ý: Các Danh mục, Tài khoản và Nhãn sẽ được GIỮ LẠI. Số dư tài khoản sẽ quay về số dư đầu kỳ.')) {
      onResetData?.();
      alert('Đã xóa sạch lịch sử giao dịch. Bây giờ bạn có thể bắt đầu nhập liệu mới!');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h1 className="text-xl font-black text-gray-800">Cài đặt</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Tùy chỉnh trải nghiệm của bạn</p>
      </div>

      {/* Currency Setup */}
      <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tiền tệ (Currency)</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Tiền tệ mặc định</span>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {(['VND', 'USD'] as const).map(curr => (
                <button
                  key={curr}
                  onClick={() => onUpdate({ defaultCurrency: curr })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${settings.defaultCurrency === curr ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customize Appearance */}
      <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Giao diện (Appearance)</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-700">Theme màu sắc</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(['blue', 'green', 'purple', 'dark'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => onUpdate({ theme })}
                className={`h-12 rounded-2xl flex items-center justify-center border-4 transition-all ${settings.theme === theme ? 'border-blue-200' : 'border-transparent'}`}
              >
                <div 
                  className={`w-full h-full rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white ${
                    theme === 'blue' ? 'bg-blue-600' : 
                    theme === 'green' ? 'bg-green-600' : 
                    theme === 'purple' ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                >
                  {theme}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Quản lý dữ liệu</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700">Làm sạch giao dịch</p>
              <p className="text-[10px] text-gray-400 font-medium">Xóa lịch sử nhưng giữ lại Danh mục & Tài khoản</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              RESET DATA
            </button>
          </div>
        </div>
      </section>

      {/* Transaction Setup */}
      <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Thiết lập giao dịch</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: 'Ghi nhớ tài khoản cuối', key: 'rememberLastAccount' },
            { label: 'Ghi nhớ danh mục cuối', key: 'rememberLastCategory' },
            { label: 'Ghi nhớ tiền tệ cuối', key: 'rememberLastCurrency' }
          ].map(item => (
            <div key={item.key} className="p-6 flex items-center justify-between">
              <span className="font-bold text-gray-700">{item.label}</span>
              <button 
                onClick={() => onUpdate({ [item.key]: !settings[item.key as keyof AppSettings] })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings[item.key as keyof AppSettings] ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[item.key as keyof AppSettings] ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Language Setting */}
      <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngôn ngữ (Language)</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            {(['vi', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => onUpdate({ language: lang })}
                className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${settings.language === lang ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-gray-100 text-gray-400'}`}
              >
                {lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
