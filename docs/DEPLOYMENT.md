# Agre Billing — Deployment Guide

## 1. Supabase Backend Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Execute the migrations located in `supabase/migrations/` in order:
   - `00001_initial_schema.sql`
   - `00002_rls_policies.sql`
   - `00003_rpc_functions.sql`
3. Execute `supabase/seed.sql` to populate permissions.
4. Copy the Project URL and Public Anon Key.

## 2. Environment Configuration

In `desktop/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

## 3. Desktop Application Build (Tauri 2)

```bash
cd desktop
npm run build
npm run tauri build
```

## 4. Mobile Application Build (Expo)

```bash
cd mobile
npx expo export
```
