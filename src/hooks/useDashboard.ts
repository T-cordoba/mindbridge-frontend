'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import type { DashboardMetrics } from '@/types';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    dashboardApi.getMetrics(days)
      .then(setMetrics)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar métricas'))
      .finally(() => setLoading(false));
  }, [days]);

  const topEmotion = metrics?.emotions[0] ?? null;
  const latestWellbeing = metrics?.wellbeingTrend.at(-1)?.score ?? null;

  return { metrics, days, setDays, loading, error, topEmotion, latestWellbeing };
}
