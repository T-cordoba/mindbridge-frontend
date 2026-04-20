'use client';

import { useEffect, useState } from 'react';
import { Phone, Users, AlertTriangle } from 'lucide-react';
import PsychologistCard from '@/components/marketplace/PsychologistCard';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FadeInSection from '@/components/ui/FadeInSection';
import { marketplaceApi } from '@/lib/api';
import type { Psychologist } from '@/types';

const CRISIS_LINES = [
  { name: 'Línea 106 — Salud Mental', number: '106', country: 'Colombia' },
  { name: 'Línea 123 — Emergencias', number: '123', country: 'Colombia' },
  { name: 'SAPTEL', number: '5525598121', country: 'México' },
  { name: 'Teléfono de la Esperanza', number: '717003717', country: 'España' },
];

export default function HelpPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    marketplaceApi.getPsychologists()
      .then(({ psychologists }) => setPsychologists(psychologists))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-10 max-w-4xl">
      <FadeInSection>
        <h1 className="text-2xl font-bold mb-2">Red de Apoyo</h1>
        <p className="text-text-secondary mb-10">
          Líneas de emergencia inmediata y directorio de psicólogos aliados.
        </p>
      </FadeInSection>

      <FadeInSection delay={80}>
        {/* Emergency lines */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-danger" />
            <h2 className="text-lg font-semibold text-danger">Líneas de emergencia</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CRISIS_LINES.map((line) => (
              <div key={line.number} className="flex items-center justify-between bg-crisis-bg border border-crisis/30 rounded-xl p-4">
                <div>
                  <p className="text-xs text-text-muted">{line.country}</p>
                  <p className="font-semibold text-crisis">{line.name}</p>
                </div>
                <a href={`tel:${line.number}`}>
                  <Button size="sm" variant="danger" className="gap-1.5">
                    <Phone size={13} /> Llamar
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection delay={130}>
        {/* Psychologists */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">Psicólogos aliados</h2>
          </div>

          {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {psychologists.map((p) => (
                <PsychologistCard key={p.id} psychologist={p} />
              ))}
            </div>
          )}
        </section>
      </FadeInSection>
    </div>
  );
}
