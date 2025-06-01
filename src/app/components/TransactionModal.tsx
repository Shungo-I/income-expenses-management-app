'use client';

import { useState, useEffect, useCallback, FC, FormEvent, MouseEvent } from 'react';
import {
  Transaction,
  TransactionFormData,
  TransactionType,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../types/transaction';

type TransactionModalProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じる時のコールバック関数 */
  onClose: () => void;
  /** フォーム送信時のコールバック関数 */
  onSubmit: (data: TransactionFormData) => void;
  /** 編集対象の取引データ（新規作成時はnull） */
  transaction?: Transaction | null;
  /** デフォルトの取引タイプ（デフォルト: 'income'） */
  defaultType?: TransactionType;
  /** デフォルトの日付（YYYY-MM-DD形式） */
  defaultDate?: string;
};

export const TransactionModal: FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  defaultType = 'income',
  defaultDate,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: defaultType,
    amount: 0,
    category: defaultType === 'income' ? 'salary' : 'food',
    description: undefined,
    date: defaultDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Partial<TransactionFormData>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // モーダルが開いたときにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // 編集モード
        setFormData({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
        });
      } else {
        // 新規作成モード
        setFormData({
          type: defaultType,
          amount: 0,
          category: defaultType === 'income' ? 'salary' : 'food',
          description: undefined,
          date: defaultDate || new Date().toISOString().split('T')[0],
        });
      }
      setErrors({});
      setIsDropdownOpen(false);
    }
  }, [isOpen, transaction, defaultType, defaultDate]);

  // エスケープキーでドロップダウンを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDropdownOpen]);

  // フォームの検証
  const validateForm = useCallback(() => {
    const newErrors: Partial<TransactionFormData> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 0;
    }

    if (!formData.date) {
      newErrors.date = '';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // フォーム送信
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  // タイプが変更されたときにカテゴリーをリセット
  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'income' ? 'salary' : 'food',
    }));
  };

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ドロップダウン外をクリックした時にドロップダウンを閉じる
  const handleModalClick = () => {
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  const availableCategories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={handleModalClick}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {transaction ? '取引を編集' : '新しい取引を追加'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 取引タイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                取引タイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${
                    formData.type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  収入
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  支出
                </button>
              </div>
            </div>

            {/* 金額 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                金額 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
              </div>
              {errors.amount !== undefined && (
                <p className="text-red-500 text-sm mt-1">
                  有効な金額を入力してください
                </p>
              )}
            </div>

            {/* カテゴリー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={CATEGORY_ICONS[formData.category]}
                      />
                    </svg>
                    <span>{CATEGORY_LABELS[formData.category]}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category }));
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-3 transition-colors cursor-pointer ${
                          formData.category === category
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={CATEGORY_ICONS[category]}
                          />
                        </svg>
                        <span>{CATEGORY_LABELS[category]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                説明 <span className="text-gray-400 text-sm">(任意)</span>
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="取引の詳細を入力..."
              />
            </div>

            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e =>
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              {errors.date !== undefined && (
                <p className="text-red-500 text-sm mt-1">
                  日付を選択してください
                </p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`flex-1 py-2 px-4 text-white rounded-lg font-medium transition-colors cursor-pointer ${
                  formData.type === 'income'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {transaction ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
