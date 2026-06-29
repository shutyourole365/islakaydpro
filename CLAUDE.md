# CLAUDE.md

Guidance for working in this repo. Keep it current when conventions change.

## What this is

**Islakayd** — a peer-to-peer equipment-rental marketplace (Australian).
Single-page React app (Vite + TypeScript + Tailwind) backed by **Supabase**
(auth, Postgres, storage, Edge Functions), packaged for web **and** native
mobile via **Capacitor** (iOS/Android).

## Commands

```bash
npm install            # install (postinstall runs typecheck, non-blocking)
npm run dev            # Vite dev server
npm run build          # production build → dist/
npm run preview        # serve the built dist/

npm run typecheck      # tsc --noEmit (tsconfig.app.json) — run before pushing
npm run lint           # eslint .
npm test               # Vitest (watch). Unit tests in src/__tests__
npm run test:run       # Vitest single run (CI-style)
npm run test:unit      # run only src/__tests__
npm run test:coverage  # coverage report
npm run test:e2e       # Playwright e2e (specs in e2e/)

npm run seed:equipment # tsx scripts/seed-equipment.ts
npm run mobile:ios     # build + cap sync + open Xcode (android variant too)
```

There's no single "check everything" script — before pushing run
`npm run typecheck && npm run lint && npm run test:run`.

## Architecture & where things live

```
src/
  App.tsx            # root: holds global UI state + does ALL view switching
  main.tsx           # React entry
  lib/
    supabase.ts      # Supabase client (singleton `supabase`)
    serviceWorker.ts # PWA SW registration
  services/          # ALL backend/IO access lives here (9 modules):
                     #   database.ts ai.ts payments.ts storage.ts email.ts
                     #   analytics.ts authHelpers.ts pushNotifications.ts
                     #   errorMonitoring.ts
  contexts/          # AuthContext, ThemeContext (React context providers)
  hooks/             # reusable hooks (useForm, useTheme, useMobileApp, …)
  components/        # ~100 feature folders (booking, listing, ai, admin,
                     #   payments, disputes, home, layout, ui, …)
  types/             # shared TS types incl. branded ids (EquipmentId, UserId)
  utils/             # pure helpers
  __tests__/         # Vitest unit/component tests
supabase/
  functions/ai-chat  # Edge Function: AI proxy (OpenAI/Anthropic + fallback)
  migrations/        # SQL migrations — add one when changing the schema
e2e/                 # Playwright specs + fixtures
android/  ios/       # Capacitor native shells (generated; build via mobile:*)
```

Data flow: **components → services/* → `lib/supabase.ts` → Supabase.**
Components should not import `@supabase/supabase-js` directly; go through a
service. Auth/user state comes from `contexts/AuthContext` (`useAuth`).

## Conventions

- **TypeScript + functional components + hooks.** Match the style of the file
  you're editing.
- **Imports are relative** (`./components/...`); no path aliases configured.
- **Styling is Tailwind** utility classes (see `tailwind.config.js`); icons
  from `lucide-react`; maps via `react-leaflet`.
- **Service layer for IO.** New backend calls go in `src/services/*`, typed,
  not inline in components.
- **Shared types in `src/types`.** Reuse the branded id types
  (`EquipmentId`, `UserId`, etc.) rather than bare `string`.
- **Lazy-load heavy/feature components** with `React.lazy` + `Suspense`, as
  `App.tsx` already does for premium/admin features.
- **Sanitize any user-rendered HTML** with `sanitize-html` (already a dep).

## Gotchas & rules (read before contributing)

- **No router.** Navigation is **state-driven in `App.tsx`** (a `currentView`
  / view-switch pattern with lazy components) — there is no `react-router`.
  Add a screen by wiring it into `App.tsx`'s view state, not routes.
- **Vitest needs a local TMPDIR.** The `test*` scripts prepend
  `mkdir -p .vitest_tmp && TMPDIR=$PWD/.vitest_tmp` for the sandbox to work.
  Run tests via the npm scripts, not bare `vitest`, or they may fail.
- **ESLint plugins are intentionally disabled** (awaiting ESLint 10 support) —
  see `eslint.config.js`. So react-hooks/react-refresh rules are NOT enforced
  by lint; follow hook rules manually. `supabase/functions/**` is lint-ignored.
- **Demo mode:** if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset,
  `lib/supabase.ts` returns a placeholder mock client instead of crashing.
  Use `isSupabaseConfigured` to guard features that require a real backend.
- **Never commit secrets.** API keys go in env vars / deploy-provider secrets,
  not Git. Copy `.env.example` → `.env.local` for local dev.
- **AI assistant is opt-in:** set `VITE_ENABLE_AI=true` plus an
  `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`; the Edge Function falls back to
  rule-based replies when no key is set.
- **Schema changes need a migration** in `supabase/migrations/` (timestamped),
  not ad-hoc SQL.
- **Mobile builds** must `npm run build` first — the `mobile:*` scripts sync
  `dist/` into the Capacitor shells.

## Deployment

- **Vercel** (`npm run deploy` → prod) and **Netlify** (`deploy:netlify`); PRs
  get Netlify deploy previews. Config: `vercel.json`, `netlify.toml`.
- Errors are reported to **Sentry** (`@sentry/react`) in production.

## Skills

Repo-local Agent Skills live in `.claude/skills/<name>/SKILL.md`
(e.g. `marketing-planning`, `audit-trail`, `proposal-drafting`). Add a new one
as its own folder with YAML frontmatter (`name`, `description`).
