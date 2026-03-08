# Portfolio Frontend

React + TypeScript + Vite frontend for the portfolio platform.

## Setup

```bash
npm install
npm run dev
```

## Environment

Create `.env.local`:

```bash
VITE_API_BASE_URL=/api/v1
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Routes

- `/` portfolio homepage
- `/resume` Supabase-powered dynamic resume + PDF download
- `/admin/login` legacy admin (JWT, backend)
- `/admin/resume` resume admin (Supabase Auth)

