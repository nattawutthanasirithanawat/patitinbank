import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CalendarEvent } from '../types/calendar';

interface Props {
  isOpen: boolean;
  event: CalendarEvent | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  event,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-rose-100 overflow-hidden animate-scale-up">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">
          ยืนยันการลบกิจกรรมงานนี้?
        </h3>

        <div className="mt-2.5 p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/60">
          <p className="text-sm font-semibold text-rose-950 truncate">
            {event.title}
          </p>
          <p className="text-xs text-rose-700 mt-1">
            วันที่: {event.date} {event.startTime ? `เวลา ${event.startTime} น.` : '(ทั้งวัน)'}
          </p>
          {event.isGoogleSynced && (
            <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
              ⚠️ กิจกรรมนี้เชื่อมต่อกับ Google Calendar อยู่ และจะถูกลบออกจาก Google Calendar ด้วย
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-3">
          การดำเนินการนี้จะไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่ว่าต้องการนำกิจกรรมนี้ออกจากปฏิทิน?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-300/40 transition-all disabled:opacity-50 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบกิจกรรม'}
          </button>
        </div>
      </div>
    </div>
  );
};
