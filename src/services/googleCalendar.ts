import { CalendarEvent } from '../types/calendar';
import { getAccessToken } from './firebaseAuth';

interface GoogleEventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: GoogleEventDateTime;
  end: GoogleEventDateTime;
  status?: string;
  htmlLink?: string;
}

const GOOGLE_CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Fetch events from Google Calendar
export const fetchGoogleCalendarEvents = async (timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ไม่พบ Access Token กรุณาเข้าสู่ระบบ Google อีกครั้ง');
  }

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);

  const response = await fetch(`${GOOGLE_CALENDAR_BASE}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Fetch Google Calendar error:', response.status, errorText);
    throw new Error(`โหลดปฏิทิน Google ไม่สำเร็จ (${response.status})`);
  }

  const data = await response.json();
  const items: GoogleCalendarItem[] = data.items || [];

  return items
    .filter(item => item.status !== 'cancelled')
    .map((item) => {
      const isAllDay = !item.start?.dateTime && !!item.start?.date;
      let date = '';
      let startTime = '';
      let endTime = '';

      if (isAllDay) {
        date = item.start?.date || '';
      } else if (item.start?.dateTime) {
        const startDate = new Date(item.start.dateTime);
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const dd = String(startDate.getDate()).padStart(2, '0');
        date = `${yyyy}-${mm}-${dd}`;
        startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

        if (item.end?.dateTime) {
          const endDate = new Date(item.end.dateTime);
          endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        }
      }

      return {
        id: `gcal-${item.id}`,
        googleCalendarEventId: item.id,
        isGoogleSynced: true,
        title: item.summary || '(ไม่มีชื่อเรื่อง)',
        description: item.description || '',
        location: item.location || '',
        date,
        startTime,
        endTime,
        isAllDay,
        category: 'work',
        isCompleted: false,
        reminderMinutes: 15,
        createdAt: Date.now(),
      };
    });
};

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (event: CalendarEvent): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ไม่พบ Access Token สำหรับการสร้างกิจกรรมใน Google Calendar');
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok';

  let start: GoogleEventDateTime = {};
  let end: GoogleEventDateTime = {};

  if (event.isAllDay || !event.startTime) {
    start = { date: event.date };
    // Google all-day event end date is exclusive, so set to same date or +1 day
    const nextDay = new Date(event.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextYyyy = nextDay.getFullYear();
    const nextMm = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDd = String(nextDay.getDate()).padStart(2, '0');
    end = { date: `${nextYyyy}-${nextMm}-${nextDd}` };
  } else {
    const startIso = `${event.date}T${event.startTime}:00`;
    const endIso = event.endTime ? `${event.date}T${event.endTime}:00` : `${event.date}T${event.startTime}:00`;
    start = { dateTime: new Date(startIso).toISOString(), timeZone };
    end = { dateTime: new Date(endIso).toISOString(), timeZone };
  }

  const payload = {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    start,
    end,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: event.reminderMinutes || 10 },
      ],
    },
  };

  const response = await fetch(GOOGLE_CALENDAR_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Error creating Google Calendar event:', response.status, errText);
    throw new Error(`ไม่สามารถเพิ่มงานลง Google Calendar (${response.status})`);
  }

  const created = await response.json();
  return created.id;
};

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (googleEventId: string, event: CalendarEvent): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ไม่พบ Access Token สำหรับการแก้ไขกิจกรรมใน Google Calendar');
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok';

  let start: GoogleEventDateTime = {};
  let end: GoogleEventDateTime = {};

  if (event.isAllDay || !event.startTime) {
    start = { date: event.date };
    const nextDay = new Date(event.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextYyyy = nextDay.getFullYear();
    const nextMm = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDd = String(nextDay.getDate()).padStart(2, '0');
    end = { date: `${nextYyyy}-${nextMm}-${nextDd}` };
  } else {
    const startIso = `${event.date}T${event.startTime}:00`;
    const endIso = event.endTime ? `${event.date}T${event.endTime}:00` : `${event.date}T${event.startTime}:00`;
    start = { dateTime: new Date(startIso).toISOString(), timeZone };
    end = { dateTime: new Date(endIso).toISOString(), timeZone };
  }

  const payload = {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    start,
    end,
  };

  const response = await fetch(`${GOOGLE_CALENDAR_BASE}/${googleEventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Error updating Google Calendar event:', response.status, errText);
    throw new Error(`ไม่สามารถอัปเดตงานใน Google Calendar (${response.status})`);
  }
};

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (googleEventId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ไม่พบ Access Token สำหรับการลบกิจกรรมใน Google Calendar');
  }

  const response = await fetch(`${GOOGLE_CALENDAR_BASE}/${googleEventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errText = await response.text();
    console.error('Error deleting Google Calendar event:', response.status, errText);
    throw new Error(`ไม่สามารถลบงานจาก Google Calendar (${response.status})`);
  }
};
