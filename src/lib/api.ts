import { getToken } from './auth';
import type {
  User, Session, Message, Psychologist,
  DashboardMetrics, SendMessageResult,
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name?: string; disclaimerAccepted: string }) =>
    request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<{ user: User }>('/auth/me'),

  deleteAccount: () => request<void>('/auth/account', { method: 'DELETE' }),
};

// ─── Journal ──────────────────────────────────────────────────────────────────

export const journalApi = {
  createSession: (title?: string) =>
    request<{ session: Session }>('/journal/sessions', { method: 'POST', body: JSON.stringify({ title }) }),

  getSessions: () => request<{ sessions: Session[] }>('/journal/sessions'),

  getSession: (id: string) => request<{ session: Session; messages: Message[] }>(`/journal/sessions/${id}`),

  updateSessionTitle: (id: string, title: string) =>
    request<{ session: Session }>(`/journal/sessions/${id}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),

  sendMessage: (sessionId: string, content: string) =>
    request<SendMessageResult>(`/journal/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteSession: (id: string) => request<void>(`/journal/sessions/${id}`, { method: 'DELETE' }),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardApi = {
  getMetrics: (days = 30) => request<DashboardMetrics>(`/dashboard/metrics?days=${days}`),
};

// ─── Marketplace ─────────────────────────────────────────────────────────────

export const marketplaceApi = {
  getPsychologists: () => request<{ psychologists: Psychologist[] }>('/marketplace/psychologists'),

  getPsychologist: (id: string) => request<{ psychologist: Psychologist }>(`/marketplace/psychologists/${id}`),
};
