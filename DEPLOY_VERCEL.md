# Deploy HerdOS UI (client) to Vercel

Your API is already live: **https://dfm-server.vercel.app**

## Code already prepared

`src/api/client.ts` reads `VITE_API_URL` and calls `${VITE_API_URL}/api/...`.

No other code change is required for production if this env var is set on Vercel.

## Upload to GitHub

Push the **client** folder contents (your `dfm-client` UI repo), including:

- `src/`
- `public/`
- `index.html`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `vercel.json`
- `.env.example`
- `.gitignore` (must ignore `.env`)

Do **not** upload `node_modules/` or `dist/`.

## Vercel settings (UI project)

| Setting | Value |
|---------|--------|
| Framework Preset | **Vite** |
| Root Directory | `.` (if repo is only client) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## Environment variable (required)

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://dfm-server.vercel.app` |

No trailing slash. No `/api` at the end.

After changing this variable, **Redeploy** the UI (Vite bakes it in at build time).

## After UI is deployed

1. Copy your UI URL, e.g. `https://dfm-client.vercel.app`
2. On **dfm-server** Vercel project → Environment Variables → set:
   - `CLIENT_ORIGIN` = `https://dfm-client.vercel.app`
3. Redeploy **dfm-server** once
4. Open the UI → login: `owner@herdos.local` / `HerdOS@Owner1`

## Local test against cloud API

Create `client/.env` (gitignored):

```env
VITE_API_URL=https://dfm-server.vercel.app
```

Then `npm run dev` — the UI on localhost will call the cloud API.
