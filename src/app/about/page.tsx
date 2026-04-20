import { Shield, Heart, Lock, Brain, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import FadeInSection from '@/components/ui/FadeInSection';

const values = [
  {
    icon: <Heart size={24} />,
    title: 'Empatía sin diagnóstico',
    description: 'Escuchamos y acompañamos. Nunca emitimos juicios clínicos ni sugerimos tratamientos.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Seguridad activa',
    description: 'Monitoreamos en tiempo real para activar protocolos de emergencia cuando más se necesita.',
  },
  {
    icon: <Lock size={24} />,
    title: 'Privacidad total',
    description: 'Tus conversaciones son estrictamente privadas. Nadie más tiene acceso a tu diario.',
  },
  {
    icon: <Brain size={24} />,
    title: 'IA responsable',
    description: 'Usamos inteligencia artificial con protocolos éticos estrictos y siempre como puente hacia humanos.',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <FadeInSection>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-subtle text-primary rounded-2xl mb-4">
            <Brain size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-3">Sobre MindBridge</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Un puente entre la introspección diaria y la ayuda profesional.
            Creemos que la salud mental preventiva debe ser accesible para todos.
          </p>
        </div>
      </FadeInSection>

      <FadeInSection delay={90}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {values.map((v) => (
            <Card key={v.title}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-subtle text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{v.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </FadeInSection>

      <FadeInSection delay={140}>
        <Card className="bg-warning-bg border-warning/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning mb-2">Aviso legal importante</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                MindBridge es un prototipo MVP de herramienta de autoayuda e introspección personal.
                <strong className="text-text-primary"> No reemplaza, bajo ninguna circunstancia, la terapia
                psicológica profesional</strong>, el diagnóstico clínico ni el tratamiento médico.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                El sistema está diseñado para detectar situaciones de riesgo y derivar
                inmediatamente a servicios de emergencia y profesionales cualificados.
                Si estás en crisis, llama al <strong className="text-danger">106</strong> (Colombia)
                o al número de emergencias de tu país.
              </p>
            </div>
          </div>
        </Card>
      </FadeInSection>
    </div>
  );
}
