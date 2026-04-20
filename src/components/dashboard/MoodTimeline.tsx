'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { AlertTrendPoint } from '@/types';

interface MoodTimelineProps {
  data: AlertTrendPoint[];
}

const alertLabels: Record<number, string> = {
  0: 'Normal', 1: 'Leve', 2: 'Moderado', 3: 'Elevado', 4: 'Severo', 5: 'Crisis',
};

export default function MoodTimeline({ data }: MoodTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Sin datos de alerta registrados.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    alerta: d.maxAlert,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
        <ReferenceLine y={4} stroke="var(--color-danger)" strokeDasharray="4 2" />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          formatter={(value: number) => [alertLabels[value] ?? value, 'Nivel de alerta']}
        />
        <Line
          type="monotone"
          dataKey="alerta"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-primary)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
