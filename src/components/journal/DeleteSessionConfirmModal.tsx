'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface DeleteSessionConfirmModalProps {
  open: boolean;
  sessionTitle: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteSessionConfirmModal({
  open,
  sessionTitle,
  loading = false,
  onClose,
  onConfirm,
}: DeleteSessionConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Eliminar sesion" maxWidth="max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onConfirm();
        }}
        className="space-y-5"
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Esta accion eliminara la conversacion
          {sessionTitle ? <strong className="text-text-primary"> "{sessionTitle}"</strong> : ''}.
          No se puede deshacer.
        </p>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Eliminar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
