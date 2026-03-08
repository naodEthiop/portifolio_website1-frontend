# Dynamic Resume (Supabase)

This frontend includes a Supabase-powered resume system:

- Public resume page: `/resume`
- Admin editor: `/admin/resume` (Supabase Auth)
- Live updates: Supabase Realtime `postgres_changes`
- PDF export: `html2canvas` + `jsPDF`

## 1) Apply the schema

In Supabase Dashboard → **SQL Editor**, run:

- `frontend/docs/supabase_resume_schema.sql`

## 2) Enable Realtime (recommended)

Supabase Dashboard → **Database → Replication**:

- Enable replication for: `personal_info`, `skills`, `projects`, `experience`, `certificates`

## 3) Configure env vars

Create `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security note

The included RLS policies allow **any authenticated user** to write resume data.
If your project allows public signups, restrict write access (e.g., allow-list `auth.uid()` or require a custom claim).

