import { getToken, removeToken } from './auth';
import type {
  User, Session, Message, Psychologist,
  DashboardMetrics, SendMessageResult, SessionsPage, UsersPage,
} from '@/types';

const BASE = (process.env.NEXT_PUBLIC_API_URL || '/api') + '/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
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

  updateProfile: (data: { name?: string; email?: string }) =>
    request<{ user: User }>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  uploadAvatar: (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append('avatar', file);
    return fetch(`${BASE}/auth/profile/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      if (res.status === 401) { removeToken(); window.location.href = '/login'; throw new Error(''); }
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as { error?: string }).error || `HTTP ${res.status}`); }
      return res.json() as Promise<{ user: User; avatarUrl: string }>;
    });
  },
};

// ─── Journal ──────────────────────────────────────────────────────────────────

export const journalApi = {
  createSession: (title?: string) =>
    request<{ session: Session }>('/journal/sessions', { method: 'POST', body: JSON.stringify({ title }) }),

  getSessions: (page = 1, limit = 10) =>
    request<SessionsPage>(`/journal/sessions?page=${page}&limit=${limit}`),

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

  sendMessageStream: (
    sessionId: string,
    content: string,
    callbacks: {
      onReasoning?: (chunk: string) => void;
      onText: (chunk: string) => void;
      onDone: (result: SendMessageResult) => void;
      onTitleUpdated?: (title: string) => void;
      onError: (message: string) => void;
    },
  ): AbortController => {
    const controller = new AbortController();
    const token = getToken();

    fetch(`${BASE}/journal/sessions/${sessionId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 401) {
          removeToken();
          window.location.href = '/login';
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          callbacks.onError((body as { error?: string }).error || `HTTP ${res.status}`);
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let currentEvent = '';
        let currentData = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.slice(6);
            } else if (line === '') {
              if (currentData) {
                try {
                  const data = JSON.parse(currentData) as Record<string, unknown>;
                  if (currentEvent === 'reasoning') callbacks.onReasoning?.(data.chunk as string);
                  else if (currentEvent === 'text') callbacks.onText(data.chunk as string);
                  else if (currentEvent === 'done') callbacks.onDone(data as unknown as SendMessageResult);
                  else if (currentEvent === 'title-updated') callbacks.onTitleUpdated?.(data.title as string);
                  else if (currentEvent === 'error') callbacks.onError(data.message as string);
                } catch { /* malformed event */ }
              }
              currentEvent = '';
              currentData = '';
            }
          }
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') callbacks.onError(err.message);
      });

    return controller;
  },

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

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  getUsers: (page = 1, limit = 10) =>
    request<UsersPage>(`/admin/users?page=${page}&limit=${limit}`),
};
