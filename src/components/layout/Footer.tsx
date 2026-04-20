import Link from 'next/link';
import { Brain, AlertTriangle, Heart, Shield, HelpCircle, ExternalLink } from 'lucide-react';

const footerLinks = [
  { label: 'Privacidad', href: '/about', icon: Shield },
  { label: 'Centro de ayuda', href: '/help', icon: HelpCircle },
  { label: 'Lineas de crisis', href: '/help', icon: ExternalLink },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-surface border-t border-border">

      <div className="container py-8 md:py-9">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-subtle">
                <Brain size={16} className="text-primary" />
              </div>
              MindBridge
            </div>

            <p className="text-text-muted text-sm leading-relaxed max-w-xl">
              Un espacio seguro para explorar tus emociones y encontrar claridad mental,
              disponible cuando mas lo necesitas.
            </p>

            <div className="flex items-center gap-1 text-text-muted text-xs">
              <span>Hecho con</span>
              <Heart size={11} className="text-primary" fill="currentColor" />
              <span>para el bienestar mental</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <p className="uppercase tracking-widest text-text-muted text-[10px] font-semibold">
              Navegacion
            </p>

            <div className="flex flex-col gap-2 md:items-end">
              {footerLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="bg-warning-bg">
          <div className="container py-3 flex items-center justify-center gap-2 text-warning text-xs text-center">
            <AlertTriangle size={13} className="flex-shrink-0" />
            <span>
              <strong>Aviso importante:</strong> MindBridge es una herramienta de apoyo emocional y{' '}
              <strong>NO reemplaza</strong> la terapia psicologica profesional.
            </span>
          </div>
        </div>

        <div className="my-6 h-px bg-border" />

        <p className="text-center text-xs text-text-muted">
          © {new Date().getFullYear()} MindBridge. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
