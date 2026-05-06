# TODO - Fix nwcsfeed.systems 404 / missing fetch handler

- [ ] Update `wrangler.jsonc` to include the Worker entrypoint (`main: server/index.ts`).
- [ ] Re-run `npm run build` to regenerate `dist/client` and `dist/server`.
- [ ] Deploy with `npx wrangler deploy --no-bundle` (to avoid Node/bundling issues) or plain `npx wrangler deploy` if needed.
- [ ] Verify endpoint returns 200/expected HTML at `https://nwcs-feed.23-72614.workers.dev/` and then `https://nwcsfeed.systems/`.

