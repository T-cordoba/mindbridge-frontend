import Link from 'next/link';
import { Phone, ExternalLink, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

const EMERGENCY_LINES = [
  { country: 'Colombia', name: 'Línea 106 - Salud Mental', phone: '106' },
  { country: 'Colombia', name: 'Línea 123 - Emergencias', phone: '123' },
  { country: 'México', name: 'SAPTEL', phone: '55 5259-8121' },
  { country: 'España', name: 'Teléfono de la Esperanza', phone: '717 003 717' },
  { country: 'Argentina', name: 'Centro de Asistencia al Suicida', phone: '135' },
];

export default function CrisisAlert() {
  return (
    <div className="crisis-pulse rounded-2xl border-2 border-crisis bg-crisis-bg p-6 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle size={24} className="text-crisis flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-crisis">Conversación bloqueada por seguridad</h2>
          <p className="text-sm text-text-secondary mt-1">
            Detectamos señales de crisis y este chat quedó bloqueado de forma inmediata.
            Busca apoyo ahora mismo. No estás solo/a.
          </p>
        </div>
      </div>

      <Link href="/help" className="block mb-4">
        <Button variant="danger" size="sm" className="w-full gap-1.5">
          <ExternalLink size={14} />
          Buscar ayuda urgente ahora
        </Button>
      </Link>

      <div className="grid gap-3 mb-5">
        {EMERGENCY_LINES.map((line) => (
          <div
            key={line.phone}
            className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border"
          >
            <div>
              <p className="text-xs text-text-muted">{line.country}</p>
              <p className="text-sm font-medium text-text-primary">{line.name}</p>
            </div>
            <a href={`tel:${line.phone.replace(/\s/g, '')}`}>
              <Button size="sm" variant="danger" className="gap-1.5">
                <Phone size={14} />
                {line.phone}
              </Button>
            </a>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/help" className="flex-1">
          <Button variant="secondary" size="sm" className="w-full gap-1.5">
            <ExternalLink size={14} />
            Ver recursos y directorio profesional
          </Button>
        </Link>
      </div>
    </div>
  );
}
