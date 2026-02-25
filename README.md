# WavePoll

Realtime polling app built with Next.js, Drizzle ORM, PostgreSQL, Redis, [Upstash Realtime](https://upstash.com/realtime), and S3-compatible object storage.

## What It Does

- Create polls with types: `single`, `rating`, `text`, `image`
- Publish live or save as draft
- Live voting and live results updates
- Reactions and live viewer presence
- Embeddable poll view
- CSV export
- Poll-ended summary

## Tech Stack

- Next.js
- React + Mantine + TanStack Query
- Drizzle ORM + PostgreSQL
- Redis + serverless-redis-http (Upstash-compatible local REST)
- [Upstash](https://upstash.com/) Realtime / QStash integrations
- S3-compatible object storage (e.g. AWS S3, Cloudflare R2)

## Prerequisites

- Node.js
- Yarn
- Docker + Docker Compose

## Code Quality Tooling

This project uses **[Biome](https://biomejs.dev/)** for formatting and linting.

- It does **not** use Prettier + ESLint.
- Install the Biome extension/plugin in your IDE to match project formatting/lint behavior.

## Local Development (Important Order for First-Time Setup)

The setup order below is crucial **only the first time you set up the project**.

### 1. Start infrastructure first

Run this first:

```bash
docker-compose up -d
```

This starts:

- PostgreSQL (`postgres`)
- Redis (`redis`)
- Serverless Redis HTTP (`serverless-redis-http`) for Upstash-compatible REST
- MinIO S3 (`minio`)

MinIO dashboard:

- URL: `http://localhost:9001/`
- Username: `wavepoll`
- Password: `wavepoll`

### 2. Create local env file

Copy env template before running storage setup:

```bash
cp .env.example .env.development.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.development.local
```

This is crucial: MinIO setup explicitly loads `.env.development.local`.
If your storage variables are not in that file, `yarn setup:storage:dev` will fail.

### 3. Install dependencies

```bash
yarn install
```

### 4. Setup local S3 bucket (MinIO)

```bash
yarn setup:storage:dev
```

This runs `scripts/minio.ts`, which:

- Reads `.env.development.local`
- Creates the S3 bucket if missing
- Makes the bucket public

### 5. Run the app

```bash
yarn dev
```

Open: `http://localhost:3000`

## Dev Note: Realtime + Presence

With the local `serverless-redis-http` container, **presence and realtime do not work**.

For realtime/presence in development, you must use real Upstash Redis credentials in your local env:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Storage in Dev vs Production

- Local development uses **MinIO** from `docker compose` as an S3-compatible storage service.
- In production, use real credentials from any **S3-compatible provider**:
  - AWS S3
  - Cloudflare R2
  - or other S3-compatible services

WavePoll only requires S3-compatible endpoint + bucket + credentials, so provider choice is flexible.

## Environment

Base local variables are in `.env.example`.

Primary ones:

- `NODE_ENV`
- `APP_BASE_URL`
- `COOKIE_SECRET` (minimum 32 characters)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `S3_ENDPOINT`
- `S3_REGION` (optional, defaults to `auto` when not provided)
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_S3_URL`

Database configuration:

- You can configure the database using either:
  - `DATABASE_URL`
  - or all of:
    - `DATABASE_HOST`
    - `DATABASE_PORT`
    - `DATABASE_NAME`
    - `DATABASE_USER`
    - `DATABASE_PASSWORD`
- If both `DATABASE_URL` and the individual fields are set, `DATABASE_URL` takes precedence.

Production-only TLS note (`NODE_ENV=production`):

- `DATABASE_CA_CERT` (optional)
- `DATABASE_TLS_REJECT_UNAUTHORIZED` (optional)

### Feature-Specific Environment Variables

For **realtime poll-ended notification**, set:

- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

Notes:

- QStash variables are provided by [Upstash](https://upstash.com/).

For **poll-ended email summary**, set:

- `RESEND_API_KEY`
- `EMAIL_FROM`

In addition to the QStash variables above.

These are used with [Resend](https://resend.com/).

For **Sentry monitoring**, set:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`

These are used with [Sentry](https://sentry.io/).

## Useful Commands

```bash
yarn dev
yarn typecheck
yarn build
yarn start
```

Database (Drizzle):

```bash
yarn db:generate
yarn db:migrate:dev
yarn db:push
yarn db:studio
```
