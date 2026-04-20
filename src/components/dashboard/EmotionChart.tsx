'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getEmotionLabel, getEmotionColor } from '@/lib/emotions';
import type { EmotionMetric } from '@/types';

interface EmotionChartProps {
  data: EmotionMetric[];
}

export default function EmotionChart({ data }: EmotionChartProps) {
  const chartData = data.slice(0, 8).map((d) => ({
    name: getEmotionLabel(d.emotion),
    value: d.occurrences,
    intensity: d.avgIntensity,
    color: getEmotionColor(d.emotion),
    emotion: d.emotion,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Sin datos suficientes aún. ¡Escribe en tu diario!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.5, radius: 8 }}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: 'var(--color-text-secondary)' }}
          formatter={(value: number, _: string, props: { payload: { intensity: number } }) => [
            `${value} veces · Intensidad ${props.payload.intensity}`,
            'Frecuencia',
          ]}
        />
        <Bar
          dataKey="value"
          radius={[8, 8, 0, 0]}
          activeBar={(props: Record<string, unknown>) => {
            const { x, y, width, height, fill } = props as {
              x: number; y: number; width: number; height: number; fill: string;
            };
            return <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.75} rx={8} ry={8} />;
          }}
        >
          {chartData.map((entry) => (
            <Cell key={entry.emotion} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
