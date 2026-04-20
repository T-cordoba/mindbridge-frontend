import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const config: Record<AlertVariant, { icon: ReactNode; classes: string }> = {
  info: { icon: <Info size={18} />, classes: 'bg-primary-subtle text-primary border-primary/30' },
  success: { icon: <CheckCircle size={18} />, classes: 'bg-success-bg text-success border-success/30' },
  warning: { icon: <AlertTriangle size={18} />, classes: 'bg-warning-bg text-warning border-warning/30' },
  danger: { icon: <AlertCircle size={18} />, classes: 'bg-danger-bg text-danger border-danger/30' },
};

export default function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const { icon, classes } = config[variant];
  return (
    <div className={['flex gap-3 p-4 rounded-xl border', classes, className].join(' ')} role="alert">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
