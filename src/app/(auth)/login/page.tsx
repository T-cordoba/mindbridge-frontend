'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Brain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PublicRoute from '@/components/layout/PublicRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import FadeInSection from '@/components/ui/FadeInSection';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/journal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <FadeInSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-subtle text-primary rounded-2xl mb-4">
              <Brain size={32} />
            </div>
            <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
            <p className="text-text-secondary mt-1">Inicia sesión para continuar tu diario</p>
          </div>
        </FadeInSection>

        <FadeInSection delay={90}>
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-card">
            {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <Button type="submit" loading={loading} className="w-full mt-2">
                Iniciar sesión
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
    </PublicRoute>
  );
}
