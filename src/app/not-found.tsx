import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-text-secondary mb-8 max-w-sm">
        Lo que buscas no existe o fue movido. Vuelve al inicio y continúa desde ahí.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
