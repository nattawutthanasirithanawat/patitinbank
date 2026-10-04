import React from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, Github } from 'lucide-react';
import { CalendarEvent, TaskCategoryConfig } from '../types/calendar';
import { THAI_DAYS, THAI_MONTHS } from '../constants/calendar';

interface Props {
  currentDate: string; // YYYY-MM-DD
  events: CalendarEvent[];
  categories: TaskCategoryConfig[];
  onSelectDate: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenNewEventWithDate: (dateStr: string) => void;
}

export const CalendarWeek: React.FC<Props> = ({
  currentDate,
  events,
  categories,
  onSelectDate,
  onSelectEvent,
  onOpenNewEventWithDate,
}) => {
  const baseDate = new Date(currentDate);
  const currentDayOfWeek = baseDate.getDay(); // 0 is Sunday

  // Compute start of week (Sunday)
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - currentDayOfWeek);

  const days: { dateStr: string; dayNum: number; monthName: string; dayName: string; isToday: boolean }[] = [];
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNum: d.getDate(),
      monthName: THAI_MONTHS[d.getMonth()],
      dayName: THAI_DAYS[i],
      isToday: dateStr === todayIso,
    });
  }

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

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md shadow-sky-100/50 overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-sky-100 min-h-[500px]">
        {days.map((day) => {
          const dayEvents = events
            .filter((e) => e.date === day.dateStr)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

          const isSelected = day.dateStr === currentDate;

          return (
            <div
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`p-3 flex flex-col transition-all cursor-pointer group ${
                isSelected ? 'bg-sky-50/70' : 'hover:bg-sky-50/20'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-sky-100/70 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    {day.dayName}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                        day.isToday
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-300'
                          : 'text-slate-800'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {day.monthName.slice(0, 4)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNewEventWithDate(day.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition-all cursor-pointer"
                  title="เพิ่มงานในวันนี้"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day's Events */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <p className="text-[11px] text-slate-300 text-center py-6">
                    - ไม่มีงาน -
                  </p>
                ) : (
                  dayEvents.map((event) => {
                    const cfg = getCatConfig(event.category);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className={`p-2 rounded-xl border text-xs transition-all hover:scale-[1.02] shadow-2xs ${
                          event.isCompleted
                            ? 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                            : `${cfg.badgeBg} hover:shadow-xs`
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-80 mb-0.5">
                          <span className="font-semibold flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {event.isAllDay ? 'ทั้งวัน' : event.startTime || '--:--'}
                          </span>
                          <div className="flex items-center gap-1">
                            {event.isGithubSynced && (
                              <Github className="w-2.5 h-2.5 text-slate-800" />
                            )}
                            {event.isGoogleSynced && (
                              <span className="text-[9px] font-bold text-blue-600 bg-white/80 px-1 rounded">
                                G
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="font-bold truncate leading-tight">
                          {event.title}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
