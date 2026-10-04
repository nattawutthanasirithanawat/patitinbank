import React from 'react';
import { Bell, X, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types/calendar';

interface ToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onOpenNotificationCenter: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({
  notifications,
  onDismiss,
  onOpenNotificationCenter,
}) => {
  // Show the latest unread toast
  const activeToast = notifications[0];

  if (!activeToast) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-bounce-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-sky-500/15 border-2 border-sky-300 p-4 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400" />
        
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-300/50">
            {activeToast.type === 'sync' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                แจ้งเตือนงาน
              </span>
              <span className="text-[11px] text-slate-400">
                เมื่อสักครู่
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-1 truncate">
              {activeToast.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {activeToast.message}
            </p>

            <button
              onClick={onOpenNotificationCenter}
              className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-800 underline underline-offset-2 flex items-center gap-1"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              เปิดศูนย์แจ้งเตือน
            </button>
          </div>

          <button
            onClick={() => onDismiss(activeToast.id)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
