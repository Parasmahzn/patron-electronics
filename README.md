# Patron Electronics

A full-stack e-commerce and repair-service platform for **Patron Electronics** — a mobile & laptop store and repair centre in Gokarneshwor, Kathmandu, Nepal.

Built as a single Next.js application: a public storefront (browse, search, cart, guest checkout with Cash on Delivery, order tracking, repair requests) and a secure admin portal (products, categories, homepage banners, inventory, orders, services, repair requests, reviews, storefront settings).

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
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Only read by `pnpm db:seed`, which upserts an `Admin` row keyed by this email and (re)hashes this password into it. Login itself checks the database, not these variables directly — see [Admin Setup](#admin-setup). Never commit real credentials. |
| `NODE_ENV` | `development` or `production`. |
| `NEXT_PUBLIC_SITE_URL` | Public base URL, used for metadata/canonical URLs. |
| `STORAGE_PROVIDER` | Image upload storage backend: `local` (writes under `public/images/`) or `s3` (any S3-compatible bucket). See [Image Handling](#image-handling) for the full storage layout. |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Required when `STORAGE_PROVIDER=s3`. Works with any S3-compatible bucket — Railway buckets, Cloudflare R2, MinIO, Backblaze, DigitalOcean Spaces, AWS S3 itself — including a **private-only** bucket (e.g. Railway Storage Buckets), since objects are read back server-side and served through `/uploads/...`, never fetched directly from the bucket by the browser. Server-side only; never sent to the browser. |

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
- 26 realistic products across mobile phones, laptops, accessories, chargers/cables, earphones, power banks, smart watches, cases, and gadgets — spanning multiple brands, prices, and product flags (new/featured/best seller/top sale/recommended/on sale) — with generated placeholder images under `public/seed/products/` (see [Image Handling](#image-handling))
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

`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` and the `Admin` table in the database are **not two independent things** — the env vars are only ever the *input* to a one-time provisioning step; the database is the sole source of truth actually consulted at login. Concretely:

- **Login always checks the database, never `.env`.** `loginAction` (`app/actions/auth.ts`) looks up `Admin` by the submitted email and bcrypt-compares the submitted password against that row's `passwordHash`. `process.env.ADMIN_EMAIL`/`ADMIN_PASSWORD` are not read anywhere in the login path.
- **`.env` is only read by `prisma/seed.ts`**, and only while `pnpm db:seed` is actually running. Each run hashes the current `ADMIN_PASSWORD` with bcrypt (12 salt rounds) and `upsert`s an `Admin` row keyed by `ADMIN_EMAIL`: creates it if that email doesn't exist yet, or **overwrites `passwordHash` on the existing row** if it does.

What this means in practice:

- Editing `ADMIN_PASSWORD` in `.env` changes nothing by itself — the database still has the old hash until you run `pnpm db:seed` again. `.env` + reseed is a *provisioning* path (useful for a fresh environment or a fully locked-out admin), not the normal way to rotate a password day to day — see the account menu below for that.
- Editing `ADMIN_EMAIL` and re-seeding does **not** rename the existing admin — upsert is keyed by email, so a different email creates a *second*, separate `Admin` row. The old email keeps working as its own login until removed manually (e.g. via `pnpm db:studio`).
- Changing `.env` on a server that never runs `pnpm db:seed` again (e.g. most redeploys) has no effect at all — only an actual seed run touches the database.

Beyond provisioning, admin authentication uses:

- Server-side sessions stored in the database (`AdminSession`), referenced by an opaque, HTTP-only, `SameSite=Lax` cookie — the raw session token is never stored server-side, only its SHA-256 hash
- Secure cookies in production (`Secure` flag set when `NODE_ENV=production`)
- A 10-minute idle timeout: `AdminSession.lastActiveAt` is checked and refreshed on every authenticated request (`getAdminSession()`), and a client-side watcher (`components/admin/IdleTimeoutWatcher.tsx`) shows a blocking modal with a live countdown ~30 seconds before expiry (`ADMIN_IDLE_WARNING_SECONDS`), then signs the admin out even if they never trigger another request. "Stay logged in" resets the timer; "Sign out now" or a manual topbar logout both go to `/admin/login` — but an unattended session that actually times out redirects to the public storefront homepage instead (`idleLogoutAction` vs `logoutAction`, both in `app/actions/auth.ts`), since whoever's at the keyboard when it expires probably isn't the admin anymore.
- Persistent, database-backed login rate limiting (`LoginAttempt`) — 5 failed attempts locks an *identifier* out for 15 minutes. That identifier is derived from `X-Forwarded-For`, trusting the **last** comma-separated entry (the value Railway's own edge proxy appends), not the first (client-supplied and trivially spoofable) — see [Security Notes](#security-notes).
- `proxy.ts` performs a fast, optimistic cookie-presence check on every `/admin/*` request; the authoritative authorization check (`requireAdmin()`) runs in the protected layout and inside every mutating service function in `lib/*/*.service.ts`

To create additional admin accounts without going through `.env` + reseed, use Prisma Studio (`pnpm db:studio`) or a one-off script — there is intentionally no public admin sign-up route.

### Account menu (change password, change profile picture)

The topbar's avatar (`components/admin/AdminUserMenu.tsx`) opens a dropdown with **Change Password**, **Change Profile Picture**, and **Logout** — the day-to-day way to manage the signed-in admin's own account, as an alternative to the `.env` + reseed provisioning path above:

- **Change Password** (`changePasswordAction` → `lib/auth/admin.service.ts#changeAdminPassword`) re-verifies the current password server-side before accepting a new one, then hashes and stores it. It also calls `invalidateOtherAdminSessions()` (`lib/auth/session.ts`), signing out every *other* session for that admin — a session opened elsewhere, or a stolen cookie, can't keep working on the old password. The session making the change stays signed in.
- **Change Profile Picture** (`updateAvatarAction` → `lib/auth/admin.service.ts#updateAdminAvatar`) goes through the same managed upload pipeline as product/category/service images (see [Image Handling](#image-handling)), stored in the new `Admin.avatarUrl` column, with the same upload-then-replace-then-cleanup-orphan ordering as everywhere else that pipeline is used.
- Both dialogs are built on `components/ui/Dialog.tsx`, a thin wrapper around the native `<dialog>` element (`showModal()`) rather than a hand-rolled overlay — it gets focus-trapping, Escape-to-close, and backdrop dismissal from the browser for free.

## Image Handling

Product/category/service images are stored as URLs/paths, not binaries, in the database. Two entirely separate kinds of image content exist on disk, deliberately kept apart:

```text
public/
  seed/
    products/<slug>.svg        Static placeholder art, generated + committed by prisma/seed.ts.
                                Part of the build; never written to or read by the upload
                                pipeline; never deleted by any admin action (see below).

  images/                      Runtime-upload space ONLY. Nothing here at build time — the
    products/<yyyy>/<mm>/<uuid>.webp     entire tree is .gitignore'd. In production this
    categories/<yyyy>/<mm>/<uuid>.webp   directory should be a mounted persistent volume
    services/<yyyy>/<mm>/<uuid>.webp     (see Production Persistence below), since a plain
    avatars/<yyyy>/<mm>/<uuid>.webp       container filesystem is wiped on every redeploy.
    banners/<yyyy>/<mm>/<uuid>.webp
```

Filenames are UUIDs the server generates itself — the admin's original filename is kept only as inert display metadata, never used to build a path. The `<yyyy>/<mm>/` split just keeps any one directory from accumulating thousands of files over time.

### Upload pipeline (what happens to a file the admin drops in)

1. **Upload UI** (`components/admin/ImageUpload.tsx`) — drag-and-drop/click-to-browse widget on every product/category/service/banner image field, alongside a manual URL text field kept for external URLs.
2. **Validation** (`lib/uploads/upload.validation.ts`) — rejects anything over 25MB; checks the declared MIME type against an allowlist (JPEG, PNG, WebP, GIF, AVIF — no SVG, so this pipeline can never be used to plant an SVG next to the seed placeholders); sniffs the *actual* file bytes with `file-type` to catch a spoofed extension; decodes with `sharp` to reject corrupted files and enforce a dimension/pixel ceiling (decompression-bomb guard).
3. **Normalization** — re-encoded to WebP, stripping EXIF metadata, before it ever touches disk. Every managed upload is WebP; nothing else is ever written by this pipeline.
4. **Storage** (`lib/uploads/storage/`) — an `ImageStorage` interface (`upload`/`delete`/`getUrl`/`exists`/`read`) selected via `STORAGE_PROVIDER`: `LocalImageStorage` writes to `public/images/<destination>/<yyyy>/<mm>/<uuid>.webp`; `S3ImageStorage` (`s3-image-storage.ts`) uploads to any S3-compatible bucket via `@aws-sdk/client-s3` (endpoint/region/credentials from `S3_*` env vars, `forcePathStyle: true`). Both providers return the same `/uploads/<storageKey>` URL shape — the bucket does not need to support public read at all, since objects are read back through `read()` and served by the app itself (see below). Adding another provider (R2, Azure Blob) later means adding one new class behind the same interface — no changes to Product/Category/Service logic, validation, or the database schema.
5. **Lifecycle & cleanup** — a new image is uploaded and confirmed stored *before* an old one is ever deleted, never the reverse. A failed save cleans up the file it would have referenced; replacing or removing an image, or deleting the owning product/category/service, deletes the now-orphaned file only after the database change succeeds. No file is deleted while a database row still references it — and this cleanup is keyed off the database's `storageKey` column, so it can never reach a seed placeholder (seed rows never populate that column).

### How uploaded images are served

**Both providers** are served through `app/uploads/[...path]/route.ts` (`GET /uploads/<storageKey>`) — a Route Handler that calls `getImageStorage().read(storageKey)` fresh on every request — **not** through Next.js's built-in `public/` static file serving, and not by pointing the browser at the bucket directly.

This matters and is easy to get backwards: `next start` computes its set of servable `public/` files once at server boot and never rescans the filesystem afterward. Any file that appears in `public/images/` *after* the server has already started — which describes every single runtime upload, by definition — would 404 forever under plain static serving, no matter how long it's actually been sitting on disk. (`next dev` doesn't have this limitation, which is why a naive setup can look correct in local development and then fail in production.) The seed placeholders under `public/seed/` don't have this problem because they exist before the server ever boots, so they're served natively as ordinary static assets.

A bucket-direct URL (returning `${S3_PUBLIC_URL_BASE}/<key>` from `getUrl()`) was tried first and abandoned: it requires the bucket to allow public, unauthenticated read access, which several real S3-compatible providers simply don't offer — notably **Railway Storage Buckets, which are private-only** (no public buckets, no ACLs). Routing every read through this app instead — an authenticated `GetObjectCommand` server-side for `S3ImageStorage`, a plain `fs.readFile` for `LocalImageStorage` — works against any provider regardless of its public-access support, at the cost of every image request passing through this server rather than being served edge-direct from the bucket/CDN.

`lib/uploads/storage-key.ts` (`extractStorageKeyFromUrl`) — used by the entity services, and by `deleteUploadedImageAction` (`app/actions/uploads.ts`), to turn a stored `image`/`avatarUrl` string back into a storage key for cleanup on replace/delete — recognizes the `/uploads/` prefix both providers now produce identically. An image saved under the old, pre-proxy S3 URL scheme (a direct bucket URL) won't match and so won't be auto-cleaned up — harmless, and expected to be rare/nonexistent outside of the brief window this project used that scheme.

### Product images

Products carry *multiple* images with richer metadata than categories/services (which have a single `image` string field each). The `ProductImage` table stores, per image: `url`, `alt`, `sortOrder`, `isPrimary`, and — for images that went through the managed upload pipeline — `storageKey`, `originalName`, `mimeType`, `fileSize`, `width`, `height`, `format` (all nullable, so seed/legacy/external images need no backfill). The admin product form exposes explicit reorder and "set as primary" controls backed by these columns, not an implicit array-index convention.

### Production persistence

A plain container filesystem does not survive a redeploy or restart, and runtime uploads live under `public/images/` precisely because that's the one directory meant to change after boot. Deploying anywhere other than a host with a persistent local disk requires mounting that directory onto durable storage — e.g. a Railway volume mounted at the container's `public/images` path — or switching `STORAGE_PROVIDER` to an object-storage-backed implementation once one exists. Without one or the other, every uploaded image is lost on the next deploy.

## Homepage Content

The homepage hero (`components/storefront/HeroSection.tsx`) is a single two-column section (`lg:grid-cols-5`, collapsing to one column below `lg`), not two stacked sections:

- **Left/first column (60% width, `lg:col-span-3`)** — `components/storefront/BannerCarousel.tsx`, rendered **only when at least one active `Banner` exists**, at every breakpoint (below `lg` it stacks above the text column instead of beside it). Pure image carousel with no text overlaid on it: crossfade autoplay (~5s) that pauses on hover/focus and is skipped entirely — not just slowed — when the visitor has `prefers-reduced-motion` set, chevron arrows, and clickable dot indicators. Each slide is a whole-slide link when it has a `linkUrl` (a plain anchor, so the browser's own pointer cursor on hover needs no special handling) or a plain, non-clickable `div` when it doesn't. Images use `object-contain` inside a fixed `aspect-[2/1]` box — never cropped — so a banner uploaded at the recommended 2:1 ratio (e.g. 1920×960px, noted as a hint on the image field in `BannerForm.tsx`) fills the slot exactly; a different ratio shows as letterboxing rather than a crop.
- **Right/second column (40% width, `lg:col-span-2`)** — the heading/subheading (from `SiteSettings`), Shop Now/Repair Your Device buttons. **Always rendered**, regardless of whether any banners exist — it's the site's identity statement, not a promotion, so nothing ever covers it.
- **`Banner` model** (`title`, `image`, `linkUrl`, `displayOrder`, `isActive`) — admin CRUD at `/admin/banners` mirrors the Categories admin pages file-for-file: a thumbnail table with up/down reorder buttons, an active/hidden toggle, and a form (`components/admin/BannerForm.tsx`) using the same managed image-upload pipeline as everything else (see [Image Handling](#image-handling)). `linkUrl` accepts a relative internal path (`/products/some-product`, `/shop?category=mobiles`) or a full external URL, and can be left blank for a non-clickable slide.
- **Zero active banners** → the first column falls back to the original "Trusted Local Service / Expert Repairs / Cash on Delivery" decorative trust-card grid (still `lg`-only) — a fresh install never shows a blank or broken hero before an admin adds a banner.
- **"Shop by Category"** (`components/storefront/CategoryScroller.tsx`) is a horizontally-scrollable row with edge-aware chevron buttons — same `getActiveCategories()` data as before, just no longer a wrapping grid. Buttons are hidden on mobile widths, where touch/drag scroll is the natural interaction.
- Page-level content constants (icon/title/description lists like the homepage's "Why Choose Us" and the about page's capabilities) live in `config/storefront-content.ts`, not hardcoded in the page files that render them — same convention as `config/site.ts` already centralizing `NAV_LINKS`/`SORT_OPTIONS`.

## Footer Social Media Links

Social links (Facebook, Instagram, WhatsApp, Viber, TikTok, or anything else an admin types) are a flat, admin-manageable list, not one database column per platform — adding a brand-new platform later is a new **row**, never a new **column**/schema change:

- **`SocialLink` model** (`platform`, `url`, `displayOrder`, `isActive`) — managed inline within the existing admin Settings page (`components/admin/SettingsForm.tsx`; no separate admin nav section), the same "repeatable rows replaced wholesale on save" pattern already used for product specifications: a Platform selector (the 5 known platforms, or "Other…" revealing a free-text field) plus a URL field, add/remove buttons, and a visibility checkbox per row.
- **Icons**: `lib/utils/social-icon.ts` maps a known platform key to a real, hand-authored, brand-colored icon component (`components/icons/SocialIcons.tsx` — simplified but recognizable marks, not pixel-exact trademark artwork) and falls back to a generic icon with a title-cased label for anything an admin types that isn't one of the known five. This is the honest limit of "no schema change needed": a genuinely new platform never needs a migration, but its *branded* icon still needs a small code change whenever someone gets around to adding it.
- Renders as an icon row in the footer (under the business name) and as icon cards on `/contact`. An empty list renders nothing — no placeholder icons for unset platforms.
- The original `SiteSettings.facebookUrl` column was retired in favor of this — its value was migrated into a `SocialLink` row via a one-off script before the column was dropped, so no existing Facebook link was lost in the switch.

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
    (protected)/     Authenticated admin portal (dashboard, products, categories, banners,
                      inventory, orders, services, repair-requests, reviews, settings)
  actions/           Server Actions (auth, checkout, repair requests, order tracking, admin CRUD)
  api/               Route Handlers (search autocomplete)
  uploads/           Route Handler serving managed-upload images (see Image Handling)
components/
  ui/                Generic design-system primitives (Button, Input, Badge, Pagination, Dialog, ...)
  storefront/        Navbar, Footer, SearchBar, cart button, mobile menu, HeroSection, BannerCarousel,
                     CategoryScroller
  icons/             Hand-authored brand icons (SocialIcons.tsx) not covered by lucide-react
  products/          Product cards, badges, filters
  cart/, checkout/   Cart and checkout UI
  admin/             Admin shell, tables, forms, dashboard widgets, live-filtering list controls
                     (AdminFilterBar — Products/Orders/Repair Requests), account menu
lib/
  db/                Prisma Client singleton (MariaDB driver adapter)
  auth/              Password hashing, sessions, rate limiting, admin account self-service
  uploads/           Image upload validation, storage abstraction (lib/uploads/storage/), lifecycle
  products/, orders/, services/, repairs/, reviews/, settings/, banners/
                     Domain service layers — all business logic and authorization checks
  validations/       Zod schemas (server-side validation for every form/action)
  utils/             Formatting, slugs, status labels, cn() class helper, social-icon lookup
prisma/
  schema.prisma      Data model
  seed.ts            Seed script
config/
  site.ts              Site-wide constants (pagination size, delivery fee, nav links, ...)
  storefront-content.ts Page-level content arrays (Why Choose Us, about page capabilities)
```

## Error Handling

- **Unmatched routes** (`app/not-found.tsx`) — any URL that doesn't resolve renders a real 404 (correct HTTP status) with a "Page not found" message, then auto-redirects to the homepage after 3 seconds via `router.replace('/')`. A "Back to Home now" link is also shown for anyone who doesn't want to wait, and as a no-JS fallback.
- **Unhandled errors** (`app/error.tsx`) — Next's root error boundary catches unexpected render/server errors, logs them server-side only (`console.error`, never rendered to the visitor), and shows a generic "Something went wrong" message with two actions: "Try again" (`reset()`) and "Go to homepage".

## Security Notes

- Customers never have accounts; the browser cart is never trusted — checkout always re-fetches prices, discounts, and stock from the database inside a single transaction, decrements inventory atomically, and rejects orders for inactive products or insufficient stock.
- Guest order tracking (`/order-status`) requires **both** the order number and phone number to match — neither alone returns anything, and sequential database IDs are never exposed.
- Every admin mutation is authorized server-side inside the service layer (`requireAdmin()`), never only in the UI or `proxy.ts`.
- Passwords are hashed with bcrypt and never logged or returned from any query; sessions are opaque tokens hashed before storage.
- Admin image uploads are gated by `requireAdmin()`, never trust the client's declared MIME type or filename, and are validated against the real file bytes (magic-byte sniff + full image decode) before being written to disk with a server-generated name — see [Image Handling](#image-handling).
- Changing the admin password re-verifies the current password server-side (never trusts that a signed-in session alone is proof of it) and signs out every other active session for that admin — see [Admin Setup](#admin-setup).
- Login always performs a real bcrypt comparison (`verifyLoginPassword`, `lib/auth/password.ts`), even when the submitted email doesn't match any admin — comparing against a fixed dummy hash instead of short-circuiting to `false`, so response time can't be used to enumerate which admin emails exist.
- The login lockout identifier trusts the *last* `X-Forwarded-For` entry, not the first (`getClientIdentifier`, `app/actions/auth.ts`) — a proxy appends the address of whoever connected to *it* to the end of the header, so for this app's single-hop deployment (browser → Railway's edge → this container) that's the value Railway itself observed. The first entry is client-supplied and spoofable; trusting it would let an attacker defeat the 5-attempt lockout by sending a different fake value on every login POST. If another proxy (e.g. a CDN) is ever put in front of Railway, this needs to skip an additional trusted hop from the end.
