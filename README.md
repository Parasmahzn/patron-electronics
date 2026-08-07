# Patron Electronics

A full-stack e-commerce and repair-service platform for **Patron Electronics** — a mobile & laptop store and repair centre in Gokarneshwor, Kathmandu, Nepal.

Built as a single Next.js application: a public storefront (browse, search, cart, guest checkout with Cash on Delivery, order tracking, repair requests) and a secure admin portal (products, categories, inventory, orders, services, repair requests, reviews, storefront settings).

## Technology Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **MySQL** via **Prisma ORM 7** (MariaDB driver adapter)
- **Zod** for server-side validation
- **Lucide React** for icons
- **Framer Motion** for restrained, purposeful animation
- **bcryptjs** for admin password hashing
- **sharp** + **file-type** for validating and processing admin image uploads
- **pnpm** as the package manager

No customer accounts, no Redux/Zustand, no separate backend — the database is the single source of truth and all business logic lives in the Next.js server layer (Server Components, Server Actions, and Route Handlers).

## Requirements

- Node.js 20.19+ (Prisma 7 requirement)
- pnpm 9+ (`npm install -g pnpm` if you don't have it)
- A MySQL-compatible database (MySQL 8+ or MariaDB 10.2+)

## Installation

```bash
pnpm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | MySQL connection string: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`. URL-encode special characters in the password (e.g. `?` → `%3F`, `+` → `%2B`). |
| `AUTH_SECRET` | Random secret used for session-related cryptography. Generate with `openssl rand -base64 32`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for the initial admin account created by the seed script. Change the password after first login in a real deployment; never commit real credentials. |
| `NODE_ENV` | `development` or `production`. |
| `NEXT_PUBLIC_SITE_URL` | Public base URL, used for metadata/canonical URLs. |
| `STORAGE_PROVIDER` | Image upload storage backend. Only `local` is implemented (writes under `public/images/`); see [Image Handling](#image-handling). |

**Never commit `.env`.** It is already git-ignored.

## MySQL Setup

Any standard MySQL or MariaDB database works. Two notes specific to this project:

1. **Shared/managed MySQL hosts without `CREATE DATABASE` privileges:** `prisma migrate dev` requires creating a temporary *shadow database* to detect drift, which many free/shared MySQL hosts don't permit. This project's schema is therefore applied with `pnpm db:push` (`prisma db push`), which writes the schema directly without a shadow database. If your host **does** support creating additional databases, you can switch to the full migration workflow:
   ```bash
   pnpm exec prisma migrate dev --name init
   ```
   and commit the resulting `prisma/migrations/` folder for versioned, repeatable migrations in production (`prisma migrate deploy`).
2. The schema uses standard foreign keys (`onDelete: Restrict/Cascade/SetNull`) — no `relationMode = "prisma"` workaround is needed on a real MySQL/MariaDB server (this is only required on FK-less hosts like PlanetScale).

## Prisma Setup

The Prisma Client is generated as plain TypeScript into `lib/generated/prisma/` (not `node_modules`), configured via `prisma.config.ts` and `prisma/schema.prisma`.

```bash
# Apply the schema to your database (no shadow DB required)
pnpm db:push

# Generate the Prisma Client
pnpm db:generate
```

## Seed Data

```bash
pnpm db:seed
```

Seeds:

- 11 product categories
- 26 realistic products across mobile phones, laptops, accessories, chargers/cables, earphones, power banks, smart watches, cases, and gadgets — spanning multiple brands, prices, and product flags (new/featured/best seller/top sale/recommended/on sale) — with generated placeholder images under `public/images/products/`
- 14 repair services
- 5 representative reviews
- Default storefront settings (business info, hero copy, announcement bar)
- The initial admin account, created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

The seed script is idempotent (safe to re-run) — it upserts by natural keys (slug/SKU/email) rather than inserting duplicates.

## Development

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin portal.

## Production

```bash
pnpm build
pnpm start
```

Before deploying, run the full quality gate (see below) and apply the schema to the production database with `pnpm db:push` (or `prisma migrate deploy` if you're using versioned migrations).

## Admin Setup

The initial admin account is created by the seed script from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Admin authentication uses:

- bcrypt password hashing (12 salt rounds)
- Server-side sessions stored in the database (`AdminSession`), referenced by an opaque, HTTP-only, `SameSite=Lax` cookie — the raw session token is never stored server-side, only its SHA-256 hash
- Secure cookies in production (`Secure` flag set when `NODE_ENV=production`)
- Persistent, database-backed login rate limiting (`LoginAttempt`) — 5 failed attempts locks an IP out for 15 minutes
- `proxy.ts` performs a fast, optimistic cookie-presence check on every `/admin/*` request; the authoritative authorization check (`requireAdmin()`) runs in the protected layout and inside every mutating service function in `lib/*/*.service.ts`

To create additional admin accounts, use Prisma Studio (`pnpm db:studio`) or a one-off script — there is intentionally no public admin sign-up route.

## Image Handling

Product/category/service images are stored as URLs/paths, not binaries, in the database (seeded placeholder images are generated as SVG files under `public/images/products/`). Beyond that, the admin portal has a real upload pipeline — not just free-text URL fields:

- **Upload UI**: every product/category/service image field has a drag-and-drop/click-to-browse widget (`components/admin/ImageUpload.tsx`) alongside the manual URL text field (kept for backward compatibility with external URLs and the seed-generated placeholders).
- **Validation** (`lib/uploads/upload.validation.ts`): rejects anything over 25MB; checks the declared MIME type against an allowlist (JPEG, PNG, WebP, GIF, AVIF — no SVG); sniffs the actual file bytes with `file-type` to catch a spoofed extension; decodes with `sharp` to reject corrupted files and enforce a dimension/pixel ceiling (decompression-bomb guard); re-encodes to optimized WebP (strips EXIF metadata, normalizes format for storefront delivery).
- **Storage abstraction** (`lib/uploads/storage/`): an `ImageStorage` interface (`upload`/`delete`/`getUrl`/`exists`) with a `LocalImageStorage` implementation writing under `public/images/<products|categories|services>/<yyyy>/<mm>/<uuid>.webp`, selected via `STORAGE_PROVIDER`. Adding S3/Cloudflare R2/Azure Blob later means adding one new class behind the same interface — no changes to Product/Category/Service logic, validation, or the database schema.
- **Filenames are never trusted**: the server always generates the storage key (UUID + extension derived from the *validated* format); the client's original filename is kept only as inert display metadata.
- **Lifecycle & cleanup**: a new image is uploaded and confirmed stored *before* an old one is ever deleted — never the reverse. A failed save cleans up the file it would have referenced; replacing or removing an image, or deleting the owning product/category/service, deletes the now-orphaned file only after the database change succeeds. No file is deleted while a database row still references it.

Product images additionally carry per-image metadata (`storageKey`, dimensions, format, file size) in the `ProductImage` table, plus explicit reorder and "set as primary" controls in the admin UI — not just an array-index convention.

## Available Scripts

```bash
pnpm dev            # Start the dev server (Turbopack)
pnpm build          # Production build
pnpm start          # Start the production server
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm format         # Prettier — write
pnpm format:check   # Prettier — check only
pnpm db:generate    # Regenerate the Prisma Client
pnpm db:push        # Apply prisma/schema.prisma to the database (no shadow DB)
pnpm db:seed        # Run prisma/seed.ts
pnpm db:studio      # Open Prisma Studio
```

## Project Structure

```text
app/
  (store)/           Public storefront routes (shared Navbar/Footer/Cart layout)
  admin/
    login/           Public admin login route
    (protected)/     Authenticated admin portal (dashboard, products, categories,
                      inventory, orders, services, repair-requests, reviews, settings)
  actions/           Server Actions (auth, checkout, repair requests, order tracking, admin CRUD)
  api/               Route Handlers (search autocomplete)
components/
  ui/                Generic design-system primitives (Button, Input, Badge, Pagination, ...)
  storefront/        Navbar, Footer, SearchBar, cart button, mobile menu
  products/          Product cards, badges, filters
  cart/, checkout/   Cart and checkout UI
  admin/             Admin shell, tables, forms, dashboard widgets
lib/
  db/                Prisma Client singleton (MariaDB driver adapter)
  auth/              Password hashing, sessions, rate limiting
  uploads/           Image upload validation, storage abstraction (lib/uploads/storage/), lifecycle
  products/, orders/, services/, repairs/, reviews/, settings/
                     Domain service layers — all business logic and authorization checks
  validations/       Zod schemas (server-side validation for every form/action)
  utils/             Formatting, slugs, status labels, cn() class helper
prisma/
  schema.prisma      Data model
  seed.ts            Seed script
config/site.ts        Site-wide constants (pagination size, delivery fee, nav links, ...)
```

## Security Notes

- Customers never have accounts; the browser cart is never trusted — checkout always re-fetches prices, discounts, and stock from the database inside a single transaction, decrements inventory atomically, and rejects orders for inactive products or insufficient stock.
- Guest order tracking (`/order-status`) requires **both** the order number and phone number to match — neither alone returns anything, and sequential database IDs are never exposed.
- Every admin mutation is authorized server-side inside the service layer (`requireAdmin()`), never only in the UI or `proxy.ts`.
- Passwords are hashed with bcrypt and never logged or returned from any query; sessions are opaque tokens hashed before storage.
- Admin image uploads are gated by `requireAdmin()`, never trust the client's declared MIME type or filename, and are validated against the real file bytes (magic-byte sniff + full image decode) before being written to disk with a server-generated name — see [Image Handling](#image-handling).
