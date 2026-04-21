# MindBridge — Frontend

**Plataforma Web de Bienestar Emocional Asistida por Inteligencia Artificial**

> Un puente entre la introspección diaria y la ayuda profesional.

---

## Descripción del proyecto

MindBridge es una aplicación web diseñada para cubrir el vacío entre el autoconocimiento personal y la terapia clínica. Funciona como un **diario reflexivo inteligente** que utiliza IA conversacional para facilitar la introspección y el desahogo del usuario en un entorno seguro y privado.

A diferencia de un chat genérico, MindBridge actúa como un espejo: devuelve al usuario sus propias emociones para ayudarlo a entenderlas mejor. Su característica más importante es el **módulo de seguridad activa**: el sistema monitorea el nivel de riesgo en tiempo real y, si detecta una crisis aguda o ideación suicida, bloquea el chat y activa un protocolo que conecta al usuario con recursos de ayuda profesional inmediatamente.

---

## Objetivos

- **Higiene mental diaria** — Una herramienta de escritura reflexiva con feedback inteligente para ordenar el ruido de los pensamientos cotidianos.
- **Red de seguridad** — La IA actúa como primer filtro de contención, detectando cuándo la introspección no es suficiente y se requiere intervención clínica.
- **Desestigmatización** — Normalizar el paso del desahogo a la terapia mediante un puente suave hacia un directorio de profesionales.

---

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Diario con IA** | Chat reflexivo entrenado para hacer preguntas que profundizan la introspección, sin dar consejos clínicos. Genera un título automático para cada sesión. |
| **Retrato emocional** | Cada respuesta de la IA actualiza un estado emocional acumulativo (no por mensaje individual), con inercia para reflejar la evolución real del estado de ánimo. |
| **Dashboard emocional** | Visualización de emociones promedio, frecuencia y tendencia de alertas en los últimos 30 días. |
| **Protocolo de crisis** | Detección automática de riesgo (escala 0–5). En nivel 5, el chat se bloquea y se despliega un aviso de crisis con recursos de ayuda. En niveles 3–4, la IA incluye recordatorios de que es una IA y guía al usuario a la Red de Apoyo. |
| **Red de apoyo** | Directorio de psicólogos para conectar al usuario con profesionales cuando lo necesita. |
| **Autenticación** | Registro, login y eliminación de cuenta con JWT. Requiere aceptación de descargo de responsabilidad en el registro. |

---

## Stack técnico

**Frontend (este repositorio)**

- Next.js 15, App Router, TypeScript
- Tailwind CSS con design system por variables CSS (sin clases de paleta hardcodeadas)
- Lucide React para iconografía
- Recharts para el dashboard

**Backend** — [mindbridge-backend](https://github.com/T-cordoba/mindbridge-backend)

- Node.js + Express (CommonJS)
- PostgreSQL via `pg`
- JWT — sin sesión, sin refresh token
- Together AI — modelo `openai/gpt-oss-20b` vía API
- Clean Architecture: `domain` → `application` → `infrastructure` → `interfaces`

---

## Ejecución

La ejecución completa de la aplicación (base de datos, backend y frontend) se gestiona desde el repositorio del backend mediante Docker Compose. Consulta la guía completa en [mindbridge-backend](https://github.com/T-cordoba/mindbridge-backend).

---

## Aviso de seguridad

MindBridge aplica detección de crisis y bloqueo de sesión ante riesgo severo. **No sustituye la atención psicológica profesional.** Ante una emergencia de salud mental, contacta a un profesional o llama a una línea de crisis.
