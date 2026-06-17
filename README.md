# TARIA Next

`taria-next` is the unified JavaScript version of TARIA. It replaces the split Angular + Spring Boot runtime with a single Next.js app that serves:

- the insurance assessment flow
- the farmer risk profiling flow
- the local API routes for assessments and recommendations
- the Prisma/Postgres persistence layer

The legacy `TARIA-frontend` and `TARIA-backend` folders can remain as reference during migration, but this app is the primary runtime going forward.

## Stack

- Next.js App Router
- React 19
- Prisma
- PostgreSQL 16
- Route Handlers under `src/app/api`
- Plain JavaScript across frontend and backend code

## Requirements

- Node.js 22
- Docker
- npm

If your shell does not already use Node 22, set the path first:

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"
```

PowerShell:

```powershell
$env:PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$env:PATH"
```

## Environment

Copy `.env.example` to `.env` if you need to reset local configuration.

Default local values point to the bundled Postgres container on port `5434`.
For production, use Supabase Postgres:

- `DATABASE_URL`: Supabase pooled connection string
- `DIRECT_URL`: Supabase direct connection string for Prisma schema changes
- If your password contains reserved URL characters such as `@`, encode them before placing them in the connection string

Key variables:

- `DATABASE_URL`: Prisma connection string
- `DIRECT_URL`: direct Prisma migration connection
- `NEXT_PUBLIC_API_BASE_URL`: browser API base, defaults to `http://localhost:3000`
- `RECOMMENDATION_AUTH_ENABLED`: enables API-key auth on recommendation routes
- `RECORDS_AUTH_ENABLED`: enables API-key auth on saved-record routes
- `RECORDS_API_KEYS`: comma-separated API keys accepted by saved-record routes
- `RECOMMENDATION_RATE_LIMIT_ENABLED`: enables in-memory rate limiting
- `TRIPSECURE_*`: external product source configuration
- `AI_*`: AI ranking configuration

## First Run

From `/Users/alfreddomegil/Desktop/CODEX/taria-next`:

```bash
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

App URLs:

- Home: `http://localhost:3000`
- Insurance assessment: `http://localhost:3000/insurance/assessment`
- Farmer risk assessment: `http://localhost:3000/farmer-risk/assessment`

## Production-style Run

```bash
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run build
npm start
```

## Cloudflare Workers Deploy

This app is configured for Cloudflare Workers using the OpenNext adapter.

Included files:

- `wrangler.jsonc`
- `open-next.config.ts`
- `.dev.vars.example`
- `prisma.config.ts`

Local preview in the Workers runtime:

```bash
cp .dev.vars.example .dev.vars
npm run preview
```

Production deploy from your machine:

```bash
npm run deploy
```

