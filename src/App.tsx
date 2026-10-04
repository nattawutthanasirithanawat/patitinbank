import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  CalendarRange,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Cloud,
  Clock,
  Github,
  Tag
} from 'lucide-react';
import { CalendarEvent, AppNotification, TaskCategoryConfig, GitHubAccount } from './types/calendar';
import {
  DEFAULT_CATEGORIES,
  getTodayStr,
  getInitialEvents,
  formatThaiDate
} from './constants/calendar';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from './services/firebaseAuth';
import {
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from './services/googleCalendar';
import {
  getStoredGitHubAccount,
  saveStoredGitHubAccount,
  connectGitHubByUsernameOrToken,
  connectGitHubViaFirebase
} from './services/githubService';
import { soundPlayer } from './services/sound';
import { Header } from './components/Header';
import { CalendarMonth } from './components/CalendarMonth';
import { CalendarWeek } from './components/CalendarWeek';
import { DailyTaskSummary } from './components/DailyTaskSummary';
import { EventModal } from './components/EventModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ToastNotification } from './components/ToastNotification';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { GitHubModal } from './components/GitHubModal';

const STORAGE_KEY_EVENTS = 'bank_fat_calendar_events_v2';
const STORAGE_KEY_NOTIFS = 'bank_fat_calendar_notifs_v2';
const STORAGE_KEY_CATEGORIES = 'bank_fat_calendar_categories_v2';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshingGoogle, setIsRefreshingGoogle] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // GitHub integration state
  const [githubAccount, setGithubAccount] = useState<GitHubAccount | null>(() => getStoredGitHubAccount());
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);

  // Dynamic Categories state
  const [categories, setCategories] = useState<TaskCategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading categories', e);
    }
    return DEFAULT_CATEGORIES;
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected dates & navigation
  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const todayDateObj = new Date();
  const [currentYear, setCurrentYear] = useState<number>(todayDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDateObj.getMonth());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Events & Notifications
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading events from storage', e);
    }
    return getInitialEvents();
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading notifs from storage', e);
    }
    return [];
  });

  const [toastQueue, setToastQueue] = useState<AppNotification[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(todayStr);
  const [deleteModalEvent, setDeleteModalEvent] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Could not save events', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Could not save notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Could not save categories', e);
    }
  }, [categories]);

  // Push status message banner with auto-hide
  const showBanner = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Add notification & trigger chime
  const triggerNotification = useCallback(
    (title: string, message: string, type: AppNotification['type'] = 'reminder', eventId?: string) => {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        eventId,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        type,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToastQueue((prev) => [newNotif, ...prev]);
      soundPlayer.playNotificationChime();

      // Trigger Browser Web Notification if allowed
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
          });
        } catch (err) {
          console.warn('Browser notification failed:', err);
        }
      }
    },
    []
  );

  // Request browser notification permission
  const handleRequestBrowserNotification = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        triggerNotification('เปิดการแจ้งเตือนสำเร็จ! 🔔', 'ระบบจะส่งเสียงและแจ้งเตือนเมื่อถึงกำหนดการงานของอ้วน ๆ', 'info');
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  };

  // Notification interval checker: check every 25 seconds for tasks needing reminder
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;
      const today = getTodayStr();

      setEvents((prevEvents) => {
        let hasChanges = false;
        const updated = prevEvents.map((ev) => {
          if (ev.date !== today || ev.isCompleted || ev.reminded || ev.isAllDay || !ev.startTime) {
            return ev;
          }

          const [sh, sm] = ev.startTime.split(':').map(Number);
          const taskTotalMin = sh * 60 + sm;
          const reminderOffset = ev.reminderMinutes ?? 15;
          const triggerTimeMin = taskTotalMin - reminderOffset;

          // If within the trigger minute window
          if (currentTotalMin >= triggerTimeMin && currentTotalMin <= taskTotalMin + 1) {
            hasChanges = true;
            const diff = taskTotalMin - currentTotalMin;
            let timeMsg = '';
            if (diff > 0) {
              timeMsg = `อีก ${diff} นาทีจะเริ่มเวลา (${ev.startTime} น.)`;
            } else if (diff === 0) {
              timeMsg = `ถึงเวลาเริ่มงานแล้ว (${ev.startTime} น.)`;
            } else {
              timeMsg = `เลยเวลาเริ่มงานมาแล้ว (${ev.startTime} น.)`;
            }

            triggerNotification(
              `🔔 เตือนงาน: ${ev.title}`,
              `${timeMsg}${ev.location ? ` • สถานที่: ${ev.location}` : ''}`,
              'reminder',
              ev.id
            );

            return { ...ev, reminded: true };
          }

          return ev;
        });

        return hasChanges ? updated : prevEvents;
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 25000);
    return () => clearInterval(interval);
  }, [triggerNotification]);

  // Sync with Google Calendar
  const handleFetchGoogleCalendar = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsRefreshingGoogle(true);
    try {
      const dMin = new Date();
      dMin.setDate(dMin.getDate() - 30);
      const dMax = new Date();
      dMax.setDate(dMax.getDate() + 90);

      const gEvents = await fetchGoogleCalendarEvents(dMin.toISOString(), dMax.toISOString());

      setEvents((prev) => {
        // Retain non-Google events (local & github)
        const nonGoogleEvents = prev.filter((e) => !e.googleCalendarEventId);
        return [...nonGoogleEvents, ...gEvents];
      });

      showBanner(`ซิงค์ตารางงานจาก Google Calendar สำเร็จ (${gEvents.length} รายการ)`, 'success');
    } catch (err: unknown) {
      console.error('Error fetching Google Calendar:', err);
      showBanner(err instanceof Error ? err.message : 'ซิงค์กับ Google Calendar ไม่สำเร็จ', 'error');
    } finally {
      setIsRefreshingGoogle(false);
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        handleFetchGoogleCalendar();
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, [handleFetchGoogleCalendar]);

  // Google Login / Logout
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        triggerNotification('เชื่อมต่อ Google Calendar เรียบร้อย 🎉', `ยินดีต้อนรับคุณ ${result.user.displayName || 'แบงค์'}`, 'sync');
        await handleFetchGoogleCalendar();
      }
    } catch (err: unknown) {
      console.error('Login error', err);
      showBanner(err instanceof Error ? err.message : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      showBanner('ออกจากระบบ Google แล้ว (ข้อมูลในเครื่องยังคงอยู่)', 'info');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // GitHub Connection Handlers
  const handleConnectGitHubUsernameOrToken = async (input: string, isToken: boolean) => {
    setIsSyncingGitHub(true);
    try {
      const { account, events: ghEvents } = await connectGitHubByUsernameOrToken(input, isToken);
      setGithubAccount(account);

      // Merge GitHub events
      setEvents((prev) => {
        const withoutOldGh = prev.filter((e) => !e.isGithubSynced);
        return [...withoutOldGh, ...ghEvents];
      });

      triggerNotification(
        'เชื่อมต่อกับ GitHub สำเร็จ! 🐙',
        `ดึงข้อมูล ${ghEvents.length} รายการของ @${account.username} ลงปฏิทินงานของอ้วน ๆ แล้ว`,
        'github'
      );
      showBanner(`เชื่อมต่อ GitHub: @${account.username} เรียบร้อย`, 'success');
    } catch (err: unknown) {
      console.error('GitHub connect error:', err);
      throw err;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const handleConnectGitHubViaFirebase = async () => {
    setIsSyncingGitHub(true);
    try {
      const { account, events: ghEvents } = await connectGitHubViaFirebase();
      setGithubAccount(account);
      setEvents((prev) => {
        const withoutOldGh = prev.filter((e) => !e.isGithubSynced);
        return [...withoutOldGh, ...ghEvents];
      });
      triggerNotification('เชื่อมต่อ GitHub สำเร็จ! 🐙', `ดึงงานของ @${account.username} เรียบร้อย`, 'github');
      showBanner(`เชื่อมต่อ GitHub: @${account.username} เรียบร้อย`, 'success');
    } catch (err: unknown) {
      console.error('GitHub oauth error:', err);
      throw err;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const handleDisconnectGitHub = () => {
    saveStoredGitHubAccount(null);
    setGithubAccount(null);
    setEvents((prev) => prev.filter((e) => !e.isGithubSynced));
    showBanner('ยกเลิกการเชื่อมต่อกับ GitHub แล้ว', 'info');
  };

  const handleResyncGitHub = async () => {
    if (!githubAccount) return;
    setIsSyncingGitHub(true);
    try {
      const identifier = githubAccount.token || githubAccount.username;
      const isToken = !!githubAccount.token;
      const { account, events: ghEvents } = await connectGitHubByUsernameOrToken(identifier, isToken);
      setGithubAccount(account);
      setEvents((prev) => {
        const withoutOldGh = prev.filter((e) => !e.isGithubSynced);
        return [...withoutOldGh, ...ghEvents];
      });
      showBanner(`อัปเดตกิจกรรม GitHub เรียบร้อย (${ghEvents.length} รายการ)`, 'success');
    } catch (err: unknown) {
      console.error('GitHub resync error:', err);
      showBanner(err instanceof Error ? err.message : 'ซิงค์ข้อมูล GitHub ไม่สำเร็จ', 'error');
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Custom Categories Handlers
  const handleAddCategory = (newCat: TaskCategoryConfig) => {
    setCategories((prev) => [...prev, newCat]);
    showBanner(`เพิ่มหมวดหมู่งาน "${newCat.label}" เรียบร้อยแล้ว ✨`, 'success');
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (categoryFilter === catId) {
      setCategoryFilter('all');
    }
    showBanner('ลบหมวดหมู่งานเรียบร้อยแล้ว', 'info');
  };

  // Month navigation helpers
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDate(todayStr);
  };

  // Open modal for new event
  const handleOpenNewEventWithDate = (dateStr: string) => {
    setEditingEvent(null);
    setModalDefaultDate(dateStr);
    setIsEventModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalDefaultDate(event.date);
    setIsEventModalOpen(true);
  };

  // Save event (Create or Update)
  const handleSaveEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }
  ) => {
    let googleEventId = eventData.googleCalendarEventId;

    if (eventData.isGoogleSynced && user) {
      try {
        if (googleEventId) {
          await updateGoogleCalendarEvent(googleEventId, {
            ...eventData,
            id: eventData.id || `temp-${Date.now()}`,
            createdAt: Date.now(),
          });
        } else {
          googleEventId = await createGoogleCalendarEvent({
            ...eventData,
            id: `temp-${Date.now()}`,
            createdAt: Date.now(),
          });
        }
      } catch (err: unknown) {
        console.error('Google Calendar sync error:', err);
        showBanner(`บันทึกในเครื่องแล้ว แต่ซิงค์กับ Google ไม่สำเร็จ: ${err instanceof Error ? err.message : ''}`, 'info');
      }
    }

    if (eventData.id) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventData.id
            ? {
                ...item,
                ...eventData,
                googleCalendarEventId: googleEventId,
                isGoogleSynced: !!googleEventId || eventData.isGoogleSynced,
              }
            : item
        )
      );
      showBanner(`อัปเดตงาน "${eventData.title}" เรียบร้อยแล้ว ✨`, 'success');
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: googleEventId ? `gcal-${googleEventId}` : `local-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        googleCalendarEventId: googleEventId,
        isGoogleSynced: !!googleEventId || eventData.isGoogleSynced,
        createdAt: Date.now(),
      };
      setEvents((prev) => [newEvent, ...prev]);
      showBanner(`เพิ่มงาน "${eventData.title}" ในตารางของอ้วน ๆ แล้ว 🎈`, 'success');
    }
  };

  // Quick inline add task
  const handleQuickAddTask = async (title: string, dateStr: string) => {
    let googleId: string | undefined = undefined;
    const defaultCatId = categories[0]?.id || 'club';

    const tempEvent: CalendarEvent = {
      id: `local-${Date.now()}`,
      title,
      date: dateStr,
      isAllDay: true,
      category: defaultCatId,
      isCompleted: false,
      reminderMinutes: 15,
      createdAt: Date.now(),
    };

    if (user) {
      try {
        googleId = await createGoogleCalendarEvent(tempEvent);
      } catch (e) {
        console.warn('Quick add google sync failed', e);
      }
    }

    const createdEvent: CalendarEvent = {
      ...tempEvent,
      id: googleId ? `gcal-${googleId}` : tempEvent.id,
      googleCalendarEventId: googleId,
      isGoogleSynced: !!googleId,
    };

    setEvents((prev) => [createdEvent, ...prev]);
    showBanner(`เพิ่มงาน "${title}" เรียบร้อยแล้ว`, 'success');
  };

  // Toggle complete
  const handleToggleComplete = (event: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, isCompleted: !e.isCompleted } : e))
    );
  };

  // Open destructive delete confirmation modal
  const handlePromptDelete = (event: CalendarEvent) => {
    setDeleteModalEvent(event);
  };

  // Confirm delete (Destructive operation)
  const handleConfirmDelete = async () => {
    if (!deleteModalEvent) return;

    setIsDeleting(true);
    try {
      if (deleteModalEvent.googleCalendarEventId && user) {
        try {
          await deleteGoogleCalendarEvent(deleteModalEvent.googleCalendarEventId);
        } catch (err: unknown) {
          console.error('Failed to delete from Google Calendar:', err);
          showBanner('ลบจากปฏิทินในเครื่องแล้ว แต่เกิดข้อผิดพลาดในการลบจาก Google Calendar', 'info');
        }
      }

      setEvents((prev) => prev.filter((e) => e.id !== deleteModalEvent.id));
      showBanner(`ลบงาน "${deleteModalEvent.title}" ออกจากปฏิทินแล้ว`, 'info');
      setDeleteModalEvent(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Dismiss toast
  const handleDismissToast = (id: string) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== id));
  };

  // Upcoming events calculation
  const upcomingEvents = events
    .filter((e) => !e.isCompleted && e.date >= todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
    });

  // Next immediate task today
  const nextTaskToday = events.find(
    (e) => e.date === todayStr && !e.isCompleted && !e.isAllDay && (e.startTime || '') >= new Date().toTimeString().slice(0, 5)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-sky-100/30 to-blue-50/40 text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      {/* Toast Notification Container */}
      <ToastNotification
        notifications={toastQueue}
        onDismiss={handleDismissToast}
        onOpenNotificationCenter={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Main Header */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenNewEvent={() => handleOpenNewEventWithDate(selectedDate)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onRefreshGoogleCalendar={handleFetchGoogleCalendar}
        isRefreshingGoogle={isRefreshingGoogle}
        githubAccount={githubAccount}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Flash Status Banner */}
      {statusMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full animate-fade-in">
          <div
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-sky-50 text-sky-800 border-sky-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {statusMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome / Summary Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-sky-400/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-cyan-300/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-white" />
                  ตารางงานสดใสของอ้วน ๆ
                </span>
                <span className="text-sky-100 text-xs hidden sm:inline">
                  • สโมสรฯ | เรียน | ยุวชน | w//คุณภรรยา | สอบ | งานสอน
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                สวัสดี {user?.displayName ? `คุณ ${user.displayName}` : 'แบงค์ (อ้วน ๆ) 💙'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
                {nextTaskToday ? (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    งานถัดไปวันนี้: <strong className="text-white underline">{nextTaskToday.title}</strong> เวลา {nextTaskToday.startTime} น.
                  </span>
                ) : (
                  <span>
                    วันนี้คุณมีกำหนดการ {events.filter((e) => e.date === todayStr).length} งาน (เสร็จแล้ว {events.filter((e) => e.date === todayStr && e.isCompleted).length} งาน) ขอให้เป็นวันที่สดใสและเต็มไปด้วยพลังบวกนะ! 🌤️
                  </span>
                )}
              </p>
            </div>

            {/* Quick View Controls */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-black/15 p-1 rounded-2xl backdrop-blur-xs border border-white/20">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-sky-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>มุมมองเดือน</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-sky-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>มุมมองสัปดาห์</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Calendar (Left/Center) + Daily Task Panel (Right) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar Area */}
          <div className="lg:col-span-8 space-y-4">
            {viewMode === 'month' ? (
              <CalendarMonth
                currentYear={currentYear}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                events={events}
                categories={categories}
                onSelectDate={(d) => setSelectedDate(d)}
                onNextMonth={handleNextMonth}
                onPrevMonth={handlePrevMonth}
                onToday={handleToday}
                onOpenNewEventWithDate={handleOpenNewEventWithDate}
                onSelectEvent={handleOpenEditEvent}
                activeCategoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              />
            ) : (
              <CalendarWeek
                currentDate={selectedDate}
                events={events}
                categories={categories}
                onSelectDate={(d) => setSelectedDate(d)}
                onSelectEvent={handleOpenEditEvent}
                onOpenNewEventWithDate={handleOpenNewEventWithDate}
              />
            )}

            {/* Quick Info Strip */}
            <div className="p-4 rounded-3xl bg-white/80 border border-sky-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    เชื่อมต่อ 2 แพลตฟอร์ม: Google Calendar & GitHub 🐙
                  </p>
                  <p className="text-slate-500">
                    {githubAccount ? `เชื่อมต่อกับ GitHub (@${githubAccount.username}) แล้ว` : 'สามารถเชื่อมต่อ GitHub เพื่อดึง Issues & คอมมิตงาน'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  จัดการหมวดหมู่งาน
                </button>
                <button
                  onClick={() => {
                    soundPlayer.playNotificationChime();
                    triggerNotification('ทดสอบระบบแจ้งเตือน 📢', 'ระบบเสียงและการแจ้งเตือนของปฏิทินอ้วน ๆ ทำงานได้อย่างสมบูรณ์แบบ!', 'info');
                  }}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  🔊 ทดสอบเสียง
                </button>
              </div>
            </div>
          </div>

          {/* Daily Tasks & Schedule Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <DailyTaskSummary
              selectedDate={selectedDate}
              events={events}
              categories={categories}
              onToggleComplete={handleToggleComplete}
              onEditEvent={handleOpenEditEvent}
              onDeleteEvent={handlePromptDelete}
              onOpenNewEventWithDate={handleOpenNewEventWithDate}
              onQuickAddTask={handleQuickAddTask}
              onSelectToday={handleToday}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-sky-100 bg-white/60 py-4 text-center text-xs text-slate-400">
        <p>
          ปฏิทินงานของอ้วน ๆ • ปฏิทินงานของแบงค์ โทนสีฟ้าสดใส ☁️💙 เชื่อมต่อ Google Calendar & GitHub พร้อมระบบแจ้งเตือน
        </p>
      </footer>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        defaultDate={modalDefaultDate}
        isGoogleAuthenticated={!!user}
        categories={categories}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Delete Confirmation Modal (Destructive operation) */}
      <DeleteConfirmModal
        isOpen={!!deleteModalEvent}
        event={deleteModalEvent}
        onCancel={() => setDeleteModalEvent(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* GitHub Connect Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        githubAccount={githubAccount}
        onConnectUsernameOrToken={handleConnectGitHubUsernameOrToken}
        onConnectViaFirebase={handleConnectGitHubViaFirebase}
        onDisconnect={handleDisconnectGitHub}
        onResync={handleResyncGitHub}
        isSyncing={isSyncingGitHub}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
        onSendTestNotification={() => {
          triggerNotification('ทดสอบแจ้งเตือนงาน 🔔', 'ระบบแจ้งเตือนของอ้วน ๆ พร้อมทำงานแล้วครับ!', 'reminder');
        }}
        upcomingEvents={upcomingEvents}
        onRequestBrowserNotification={handleRequestBrowserNotification}
        browserNotificationStatus={browserPermission}
      />
    </div>
  );
}
