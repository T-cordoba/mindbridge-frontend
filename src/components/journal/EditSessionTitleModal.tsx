'use client';

import { FormEvent, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface EditSessionTitleModalProps {
  open: boolean;
  initialTitle: string;
  loading?: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
}

export default function EditSessionTitleModal({
  open,
  initialTitle,
  loading = false,
  onClose,
  onSave,
}: EditSessionTitleModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setError('');
  }, [open, initialTitle]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('El titulo no puede estar vacio');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('El titulo no puede superar los 200 caracteres');
      return;
    }

    setError('');
    await onSave(trimmedTitle);
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar titulo" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titulo de la conversacion"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          error={error || undefined}
          placeholder="Escribe un titulo"
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}