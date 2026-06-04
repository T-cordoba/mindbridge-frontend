'use client';

import { useEffect, useRef, useState } from 'react';

const THINKING_WORDS = [
  'Escuchando',
  'Reflexionando',
  'Sintiendo',
  'Sosteniendo',
  'Contemplando',
  'Acompañando',
  'Integrando',
  'Acogiendo',
  'Respirando',
  'Resonando',
  'Conectando',
  'Honrando',
  'Comprendiendo',
  'Fluyendo',
  'Habitando',
  'Tejiendo',
  'Nutriendo',
  'Explorando',
  'Reconociendo',
  'Cuidando',
  'Validando',
  'Germinando',
  'Suavizando',
  'Clarificando',
  'Sintonizando',
  'Aquietando',
  'Centrando',
  'Discerniendo',
  'Destilando',
  'Abrazando',
  'Madurando',
  'Floreciendo',
  'Despertando',
  'Enraizando',
  'Iluminando',
  'Albergando',
  'Entretejiendo',
  'Procesando',
  'Latiendo',
];

const INTERVAL_MS = 3800;

export default function ThinkingIndicator() {
  const [word, setWord] = useState(() => THINKING_WORDS[Math.floor(Math.random() * THINKING_WORDS.length)]);
  const [visible, setVisible] = useState(true);
  const indexRef = useRef(Math.floor(Math.random() * THINKING_WORDS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        indexRef.current = (indexRef.current + 1) % THINKING_WORDS.length;
        setWord(THINKING_WORDS[indexRef.current]);
        setVisible(true);
      }, 250);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="thinking-shimmer text-sm italic select-none"
      style={{ transition: 'opacity 250ms ease', opacity: visible ? 1 : 0 }}
      aria-live="polite"
      aria-label="Asistente pensando"
    >
      {word}…
    </span>
  );
}
