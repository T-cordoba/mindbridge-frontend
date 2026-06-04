'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { WellbeingPoint } from '@/types';

interface WellbeingChartProps {
  data: WellbeingPoint[];
}

export default function WellbeingChart({ data }: WellbeingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Sin datos suficientes aún.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    score: d.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="wbPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="wbNegative" x1="0" y1="1" x2="0" y2="0">
            <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis
          domain={[-10, 10]}
          ticks={[-10, -5, 0, 5, 10]}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          formatter={(value: number) => [
            `${value > 0 ? '+' : ''}${value}`,
            'Bienestar neto',
          ]}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#wbPositive)"
          dot={{ r: 3, fill: 'var(--color-primary)' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
