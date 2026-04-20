# MindBridge Frontend

Aplicacion web de MindBridge construida con Next.js 15, TypeScript y Tailwind CSS.

Este repositorio contiene solo el frontend.
El backend se separo a un repositorio independiente local en:

`C:\Users\Tomas\VisualProjects\mindbridge-backend`

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts

## Requisitos

- Node.js 18+
- npm 9+
- Backend de MindBridge corriendo (por defecto en `http://localhost:4000`)

## Configuracion

1. Instala dependencias:

```bash
npm install
```

2. Crea archivo de entorno a partir del ejemplo:

```bash
cp .env.local.example .env.local
```

3. Variable requerida:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build produccion
npm run start   # correr build
npm run lint    # lint
```

## Estructura principal

```text
src/
	app/
	components/
	context/
	lib/
	types/
```

## Notas

- Este frontend usa autenticacion por JWT almacenado en `localStorage`.
- La app asume que el backend expone la API en `/api`.
- MindBridge es una herramienta de apoyo emocional y no reemplaza terapia profesional.