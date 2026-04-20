import type { Session } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function capitalizeFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatRecentSessionDate(dateValue: string, nowDate: Date = new Date()) {
  const targetDate = new Date(dateValue);
  if (Number.isNaN(targetDate.getTime())) return '';

  const today = startOfDay(nowDate).getTime();
  const target = startOfDay(targetDate).getTime();
  const dayDiff = Math.round((today - target) / DAY_MS);

  if (dayDiff === 0) return 'Hoy';
  if (dayDiff === 1) return 'Ayer';

  if (dayDiff > 1 && dayDiff < 7) {
    const weekday = targetDate.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
    return capitalizeFirst(weekday);
  }

  return targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function getRecentSessionPreview(session: Session) {
  const summary = session.summary?.trim();
  if (summary) return summary;

  if (session.messageCount <= 0) {
    return 'Empieza esta conversacion cuando quieras';
  }

  if (session.messageCount === 1) {
    return '1 mensaje en esta charla';
  }

  return `${session.messageCount} mensajes en esta charla`;
}
