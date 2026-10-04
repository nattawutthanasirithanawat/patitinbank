import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  AlignLeft,
  MapPin,
  Bell,
  CheckCircle2,
  CalendarPlus,
  Loader2,
  Plus
} from 'lucide-react';
import { CalendarEvent, TaskCategoryConfig } from '../types/calendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  isGoogleAuthenticated: boolean;
  categories: TaskCategoryConfig[];
  onOpenCategoryModal: () => void;
}

export const EventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  defaultDate,
  isGoogleAuthenticated,
  categories,
  onOpenCategoryModal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<string>(categories[0]?.id || 'club');
  const [location, setLocation] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [syncToGoogle, setSyncToGoogle] = useState(isGoogleAuthenticated);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime || '09:00');
      setEndTime(initialEvent.endTime || '10:00');
      setIsAllDay(initialEvent.isAllDay);
      setCategory(initialEvent.category || categories[0]?.id || 'club');
      setLocation(initialEvent.location || '');
      setReminderMinutes(initialEvent.reminderMinutes ?? 15);
      setSyncToGoogle(!!initialEvent.googleCalendarEventId || isGoogleAuthenticated);
    } else {
      const todayIso = defaultDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDate(todayIso);
      setStartTime('10:00');
      setEndTime('11:00');
      setIsAllDay(false);
      setCategory(categories[0]?.id || 'club');
      setLocation('');
      setReminderMinutes(15);
      setSyncToGoogle(isGoogleAuthenticated);
    }
    setError(null);
  }, [initialEvent, defaultDate, isOpen, isGoogleAuthenticated, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่องานของอ้วน ๆ ก่อนบันทึกนะ');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        id: initialEvent?.id,
        title: title.trim(),
        description: description.trim(),
        date,
        startTime: isAllDay ? undefined : startTime,
        endTime: isAllDay ? undefined : endTime,
        isAllDay,
        category,
        location: location.trim(),
        reminderMinutes,
        isCompleted: initialEvent?.isCompleted ?? false,
        isGoogleSynced: syncToGoogle,
        googleCalendarEventId: initialEvent?.googleCalendarEventId,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8 animate-scale-up">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialEvent ? 'แก้ไขงานของอ้วน ๆ ✏️' : 'เพิ่มงานใหม่ของอ้วน ๆ 🌟'}
              </h3>
              <p className="text-xs text-sky-100">
                จัดตารางเวลาให้เป็นระเบียบ สดใส สบายใจ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่องาน / กิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ประชุมสโมสรฯ, เตรียมสอบวิชาหลัก, สอนน้อง..."
              className="w-full px-4 py-2.5 rounded-2xl bg-sky-50/50 border border-sky-200 focus:bg-white focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all text-sm font-medium placeholder:text-slate-400 outline-none"
              autoFocus
            />
          </div>

          {/* Category selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                หมวดหมู่งาน
              </label>
              <button
                type="button"
                onClick={onOpenCategoryModal}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-0.5 cursor-pointer underline"
              >
                <Plus className="w-3 h-3" />
                จัดการ / เพิ่มหมวดหมู่เอง
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? `${cat.badgeBg} ring-2 ring-sky-400 shadow-xs font-bold`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & All Day Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                required
              />
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="relative flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 border-slate-300"
                />
                กิจกรรมทั้งวัน (All Day)
              </label>
            </div>
          </div>

          {/* Time Picker (if not all-day) */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" />
                  เวลาเริ่ม
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" />
                  เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* Location / Meet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              สถานที่ หรือ ลิงก์ห้องประชุม
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ห้องสโมสรฯ, ห้องสอบ 402, Google Meet"
              className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
              รายละเอียดเพิ่มเติม / โน้ต
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="จดรายละเอียดงาน สิ่งที่ต้องเตรียม หรือข้อความเตือนความจำ..."
              className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
            />
          </div>

          {/* Reminder settings */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-sky-500" />
              การแจ้งเตือนในระบบ
            </label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
            >
              <option value={0}>แจ้งเตือนเมื่อถึงเวลาทันที</option>
              <option value={5}>เตือนล่วงหน้า 5 นาที</option>
              <option value={10}>เตือนล่วงหน้า 10 นาที</option>
              <option value={15}>เตือนล่วงหน้า 15 นาที</option>
              <option value={30}>เตือนล่วงหน้า 30 นาที</option>
              <option value={60}>เตือนล่วงหน้า 1 ชั่วโมง</option>
              <option value={1440}>เตือนล่วงหน้า 1 วัน</option>
            </select>
          </div>

          {/* Google Calendar Sync Option */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-sky-50 border border-blue-200/80">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToGoogle}
                onChange={(e) => setSyncToGoogle(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-slate-300 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  📅 ซิงค์บันทึกลง Google Calendar
                </span>
                <p className="text-slate-500 mt-0.5">
                  {isGoogleAuthenticated
                    ? 'งานนี้จะถูกเพิ่มและอัปเดตไปยังบัญชี Google Calendar ของคุณโดยตรง'
                    : 'เมื่อเข้าสู่ระบบด้วย Google งานจะซิงค์กับปฏิทิน Google ทันที'}
                </p>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl shadow-md shadow-sky-300/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  บันทึกกิจกรรม
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
