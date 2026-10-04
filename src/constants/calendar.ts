import { TaskCategoryConfig, CalendarEvent } from '../types/calendar';

export const DEFAULT_CATEGORIES: TaskCategoryConfig[] = [
  {
    id: 'club',
    label: 'งานสโมสรฯ 🏛️',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
    badgeText: 'text-sky-800',
    borderColor: 'border-l-sky-500',
    colorHex: '#0284c7',
  },
  {
    id: 'study',
    label: 'เรียน 📚',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badgeText: 'text-indigo-800',
    borderColor: 'border-l-indigo-500',
    colorHex: '#6366f1',
  },
  {
    id: 'youth',
    label: 'งานยุวชน 🌟',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeText: 'text-amber-800',
    borderColor: 'border-l-amber-500',
    colorHex: '#d97706',
  },
  {
    id: 'wife',
    label: 'w//คุณภรรยา 💖',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    badgeText: 'text-rose-800',
    borderColor: 'border-l-rose-500',
    colorHex: '#e11d48',
  },
  {
    id: 'exam',
    label: 'สอบ 📝',
    badgeBg: 'bg-red-100 text-red-800 border-red-200',
    badgeText: 'text-red-800',
    borderColor: 'border-l-red-500',
    colorHex: '#dc2626',
  },
  {
    id: 'teaching',
    label: 'งานสอน 🎓',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-800',
    borderColor: 'border-l-emerald-500',
    colorHex: '#059669',
  },
];

export const COLOR_PALETTES = [
  { name: 'ฟ้าสดใส', bg: 'bg-sky-100 text-sky-800 border-sky-200', text: 'text-sky-800', border: 'border-l-sky-500', hex: '#0ea5e9' },
  { name: 'ม่วงสด', bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-800', border: 'border-l-purple-500', hex: '#a855f7' },
  { name: 'ชมพูหวาน', bg: 'bg-pink-100 text-pink-800 border-pink-200', text: 'text-pink-800', border: 'border-l-pink-500', hex: '#ec4899' },
  { name: 'เขียวมิ้นต์', bg: 'bg-teal-100 text-teal-800 border-teal-200', text: 'text-teal-800', border: 'border-l-teal-500', hex: '#14b8a6' },
  { name: 'ส้มสว่าง', bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-800', border: 'border-l-orange-500', hex: '#f97316' },
  { name: 'น้ำเงินเข้ม', bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-800', border: 'border-l-blue-500', hex: '#3b82f6' },
  { name: 'เทาสงบ', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-800', border: 'border-l-slate-500', hex: '#64748b' },
];

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

// Helper to format date in Thai
export const formatThaiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const thaiYear = year + 543;
  return `${day} ${THAI_MONTHS[month - 1]} ${thaiYear}`;
};

export const getTodayStr = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Initial cheerful sample tasks for Bank with the newly requested categories
export const getInitialEvents = (): CalendarEvent[] => {
  const today = getTodayStr();
  const d = new Date();
  
  // Tomorrow
  const tom = new Date(d);
  tom.setDate(d.getDate() + 1);
  const tomStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;

  // Next 2 days
  const next2 = new Date(d);
  next2.setDate(d.getDate() + 2);
  const next2Str = `${next2.getFullYear()}-${String(next2.getMonth() + 1).padStart(2, '0')}-${String(next2.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'task-1',
      title: 'ประชุมเตรียมโครงการกิจกรรมสโมสรฯ',
      description: 'สรุปงบประมาณและวาระการประชุมประจำเดือนของสโมสรฯ',
      date: today,
      startTime: '09:30',
      endTime: '11:00',
      isAllDay: false,
      category: 'club',
      location: 'ห้องประชุมสโมสรฯ / Google Meet',
      isCompleted: false,
      reminderMinutes: 15,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'task-2',
      title: 'สอนวิชาปฏิบัติการและตรวจการบ้าน',
      description: 'บรรยายเนื้อหาบทที่ 4 และตรวจชิ้นงานของนักศึกษา',
      date: today,
      startTime: '13:00',
      endTime: '15:30',
      isAllDay: false,
      category: 'teaching',
      location: 'ห้องปฏิบัติการคอมพิวเตอร์ 3',
      isCompleted: false,
      reminderMinutes: 10,
      createdAt: Date.now() - 1800000,
    },
    {
      id: 'task-3',
      title: 'ไปทานข้าวเย็นและเดินเล่น w//คุณภรรยา 💖',
      description: 'ร้านโปรดของคุณภรรยา เติมพลังบวกและความสุขให้อ้วน ๆ',
      date: today,
      startTime: '18:00',
      endTime: '20:00',
      isAllDay: false,
      category: 'wife',
      location: 'ร้านอาหารริมน้ำ',
      isCompleted: true,
      reminderMinutes: 30,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'task-4',
      title: 'จัดกิจกรรมค่ายอาสาและพัฒนาศักยภาพงานยุวชน',
      description: 'กิจกรรมเวิร์กช็อปเสริมทักษะน้อง ๆ ยุวชน',
      date: tomStr,
      startTime: '10:00',
      endTime: '12:00',
      isAllDay: false,
      category: 'youth',
      isCompleted: false,
      reminderMinutes: 15,
      createdAt: Date.now(),
    },
    {
      id: 'task-5',
      title: 'เตรียมตัวทบทวนเนื้อหาก่อนเข้าสอบ',
      description: 'อ่านสรุปวิชาหลักและทำแบบฝึกหัดทบทวน',
      date: next2Str,
      startTime: '14:00',
      endTime: '17:00',
      isAllDay: false,
      category: 'exam',
      isCompleted: false,
      reminderMinutes: 30,
      createdAt: Date.now(),
    }
  ];
};
