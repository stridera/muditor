# Muditor deploy (PM2)

Production no longer runs dev servers. Build first, then reload PM2.

```bash
cd ~/Code/mud/muditor
bun run build                      # packages/* then apps/* (api -> apps/api/dist, web -> apps/web/.next)
pm2 startOrReload ~/ecosystem.config.js --update-env && pm2 save
```

- `muditor-api` runs `bun run --filter @muditor/api start:prod` (= `bun dist/main.js` in apps/api, cwd matters
  for `src/schema.gql`). `bun src/main.ts` does NOT boot (Bun does not apply the NestJS GraphQL decorators);
  the dev command uses node + `@swc-node/register`.
- `muditor-web` runs `bun run start:web` (`next start`) with `NODE_ENV=production`, `PORT=3000`; it needs a fresh `bun run build` first.
  Note `next build` and `next dev` share `apps/web/.next`: do not build while a dev server is serving from it.
- Any component calling `useSearchParams()` must sit under a `<Suspense>` boundary (the root `ZoneProvider` isolates its use in `ZoneUrlSync`), otherwise prerender fails.

## Smoke checks

```bash
curl -s -X POST -H 'content-type: application/json' -d '{"query":"{ __typename }"}' http://127.0.0.1:3001/graphql  # {"data":{"__typename":"Query"}}
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/   # 200 (or 307 to /login)
```
