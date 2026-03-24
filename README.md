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
3. Set `FRANKLIN_TOKEN_SECRET` to a long random secret.
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client and run the database migration:

```bash
npm run prisma:generate
npx prisma migrate dev --name phase12_durable_proposal_workflow
```

6. Seed the organization and service catalog:

```bash
npm run prisma:seed
```

7. Start the app:

```bash
npm run dev
```

## Core routes

- `/login` for internal mock sign-in
- `/app/proposals` for the durable proposal workspace
- `/app/proposals/new` for multi-step draft creation
- `/app/proposals/[proposalId]` for internal proposal detail and send flow
- `/p/[token]` for the secure client-facing proposal
- `/p/[token]/checklist` for the post-acceptance checklist
- `/p/[token]/pdf` for the accepted delivery PDF render route
