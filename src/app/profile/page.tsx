'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, User as UserIcon, Mail, Save, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
}

function ProfileForm() {
  const { user, updateProfile, uploadAvatar } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setAvatarPreview(user.avatarUrl ?? null);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const updates: { name?: string; email?: string } = {};
    if (name.trim() !== (user?.name ?? '')) updates.name = name.trim();
    if (email.trim() !== user?.email) updates.email = email.trim();

    if (!Object.keys(updates).length) {
      setProfileError('No hay cambios para guardar.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile(updates);
      setProfileSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error al actualizar el perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError('');
    setAvatarSuccess('');
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarError('');
    setAvatarSuccess('');
    try {
      await uploadAvatar(avatarFile);
      setAvatarFile(null);
      setAvatarSuccess('Foto de perfil actualizada.');
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const initials = (user?.name?.trim() || user?.email || 'U')[0].toUpperCase();

  return (
    <main className="container py-10 max-w-xl">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Mi Perfil</h1>

      {/* Avatar */}
      <section className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative group">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold select-none">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Cambiar foto"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Seleccionar imagen
            </Button>
            {avatarFile && (
              <Button size="sm" loading={avatarLoading} onClick={handleAvatarUpload}>
                {avatarLoading ? 'Subiendo…' : 'Guardar foto'}
              </Button>
            )}
            <p className="text-xs text-text-muted">JPG, PNG o WebP · máx. 5 MB</p>
          </div>
        </div>
        {avatarSuccess && <Alert variant="success" className="mt-4">{avatarSuccess}</Alert>}
        {avatarError && <Alert variant="danger" className="mt-4">{avatarError}</Alert>}
      </section>

      {/* Info */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Información personal</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => { setName(e.target.value); setProfileSuccess(''); setProfileError(''); }}
            icon={<UserIcon size={16} />}
            placeholder="Tu nombre"
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setProfileSuccess(''); setProfileError(''); }}
            icon={<Mail size={16} />}
            placeholder="tu@correo.com"
          />
          {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
          {profileError && <Alert variant="danger">{profileError}</Alert>}
          <Button type="submit" loading={profileLoading} className="self-end">
            <Save size={16} />
            {profileLoading ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </section>
    </main>
  );
}
