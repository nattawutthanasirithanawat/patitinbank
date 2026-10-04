import React from 'react';
import { User } from 'firebase/auth';
import {
  Bell,
  RefreshCw,
  Plus,
  Sparkles,
  CalendarCheck,
  CloudSun,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { formatThaiDate, getTodayStr } from '../constants/calendar';

interface Props {
  user: User | null;
  isLoggingIn: boolean;
  onLoginOrSync: () => void;
  onOpenNewEvent: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  isRefreshingGoogle: boolean;
  onOpenCategoryModal: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  isLoggingIn,
  onLoginOrSync,
  onOpenNewEvent,
  onOpenNotifications,
  unreadNotificationsCount,
  isRefreshingGoogle,
  onOpenCategoryModal,
}) => {
  const todayFormatted = formatThaiDate(getTodayStr());
  const permanentEmail = '465125@wsk.ac.th';
  const displayName = user?.displayName || 'แบงค์ (อ้วน ๆ)';
  const displayEmail = user?.email || permanentEmail;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-400/30 transform group-hover:scale-105 transition-all">
                <CloudSun className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[10px]">
                ✨
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ปฏิทินงานของอ้วน ๆ
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  Bank's Work System
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>วันนี้: {todayFormatted}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Manage Categories Button */}
            <button
              onClick={onOpenCategoryModal}
              title="จัดการหมวดหมู่งาน"
              className="inline-flex items-center gap-1 px-2.5 py-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-sky-50 rounded-2xl transition-all cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden md:inline">หมวดหมู่งาน</span>
            </button>

            {/* Permanent Google Calendar Account Badge */}
            <div
              onClick={onLoginOrSync}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-50 to-blue-50/80 border border-sky-200 rounded-2xl p-1.5 pr-3 shadow-2xs hover:border-sky-300 transition-all cursor-pointer group"
              title="เชื่อมต่อกับ Google Calendar: 465125@wsk.ac.th ถาวร (คลิกเพื่อรีเฟรชข้อมูล)"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-sky-300 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs ring-2 ring-sky-200">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
              )}

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {displayName}
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block animate-pulse" />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-sky-700 font-semibold truncate max-w-[125px]">
                    {displayEmail}
                  </span>
                  <span className="text-[9px] bg-sky-200/80 text-sky-800 px-1 py-0.2 rounded font-bold">
                    ถาวร
                  </span>
                </div>
              </div>

              <div className="pl-1 border-l border-sky-200">
                <RefreshCw
                  className={`w-3.5 h-3.5 text-sky-600 group-hover:rotate-180 transition-transform ${
                    isRefreshingGoogle || isLoggingIn ? 'animate-spin' : ''
                  }`}
                />
              </div>
            </div>

            {/* New Task Button */}
            <button
              onClick={onOpenNewEvent}
              className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-sky-300/40 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">เพิ่มงานใหม่</span>
              <span className="sm:hidden">เพิ่มงาน</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title="ศูนย์แจ้งเตือน"
            >
              <Bell className="w-4 h-4 text-sky-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
