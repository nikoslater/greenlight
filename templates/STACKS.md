# STACKS.md — preset technology choices (the corpus)

> Bootstrap picks from this file. **The rule: use the default unless there is a specific,
> recorded reason not to** (record deviations in DECISIONS.md). Boring, dominant, deeply
> documented technology is a feature: it's what AI agents debug best, what has answers
> online, and what won't need a rewrite. The stack is never the product's edge.

## Universal rules
- One language across the project where possible (TypeScript for web) — context-switching between languages is the solo/AI killer.
- Modular monolith. No microservices, no message queues, no Kubernetes for v1 — ever.
- Postgres is the default database for anything relational. It also covers JSON, full-text search, and vector embeddings — don't add a second datastore until Postgres provably can't.
- Never hand-roll: auth/session crypto, password hashing, payments, email delivery.
- Prefer platform features over packages (STANDARDS ladder) and managed services over self-hosting for v1.

## Default picks by profile

**Web app (with or without users) — the default for most ideas**
Next.js (App Router) + TypeScript + Tailwind CSS · Postgres via Supabase (or Neon) + Drizzle ORM · Auth: Supabase Auth or Clerk (magic link / OAuth — never custom passwords) · Payments: Stripe Checkout + billing portal (never build billing UI) · Email: Resend · Hosting: Vercel · Errors: Sentry · Tests: Vitest + Playwright.
*Static/simple site with no server logic:* Vite + TypeScript, skip the framework.

**API / backend service**
FastAPI (Python) or Hono/Fastify (TypeScript) · Postgres + the language's standard ORM (SQLAlchemy / Drizzle) · versioned routes (`/v1/`) · schema-validated bodies (Pydantic / Zod) · Hosting: Fly.io or Railway · Tests: pytest / Vitest + a smoke script that hits every route.

**CLI / script / automation**
Python (stdlib-first; `argparse`, `pathlib`) or Go for distribution as a single binary · config via env/flags, never hardcoded · Tests: pytest / go test.

**iOS**
SwiftUI + Swift, SwiftData or SQLite for local persistence, CloudKit or the web-app backend above if it needs sync. XCTest + XCUITest for interaction tests.

**Desktop**
Tauri (web UI, tiny footprint) over Electron unless a needed Node API forces Electron.

## Avoid for v1 (with the reason)
- MongoDB "because it's easy" — schemaless bites at exactly the moment you have real users
- GraphQL, tRPC-for-future-mobile, microservices — complexity before scale exists
- Exotic/young frameworks (thin ecosystems = the loop can't debug them)
- Custom auth or session code of any kind
- Self-hosted anything (mail servers, DBs on a VPS) before product-market fit
- Any package that duplicates a platform capability (see STANDARDS "Write less code")
