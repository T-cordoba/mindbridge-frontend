export type EmotionKey =
  | 'joy' | 'gratitude' | 'calm' | 'hope' | 'love' | 'pride' | 'relief'
  | 'sadness' | 'anxiety' | 'fear' | 'anger' | 'frustration' | 'guilt' | 'shame' | 'loneliness'
  | 'confusion' | 'nostalgia' | 'uncertainty' | 'exhaustion' | 'emptiness' | 'unknown';

export type MoodData = [EmotionKey, number][];

export interface User {
  id: string;
  email: string;
  name: string | null;
  disclaimerAccepted: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  summary: string | null;
  messageCount: number;
  maxAlertLevel: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  moodData: MoodData | null;
  alertLevel: number;
  createdAt: string;
}

export interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string | null;
  email: string;
  phone: string;
  location: string;
  priceRange: string;
  rating: number;
  languages: string;
  createdAt: string;
}

export interface EmotionMetric {
  emotion: EmotionKey;
  avgIntensity: number;
  occurrences: number;
}

export interface AlertTrendPoint {
  date: string;
  maxAlert: number;
}

export interface DashboardMetrics {
  emotions: EmotionMetric[];
  alertTrend: AlertTrendPoint[];
  totalSessions: number;
  analyzedMessages: number;
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
  alertLevel: number;
  isBlocked: boolean;
}
