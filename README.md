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

Key variables:

- `DATABASE_URL`: Prisma connection string
- `DIRECT_URL`: direct Prisma migration connection
- `NEXT_PUBLIC_API_BASE_URL`: browser API base, defaults to `http://localhost:3000`
- `RECOMMENDATION_AUTH_ENABLED`: enables API-key auth on recommendation routes
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
