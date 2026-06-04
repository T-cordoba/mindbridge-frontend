'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LogOut, LayoutDashboard, MessageSquare, Users, Info, ChevronDown, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const publicLinks = [
  { href: '/help', label: 'Red de Apoyo', icon: <Users size={16} /> },
  { href: '/about', label: 'Nosotros', icon: <Info size={16} /> },
];

const privateLinks = [
  { href: '/journal', label: 'Mi Diario', icon: <MessageSquare size={16} /> },
  { href: '/dashboard', label: 'Panel', icon: <LayoutDashboard size={16} /> },
  { href: '/help', label: 'Red de Apoyo', icon: <Users size={16} /> },
];

function getUserInitial(user: { name: string | null; email: string }): string {
  const source = user.name?.trim() || user.email;
  return source[0].toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user
    ? user.role === 'admin'
      ? [...privateLinks, { href: '/admin', label: 'Admin', icon: <ShieldCheck size={16} /> }]
      : privateLinks
    : publicLinks;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Brain size={24} />
          MindBridge
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary-subtle text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
              ].join(' ')}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
                aria-haspopup="true"
                aria-expanded={open}
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none">
                  {getUserInitial(user)}
                </span>
                <ChevronDown size={14} className={['transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-card z-50 overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-text-primary text-sm truncate">{user.name ?? 'Usuario'}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors"
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
