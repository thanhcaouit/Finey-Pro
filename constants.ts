
import { Account, AccountGroup, CategoryGroup, Category, Transaction, Label } from './types';

export const INITIAL_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: 'ag-1', type: 'Asset', name: 'Bất động sản', description: 'Bất động sản', icon: '🏠' },
  { id: 'ag-2', type: 'Asset', name: 'Bank', description: 'Bank', icon: '🏦' },
  { id: 'ag-3', type: 'Asset', name: 'Phải thu', description: 'Phải thu nợ', icon: '📑' },
  { id: 'ag-4', type: 'Asset', name: 'Tiền mặt', description: 'Tiền mặt', icon: '💵' },
  { id: 'ag-5', type: 'Asset', name: 'Đầu tư', description: 'Đầu tư', icon: '📈' },
  { id: 'ag-6', type: 'Liabilities', name: 'Credit Card', description: 'Thẻ tín dụng', icon: '💳' },
  { id: 'ag-7', type: 'Liabilities', name: 'Thế chấp', description: 'Thế chấp', icon: '🤝' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', groupId: 'ag-1', name: 'Bất động sản', description: 'Bất động sản', dateStart: '2023-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-2', groupId: 'ag-2', name: 'Tiết kiệm', description: 'Tiết kiệm 1', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-3', groupId: 'ag-2', name: 'Tiết kiệm 2', description: 'Tiết kiệm 2', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-4', groupId: 'ag-3', name: 'Phải thu 1', description: 'Phải thu 1', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-5', groupId: 'ag-4', name: 'Ví', description: 'Tiền mặt', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-6', groupId: 'ag-4', name: 'Thẻ', description: 'Thẻ ngân hàng', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-7', groupId: 'ag-5', name: 'Vàng', description: 'Vàng', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-8', groupId: 'ag-5', name: 'Chứng Khoán Ba', description: 'Chứng Khoán Ba', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-9', groupId: 'ag-6', name: 'Thẻ tín dụng', description: 'Thẻ 1', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
  { id: 'acc-10', groupId: 'ag-7', name: 'Thế chấp nhà', description: 'Thế chấp nhà', dateStart: '2025-01-01', balanceStart: 0, balanceNew: 0, currency: 'VND', note: '', selectInAsset: false, selectAssetAndReport: false },
];

