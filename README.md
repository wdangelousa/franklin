# Franklin

Franklin is a Next.js and Prisma MVP for Onebridge's internal proposal workflow. The current codebase supports:

- Protected internal workspace access for `ADMIN` and `PARTNER`
- Prisma-backed service catalog seeded from Annex A
- Durable proposal draft creation and send flow
- Snapshot-based proposal items and Annex B-style proposal content storage
- Secure public token access backed by stored token hashes plus encrypted token recovery for internal use
- Durable `VIEWED`, `ACCEPTED`, `EXPIRED`, and PDF-queue trigger events

## Local development

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a local PostgreSQL database.
3. Keep `FRANKLIN_AUTH_MODE="mock"` for local internal use. Other modes are not implemented today.
4. Set `FRANKLIN_TOKEN_SECRET` to a long random secret.
5. Install dependencies:

```bash
npm install
```

6. Generate Prisma client and sync the database schema:

```bash
npm run prisma:generate
npx prisma db push
```

7. Seed the organization and service catalog:

```bash
npm run prisma:seed
```

8. Start the app:

```bash
npm run dev
```

## Required environment variables

- `DATABASE_URL`: required. The app uses PostgreSQL through Prisma and does not provide a non-database fallback for the main workflow.
- `FRANKLIN_AUTH_MODE`: supported today only as `mock`. Keep `mock` for local internal testing until a real provider-based auth flow exists.
- `FRANKLIN_TOKEN_SECRET`: recommended for any meaningful local run. If omitted, the code falls back to a development secret, which is not appropriate for shared or persistent environments.

## Minimal terminal setup for today

If you already have PostgreSQL running locally on port `5432`:

```bash
cp .env.example .env
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run dev
```

If you do not have PostgreSQL running locally, the fastest path is Docker:

```bash
docker run --name franklin-postgres \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e POSTGRES_DB=franklin \
	-p 5432:5432 \
	-d postgres:16

cp .env.example .env
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Notes:

- The repository currently includes `prisma/schema.prisma` and seed data, but not a standard Prisma migrations directory. For local setup today, `prisma db push` is the simplest reliable path.
- If port `3000` is already in use, Next.js will automatically choose another port such as `3001`.

## Core routes

- `/login` for internal mock sign-in
- `/app/proposals` for the durable proposal workspace
- `/app/proposals/new` for multi-step draft creation
- `/app/proposals/[proposalId]` for internal proposal detail and send flow
- `/p/[token]` for the secure client-facing proposal
- `/p/[token]/checklist` for the post-acceptance checklist
- `/p/[token]/pdf` for the accepted delivery PDF render route
