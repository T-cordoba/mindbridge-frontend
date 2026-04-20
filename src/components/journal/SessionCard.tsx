import Link from 'next/link';
import { MessageSquare, AlertTriangle, Lock, Trash2, Pencil } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Session } from '@/types';

interface SessionCardProps {
  session: Session;
  onDelete?: (id: string) => void;
  onEdit?: (session: Session) => void;
}

export default function SessionCard({ session, onDelete, onEdit }: SessionCardProps) {
  const alertBadge = session.isBlocked
    ? <Badge variant="danger"><Lock size={10} className="inline mr-1" />Bloqueada</Badge>
    : session.maxAlertLevel >= 3
      ? <Badge variant="warning"><AlertTriangle size={10} className="inline mr-1" />Nivel {session.maxAlertLevel}</Badge>
      : null;

  return (
    <div className="group relative">
      <Link href={`/journal/${session.id}`}>
        <Card hover className="cursor-pointer">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={[
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                session.isBlocked ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary',
              ].join(' ')}>
                {session.isBlocked ? <Lock size={18} /> : <MessageSquare size={18} />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{session.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {session.messageCount} mensajes · {new Date(session.updatedAt).toLocaleDateString('es')}
                </p>
              </div>
            </div>
            {alertBadge && (
              <div className="group-hover:opacity-0 transition-opacity flex-shrink-0">
                {alertBadge}
              </div>
            )}
          </div>
        </Card>
      </Link>
      {(onDelete || onEdit) && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(session);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-subtle transition-all"
              aria-label="Editar titulo"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg transition-all"
              aria-label="Eliminar sesión"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
