import React from 'react';
import {
  Bell,
  X,
  Trash2,
  Volume2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { AppNotification, CalendarEvent } from '../types/calendar';
import { soundPlayer } from '../services/sound';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearNotifications: () => void;
  onSendTestNotification: () => void;
  upcomingEvents: CalendarEvent[];
  onRequestBrowserNotification: () => void;
  browserNotificationStatus: NotificationPermission;
}

export const NotificationDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onSendTestNotification,
  upcomingEvents,
  onRequestBrowserNotification,
  browserNotificationStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-sky-100">
          
          {/* Header */}
          <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-300/40">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    ศูนย์แจ้งเตือนงาน 
                    <span className="text-xs bg-sky-500 text-white font-medium px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    แจ้งเตือนนัดหมายและกิจกรรมสำคัญของแบงค์
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action bar */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  soundPlayer.playNotificationChime();
                  onSendTestNotification();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-white border border-sky-200 rounded-xl hover:bg-sky-50 shadow-xs transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                ทดสอบส่งเสียง & แจ้งเตือน
              </button>

              {browserNotificationStatus !== 'granted' && (
                <button
                  onClick={onRequestBrowserNotification}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100/70 hover:bg-blue-200/70 rounded-xl transition-all"
                  title="เปิดการแจ้งเตือนจากบราวเซอร์"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  เปิดการแจ้งเตือนระบบ
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Upcoming Next Alert */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                กำหนดการที่กำลังจะมาถึง
              </h3>

              {upcomingEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-sky-50/60 border border-dashed border-sky-200 text-center text-xs text-sky-700">
                  ไม่มีงานที่ใกล้ถึงเวลาในขณะนี้ สามารถพักผ่อนได้สบายใจ! 🎈
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-xl bg-gradient-to-r from-sky-50/80 to-white border border-sky-200/80 hover:border-sky-300 transition-all flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                            {event.startTime ? `${event.startTime} น.` : 'ทั้งวัน'}
                          </span>
                          {event.isGoogleSynced && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              Google
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mt-1 truncate">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap mt-1">
                        {event.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  ประวัติการแจ้งเตือน ({notifications.length})
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-6 h-6 opacity-60" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">ยังไม่มีการแจ้งเตือนใหม่</p>
                  <p className="text-xs text-slate-400 mt-1">
                    เมื่อถึงเวลากิจกรรม ระบบจะส่งเสียงและแสดงการแจ้งเตือนที่นี่ทันที
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3 hover:border-sky-300 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note about sync */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                ระบบจะตรวจสอบงานที่ต้องทำอย่างต่อเนื่อง แม้คุณกำลังเปิดหน้าต่างนี้ไว้ และส่งเสียงเตือนให้อ้วน ๆ ทราบทันที
              </span>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
