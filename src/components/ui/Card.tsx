import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  hover?: boolean;
}

export default function Card({ children, elevated = false, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-border p-6',
        elevated ? 'bg-surface-elevated' : 'bg-surface',
        hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-card cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
