import Spinner from '@/components/ui/Spinner';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import type { Session } from '@/types';
import RecentSessionItem from './RecentSessionItem';

interface RecentSessionsSidebarProps {
  sessions: Session[];
  activeSessionId: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  loading?: boolean;
  error?: string;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export default function RecentSessionsSidebar({
  sessions,
  activeSessionId,
  collapsed = false,
  onToggleCollapse,
  loading = false,
  error,
  title = 'Conversaciones recientes',
  emptyMessage = 'Aun no hay sesiones recientes.',
  className = '',
}: RecentSessionsSidebarProps) {
  return (
    <aside className={[
      'shrink-0 border-r border-border bg-bg py-4 flex-col transition-[width] duration-300',
      collapsed
        ? 'w-[var(--journal-sidebar-collapsed-width)] px-2'
        : 'w-[var(--journal-sidebar-width)] px-3',
      className,
    ].join(' ')}>
      <div className={[
        'pb-3',
        collapsed ? 'px-0 flex justify-center' : 'px-2 flex items-center justify-between gap-2',
      ].join(' ')}>
        {!collapsed && (
          <p className="flex-1 text-[0.72rem] uppercase tracking-[0.08em] text-text-muted font-semibold leading-tight whitespace-normal break-words">
            {title}
          </p>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-xl border border-border text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors flex items-center justify-center"
          aria-label={collapsed ? 'Expandir conversaciones recientes' : 'Colapsar conversaciones recientes'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={[
        'flex-1 overflow-y-auto',
        collapsed ? 'pr-0' : 'pr-1',
      ].join(' ')}>
        {loading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : error ? (
          <p className={[
            'text-sm text-danger',
            collapsed ? 'text-center text-xs px-1' : 'px-2',
          ].join(' ')}>{error}</p>
        ) : sessions.length === 0 ? (
          <p className={[
            'text-sm text-text-muted',
            collapsed ? 'text-center text-xs px-1' : 'px-2',
          ].join(' ')}>{emptyMessage}</p>
        ) : (
          <div className="space-y-1.5">
            {sessions.map((session) => (
              <RecentSessionItem
                key={session.id}
                session={session}
                active={session.id === activeSessionId}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
