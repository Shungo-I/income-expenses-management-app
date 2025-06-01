'use client';

import { useState, useMemo, FC } from 'react';

type CalendarDay = {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
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

const Calendar: FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: CalendarDay[] = [];

    // 前月の日付
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // 当月の日付
    for (let date = 1; date <= daysInMonth; date++) {
      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === date;
      const isSelected =
        selectedDate?.getFullYear() === currentYear &&
        selectedDate?.getMonth() === currentMonth &&
        selectedDate?.getDate() === date;

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    // 翌月の日付
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const selectDate = (day: CalendarDay) => {
    if (day.isCurrentMonth) {
      setSelectedDate(new Date(currentYear, currentMonth, day.date));
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
              h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200
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
          </button>
        ))}
      </div>

      {/* 選択された日付の表示 */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            選択された日付: {selectedDate.getFullYear()}年
            {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          </p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
