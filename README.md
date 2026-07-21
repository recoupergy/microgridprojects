# Microgrid Projects

The modern, static-first rebuild of [microgridprojects.com](https://microgridprojects.com): a searchable global directory of 197 historical microgrid project records, plus market and educational guides.

Its goal is to open-source the available knowledge and data about microgrids so more people can see what is possible, build better systems, and lead the energy transition. It is the research and discovery companion to [MicrogridModeler.com](https://www.microgridmodeler.com), which helps turn that evidence into reproducible feasibility studies for new microgrids.

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
