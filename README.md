# Microgrid Projects

The modern, static-first rebuild of [microgridprojects.com](https://microgridprojects.com): a searchable global directory of 197 historical microgrid project records, plus market and educational guides.

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run lint
npm run build
```

## Legacy data import

The project records in `app/data/projects.ts` were migrated from the original WordPress map. To refresh the generated dataset while the legacy source remains available:

```bash
curl -kLsS https://microgridprojects.com/ | node scripts/import-legacy.mjs
```

The insecure TLS flag is required only because the legacy host serves a mismatched certificate. The production Next.js site does not make requests to that host.