export const INITIAL_CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'cg-1', type: 'Outcome', name: 'Tiện ích', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Tiện ích hàng ngày', icon: '⚡' },
  { id: 'cg-2', type: 'Outcome', name: 'Xe cộ', budget: 0, enableBudget: false, calculatorBudget: false, description: 'Chi phí xe cộ', icon: '🚗' },
  { id: 'cg-3', type: 'Outcome', name: 'Hộ gia đình', budget: 2000000, enableBudget: true, calculatorBudget: true, description: 'Chi tiêu hộ gia đình', icon: '🏠' },
  { id: 'cg-4', type: 'Outcome', name: 'Danh mục khác', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Danh mục khác', icon: '📦' },
  { id: 'cg-5', type: 'Outcome', name: 'Vui chơi giải trí', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Vui chơi giải trí', icon: '🎮' },
  { id: 'cg-6', type: 'Income', name: 'Lao động', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Người lao động', icon: '🛠️' },
  { id: 'cg-7', type: 'Transfer', name: '(Chuyển khoản)', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Chuyển khoản', icon: '🔄' },
  { id: 'cg-8', type: 'New Account', name: '(Tài khoản mới)', budget: 0, enableBudget: false, calculatorBudget: true, description: '(Tài khoản mới)', icon: '🆕' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', groupId: 'cg-1', name: 'Đồ gia dụng', icon: '🛋️', color: '#3B82F6', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Mua đồ cho nhà' },
  { id: 'cat-2', groupId: 'cg-1', name: 'Quần áo', icon: '👕', color: '#6366F1', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Quần áo' },
  { id: 'cat-3', groupId: 'cg-2', name: 'Đổ xăng', icon: '⛽', color: '#F59E0B', budget: 0, enableBudget: false, calculatorBudget: false, description: 'Đổ xăng xe' },
  { id: 'cat-4', groupId: 'cg-2', name: 'Sửa xe', icon: '🔧', color: '#7C3AED', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Sửa xe' },
  { id: 'cat-5', groupId: 'cg-3', name: 'Thuốc men', icon: '💊', color: '#10B981', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Mua thuốc' },
  { id: 'cat-6', groupId: 'cg-3', name: 'Ăn uống', icon: '🍲', color: '#EF4444', budget: 2000000, enableBudget: true, calculatorBudget: true, description: 'Ăn uống' },
  { id: 'cat-7', groupId: 'cg-4', name: 'Danh mục khác', icon: '📦', color: '#94A3B8', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Danh mục khác' },
  { id: 'cat-8', groupId: 'cg-1', name: 'Điện', icon: '⚡', color: '#EAB308', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Tiền điện' },
  { id: 'cat-9', groupId: 'cg-1', name: 'Thuê nhà', icon: '🔑', color: '#EC4899', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Tiền thuê phòng' },
  { id: 'cat-10', groupId: 'cg-6', name: 'Lương', icon: '💰', color: '#059669', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Tiền lương' },
  { id: 'cat-11', groupId: 'cg-6', name: 'Thưởng', icon: '🏆', color: '#8B5CF6', budget: 0, enableBudget: false, calculatorBudget: false, description: 'Tiền thưởng' },
  { id: 'cat-12', groupId: 'cg-7', name: '(Chuyển khoản)', icon: '🔄', color: '#64748B', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Chuyển khoản' },
  { id: 'cat-13', groupId: 'cg-8', name: '(Tài khoản mới)', icon: '🆕', color: '#0EA5E9', budget: 0, enableBudget: false, calculatorBudget: true, description: '(Tài khoản mới)' },
  { id: 'cat-14', groupId: 'cg-5', name: 'Biếu tặng', icon: '🎁', color: '#F43F5E', budget: 0, enableBudget: false, calculatorBudget: true, description: 'Biếu tặng' },
];

export const INITIAL_LABELS: Label[] = [
  { id: 'lbl-1', name: 'Kinh doanh', createdAt: '2025-01-01' },
  { id: 'lbl-2', name: 'Bonus', createdAt: '2025-02-01' },
  { id: 'lbl-3', name: 'Học tập', createdAt: '2025-03-01' },
  { id: 'lbl-4', name: 'Other', createdAt: '2025-01-01' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Chuyển khoản tách 2 dòng
  { id: 't-1-out', date: '2026-01-15T12:41:47', amount: -47000000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-5', note: 'Tiết kiệm tháng 1 (Đi)', labels: [], status: 'None' },
  { id: 't-1-in', date: '2026-01-15T12:41:47', amount: 47000000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-2', note: 'Tiết kiệm tháng 1 (Đến)', labels: [], status: 'None' },
  
  { id: 't-2', date: '2026-01-15T12:38:44', amount: -315000, type: 'Expense', categoryId: 'cat-1', accountId: 'acc-5', note: 'Ga nệm', labels: [], status: 'None' },
  { id: 't-3', date: '2026-01-15T12:38:22', amount: -480000, type: 'Expense', categoryId: 'cat-2', accountId: 'acc-5', note: 'Áo dài mẹ', labels: ['lbl-1'], status: 'None' },
  { id: 't-4', date: '2026-01-15T12:37:50', amount: 52000000, type: 'Income', categoryId: 'cat-10', accountId: 'acc-5', note: 'Lương Ba', labels: [], status: 'None' },
  { id: 't-5', date: '2026-01-14T16:40:26', amount: -174000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },
  { id: 't-6', date: '2026-01-14T16:39:49', amount: -200000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Mời Nước', labels: [], status: 'None' },
  { id: 't-7', date: '2026-01-12T11:15:32', amount: -500000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },
  { id: 't-8', date: '2026-01-12T11:12:48', amount: -3367000, type: 'Expense', categoryId: 'cat-14', accountId: 'acc-5', note: 'Shopping vs bà', labels: [], status: 'None' },
  { id: 't-9', date: '2026-01-11T07:36:16', amount: -49000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Khẩu trang', labels: ['lbl-4'], status: 'None' },
  { id: 't-10', date: '2026-01-11T07:35:36', amount: -255000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Ăn mê thái', labels: [], status: 'None' },

  // Chuyển khoản tách 2 dòng
  { id: 't-11-out', date: '2026-01-10T15:54:59', amount: -3112000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-5', note: 'Pi tiêm vx 12', labels: [], status: 'None' },
  { id: 't-11-in', date: '2026-01-10T15:54:59', amount: 3112000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-9', note: 'Pi tiêm vx 12', labels: [], status: 'None' },
  
  { id: 't-12-out', date: '2026-01-10T15:53:41', amount: -1500000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-5', note: 'Trả góp răng', labels: [], status: 'None' },
  { id: 't-12-in', date: '2026-01-10T15:53:41', amount: 1500000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-9', note: 'Trả góp răng', labels: [], status: 'None' },

  { id: 't-13', date: '2026-01-10T10:40:25', amount: -200000, type: 'Expense', categoryId: 'cat-5', accountId: 'acc-5', note: 'Thuốc nhỏ mắt', labels: [], status: 'None' },
  { id: 't-14', date: '2026-01-10T10:39:31', amount: -2398000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Cắt kính', labels: [], status: 'None' },
  { id: 't-15', date: '2026-01-10T10:39:04', amount: -500000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },

  { id: 't-16-out', date: '2026-01-10T10:38:03', amount: -15000000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-5', note: 'Chứng Khoán', labels: [], status: 'None' },
  { id: 't-16-in', date: '2026-01-10T10:38:03', amount: 15000000, type: 'Transfer', categoryId: 'cat-12', accountId: 'acc-8', note: 'Chứng Khoán', labels: [], status: 'None' },

  { id: 't-17', date: '2026-01-09T10:44:07', amount: 100000, type: 'Income', categoryId: 'cat-7', accountId: 'acc-2', note: 'TTLK', labels: [], status: 'None' },
  { id: 't-18', date: '2026-01-09T10:33:40', amount: 23000, type: 'Income', categoryId: 'cat-7', accountId: 'acc-2', note: 'TTLK', labels: [], status: 'None' },
  { id: 't-19', date: '2026-01-09T10:25:49', amount: 20000, type: 'Income', categoryId: 'cat-7', accountId: 'acc-2', note: 'TTLK', labels: [], status: 'None' },
  { id: 't-20', date: '2026-01-09T10:25:15', amount: -3799000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Học Phí Moon', labels: ['lbl-1'], status: 'None' },
  { id: 't-21', date: '2026-01-08T12:24:20', amount: -100000, type: 'Expense', categoryId: 'cat-3', accountId: 'acc-5', note: 'Xăng', labels: [], status: 'None' },
  { id: 't-22', date: '2026-01-08T12:24:00', amount: -15000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Cafe', labels: [], status: 'None' },
  { id: 't-23', date: '2026-01-08T12:23:01', amount: -23000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Ăn Sáng', labels: [], status: 'None' },
  { id: 't-24', date: '2026-01-08T12:20:17', amount: -192000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sách', labels: ['lbl-4'], status: 'None' },
  { id: 't-25', date: '2026-01-08T12:19:45', amount: -159000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Yến mạch', labels: [], status: 'None' },
  { id: 't-26', date: '2026-01-08T12:18:56', amount: -240000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },
  { id: 't-27', date: '2026-01-08T12:13:47', amount: -210000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sách', labels: ['lbl-1'], status: 'None' },
  { id: 't-28', date: '2026-01-08T12:10:21', amount: -136000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Trà sữa', labels: [], status: 'None' },
  { id: 't-29', date: '2026-01-06T06:12:50', amount: -100000, type: 'Expense', categoryId: 'cat-8', accountId: 'acc-5', note: 'Card điện thoại', labels: [], status: 'None' },
  { id: 't-30', date: '2026-01-06T06:12:31', amount: -364000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sữa Hươu', labels: ['lbl-4'], status: 'None' },
  { id: 't-31', date: '2026-01-06T06:12:04', amount: -260000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Tã', labels: ['lbl-1'], status: 'None' },
  { id: 't-32', date: '2026-01-06T06:11:41', amount: -260000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Tã', labels: ['lbl-4'], status: 'None' },
  { id: 't-33', date: '2026-01-06T06:11:06', amount: -500000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },
  { id: 't-34', date: '2026-01-06T06:10:00', amount: -848000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Massage', labels: [], status: 'None' },
  { id: 't-35', date: '2026-01-06T06:09:39', amount: -970000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sữa Ap', labels: ['lbl-1'], status: 'None' },
  { id: 't-36', date: '2026-01-06T06:09:13', amount: -247000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sữa vinamilk', labels: ['lbl-1'], status: 'None' },
  { id: 't-37', date: '2026-01-06T06:08:33', amount: -854000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sữa Ap', labels: ['lbl-4'], status: 'None' },
  { id: 't-38', date: '2026-01-06T06:08:14', amount: -176000, type: 'Expense', categoryId: 'cat-1', accountId: 'acc-5', note: 'Chén bát', labels: [], status: 'None' },
  { id: 't-39', date: '2026-01-06T06:04:28', amount: -472000, type: 'Expense', categoryId: 'cat-8', accountId: 'acc-5', note: 'Điện', labels: [], status: 'None' },
  { id: 't-40', date: '2026-01-05T20:15:35', amount: -30000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Khoai mỡ', labels: [], status: 'None' },
  { id: 't-41', date: '2026-01-05T12:55:03', amount: -500000, type: 'Expense', categoryId: 'cat-6', accountId: 'acc-5', note: 'Đi chợ', labels: [], status: 'None' },
  { id: 't-42', date: '2026-01-05T12:53:05', amount: -571000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Sữa yến - Cho ông bà ngoại', labels: [], status: 'None' },
  { id: 't-43', date: '2026-01-05T06:31:32', amount: -184000, type: 'Expense', categoryId: 'cat-2', accountId: 'acc-5', note: 'Áo - Cho mẹ', labels: ['lbl-4'], status: 'None' },
  { id: 't-44', date: '2026-01-05T06:27:23', amount: -49000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-5', note: 'Khẩu trang', labels: ['lbl-1'], status: 'None' },
  { id: 't-45', date: '2026-01-05T06:25:09', amount: -516000, type: 'Expense', categoryId: 'cat-1', accountId: 'acc-5', note: 'Mua nồi', labels: [], status: 'None' },
  { id: 't-46', date: '2026-01-03T23:40:09', amount: -5200000, type: 'Expense', categoryId: 'cat-9', accountId: 'acc-5', note: 'Tiền nhà', labels: [], status: 'Cleared' },
  { id: 't-47', date: '2026-01-03T23:30:43', amount: 57000000, type: 'Income', categoryId: 'cat-7', accountId: 'acc-8', note: 'Điều chỉnh', labels: [], status: 'None' },
  
  // Starting Balances (as Income)
  { id: 't-sb-1', date: '2026-01-01T23:27:44', amount: 169000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-3', note: 'Tiết Kiệm 1', labels: [], status: 'Reconciled' },
  { id: 't-sb-2', date: '2026-01-01T23:20:49', amount: 44000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-5', note: 'Ví', labels: [], status: 'Reconciled' },
  { id: 't-sb-3', date: '2025-12-13T00:16:35', amount: -3112000, type: 'Expense', categoryId: 'cat-5', accountId: 'acc-9', note: 'Pi tiêm vx', labels: [], status: 'None' },
  { id: 't-sb-4', date: '2025-12-01T00:10:32', amount: -7500000, type: 'Expense', categoryId: 'cat-7', accountId: 'acc-9', note: 'Làm răng', labels: [], status: 'None' },
  { id: 't-sb-5', date: '2025-10-01T23:25:50', amount: 140000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-4', note: 'A Kiện Mượn', labels: [], status: 'Reconciled' },
  { id: 't-sb-6', date: '2025-08-01T00:28:22', amount: 15000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-8', note: 'Chứng Khoán Mẹ', labels: [], status: 'Reconciled' },
  { id: 't-sb-7', date: '2025-02-01T23:26:51', amount: 100000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-4', note: 'Chị Hảo Mượn', labels: [], status: 'Reconciled' },
  { id: 't-sb-8', date: '2025-01-01T23:29:35', amount: 223000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-8', note: 'Chứng Khoán Ba', labels: [], status: 'Reconciled' },
  { id: 't-sb-9', date: '2023-02-01T23:24:42', amount: 1350000000, type: 'Income', categoryId: 'cat-13', accountId: 'acc-1', note: 'Đất', labels: [], status: 'Reconciled' },
];
