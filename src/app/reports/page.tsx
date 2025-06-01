'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTransactions } from '../hooks/useTransactions';
import { IncomeExpenseChart } from '../components/reports/IncomeExpenseChart';
import { CategoryPieChart } from '../components/reports/CategoryPieChart';
import { MonthlyTrendChart } from '../components/reports/MonthlyTrendChart';
import { ReportsSummary } from '../components/reports/ReportsSummary';
import { CATEGORY_LABELS } from '../types/transaction';

export default function ReportsPage() {
  const { transactions, getStatistics } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  
  // 期間の計算
  const period = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (selectedPeriod) {
      case 'current-month':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0),
          label: `${currentYear}年${currentMonth + 1}月`,
        };
      case 'last-month':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0),
          label: `${currentYear}年${currentMonth}月`,
        };
      case 'current-year':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31),
          label: `${currentYear}年`,
        };
      case 'last-year':
        return {
          start: new Date(currentYear - 1, 0, 1),
          end: new Date(currentYear - 1, 11, 31),
          label: `${currentYear - 1}年`,
        };
      default:
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0),
          label: `${currentYear}年${currentMonth + 1}月`,
        };
    }
  }, [selectedPeriod]);

  // 期間内の取引をフィルタ
  const filteredTransactions = useMemo(() => {
    const startDate = period.start.toISOString().split('T')[0];
    const endDate = period.end.toISOString().split('T')[0];
    
    return transactions.filter(transaction => 
      transaction.date >= startDate && transaction.date <= endDate
    );
  }, [transactions, period]);

  // 統計データの計算
  const statistics = useMemo(() => {
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
  }, [filteredTransactions]);

  // カテゴリ別データの計算
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = CATEGORY_LABELS[transaction.category];
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // 月次トレンドデータの計算（過去12ヶ月）
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const monthlyData = [];

    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthTransactions = transactions.filter(t => 
        t.date.startsWith(monthStr)
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: month.toLocaleDateString('ja-JP', { month: 'short' }),
        income,
        expense,
        balance: income - expense,
      });
    }

    return monthlyData;
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                レポート・分析
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                ホーム
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* メインタイトル */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            収支レポート
          </h2>
          
          {/* 期間選択 */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'current-month', label: '今月' },
              { value: 'last-month', label: '先月' },
              { value: 'current-year', label: '今年' },
              { value: 'last-year', label: '昨年' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            期間: {period.label}
          </p>
        </div>

        {/* サマリー */}
        <ReportsSummary statistics={statistics} />

        {/* チャート */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 収入・支出比較 */}
          <IncomeExpenseChart 
            income={statistics.income}
            expense={statistics.expense}
          />

          {/* カテゴリ別支出 */}
          <CategoryPieChart data={categoryData} />
        </div>

        {/* 月次トレンド */}
        <MonthlyTrendChart data={monthlyTrendData} />
      </div>
    </div>
  );
} 