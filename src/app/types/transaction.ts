export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  // 収入カテゴリー
  | 'salary' // 給与
  | 'bonus' // ボーナス
  | 'freelance' // フリーランス
  | 'investment' // 投資
  | 'gift' // 贈り物
  | 'other_income' // その他収入
  // 支出カテゴリー
  | 'food' // 食費
  | 'transport' // 交通費
  | 'housing' // 住居費
  | 'utilities' // 光熱費
  | 'entertainment' // 娯楽
  | 'healthcare' // 医療費
  | 'education' // 教育費
  | 'shopping' // 買い物
  | 'other_expense'; // その他支出

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string; // YYYY-MM-DD format
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description?: string;
  date: string;
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  // 収入
  salary: '給与',
  bonus: 'ボーナス',
  freelance: 'フリーランス',
  investment: '投資',
  gift: '贈り物',
  other_income: 'その他収入',
  // 支出
  food: '食費',
  transport: '交通費',
  housing: '住居費',
  utilities: '光熱費',
  entertainment: '娯楽',
  healthcare: '医療費',
  education: '教育費',
  shopping: '買い物',
  other_expense: 'その他支出',
};

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'salary',
  'bonus',
  'freelance',
  'investment',
  'gift',
  'other_income',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'housing',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'other_expense',
];

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  // 収入アイコン
  salary: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  bonus: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  freelance: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  investment: 'M7 11l5-5m0 0l5 5m-5-5v12',
  gift: 'M12 8v4.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12h2.5c.83 0 1.5-.67 1.5-1.5S18.33 9 17.5 9H15V8.5c0-.83-.67-1.5-1.5-1.5S12 7.67 12 8.5V8z',
  other_income: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  // 支出アイコン
  food: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4',
  transport: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM4 7h12v2l2 7H2l2-7V7z',
  housing: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
  utilities: 'M13 10V3L4 14h7v7l9-11h-7z',
  entertainment: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  healthcare: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  education: 'M12 14l9-5-9-5-9 5 9 5z',
  shopping: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  other_expense: 'M17 13l-5 5m0 0l-5-5m5 5V6',
};
