# Build/Deploy notes

This project is a Cloudflare Worker running TanStack React Start via the TanStack `createStartHandler`.

If you deploy and get a 404/no fetch handler, it usually means the Worker build failed or Wrangler deployed the wrong config.

This repo expects:

- `server/index.ts` imports `./src/router` (SSR/Worker entry)
- the SSR build must succeed during deploy
- `dist/client` must exist for static assets

If deploy fails with module resolution errors, verify the existence of:

- `server/src/router.ts` (this repo currently imports `./src/router` from `server/index.ts`)
