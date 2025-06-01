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
  description: string;
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
