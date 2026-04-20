'use client';

import { useEffect, useState } from 'react';
import { BarChart2, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StatsCard from '@/components/dashboard/StatsCard';
import EmotionChart from '@/components/dashboard/EmotionChart';
import MoodTimeline from '@/components/dashboard/MoodTimeline';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import FadeInSection from '@/components/ui/FadeInSection';
import { getEmotionLabel, getEmotionColor } from '@/lib/emotions';
import { dashboardApi } from '@/lib/api';
import type { DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardApi.getMetrics(days)
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  const topEmotion = metrics?.emotions[0];

  return (
    <ProtectedRoute>
      <div className="container py-10 max-w-4xl">
        <FadeInSection>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Panel Emocional</h1>
              <p className="text-text-secondary mt-1">Tu historial de bienestar</p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    days === d
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary',
                  ].join(' ')}
                >
                  {d} días
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : metrics && (
          <>
            <FadeInSection delay={80}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard label="Sesiones totales" value={metrics.totalSessions} icon={<MessageSquare size={22} />} />
                <StatsCard label="Mensajes analizados" value={metrics.analyzedMessages} icon={<BarChart2 size={22} />} />
                <StatsCard
                  label="Emoción predominante"
                  value={topEmotion ? getEmotionLabel(topEmotion.emotion) : '—'}
                  icon={<TrendingUp size={22} />}
                  sub={topEmotion ? `${topEmotion.occurrences} veces` : undefined}
                />
                <StatsCard
                  label="Nivel de alerta máx."
                  value={metrics.alertTrend.length > 0
                    ? Math.max(...metrics.alertTrend.map((a) => a.maxAlert))
                    : 0}
                  icon={<AlertTriangle size={22} />}
                  color={metrics.alertTrend.some((a) => a.maxAlert >= 4) ? 'text-danger' : 'text-primary'}
                />
              </div>
            </FadeInSection>

            <FadeInSection delay={130}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <h2 className="font-semibold mb-4">Frecuencia de emociones</h2>
                  <EmotionChart data={metrics.emotions} />
                </Card>
                <Card>
                  <h2 className="font-semibold mb-4">Tendencia de alerta</h2>
                  <MoodTimeline data={metrics.alertTrend} />
                </Card>
              </div>
            </FadeInSection>

            {metrics.emotions.length > 0 && (
              <FadeInSection delay={170}>
                <Card>
                  <h2 className="font-semibold mb-4">Detalle de emociones</h2>
                  <div className="flex flex-col gap-3">
                    {metrics.emotions.map((e) => (
                      <div key={e.emotion} className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: getEmotionColor(e.emotion) }}
                        />
                        <span className="text-sm text-text-primary min-w-[120px]">{getEmotionLabel(e.emotion)}</span>
                        <div className="flex-1 bg-surface-elevated rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(e.occurrences / (metrics.emotions[0]?.occurrences || 1)) * 100}%`,
                              background: getEmotionColor(e.emotion),
                            }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-16 text-right">
                          {e.occurrences}× · {e.avgIntensity}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInSection>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
