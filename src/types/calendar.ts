export type TaskCategory = string;

export interface TaskCategoryConfig {
  id: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  colorHex: string;
  isCustom?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay: boolean;
  category: string; // category id
  isCompleted: boolean;
  googleCalendarEventId?: string; // ID if synced with Google Calendar
  isGoogleSynced?: boolean;
  githubIssueId?: number; // ID if synced from GitHub
  githubUrl?: string;
  isGithubSynced?: boolean;
  location?: string;
  reminderMinutes: number; // e.g. 0, 10, 30, 60
  reminded?: boolean;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  eventId?: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'urgent' | 'reminder' | 'sync' | 'info' | 'github';
}

export interface GitHubAccount {
  username: string;
  avatarUrl: string;
  name: string;
  token?: string;
  connectedAt: number;
  syncedIssuesCount: number;
}
