'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Brain, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import FadeInSection from '@/components/ui/FadeInSection';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [disclaimer, setDisclaimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimer) { setError('Debes aceptar el descargo de responsabilidad.'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, disclaimerAccepted: disclaimer });
      await login(form.email, form.password);
      router.push('/journal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <FadeInSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-subtle text-primary rounded-2xl mb-4">
              <Brain size={32} />
            </div>
            <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
            <p className="text-text-secondary mt-1">Empieza tu diario emocional hoy</p>
          </div>
        </FadeInSection>

        <FadeInSection delay={90}>
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-card">
            {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input label="Nombre (opcional)" value={form.name} onChange={set('name')} icon={<User size={16} />} placeholder="Tu nombre" />
              <Input label="Correo electrónico" type="email" value={form.email} onChange={set('email')} icon={<Mail size={16} />} placeholder="tu@correo.com" required autoComplete="email" />
              <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} icon={<Lock size={16} />} placeholder="Mínimo 8 caracteres" minLength={8} required autoComplete="new-password" hint="Mínimo 8 caracteres" />

              <div className="bg-warning-bg border border-warning/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <strong className="text-warning">Descargo de responsabilidad:</strong> MindBridge es una herramienta
                    de autoayuda e introspección. <strong>No reemplaza la terapia psicológica profesional</strong>,
                    ni emite diagnósticos. En caso de crisis, llama a líneas de emergencia.
                  </p>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-text-secondary font-medium">
                    Entiendo y acepto este descargo de responsabilidad
                  </span>
                </label>
              </div>

              <Button type="submit" loading={loading} disabled={!disclaimer} className="w-full">
                Crear cuenta
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
