import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';
import { CalendarEvent, TaskCategoryConfig } from '../types/calendar';
import { THAI_DAYS_SHORT, THAI_MONTHS } from '../constants/calendar';

interface Props {
  currentYear: number;
  currentMonth: number; // 0-indexed (0 = ม.ค., 11 = ธ.ค.)
  selectedDate: string; // YYYY-MM-DD
  events: CalendarEvent[];
  categories: TaskCategoryConfig[];
  onSelectDate: (dateStr: string) => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onToday: () => void;
  onOpenNewEventWithDate: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  activeCategoryFilter: string;
  onCategoryFilterChange: (catId: string) => void;
  onOpenCategoryModal: () => void;
}

export const CalendarMonth: React.FC<Props> = ({
  currentYear,
  currentMonth,
  selectedDate,
  events,
  categories,
  onSelectDate,
  onNextMonth,
  onPrevMonth,
  onToday,
  onOpenNewEventWithDate,
  onSelectEvent,
  activeCategoryFilter,
  onCategoryFilterChange,
  onOpenCategoryModal,
}) => {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const getCatConfig = (catId: string): TaskCategoryConfig => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        label: catId,
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
        badgeText: 'text-sky-800',
        borderColor: 'border-l-sky-500',
        colorHex: '#0284c7',
      }
    );
  };

  const filteredEvents = events.filter((e) => {
    if (activeCategoryFilter === 'all') return true;
    return e.category === activeCategoryFilter;
  });

  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  interface DayCell {
    dayNum: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  const cells: DayCell[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayIso,
      isSelected: dateStr === selectedDate,
    });
  }

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayIso,
      isSelected: dateStr === selectedDate,
    });
  }

  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= (remainingCells <= 7 ? remainingCells : remainingCells - 7); d++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayIso,
      isSelected: dateStr === selectedDate,
    });
  }

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md shadow-sky-100/50 overflow-hidden flex flex-col">
      {/* Month Navigation & Filters Header */}
      <div className="p-4 sm:p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50/60 via-blue-50/40 to-white">
        <div className="flex flex-col gap-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-2xl border border-sky-200/80 p-1 shadow-xs">
                <button
                  onClick={onPrevMonth}
                  title="เดือนก่อนหน้า"
                  className="w-8 h-8 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onToday}
                  className="px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                >
                  วันนี้
                </button>
                <button
                  onClick={onNextMonth}
                  title="เดือนถัดไป"
                  className="w-8 h-8 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>{THAI_MONTHS[currentMonth]}</span>
                <span className="text-sky-600 font-semibold">{currentYear + 543}</span>
              </h2>
            </div>

            <button
              onClick={onOpenCategoryModal}
              className="text-xs text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มหมวดหมู่งานเอง
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => onCategoryFilterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ทั้งหมด ({events.length})
            </button>

            {categories.map((cat) => {
              const count = events.filter((e) => e.category === cat.id).length;
              const isSelected = activeCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryFilterChange(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-xs font-bold'
                      : `${cat.badgeBg} hover:opacity-90`
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-sky-100 bg-sky-50/40 text-center text-xs font-bold text-slate-500 py-2.5">
        {THAI_DAYS_SHORT.map((dayName, idx) => (
          <div
            key={dayName}
            className={`${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : ''}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-sky-100/80 bg-slate-50/20">
        {cells.map((cell) => {
          const dayEvents = getEventsForDate(cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition-all flex flex-col justify-between group cursor-pointer relative ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/60 text-slate-400'
                  : cell.isSelected
                  ? 'bg-sky-50/80 ring-2 ring-inset ring-sky-400'
                  : 'bg-white hover:bg-sky-50/30'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    cell.isToday
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-300 ring-2 ring-white'
                      : cell.isSelected
                      ? 'bg-sky-100 text-sky-800 font-black'
                      : cell.isCurrentMonth
                      ? 'text-slate-700 group-hover:text-sky-600'
                      : 'text-slate-300'
                  }`}
                >
                  {cell.dayNum}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNewEventWithDate(cell.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition-all cursor-pointer"
                  title="เพิ่มงานในวันนี้"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Event Badges List */}
              <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const cfg = getCatConfig(event.category);

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-lg border leading-tight truncate flex items-center gap-1 font-medium transition-all hover:scale-[1.02] shadow-2xs ${
                        event.isCompleted
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                          : `${cfg.badgeBg}`
                      }`}
                    >
                      {event.isGoogleSynced && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" title="Google Calendar" />
                      )}
                      {event.isCompleted ? (
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.colorHex }} />
                      )}
                      <span className="truncate">
                        {event.startTime && !event.isAllDay ? `${event.startTime} ` : ''}
                        {event.title}
                      </span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-sky-600 font-bold px-1">
                    +{dayEvents.length - 3} งานอื่น
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
