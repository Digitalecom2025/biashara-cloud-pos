# Biashara Cloud POS: Temporary Vercel Demo Deployment

This guide prepares a hosted demo to help land the first client. It is not the final production hosting plan. After client payment, move to VPS + PostgreSQL for production operations.

## Current Database Strategy

Local development stays on SQLite using:

```env
DATABASE_URL="file:./dev.db"
```

The temporary Vercel demo should use PostgreSQL with the PostgreSQL Prisma schema:

```txt
prisma/schema.postgresql.prisma
```

The `postinstall` script runs `scripts/prisma-generate.cjs`, which automatically uses the PostgreSQL schema when `DATABASE_URL` starts with `postgres://` or `postgresql://`.

## A. Push Project To GitHub

1. Confirm local checks pass:

```bash
npm run lint
npm run build
```

2. Commit the deployment preparation changes.
3. Push the repository to GitHub.

## B. Create Vercel Project

1. Open Vercel.
2. Import the GitHub repository.
3. Framework preset: `Next.js`.
4. Install command: `npm install`.
5. Build command: `npm run build`.

`npm install` runs Prisma Client generation through `postinstall`. On Vercel, the generator will use `prisma/schema.postgresql.prisma` when the PostgreSQL `DATABASE_URL` is present.

## C. Add Hosted PostgreSQL Database

Use one of these hosted database options:

- Prisma Postgres through Vercel Marketplace
- Neon Postgres
- Supabase Postgres
- Another Vercel Marketplace PostgreSQL provider

Copy the PostgreSQL connection string. It should look like:

```env
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
```

Do not commit real database credentials.

## D. Add Environment Variables In Vercel

Add these variables in the Vercel project settings:

```env
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
NEXT_PUBLIC_APP_NAME="Biashara Cloud POS"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
```

For a custom domain, update `NEXT_PUBLIC_APP_URL` after the domain is connected.

## E. Run Prisma Setup For Demo Database

Run these once against the hosted PostgreSQL demo database.

From local terminal with `DATABASE_URL` set to the hosted PostgreSQL URL:

```bash
npm run prisma:generate:postgres
npm run prisma:push:postgres
npm run prisma:seed:postgres
```

Important:

- `prisma:push:postgres` creates/updates the demo database tables.
- `prisma:seed:postgres` seeds only the known demo tenant `nairobi-cbd-store`.
- The seed script does not wipe unknown production/client data.
- Do not run destructive reset commands against a real client database.

## F. Deploy And Verify

Deploy from Vercel, then confirm:

- `/login` works.
- Demo roles work:
  - Admin
  - Cashier
  - Branch Manager
  - Stock Clerk
  - Accountant
- `/sales` works.
- `/sync-center` works.
- Offline sale queue works in the browser.
- `Sync Now` sends pending offline sales to `/api/sales`.
- Duplicate prevention works through `offlineSyncId`.
- `/super-admin` is not linked in the client shell.
- `/super-admin` still works by direct URL for internal review.

## G. Connect Domain

Recommended demo domains:

- `leadsstacks.com`
- `pos.leadsstacks.com`

Steps:

1. Add the domain in Vercel project settings.
2. Copy the DNS records provided by Vercel.
3. Update DNS in Rocketlauncher CRM/domain manager.
4. Wait for DNS propagation.
5. Confirm:

```txt
https://leadsstacks.com/login
```

or:

```txt
https://pos.leadsstacks.com/login
```

## H. Demo Safety Notes

- This is a demo environment.
- Do not enter real business data.
- Demo login is local client-side presentation auth, not production authentication.
- Super Admin remains hidden from the client-facing shell.
- Offline sync is browser-side IndexedDB plus `/api/sales` sync.
- API data is not aggressively cached by the service worker.

## I. Later Production Plan

After landing the first paying client:

1. Move hosting to VPS.
2. Use managed or VPS-hosted PostgreSQL.
3. Add production authentication.
4. Add tenant isolation and production authorization checks.
5. Add backups, monitoring, and operational logging.
6. Configure domain, SSL, and deployment pipeline for production.
