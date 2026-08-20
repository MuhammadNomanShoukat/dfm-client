# HerdOS Client (React + MUI)

## Local (API on this PC)

```bash
npm install
npm run dev
```

Leave `VITE_API_URL` empty — Vite proxies `/api` to `localhost:4000`.

## Local UI + cloud API

```env
VITE_API_URL=https://dfm-server.vercel.app
```

## Vercel

See [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md).

Set `VITE_API_URL=https://dfm-server.vercel.app` in the Vercel dashboard.
