import { Star, MapPin, Globe, Phone, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Psychologist } from '@/types';

interface PsychologistCardProps {
  psychologist: Psychologist;
}

export default function PsychologistCard({ psychologist: p }: PsychologistCardProps) {
  const initials = p.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <Card hover>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-text-primary">{p.name}</h3>
              <p className="text-sm text-primary font-medium">{p.specialty}</p>
            </div>
            {p.rating && (
              <div className="flex items-center gap-1 text-warning text-sm font-semibold">
                <Star size={14} fill="currentColor" />
                {p.rating}
              </div>
            )}
          </div>

          <p className="text-sm text-text-secondary mt-2 leading-relaxed line-clamp-2">{p.bio}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {p.location && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <MapPin size={12} /> {p.location}
              </span>
            )}
            {p.languages && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Globe size={12} /> {p.languages}
              </span>
            )}
          </div>

          {p.priceRange && (
            <Badge variant="primary" className="mt-3">{p.priceRange}</Badge>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {p.phone && (
              <a href={`tel:${p.phone.replace(/\s/g, '')}`}>
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <Phone size={13} /> Llamar
                </Button>
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`}>
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <Mail size={13} /> Escribir
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
