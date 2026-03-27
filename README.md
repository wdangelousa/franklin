# Franklin

Franklin is a Next.js and Prisma application for Onebridge's internal proposal workflow.

## Features

- Protected internal workspace for `ADMIN` and `PARTNER` roles
- HMAC-signed session cookies with middleware enforcement and secret rotation
- OAuth/OIDC authentication for production (strict mode)
- Demo accounts for development (mock mode)
- Prisma-backed service catalog
- Durable proposal lifecycle: draft, publish, view, accept, reject, expire
- Snapshot-based proposal items (catalog changes don't rewrite sent proposals)
- Secure public token access with hash + encrypted recovery + token-level expiration
- Distributed rate limiting (Redis/Upstash with in-memory fallback)
- Transactional email notifications via MailerSend (proposal published, accepted, rejected)
- MailerSend webhook integration for delivery tracking
- Structured audit logging for security and notification events
- Post-acceptance client and internal checklists
- Notification architecture prepared for WhatsApp (future)
- Automated test suite (Vitest)

## Local development

```bash
cp .env.example .env
npm install
npm run db:setup   # generate + migrate + seed
npm run dev
npm test           # run tests
```

Docker PostgreSQL (if you don't have one running):

```bash
docker run --name franklin-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=franklin \
  -p 5432:5432 -d postgres:16
```

## Environment variables

### Required

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. No fallback. |
| `FRANKLIN_TOKEN_SECRET` | **Required in production.** Used for token encryption (AES-256-GCM) and session signing (HMAC-SHA256). Dev fallback exists but is blocked in production. |

### Authentication

| Variable | Default | Notes |
|---|---|---|
| `FRANKLIN_AUTH_MODE` | `"mock"` | `"mock"` for demo login, `"strict"` for OIDC. |
| `FRANKLIN_SESSION_SECRET` | Falls back to `TOKEN_SECRET` | Override for session HMAC signing. |
| `FRANKLIN_OIDC_ISSUER` | — | OIDC issuer URL (required for strict mode). |
| `FRANKLIN_OIDC_CLIENT_ID` | — | OAuth client ID (required for strict mode). |
| `FRANKLIN_OIDC_CLIENT_SECRET` | — | OAuth client secret (required for strict mode). |
| `FRANKLIN_OIDC_SCOPES` | `"openid email profile"` | Space-separated OIDC scopes. |
| `FRANKLIN_BASE_URL` | `http://localhost:3000` | Application base URL for OIDC redirect_uri. |
| `FRANKLIN_ADMIN_EMAILS` | — | Comma-separated emails that receive ADMIN role. Others get PARTNER. |

### Secret rotation

| Variable | Notes |
|---|---|
| `FRANKLIN_TOKEN_SECRET_PREVIOUS` | Previous token encryption key. Set during rotation to keep old tokens decryptable. |
| `FRANKLIN_SESSION_SECRET_PREVIOUS` | Previous session signing key. Set during rotation to keep old sessions valid. |

### Rate limiting

| Variable | Notes |
|---|---|
| `FRANKLIN_UPSTASH_REDIS_URL` | Upstash Redis REST URL. If not set, uses in-memory (single-instance only). |
| `FRANKLIN_UPSTASH_REDIS_TOKEN` | Upstash Redis REST token. |

## Authentication modes

### Mock mode (`FRANKLIN_AUTH_MODE="mock"`)

Default. Provides three hardcoded demo accounts. Session cookies are HMAC-signed. Suitable for development and MVP testing.

### Strict mode (`FRANKLIN_AUTH_MODE="strict"`)

Uses an external OIDC/OAuth provider. Demo login is completely disabled:
- The sign-in form shows only the corporate login button (or an error if OIDC is not configured).
- `signInAsDemoUser()` throws `AuthError("DEMO_LOGIN_DISABLED_IN_STRICT_MODE")`.

Set `FRANKLIN_OIDC_ISSUER`, `FRANKLIN_OIDC_CLIENT_ID`, and `FRANKLIN_OIDC_CLIENT_SECRET` before enabling strict mode. The system performs OIDC discovery automatically. The callback URL is `{FRANKLIN_BASE_URL}/api/auth/callback`.

**Do not set strict mode without configuring OIDC. It will lock all users out.**

## Security architecture

### Session cookies

- Format: `base64url(payload).base64url(HMAC-SHA256)`
- Signed with `FRANKLIN_SESSION_SECRET` (falls back to `FRANKLIN_TOKEN_SECRET`)
- Unsigned/tampered cookies rejected; no fallback to raw JSON
- HttpOnly, SameSite=Lax, Secure in production, 8-hour TTL

### Middleware

Runs before server rendering on every request to `/app/*` and `/p/*`:

- **`/app/*`**: Validates HMAC signature, session structure, and user role. Redirects to `/login` on failure.
- **`/p/*`**: Rate limits reads (60/min per IP). Returns HTTP 429 when exceeded.

### Rate limiting

Two layers:

1. **Middleware** (Edge): Public read throttling on `/p/*`.
2. **Server actions**: Mutable action throttling (accept: 10/min, reject: 10/min, checklist: 30/min per IP).

**Failure policy:** If the Redis backend is unavailable, requests are **allowed** (fail-open) to avoid blocking legitimate traffic. This is logged.

**Limitation:** The middleware rate limiter runs in Edge Runtime with in-memory state (not shared across instances). The server action limiter uses Redis when configured. For full distributed rate limiting at the middleware level, consider a CDN-level solution.

### Proposal tokens

- 24 random bytes + `frkpub_` prefix
- Stored as SHA-256 hash (lookup) + AES-256-GCM ciphertext (recovery)
- Token-level and proposal-level `expiresAt` enforced at every access point

### Audit logging

Structured JSON logs to stdout. Events include:

| Event | When |
|---|---|
| `auth.login.success` | Successful demo or OIDC login |
| `auth.login.denied` | Failed login attempt |
| `auth.login.demo_blocked` | Demo login attempted in strict mode |
| `auth.logout` | User sign-out |
| `middleware.auth.rejected` | Invalid session in middleware |
| `middleware.ratelimit.exceeded` | Rate limit hit in middleware |
| `ratelimit.exceeded` | Rate limit hit in server action |
| `public.proposal.accepted` | Proposal accepted by client |
| `public.proposal.rejected` | Proposal rejected by client |
| `public.checklist.completed` | Checklist item completed |

Each entry includes: `event`, `timestamp`, `actorType`, `outcome`, `ip`, `route`, `reasonCode`. Token references use prefix only (first 16 chars). Raw tokens and secrets are never logged.

## Secret rotation procedure

1. Generate a new secret value.
2. Set the **current** secret as `FRANKLIN_TOKEN_SECRET_PREVIOUS` (and/or `FRANKLIN_SESSION_SECRET_PREVIOUS`).
3. Set the **new** secret as `FRANKLIN_TOKEN_SECRET` (and/or `FRANKLIN_SESSION_SECRET`).
4. Deploy. Existing sessions and tokens remain valid via the previous key.
5. After sufficient time (e.g., session TTL of 8 hours), remove `*_PREVIOUS` vars.
6. After removing previous secrets, any artifacts signed with the old key become permanently invalid.

**Impact of rotation:**
- Sessions: Users on old sessions stay authenticated until `*_PREVIOUS` is removed.
- Tokens: Encrypted ciphertext remains decryptable while `*_PREVIOUS` is present. Hash-based lookup always works.

## Database management

| Command | Use |
|---|---|
| `npm run db:setup` | First-time local setup (generate + migrate + seed) |
| `npm run prisma:migrate` | Apply pending migrations (development) |
| `npm run db:deploy` | Apply migrations in production/CI |
| `npm run prisma:seed` | Seed organization and catalog data |

**Avoid in production:** `prisma db push` (may drop data) and `prisma migrate dev` (interactive).

## Deployment under subpath

Franklin is configured with `basePath: "/franklin"` in `next.config.ts`. The entire app is served under `/franklin`:

- `https://onebridgestalwart.com/franklin/login`
- `https://onebridgestalwart.com/franklin/app/dashboard`
- `https://onebridgestalwart.com/franklin/p/{token}`

**Vercel deployment:**

1. Set `FRANKLIN_BASE_URL` to `https://onebridgestalwart.com/franklin` in environment variables.
2. If using OIDC, set the callback URL in your provider to `https://onebridgestalwart.com/franklin/api/auth/callback`.
3. If using MailerSend webhooks, set the webhook URL to `https://onebridgestalwart.com/franklin/api/webhooks/mailersend`.
4. Deploy normally — Next.js handles the basePath routing automatically.

**What basePath handles automatically:**
- `<Link href>` and `redirect()` are prefixed with `/franklin`
- Static assets are served from `/franklin/_next/...`
- Middleware matcher paths are evaluated without the basePath prefix
- `revalidatePath()` calls are prefixed automatically

**What is handled manually:**
- Cookie `path` is set to `/franklin` (scoped to the app)
- `window.location.origin` usages add `/franklin` explicitly
- The OIDC form action uses `/franklin/api/auth/login`
- `FRANKLIN_BASE_URL` must include `/franklin` in the value

## Core routes

All routes below are relative to the basePath (`/franklin`):

| Route | Purpose |
|---|---|
| `/login` | Internal sign-in (mock or OIDC) |
| `/api/auth/login` | OIDC flow initiation (strict mode) |
| `/api/auth/callback` | OIDC callback handler |
| `/app/proposals` | Proposal workspace |
| `/app/proposals/new` | Multi-step draft builder |
| `/app/proposals/[id]` | Proposal detail + publish |
| `/p/[token]` | Public client-facing proposal |
| `/p/[token]/checklist` | Post-acceptance checklist |
| `/p/[token]/pdf` | Accepted proposal PDF render |

## Email notifications

Franklin sends transactional emails via [MailerSend](https://www.mailersend.com) using the REST API directly (no SDK dependency).

### Configuration

| Variable | Required | Notes |
|---|---|---|
| `MAILERSEND_API_KEY` | Yes for email | MailerSend API key. If missing, emails are skipped with an audit log. |
| `EMAIL_FROM` | No | Sender address, e.g. `Franklin <noreply@yourdomain.com>`. Default: `Franklin <noreply@example.com>`. Domain must be verified in MailerSend. |
| `EMAIL_REPLY_TO` | No | Reply-to address for all emails. |
| `EMAIL_INTERNAL_NOTIFICATIONS` | No | Recipient for internal notifications (accepted/rejected). |
| `MAILERSEND_WEBHOOK_SECRET` | No | HMAC signing secret for webhook verification. |

### Events that send email

| Event | Recipient | Template |
|---|---|---|
| Proposal published | Client (`clientContactEmail`) | Link to proposal with expiration date |
| Proposal accepted | Internal team (`EMAIL_INTERNAL_NOTIFICATIONS`) | Acceptance confirmation |
| Proposal rejected | Internal team (`EMAIL_INTERNAL_NOTIFICATIONS`) | Rejection with optional reason |

### Webhook

Configure the MailerSend webhook to `{FRANKLIN_BASE_URL}/api/webhooks/mailersend`. The endpoint processes `activity.delivered`, `activity.hard_bounced`, `activity.soft_bounced`, and `activity.spam_complaint` events with audit logging. Signature verification uses HMAC-SHA256 when `MAILERSEND_WEBHOOK_SECRET` is set.

### Architecture

The notification system is channel-agnostic:
- `src/lib/notifications/types.ts` — channel-independent payloads
- `src/lib/notifications/notify.ts` — domain-level orchestrator
- `src/lib/notifications/email/mailersend.ts` — MailerSend provider (fetch-based, no SDK)
- `src/lib/notifications/email/templates/` — HTML templates

Email failures never block the main business flow. All send attempts are logged via the audit system.

### WhatsApp (future)

The architecture supports adding WhatsApp as a second channel. The `NotificationChannel` type and provider interface are ready. Implementation deferred to a future sprint.

## PDF generation

The system records `PDF_GENERATION_QUEUED` events on acceptance and serves `/p/[token]/pdf` as a render route. There is no background generation job — the PDF route renders from the stored snapshot at request time.

## Testing

```bash
npm test          # 75 tests across 10 suites
npm run test:watch
```

Coverage includes: session signing/verification (Node + Edge), secret rotation, auth mode enforcement, token generation/encryption/decryption, rate limiter behavior, audit logging, typed errors, proposal number generation.
