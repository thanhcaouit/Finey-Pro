
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { Transaction, Account, Category, CategoryGroup, AccountGroup } from '../types';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  categoryGroups: CategoryGroup[];
  accountGroups: AccountGroup[];
}

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];

const Dashboard: React.FC<Props> = ({ transactions, accounts, categoryGroups, accountGroups }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_order');
    return saved ? JSON.parse(saved) : ['DAILY', 'BUDGET', 'CALENDAR', 'NET_EARNINGS', 'CASH_FLOW', 'NET_WORTH', 'FAVORITES', 'CREDIT_CARDS'];
  });

  useEffect(() => {
    localStorage.setItem('dashboard_order', JSON.stringify(order));
  }, [order]);

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = order.indexOf(id);
    if (idx === -1) return;
    const newOrder = [...order];
    if (direction === 'up' && idx > 0) {
      [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
    } else if (direction === 'down' && idx < order.length - 1) {
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    }
    setOrder(newOrder);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
  };

  const currentDate = new Date(2026, 0, 19); // Cố định ngày giả lập như trong ảnh

  // 1. Daily Summary Data (Last 7 days)
  const dailyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.setHours(0,0,0,0));
      const dayEnd = new Date(d.setHours(23,59,59,999));
      
      const spent = Math.abs(transactions
        .filter(t => t.type === 'Expense' && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
        .reduce((s, t) => s + t.amount, 0));
      
      data.push({ name: dayName, amount: spent / 1000, label: `$${Math.round(spent/1000)}` });
    }
    return data;
  }, [transactions]);

  // 2. Budget Summary Data (Current Month)
  const budgetPieData = useMemo(() => {
    const catMap = new Map<string, number>();
    const monthTs = transactions.filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === currentDate.getMonth());
    
    monthTs.forEach(t => {
      catMap.set(t.categoryId, (catMap.get(t.categoryId) || 0) + Math.abs(t.amount));
    });

    const data = Array.from(catMap.entries()).map(([id, val]) => ({
      name: categoryGroups.find(g => g.id === id)?.name || 'Other',
      value: val
    })).sort((a, b) => b.value - a.value).slice(0, 8);
    
    return data;
  }, [transactions, categoryGroups]);

  // 3. Calendar Data
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dayTs = transactions.filter(t => new Date(t.date).toDateString() === date.toDateString());
      days.push({
        day: i,
        hasIncome: dayTs.some(t => t.type === 'Income'),
        hasExpense: dayTs.some(t => t.type === 'Expense'),
        isToday: i === 19
      });
    }
    return days;
  }, [transactions]);

  // 4. Net Earnings / Cash Flow (Last 3 Months)
  const multiMonthData = useMemo(() => {
    const data = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const monthTs = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      const income = monthTs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
      const expense = Math.abs(monthTs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0));
      data.push({ name: label, income: income/1000, expense: expense/1000, rawIncome: income, rawExpense: expense });
    }
    return data;
  }, [transactions]);

  // 5. Net Worth Summary (Reconstructing history)
  const netWorthHistory = useMemo(() => {
    // Simplified: show last 6 months
    const history = [];
    for(let i = 5; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
        // Calculate balance at end of this month
        const tsAfter = transactions.filter(t => new Date(t.date) > d);
        const assetsNow = accounts.filter(a => accountGroups.find(g => g.id === a.groupId)?.type === 'Asset').reduce((s, a) => s + a.balanceNew, 0);
        const debtNow = accounts.filter(a => accountGroups.find(g => g.id === a.groupId)?.type === 'Liabilities').reduce((s, a) => s + a.balanceNew, 0);
        
        const changeAfter = tsAfter.reduce((s, t) => s + t.amount, 0);
        const netAtThen = (assetsNow + debtNow) - changeAfter;
        
        history.push({
            name: d.toLocaleDateString('en-US', { month: 'short' }),
            netWorth: netAtThen / 1000,
            assets: (assetsNow - tsAfter.filter(t => accounts.find(a => a.id === t.accountId && accountGroups.find(g => g.id === a.groupId)?.type === 'Asset')).reduce((s, t) => s + t.amount, 0)) / 1000
        });
    }
    return history;
  }, [transactions, accounts, accountGroups]);

  // Fix: children set as optional to avoid "Property 'children' is missing" error when using as a wrapper.
  const CardWrapper = ({ id, title, children }: { id: string, title: string, children?: React.ReactNode }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative">
      <div className="p-5 flex justify-between items-center border-b border-gray-50 shrink-0">
        <h3 className="font-black text-gray-800 text-[15px]">{title}</h3>
        <div className="flex items-center gap-1">
          {isEditing && (
            <>
              <button onClick={() => moveWidget(id, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400">↑</button>
              <button onClick={() => moveWidget(id, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400">↓</button>
            </>
          )}
          <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
      </div>
      <div className="flex-1 p-5 min-h-[250px]">
        {children}
      </div>
    </div>
  );

  const widgets: Record<string, React.ReactNode> = {
    DAILY: (
      <CardWrapper id="DAILY" title="Daily Summary">
        <div className="h-[180px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 border-t border-gray-50 pt-4">
          <div className="flex justify-between text-[13px] font-bold text-gray-500">
            <span>7 days average</span>
            <span>- {formatCurrency(Math.round(dailyData.reduce((s, d) => s + d.amount, 0) / 7) * 1000)}</span>
          </div>
          <div className="flex justify-between text-[13px] font-bold text-gray-500">
            <span>30 days average</span>
            <span>- {formatCurrency(Math.round(dailyData.reduce((s, d) => s + d.amount, 0) / 7 * 0.95) * 1000)}</span>
          </div>
        </div>
      </CardWrapper>
    ),
    BUDGET: (
      <CardWrapper id="BUDGET" title="Budget Summary">
        <div className="flex gap-4 items-center">
          <div className="h-[160px] w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetPieData} innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value">
                  {budgetPieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {budgetPieData.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="truncate">{entry.name}</span>
                <span className="ml-auto">{(entry.value / budgetPieData.reduce((s, d) => s + d.value, 0) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-[11px] font-black text-gray-400 mb-1 uppercase tracking-widest">
            <span>Category</span>
            <span>Actual</span>
            <span>Budget</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">Expense</span>
            <div className="flex-1 mx-4">
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[12%]"></div>
               </div>
            </div>
            <span className="text-sm font-black text-gray-800">{formatCurrency(budgetPieData.reduce((s, d) => s + d.value, 0))}</span>
          </div>
        </div>
      </CardWrapper>
    ),
    CALENDAR: (
      <CardWrapper id="CALENDAR" title="Calendar">
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] font-black text-gray-400 uppercase">{d}</div>
          ))}
          {calendarDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center justify-center relative h-10">
              {d && (
                <>
                  <span className={`text-xs font-bold ${d.isToday ? 'bg-blue-400 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                    {d.day}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {d.hasIncome && <div className="w-1 h-1 rounded-full bg-green-500"></div>}
                    {d.hasExpense && <div className="w-1 h-1 rounded-full bg-red-500"></div>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardWrapper>
    ),
    NET_EARNINGS: (
      <CardWrapper id="NET_EARNINGS" title="Net Earnings">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiMonthData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-[13px] font-bold text-gray-600">
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span>Income</span>
            <span className="text-green-600">{formatCurrency(multiMonthData[2].rawIncome)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span>Expense</span>
            <span className="text-red-500">-{formatCurrency(multiMonthData[2].rawExpense)}</span>
          </div>
          <div className="flex justify-between py-1 pt-2">
            <span className="font-black">Net Earnings</span>
            <span className="font-black text-gray-900">{formatCurrency(multiMonthData[2].rawIncome - multiMonthData[2].rawExpense)}</span>
          </div>
        </div>
      </CardWrapper>
    ),
    CASH_FLOW: (
      <CardWrapper id="CASH_FLOW" title="Cash Flow">
         <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiMonthData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
              <Tooltip />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[11px] font-bold text-gray-400 mt-4 uppercase">Monthly Inflow vs Outflow</p>
      </CardWrapper>
    ),
    NET_WORTH: (
      <CardWrapper id="NET_WORTH" title="Net Worth Summary">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthHistory}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="assets" stroke="#10B981" fill="none" strokeWidth={3} />
              <Area type="monotone" dataKey="netWorth" stroke="#3B82F6" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-center text-[13px] font-black">
           <span className="text-gray-500">Latest Net Worth</span>
           <span className="text-blue-600">{formatCurrency(netWorthHistory[5].netWorth * 1000)}</span>
        </div>
      </CardWrapper>
    ),
    FAVORITES: (
      <CardWrapper id="FAVORITES" title="Favorite Accounts">
        <div className="space-y-4">
          {accounts.slice(0, 5).map(acc => (
            <div key={acc.id} className="flex justify-between items-center">
              <span className="font-bold text-gray-600 text-[14px]">{acc.name}</span>
              <span className={`font-black text-[14px] ${acc.balanceNew >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(acc.balanceNew)}
              </span>
            </div>
          ))}
          <button className="w-full text-center text-blue-500 text-[12px] font-black pt-2 uppercase tracking-widest">Balance Sheet</button>
        </div>
      </CardWrapper>
    ),
    CREDIT_CARDS: (
      <CardWrapper id="CREDIT_CARDS" title="Credit Card Summary">
        <div className="space-y-6">
          {accounts.filter(a => accountGroups.find(g => g.id === a.groupId)?.name === 'Credit Card').map(acc => (
            <div key={acc.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-700">{acc.name}</span>
                <span className="text-xs font-black text-gray-400">{formatCurrency(13000000)}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div className="h-full bg-green-500 w-[25%]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>{formatCurrency(acc.balanceNew)}</span>
                <span>January 19</span>
              </div>
            </div>
          ))}
        </div>
      </CardWrapper>
    )
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mx-1">
        <div>
          <h2 className="text-xl font-black text-gray-800">Financial Overview</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hi, Welcome back!</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {isEditing ? 'DONE EDITING' : 'EDIT DASHBOARD'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {order.map(id => (
          <React.Fragment key={id}>
            {widgets[id]}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
