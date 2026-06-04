'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import { adminApi } from '@/lib/api';
import type { User, PaginatedMeta } from '@/types';

const PAGE_SIZE = 10;

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getUsers(targetPage, PAGE_SIZE);
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const goToPage = (target: number) => {
    if (target < 1 || target > meta.totalPages || target === meta.page) return;
    fetchUsers(target);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-subtle text-primary rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de administración</h1>
            <p className="text-text-secondary text-sm mt-0.5">{meta.total} usuarios registrados</p>
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-text-secondary font-medium">Usuario</th>
                    <th className="text-left px-4 py-3 text-text-secondary font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-text-secondary font-medium">Rol</th>
                    <th className="text-left px-4 py-3 text-text-secondary font-medium hidden md:table-cell">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                      <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={[
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          u.role === 'admin'
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-surface-elevated text-text-secondary',
                        ].join(' ')}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-2 text-text-secondary">
                  <Users size={32} className="opacity-30" />
                  <p>No hay usuarios registrados</p>
                </div>
              )}
            </div>

            {meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Página {meta.page} de {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => goToPage(meta.page + 1)}
                    disabled={meta.page === meta.totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
