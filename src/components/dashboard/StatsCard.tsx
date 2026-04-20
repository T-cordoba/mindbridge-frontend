import { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
  color?: string;
}

export default function StatsCard({ label, value, icon, sub, color = 'text-primary' }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className={['text-3xl font-bold mt-1', color].join(' ')}>{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
        </div>
        <div className={['p-3 rounded-xl bg-primary-subtle', color].join(' ')}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
