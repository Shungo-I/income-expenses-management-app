'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type CategoryPieChartProps = {
  /** カテゴリ別支出データの配列 */
  data: Array<{
    /** カテゴリ名（日本語ラベル） */
    name: string;
    /** そのカテゴリの支出金額（円単位） */
    value: number;
  }>;
};

// カテゴリ用のカラーパレット
const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
  '#f97316', // orange-500
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // パーセンテージを計算
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : '0',
  }));

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            金額: {formatAmount(data.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            割合: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // カスタムラベル
  const renderLabel = (entry: any) => {
    if (parseFloat(entry.percentage) < 5) return ''; // 5%未満は表示しない
    return `${entry.percentage}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        カテゴリ別支出
      </h3>
      
      {data.length === 0 || totalAmount === 0 ? (
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              支出データがありません
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithPercentage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* カテゴリリスト */}
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内訳
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {dataWithPercentage.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {formatAmount(item.value)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 