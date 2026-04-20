import Link from 'next/link';
import { Brain, ShieldCheck, BarChart2, Users, AlertTriangle, ArrowRight, MessageCircleHeart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FadeInSection from '@/components/ui/FadeInSection';

const features = [
  {
    icon: <MessageCircleHeart size={28} />,
    title: 'Diario Reflexivo IA',
    description: 'Conversaciones guiadas que te ayudan a entender tus emociones sin juicios ni diagnósticos.',
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'Panel Emocional',
    description: 'Visualiza tus patrones de estado de ánimo con gráficos semanales y tendencias.',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Protocolo de Seguridad',
    description: 'Detección automática de situaciones de riesgo con acceso inmediato a líneas de emergencia.',
  },
  {
    icon: <Users size={28} />,
    title: 'Red de Profesionales',
    description: 'Directorio de psicólogos aliados para cuando la introspección no es suficiente.',
  },
];

export default function HomePage() {
  return (
    <>
      <FadeInSection>
        {/* Hero */}
        <section className="gradient-hero py-24 px-4 text-center">
          <div className="container max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-subtle border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Brain size={16} />
              Herramienta de higiene mental
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Donde tus pensamientos{' '}
              <span className="gradient-text">encuentran orden</span>
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
              MindBridge es tu diario inteligente. Te acompaña en la introspección diaria
              y te conecta con ayuda profesional cuando la necesitas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Comenzar gratis <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="secondary">Ver psicólogos</Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection delay={80}>
        {/* Disclaimer */}
        <section className="py-6 bg-warning-bg border-y border-warning/30">
          <div className="container flex items-center gap-3 justify-center text-sm text-warning max-w-2xl mx-auto text-center">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <p>
              <strong>MindBridge NO reemplaza la terapia psicológica profesional.</strong>{' '}
              Es una herramienta de autoayuda. Ante una emergencia, llama a la línea 106 (Colombia).
            </p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection delay={120}>
        {/* Features */}
        <section className="py-20 px-4">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">Todo lo que necesitas</h2>
            <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
              Un ecosistema completo de bienestar mental diseñado con ética y seguridad como prioridad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <Card key={f.title} hover className="text-center">
                  <div className="w-14 h-14 bg-primary-subtle text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection delay={150}>
        {/* CTA */}
        <section className="py-20 px-4 bg-primary-subtle">
          <div className="container text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Empieza tu primer diario hoy</h2>
            <p className="text-text-secondary mb-8">
              Completamente privado. Tus conversaciones son solo tuyas.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Crear cuenta gratuita <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
