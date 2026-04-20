import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Session } from '@/types';
import { formatRecentSessionDate, getRecentSessionPreview } from './recentSessionMeta';

interface RecentSessionItemProps {
  session: Session;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
  dateLabel?: string;
  preview?: string;
}

export default function RecentSessionItem({
  session,
  active = false,
  collapsed = false,
  href,
  dateLabel,
  preview,
}: RecentSessionItemProps) {
  const resolvedHref = href ?? `/journal/${session.id}`;
  const resolvedDateLabel = dateLabel ?? formatRecentSessionDate(session.updatedAt);
  const resolvedPreview = preview ?? getRecentSessionPreview(session);

  return (
    <Link
      href={resolvedHref}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? session.title : undefined}
      className={[
        'block rounded-2xl border transition-colors',
        collapsed ? 'px-2 py-2' : 'px-3 py-3',
        active
          ? 'border-border-subtle bg-[var(--journal-sidebar-item-active-bg)]'
          : 'border-transparent hover:bg-[var(--journal-sidebar-item-hover-bg)]',
      ].join(' ')}
    >
      <div className={[
        'flex items-center gap-3',
        collapsed ? 'justify-center' : '',
      ].join(' ')}>
        <div
          className={[
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
            active
              ? 'bg-[var(--journal-sidebar-icon-active-bg)] text-[var(--journal-sidebar-icon-active-fg)]'
              : 'bg-[var(--journal-sidebar-icon-bg)] text-text-muted',
          ].join(' ')}
        >
          <MessageCircle size={14} />
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="text-[0.98rem] font-semibold text-text-primary truncate flex-1">{session.title}</p>
              <span className="text-xs text-text-muted shrink-0">{resolvedDateLabel}</span>
            </div>
            <p className="text-sm text-text-secondary truncate mt-0.5">{resolvedPreview}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
