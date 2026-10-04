import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseAuth';
import { CalendarEvent, GitHubAccount } from '../types/calendar';

const STORAGE_KEY_GITHUB = 'bank_fat_github_account_v1';

export const getStoredGitHubAccount = (): GitHubAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GITHUB);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading github account', e);
  }
  return null;
};

export const saveStoredGitHubAccount = (account: GitHubAccount | null) => {
  if (account) {
    localStorage.setItem(STORAGE_KEY_GITHUB, JSON.stringify(account));
  } else {
    localStorage.removeItem(STORAGE_KEY_GITHUB);
  }
};

// Connect via GitHub Username or Token
export const connectGitHubByUsernameOrToken = async (
  usernameOrToken: string,
  isToken: boolean
): Promise<{ account: GitHubAccount; events: CalendarEvent[] }> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (isToken) {
    headers['Authorization'] = `token ${usernameOrToken.trim()}`;
  }

  // 1. Fetch user profile
  const userEndpoint = isToken
    ? 'https://api.github.com/user'
    : `https://api.github.com/users/${encodeURIComponent(usernameOrToken.trim())}`;

  const res = await fetch(userEndpoint, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('ไม่พบบัญชีผู้ใช้ GitHub นี้ กรุณาตรวจสอบ Username ให้ถูกต้อง');
    }
    if (res.status === 401) {
      throw new Error('Personal Access Token ไม่ถูกต้องหรือหมดอายุ');
    }
    throw new Error(`เชื่อมต่อ GitHub ไม่สำเร็จ (Status: ${res.status})`);
  }

  const userData = await res.json();
  const username = userData.login;

  // 2. Fetch issues / pull requests / recent activities to turn into calendar events
  const events: CalendarEvent[] = [];

  try {
    if (isToken) {
      // With token, can fetch assigned issues across repos
      const issuesRes = await fetch('https://api.github.com/user/issues?filter=all&state=all&per_page=30', { headers });
      if (issuesRes.ok) {
        const issues = await issuesRes.json();
        issues.forEach((issue: any) => {
          const targetDate = issue.milestone?.due_on
            ? issue.milestone.due_on.slice(0, 10)
            : issue.created_at.slice(0, 10);

          events.push({
            id: `gh-issue-${issue.id}`,
            title: `🐙 [GitHub] ${issue.title} (#${issue.number})`,
            description: `Repository: ${issue.repository?.full_name || 'GitHub'}\nURL: ${issue.html_url}\n${issue.body ? issue.body.slice(0, 100) : ''}`,
            date: targetDate,
            isAllDay: true,
            category: 'club', // default to club or study
            isCompleted: issue.state === 'closed',
            githubIssueId: issue.id,
            githubUrl: issue.html_url,
            isGithubSynced: true,
            reminderMinutes: 30,
            createdAt: new Date(issue.created_at).getTime(),
          });
        });
      }
    }

    // Also fetch public events / recent commits if no issues or for public username
    if (events.length === 0) {
      const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=20`, { headers });
      if (eventsRes.ok) {
        const userEvents = await eventsRes.json();
        userEvents.slice(0, 15).forEach((item: any) => {
          const dateStr = item.created_at.slice(0, 10);
          let title = `🐙 [GitHub] กิจกรรม ${item.type}`;
          let desc = `Repo: ${item.repo?.name || ''}`;

          if (item.type === 'PushEvent') {
            const commitCount = item.payload?.commits?.length || 1;
            const message = item.payload?.commits?.[0]?.message || 'อัปเดตโค้ด';
            title = `🐙 Push ${commitCount} คอมมิต: ${message.slice(0, 40)}`;
          } else if (item.type === 'CreateEvent') {
            title = `🐙 สร้าง ${item.payload?.ref_type || 'งาน'}: ${item.payload?.ref || item.repo?.name}`;
          } else if (item.type === 'IssuesEvent') {
            title = `🐙 Issue ${item.payload?.action}: ${item.payload?.issue?.title || ''}`;
            desc = item.payload?.issue?.html_url || desc;
          }

          events.push({
            id: `gh-event-${item.id}`,
            title,
            description: desc,
            date: dateStr,
            startTime: new Date(item.created_at).toTimeString().slice(0, 5),
            isAllDay: false,
            category: 'club',
            isCompleted: true,
            githubUrl: `https://github.com/${item.repo?.name}`,
            isGithubSynced: true,
            reminderMinutes: 0,
            createdAt: new Date(item.created_at).getTime(),
          });
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching detailed github items, basic profile still saved:', err);
  }

  const account: GitHubAccount = {
    username,
    name: userData.name || username,
    avatarUrl: userData.avatar_url,
    token: isToken ? usernameOrToken.trim() : undefined,
    connectedAt: Date.now(),
    syncedIssuesCount: events.length,
  };

  saveStoredGitHubAccount(account);
  return { account, events };
};

// Connect via Firebase GithubAuthProvider
export const connectGitHubViaFirebase = async (): Promise<{ account: GitHubAccount; events: CalendarEvent[] }> => {
  const provider = new GithubAuthProvider();
  provider.addScope('read:user');
  provider.addScope('repo');

  const result = await signInWithPopup(auth, provider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  return connectGitHubByUsernameOrToken(token || result.user.displayName || 'user', !!token);
};
