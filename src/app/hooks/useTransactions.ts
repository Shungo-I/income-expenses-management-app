'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  TransactionFormData,
} from '../types/transaction';

const STORAGE_KEY = 'income-expense-transactions';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem(STORAGE_KEY);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Failed to load transactions from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ローカルストレージにデータを保存
  const saveToLocalStorage = useCallback((data: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save transactions to localStorage:', error);
    }
  }, []);

  // IDを生成
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  // 取引を追加
  const addTransaction = useCallback(
    (formData: TransactionFormData) => {
      const now = new Date().toISOString();
      const newTransaction: Transaction = {
        id: generateId(),
        ...formData,
        description: formData.description || '',
        createdAt: now,
        updatedAt: now,
      };

      setTransactions(prev => {
        const updated = [...prev, newTransaction];
        saveToLocalStorage(updated);
        return updated;
      });

      return newTransaction;
    },
    [generateId, saveToLocalStorage]
  );

  // 取引を更新
  const updateTransaction = useCallback(
    (id: string, formData: TransactionFormData) => {
      setTransactions(prev => {
        const updated = prev.map(transaction =>
          transaction.id === id
            ? {
                ...transaction,
                ...formData,
                description: formData.description || '',
                updatedAt: new Date().toISOString(),
              }
            : transaction
        );
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // 取引を削除
  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions(prev => {
        const updated = prev.filter(transaction => transaction.id !== id);
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // 特定の日付の取引を取得
  const getTransactionsByDate = useCallback(
    (date: string) => {
      return transactions.filter(transaction => transaction.date === date);
    },
    [transactions]
  );

  // 特定の月の取引を取得
  const getTransactionsByMonth = useCallback(
    (year: number, month: number) => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

      return transactions.filter(
        transaction =>
          transaction.date >= startDate && transaction.date <= endDate
      );
    },
    [transactions]
  );

  // 統計情報を計算
  const getStatistics = useCallback(
    (year?: number, month?: number) => {
      let filteredTransactions = transactions;

      if (year !== undefined && month !== undefined) {
        filteredTransactions = getTransactionsByMonth(year, month);
      }

      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expense,
        balance: income - expense,
        totalTransactions: filteredTransactions.length,
      };
    },
    [transactions, getTransactionsByMonth]
  );

  // 特定のIDの取引を取得
  const getTransactionById = useCallback(
    (id: string) => {
      return transactions.find(transaction => transaction.id === id);
    },
    [transactions]
  );

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDate,
    getTransactionsByMonth,
    getStatistics,
    getTransactionById,
  };
};
