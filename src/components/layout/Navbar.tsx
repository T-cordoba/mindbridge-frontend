'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LogOut, LayoutDashboard, MessageSquare, Users, Info } from 'lucide-react';
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

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user ? privateLinks : publicLinks;

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
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors"
            >
              <LogOut size={16} />
              Salir
            </button>
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
