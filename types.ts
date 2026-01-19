
export type TransactionType = 'Income' | 'Expense' | 'Transfer';

export type TransactionStatus = 'None' | 'Cleared' | 'Reconciled';

export interface Label {
  id: string;
  name: string;
  createdAt: string;
}

export type AccountGroupType = 'Asset' | 'Liabilities';

export interface AccountGroup {
  id: string;
  type: AccountGroupType;
  name: string;
  description: string;
  icon: string;
}

export interface Account {
  id: string;
  groupId: string;
  name: string;
  description: string;
  dateStart: string;
  balanceStart: number;
  balanceNew: number;
  currency: 'VND' | 'USD';
  note: string;
  selectInAsset: boolean;
  selectAssetAndReport: boolean;
  showInSelection: boolean; // Thuộc tính mới
}

export type CategoryGroupType = 'Income' | 'Outcome' | 'Transfer' | 'New Account';

export interface CategoryGroup {
  id: string;
  type: CategoryGroupType;
  name: string;
  budget: number;
  enableBudget: boolean;
  calculatorBudget: boolean;
  description: string;
  icon: string;
}

export interface Category {
  id: string;
  groupId: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  enableBudget: boolean;
  calculatorBudget: boolean;
  description: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  note: string;
  labels: string[]; // IDs of labels
  status: TransactionStatus;
}

export interface AppSettings {
  defaultCurrency: 'VND' | 'USD';
  theme: 'blue' | 'green' | 'purple' | 'dark';
  language: 'vi' | 'en';
  rememberLastAccount: boolean;
  rememberLastCategory: boolean;
  rememberLastCurrency: boolean;
  lastAccountId?: string;
  lastCategoryId?: string;
  lastCurrency?: 'VND' | 'USD';
}

export interface FinanceState {
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  accounts: Account[];
  accountGroups: AccountGroup[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  labels: Label[];
  settings: AppSettings;
}
