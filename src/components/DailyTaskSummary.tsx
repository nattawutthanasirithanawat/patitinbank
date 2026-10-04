import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  Smile,
  Github
} from 'lucide-react';
import { CalendarEvent, TaskCategoryConfig } from '../types/calendar';
import { formatThaiDate, getTodayStr } from '../constants/calendar';
import { soundPlayer } from '../services/sound';

interface Props {
  selectedDate: string;
  events: CalendarEvent[];
  categories: TaskCategoryConfig[];
  onToggleComplete: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onOpenNewEventWithDate: (dateStr: string) => void;
  onQuickAddTask: (title: string, dateStr: string) => Promise<void>;
  onSelectToday: () => void;
}

export const DailyTaskSummary: React.FC<Props> = ({
  selectedDate,
  events,
  categories,
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onOpenNewEventWithDate,
  onQuickAddTask,
  onSelectToday,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  const todayStr = getTodayStr();
  const isToday = selectedDate === todayStr;

  const dayEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => {
      // Incomplete first, then by time
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      if (a.isAllDay) return -1;
      if (b.isAllDay) return 1;
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
    });

  const totalTasks = dayEvents.length;
  const completedTasks = dayEvents.filter((e) => e.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setIsSubmittingQuick(true);
    try {
      await onQuickAddTask(quickTitle.trim(), selectedDate);
      setQuickTitle('');
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const handleToggle = (event: CalendarEvent) => {
    if (!event.isCompleted) {
      soundPlayer.playSuccessSound();
    }
    onToggleComplete(event);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md shadow-sky-100/50 p-5 flex flex-col h-full">
      {/* Date Header */}
      <div className="flex items-start justify-between pb-4 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {isToday ? 'วันนี้' : 'กำหนดการ'}
            </span>
            {!isToday && (
              <button
                onClick={onSelectToday}
                className="text-xs text-slate-500 hover:text-sky-600 underline font-medium cursor-pointer"
              >
                กลับมาดูวันนี้
              </button>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-800 mt-1">
            {formatThaiDate(selectedDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenNewEventWithDate(selectedDate)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs shadow-sky-300 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มงาน</span>
        </button>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50/70 border border-sky-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              ความคืบหน้าของอ้วน ๆ วันนี้
            </span>
            <span className="font-bold text-sky-700">
              {completedTasks}/{totalTasks} งาน ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-sky-100 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <p className="text-[11px] text-sky-700 font-semibold mt-1.5 flex items-center gap-1">
              🎉 ยอดเยี่ยมมาก! เคลียร์งานของวันนี้ครบทั้งหมดแล้ว
            </p>
          )}
        </div>
      )}

      {/* Quick Add Inline Input */}
      <form onSubmit={handleQuickSubmit} className="mt-2 mb-4">
        <div className="relative">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="พิมพ์ชื่องานด่วน แล้วกด Enter..."
            disabled={isSubmittingQuick}
            className="w-full pl-3.5 pr-20 py-2 text-xs bg-sky-50/50 hover:bg-white focus:bg-white rounded-xl border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isSubmittingQuick || !quickTitle.trim()}
            className="absolute right-1.5 top-1 bottom-1 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
          >
            {isSubmittingQuick ? '...' : '+ เพิ่ม'}
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {dayEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-3xl bg-sky-100/70 text-sky-500 flex items-center justify-center mx-auto mb-3">
              <Smile className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">ไม่มีตารางงานในวันนี้</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
              วันว่าง ๆ ของอ้วน ๆ หรือคลิกปุ่มด้านบนเพื่อเพิ่มงานใหม่
            </p>
          </div>
        ) : (
          dayEvents.map((event) => {
            const cfg = getCatConfig(event.category);

            return (
              <div
                key={event.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 group flex items-start gap-3 ${
                  event.isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-70'
                    : 'bg-white hover:bg-sky-50/40 border-sky-100 hover:border-sky-300 shadow-xs'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(event)}
                  className="mt-0.5 text-slate-400 hover:text-sky-600 transition-colors shrink-0 cursor-pointer"
                  title={event.isCompleted ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                >
                  {event.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-sky-500" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.badgeBg}`}
                    >
                      {cfg.label}
                    </span>

                    {/* Time */}
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {event.isAllDay
                        ? 'ทั้งวัน'
                        : `${event.startTime || '--:--'} - ${event.endTime || '--:--'}`}
                    </span>

                    {/* Google Sync Badge */}
                    {event.isGoogleSynced && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1" title="เชื่อมต่อกับ Google Calendar">
                        <span>G-Cal</span>
                      </span>
                    )}

                    {/* GitHub Sync Badge */}
                    {event.isGithubSynced && (
                      <span className="text-[10px] text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        <Github className="w-2.5 h-2.5" />
                        <span>GitHub</span>
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-sm font-bold mt-1.5 break-words ${
                      event.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {event.title}
                  </h4>

                  {event.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {event.githubUrl && (
                    <a
                      href={event.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:text-sky-800 underline mt-1 inline-flex items-center gap-1 font-medium"
                    >
                      <span>เปิดดูใน GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {event.location && !event.githubUrl && (
                    <p className="text-xs text-sky-600 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{event.location}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditEvent(event)}
                    title="แก้ไขงาน"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteEvent(event)}
                    title="ลบงาน"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
