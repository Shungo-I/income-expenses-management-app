'use client';

import { useState, useMemo, FC } from 'react';
import { Transaction } from '../types/transaction';

type CalendarDay = {
  /** 日付の数値 */
  date: number;
  /** 現在表示中の月の日付かどうか */
  isCurrentMonth: boolean;
  /** 今日の日付かどうか */
  isToday: boolean;
  /** 選択されている日付かどうか */
  isSelected: boolean;
  /** その日に取引があるかどうか */
  hasTransactions: boolean;
};

type CalendarProps = {
  /** 選択されている日付（YYYY-MM-DD形式、nullの場合は未選択） */
  selectedDate?: string | null;
  /** 日付選択時のコールバック関数 */
  onDateSelect?: (date: string | null) => void;
  /** 表示する取引データの配列 */
  transactions?: Transaction[];
};

const MONTH_NAMES = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
] as const;

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const Calendar: FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  transactions = [],
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 日付文字列をDateオブジェクトに変換
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: CalendarDay[] = [];

    // 前月の日付
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`;
      const hasTransactions = transactions.some(t => t.date === dateStr);

      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasTransactions,
      });
    }

    // 当月の日付
    for (let date = 1; date <= daysInMonth; date++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const hasTransactions = transactions.some(t => t.date === dateStr);

      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === date;
      const isSelected =
        selectedDateObj?.getFullYear() === currentYear &&
        selectedDateObj?.getMonth() === currentMonth &&
        selectedDateObj?.getDate() === date;

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        hasTransactions,
      });
    }

    // 翌月の日付
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      const dateStr = `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const hasTransactions = transactions.some(t => t.date === dateStr);

      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasTransactions,
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDateObj, transactions]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const selectDate = (day: CalendarDay) => {
    if (day.isCurrentMonth && onDateSelect) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
      // 同じ日付がクリックされた場合は選択解除
      if (selectedDate === dateStr) {
        onDateSelect(null);
      } else {
        onDateSelect(dateStr);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentYear}年 {MONTH_NAMES[currentMonth]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEK_DAYS.map(day => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => selectDate(day)}
            className={`
              h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200 relative
              ${
                day.isCurrentMonth
                  ? 'text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }
              ${
                day.isToday
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold'
                  : ''
              }
              ${
                day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
              }
            `}
            disabled={!day.isCurrentMonth}
          >
            {day.date}
            {/* 取引がある日に小さな点を表示 */}
            {day.hasTransactions && day.isCurrentMonth && !day.isSelected && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* 選択された日付の表示 */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            選択された日付: {new Date(selectedDate).getFullYear()}年
            {new Date(selectedDate).getMonth() + 1}月
            {new Date(selectedDate).getDate()}日
          </p>
          <button
            onClick={() => onDateSelect && onDateSelect(null)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block mx-auto"
          >
            選択を解除
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