Required Cloudflare runtime secrets:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put NEXT_PUBLIC_API_BASE_URL
npx wrangler secret put TRIPSECURE_BASE_URL
npx wrangler secret put TRIPSECURE_POLICY_PATH
npx wrangler secret put TRIPSECURE_API_KEY
npx wrangler secret put TRIPSECURE_API_KEY_HEADER
npx wrangler secret put AI_BASE_URL
npx wrangler secret put AI_API_KEY
npx wrangler secret put AI_MODEL
npx wrangler secret put AI_TIMEOUT_MS
npx wrangler secret put AI_TEMPERATURE
npx wrangler secret put RECOMMENDATION_AUTH_ENABLED
npx wrangler secret put RECOMMENDATION_API_KEYS
npx wrangler secret put RECORDS_AUTH_ENABLED
npx wrangler secret put RECORDS_API_KEYS
npx wrangler secret put RECOMMENDATION_RATE_LIMIT_ENABLED
npx wrangler secret put RECOMMENDATION_RATE_LIMIT_REQUESTS
npx wrangler secret put RECOMMENDATION_RATE_LIMIT_WINDOW_SECONDS
```

Notes:

- `DATABASE_URL` should use the Supabase session pooler URL on port `5432` for Workers runtime compatibility.
- `DIRECT_URL` is only needed for Prisma CLI commands like `npm run db:push`; it is not used by the deployed Worker runtime.
- Deploy without a custom route first. Add the custom domain later after the Cloudflare zone is confirmed.
- For GitHub-connected Workers Builds, set the same variables in Cloudflare under build variables and secrets.

Official references:

- Cloudflare Next.js Workers guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare automatic project config: https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/
- Cloudflare custom domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Prisma on Cloudflare Workers: https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare
- Prisma config reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference

## VPS Deploy

Target host: `taria.tripsecuregh.com`

Recommended production shape:

- Cloudflare handles DNS, proxying, and edge SSL
- Nginx terminates HTTPS on the VPS
- PM2 keeps the Next.js app running on port `3000`
- Docker Compose keeps PostgreSQL running on port `5434`

Files included for this:

- `ecosystem.config.cjs`
- `deploy/nginx.taria.tripsecuregh.com.conf`
- `.env.production.example`

Suggested VPS path:

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Degbang/taria-next-aggregator.git taria-next
cd /var/www/taria-next
sudo cp .env.production.example .env
sudo docker compose up -d
npm ci
npm run db:push
npm run db:seed
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Nginx:

1. Copy `deploy/nginx.taria.tripsecuregh.com.conf` to `/etc/nginx/sites-available/taria.tripsecuregh.com`
2. Install your Cloudflare Origin CA certificate and key at:
   - `/etc/ssl/cloudflare/taria.tripsecuregh.com.pem`
   - `/etc/ssl/cloudflare/taria.tripsecuregh.com.key`
3. Enable the site and reload Nginx

```bash
sudo ln -s /etc/nginx/sites-available/taria.tripsecuregh.com /etc/nginx/sites-enabled/taria.tripsecuregh.com
sudo nginx -t
sudo systemctl reload nginx
```

Cloudflare:

1. Add an `A` record for `taria` pointing to your VPS public IP
2. Set the record to `Proxied`
3. Set SSL/TLS mode to `Full (strict)`

Official Cloudflare references:

- DNS record creation: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
- Proxy status: https://developers.cloudflare.com/dns/proxy-status/
- Origin CA certificates: https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/
- Full (strict) SSL mode: https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/

## What The Database Stores

Current persisted records:

- Insurance assessments and their recommendation results
- Farmer risk assessments
- Farmer submitted answers
- Farmer calculated question and section scores
- Farmer final score, risk level, loan amount, insurance premium, and insurance package

Protected records APIs:

- `GET /api/v1/records/assessments?limit=25`
- `GET /api/v1/records/farmer-risk-assessments?limit=25`

Send the API key in:

```http
x-taria-key: YOUR_SECRET_KEY
```

## Validation

Useful checks:

```bash
npm run lint
npm run build
```

## Project Shape

Important paths:

- `src/app/page.js`: landing page and module entry
- `src/app/insurance/assessment/page.js`: insurance profiling UI
- `src/app/farmer-risk/assessment/page.js`: farmer profiling UI
- `src/app/api/v1/assessments`: assessment and recommendation endpoints
- `src/lib/taria/recommendations.js`: insurance recommendation logic
- `src/lib/taria/farmer-risk.js`: farmer scoring model, loan tiers, and premium mapping
- `src/components/FarmerRiskClient.js`: farmer questionnaire and pager output card
- `prisma/schema.prisma`: database schema
- `prisma/seed.js`: local seed data

## Notes

- Farmer outputs use the capped decision bands currently configured in the scoring module:
  - `80+` => loan `GHS 15,000`, premium `GHS 500`
  - `70-79` => loan `GHS 13,500`, premium `GHS 700`
  - `60-69` => loan `GHS 10,500`, premium `GHS 900`
  - `<60` => loan `GHS 7,500`, premium `GHS 1,000`
- The old Angular frontend is no longer required to run the product locally.
- The old Spring Boot backend is no longer required for the migrated flows in this app.
