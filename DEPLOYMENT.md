# Deploying BloodConnect

The app is a TanStack Start (React 19 + Vite 7) full-stack app with SSR and
server functions, backed by Supabase. `vite build` produces both the static
client assets and a server bundle; which server bundle is emitted depends on
the build target ("nitro preset").

The target is auto-detected from the host's own environment variables, so the
same repository deploys anywhere with no code changes:

| Host | Detected via | Preset |
| --- | --- | --- |
| Vercel | `VERCEL=1` (set automatically) | `vercel` |
| Netlify | `NETLIFY=true` (set automatically) | `netlify` |
| Cloudflare Pages/Workers | `CF_PAGES=1` (set automatically) | `cloudflare_pages` |
| Anything else (Render, Railway, Fly, VPS, Docker) | `NITRO_PRESET=node_server` | `node_server` |

`NITRO_PRESET` always wins if you set it explicitly.

## Environment variables

Copy `.env.example` and set the same values in your host's dashboard. Both the
`VITE_`-prefixed (browser) and unprefixed (server) variants are required:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_PROJECT_ID
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed if you enable privileged server-side
operations. Never expose it with a `VITE_` prefix.

`VITE_*` values are inlined at build time — after changing them you must
redeploy, not just restart.

## Vercel

1. Import the repository (Framework preset: **Other** / auto).
2. Build command `npm run build`, install command `npm install`.
3. Add the environment variables above for Production and Preview.
4. Deploy. Nitro writes Vercel Build Output API files to `.vercel/output`, so no
   `vercel.json` is required.

## Netlify

Build command `npm run build`, no publish directory override needed — the
`netlify` preset emits `dist/` plus the SSR function automatically.

## Node / Docker / Render / Railway / Fly

```bash
NITRO_PRESET=node_server npm run build   # or: npm run build:node
npm start                                # node .output/server/index.mjs
```

The server listens on `PORT` (default 3000). Minimal Dockerfile:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NITRO_PRESET=node_server
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## Static-only hosting

This app uses SSR and server functions, so pure static hosts (GitHub Pages,
S3 without a function runtime) are not supported. Use one of the targets above.

## Supabase configuration after deploying

In Supabase → Authentication → URL Configuration add your deployed origin to
**Site URL** and **Redirect URLs**, including:

- `https://your-domain.com`
- `https://your-domain.com/dashboard`
- `https://your-domain.com/reset-password`

Google sign-in additionally requires the Google provider to be enabled in
Supabase Auth with your OAuth client ID/secret, and the Supabase callback URL
(`https://<project-ref>.supabase.co/auth/v1/callback`) registered in the Google
Cloud console.

## Routing

Client-side routing works on all supported hosts without `_redirects`,
`vercel.json`, or hash routing. If a deep link 404s, verify the route file
exists under `src/routes/` and that the build succeeded.

## Vercel (turnkey)

`vercel.json` is committed, so Vercel needs no manual build settings:

- install: `npm install`
- build: `npm run build:vercel` (Nitro `vercel` preset → `.vercel/output`, Build Output API)

### Required environment variables (Project Settings → Environment Variables)

| Name | Scope | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | all | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | all | publishable / anon key |
| `SUPABASE_URL` | all | same as above |
| `SUPABASE_PUBLISHABLE_KEY` | all | same as above |

No service-role key is needed — every server function uses either the
authenticated user's token (`requireSupabaseAuth`) or the anon publishable
key via `src/lib/supabase-public.server.ts`.

### Database

All schema lives in `supabase/migrations/`. Apply it to the target project with
`supabase db push` (or paste the SQL in the Supabase SQL editor). Donor
registrations are append-only: `public.donors` has no unique constraint on
`user_id`, and `registerDonor` always `INSERT`s a new row, so historical
registrations are never overwritten.

### Supabase Auth settings after deploy

- Site URL: `https://<your-domain>`
- Redirect URLs: `https://<your-domain>/**`, including `/reset-password`
- Google provider: enable it and add `https://<project-ref>.supabase.co/auth/v1/callback`
