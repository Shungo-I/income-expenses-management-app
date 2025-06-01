'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type MonthlyTrendChartProps = {
  /** 月次トレンドデータの配列（過去12ヶ月分） */
  data: Array<{
    /** 月の表示名（例：'2024年1月'） */
    month: string;
    /** その月の収入合計金額（円単位） */
    income: number;
    /** その月の支出合計金額（円単位） */
    expense: number;
    /** その月の収支バランス（収入 - 支出、円単位） */
    balance: number;
  }>;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.dataKey === 'income' && '収入: '}
              {entry.dataKey === 'expense' && '支出: '}
              {entry.dataKey === 'balance' && '収支: '}
              {formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // データが空の場合
  const hasData = data.some(item => item.income > 0 || item.expense > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        月次トレンド（過去12ヶ月）
      </h3>
      
      {!hasData ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-500 dark:text-gray-400">
              トレンドデータがありません
            </p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tickFormatter={formatAmount}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="収入"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="支出"
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
                name="収支"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* 統計サマリー */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
            平均収入
          </div>
          <div className="text-lg font-bold text-green-700 dark:text-green-300">
            {formatAmount(data.reduce((sum, item) => sum + item.income, 0) / data.length)}
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
            平均支出
          </div>
          <div className="text-lg font-bold text-red-700 dark:text-red-300">
            {formatAmount(data.reduce((sum, item) => sum + item.expense, 0) / data.length)}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
            平均収支
          </div>
          <div className={`text-lg font-bold ${
            data.reduce((sum, item) => sum + item.balance, 0) / data.length >= 0
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {formatAmount(data.reduce((sum, item) => sum + item.balance, 0) / data.length)}
          </div>
        </div>
      </div>
    </div>
  );
}; 