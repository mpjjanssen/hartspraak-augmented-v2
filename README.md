# augmented-psychotherapy

Express-app met toegangscode-gated landingspagina's, drietalig (NL/EN/DE).

## Lokaal draaien

```
npm install
ACCESS_CODE=jouwcode SESSION_SECRET=een-lange-random-string npm start
```

## Deploy

Auto-deploy vanaf `main` via Railway. Environment variables (`ACCESS_CODE`, `SESSION_SECRET`, `NODE_ENV=production`) staan in de Railway-configuratie.
