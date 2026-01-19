
import { useState, useEffect, useCallback } from 'react';
import { Transaction, Account, AccountGroup, CategoryGroup, Category, FinanceState, Label, AppSettings } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_ACCOUNT_GROUPS, INITIAL_CATEGORY_GROUPS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_LABELS } from '../constants';

const STORAGE_KEY = 'bluefinance_pro_data_v10'; // Tăng version để tránh dữ liệu cũ bị xung đột

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'VND',
  theme: 'blue',
  language: 'vi',
  rememberLastAccount: true,
  rememberLastCategory: true,
  rememberLastCurrency: true,
};

const getInitialState = (): FinanceState => {
  const transactions = INITIAL_TRANSACTIONS;
  const accounts = INITIAL_ACCOUNTS.map(acc => {
    const balanceFromTransactions = transactions
      .filter(t => t.accountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { ...acc, balanceNew: acc.balanceStart + balanceFromTransactions };
  });

  return {
    transactions,
    deletedTransactions: [],
    accounts,
    accountGroups: INITIAL_ACCOUNT_GROUPS,
    categoryGroups: INITIAL_CATEGORY_GROUPS,
    categories: INITIAL_CATEGORIES,
    labels: INITIAL_LABELS,
    settings: DEFAULT_SETTINGS,
  };
};

export const useFinanceStore = () => {
  const [state, setState] = useState<FinanceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Kiểm tra tính toàn vẹn cơ bản của dữ liệu nạp vào
        if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Dữ liệu lưu trữ không hợp lệ, đang khởi tạo lại...");
    }
    return getInitialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Không thể lưu dữ liệu vào localStorage:", e);
    }
  }, [state]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  const recalculateBalances = (transactions: Transaction[], accounts: Account[]) => {
    return accounts.map(acc => {
      const balanceFromTransactions = transactions
        .filter(t => t.accountId === acc.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...acc, balanceNew: acc.balanceStart + balanceFromTransactions };
    });
  };

  const resetTransactions = useCallback(() => {
    setState(prev => {
      const resetAccounts = prev.accounts.map(acc => ({
        ...acc,
        balanceNew: acc.balanceStart
      }));
      return {
        ...prev,
        transactions: [],
        deletedTransactions: [],
        accounts: resetAccounts
      };
    });
  }, []);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    setState(prev => {
      const newTransactions: Transaction[] = [];
      if (transactionData.type === 'Transfer' && transactionData.toAccountId) {
        newTransactions.push(
          { ...transactionData, id: generateId(), amount: -Math.abs(transactionData.amount), note: `${transactionData.note} (Chuyển đi)` },
          { ...transactionData, id: generateId(), accountId: transactionData.toAccountId, amount: Math.abs(transactionData.amount), note: `${transactionData.note} (Chuyển đến)` }
        );
      } else {
        newTransactions.push({ 
          ...transactionData, 
          id: generateId(), 
          amount: transactionData.type === 'Expense' ? -Math.abs(transactionData.amount) : Math.abs(transactionData.amount) 
        });
      }
      
      const updatedTransactions = [...newTransactions, ...prev.transactions];
      const updatedAccounts = recalculateBalances(updatedTransactions, prev.accounts);
      
      const settingsUpdates: Partial<AppSettings> = {};
      if (prev.settings.rememberLastAccount) settingsUpdates.lastAccountId = transactionData.accountId;
      if (prev.settings.rememberLastCategory) settingsUpdates.lastCategoryId = transactionData.categoryId;

      return { 
        ...prev, 
        transactions: updatedTransactions, 
        accounts: updatedAccounts,
        settings: { ...prev.settings, ...settingsUpdates }
      };
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => {
      const updatedTransactions = prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t);
      const updatedAccounts = recalculateBalances(updatedTransactions, prev.accounts);
      return { ...prev, transactions: updatedTransactions, accounts: updatedAccounts };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const transactionToDelete = prev.transactions.find(t => t.id === id);
      if (!transactionToDelete) return prev;
      const updatedTransactions = prev.transactions.filter(t => t.id !== id);
      const updatedAccounts = recalculateBalances(updatedTransactions, prev.accounts);
      return { 
        ...prev, 
        transactions: updatedTransactions, 
        deletedTransactions: [transactionToDelete, ...prev.deletedTransactions],
        accounts: updatedAccounts 
      };
    });
  }, []);

  const restoreTransaction = useCallback((id: string) => {
    setState(prev => {
      const transactionToRestore = prev.deletedTransactions.find(t => t.id === id);
      if (!transactionToRestore) return prev;
      const updatedDeleted = prev.deletedTransactions.filter(t => t.id !== id);
      const updatedTransactions = [transactionToRestore, ...prev.transactions];
      const updatedAccounts = recalculateBalances(updatedTransactions, prev.accounts);
      return { ...prev, transactions: updatedTransactions, deletedTransactions: updatedDeleted, accounts: updatedAccounts };
    });
  }, []);

  const emptyTrash = useCallback(() => {
    setState(prev => ({ ...prev, deletedTransactions: [] }));
  }, []);

  const permanentlyDeleteTransaction = useCallback((id: string) => {
    setState(prev => ({ ...prev, deletedTransactions: prev.deletedTransactions.filter(t => t.id !== id) }));
  }, []);

  const addLabel = useCallback((name: string) => setState(prev => ({ ...prev, labels: [...prev.labels, { id: generateId(), name, createdAt: new Date().toISOString() }] })), []);
  const deleteLabel = useCallback((id: string) => setState(prev => ({ ...prev, labels: prev.labels.filter(l => l.id !== id) })), []);
  const updateLabel = useCallback((id: string, name: string) => setState(prev => ({ ...prev, labels: prev.labels.map(l => l.id === id ? { ...l, name } : l) })), []);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const id = generateId();
    setState(prev => {
      const initTransaction: Transaction = { id: generateId(), date: new Date().toISOString(), amount: account.balanceStart, type: 'Income', categoryId: 'cat-13', accountId: id, note: `Số dư đầu: ${account.name}`, labels: [], status: 'Reconciled' };
      const updatedAccounts = [...prev.accounts, { ...account, id, balanceNew: account.balanceStart }];
      const updatedTransactions = [initTransaction, ...prev.transactions];
      return { ...prev, accounts: recalculateBalances(updatedTransactions, updatedAccounts), transactions: updatedTransactions };
    });
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => setState(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === id ? { ...a, ...updates } : a) })), []);
  const deleteAccount = useCallback((id: string) => setState(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) })), []);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => setState(prev => ({ ...prev, categories: [...prev.categories, { ...cat, id: generateId() }] })), []);
  const updateCategory = useCallback((id: string, updates: Partial<Category>) => setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c) })), []);
  const deleteCategory = useCallback((id: string) => setState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) })), []);

  const addAccountGroup = useCallback((g: Omit<AccountGroup, 'id'>) => setState(prev => ({ ...prev, accountGroups: [...prev.accountGroups, { ...g, id: generateId() }] })), []);
  const updateAccountGroup = useCallback((id: string, u: Partial<AccountGroup>) => setState(prev => ({ ...prev, accountGroups: prev.accountGroups.map(g => g.id === id ? { ...g, ...u } : g) })), []);
  const deleteAccountGroup = useCallback((id: string) => setState(prev => ({ ...prev, accountGroups: prev.accountGroups.filter(g => g.id !== id) })), []);

  const addCategoryGroup = useCallback((g: Omit<CategoryGroup, 'id'>) => setState(prev => ({ ...prev, categoryGroups: [...prev.categoryGroups, { ...g, id: generateId() }] })), []);
  const updateCategoryGroup = useCallback((id: string, u: Partial<CategoryGroup>) => setState(prev => ({ ...prev, categoryGroups: prev.categoryGroups.map(g => g.id === id ? { ...g, ...u } : g) })), []);
  const deleteCategoryGroup = useCallback((id: string) => setState(prev => ({ ...prev, categoryGroups: prev.categoryGroups.filter(g => g.id !== id) })), []);

  return {
    ...state,
    updateSettings,
    resetTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    emptyTrash,
    permanentlyDeleteTransaction,
    addLabel,
    deleteLabel,
    updateLabel,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccountGroup,
    updateAccountGroup,
    deleteAccountGroup,
    addCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
  };
};
