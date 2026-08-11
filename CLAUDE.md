# Patron Electronics — Project Instructions

This file is the authoritative specification for the Patron Electronics web application. It was originally a standalone master specification file; its full content now lives directly here so the project is self-contained. Read it in full before making any implementation decision — it governs architecture, tech stack, data model, security rules, and the definition of done.

> **IMPORTANT:** The goal is a real, production-quality full-stack application, not a static mockup or frontend-only prototype.

---

# 1. Project Overview

Build a modern e-commerce and repair-service platform for:

**Patron Electronics**

Business type:

- Mobile phone sales
- Laptop sales
- Mobile accessories
- Laptop accessories
- Electronics
- Gadgets
- Mobile repair
- Laptop repair
- Maintenance services
- Display Change
- Battery Replacement
- Glass Replacement
- Charging Port
- Mic
- Loc unlock Service
- All kind of Apple Care
- Laptop display change

The application must provide two experiences:

### Public Storefront

Customers can:

- Browse products
- Search products
- Filter products
- Sort products
- View categories
- View product details
- Add products to cart
- Checkout as a guest
- Place Cash on Delivery orders
- Track orders
- View repair services
- Submit repair requests

### Admin Portal

Administrators can:

- Securely log in
- View dashboard
- Manage products
- Manage categories
- Manage inventory
- Manage orders
- Manage services
- Manage repair requests
- Manage reviews
- Manage storefront content/settings

---

# 2. Business Information

## Business

**Patron Electronics**

## Category

Mobile and Laptop Repairing

## Contact

**9843012697**

## Address

**P9MJ+8J6, Gokarneshwor 44600, Nepal**

## Facebook

https://www.facebook.com/p/Patron-Electronics-Mobile-and-repairing-centre-100063595520227/

Do not invent an Instagram URL because none has been provided.

## Existing Review Information

Rating:

**4.2 / 5**

Reviews:

**5**

---

# 3. Primary Goal

Create a website that looks and feels like a professional modern electronics retailer.

It should combine:

```text
              PATRON ELECTRONICS
                     │
        ┌────────────┼────────────┐
        │            │            │
     PRODUCTS      SERVICES      REPAIRS
        │            │            │
        └────────────┼────────────┘
                     │
                  SEARCH
                     │
                 FILTER/SORT
                     │
                  PRODUCT
                     │
                   CART
                     │
             GUEST CHECKOUT
                     │
              CASH ON DELIVERY
                     │
                   ORDER
                     │
              ORDER TRACKING

                     +

                   ADMIN
                     │
       ┌─────────────┼─────────────┐
       │             │             │
    PRODUCTS       ORDERS       INVENTORY
       │             │             │
   CATEGORIES     SERVICES      REPAIRS
       │             │             │
    REVIEWS       DASHBOARD      SETTINGS
```

The final result must be functional end-to-end.

---

# 4. Mandatory Technology Stack

Use:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- MySQL
- Prisma ORM
- Zod
- Lucide React
- Framer Motion where useful
- ESLint
- Prettier

Use the **UI/UX Pro Max skill** when making design and UX decisions.

Do not create a separate Express backend.

Do not create a separate frontend application.

This must be a **single Next.js full-stack application**.

---

# 5. Project Initialization

Before changing anything:

1. Inspect the repository.
2. Determine whether a project already exists.
3. Preserve existing working code.
4. If the repository is empty, initialize the project.
5. Never overwrite an existing application without understanding it.

If initialization is required, use:

```bash
pnpm create next-app@latest
```

Use the latest **stable** Next.js release.

Do NOT use:

```bash
pnpm create next-app@canary
```

unless there is a specific technical requirement.

---

# 6. Package Manager

**pnpm is mandatory.**

Use:

```bash
pnpm install
pnpm add <package>
pnpm add -D <package>
pnpm remove <package>

pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
```

For Prisma:

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm exec prisma studio
```

Do not use npm, yarn, or bun.

The repository must use:

```text
pnpm-lock.yaml
```

Do not create:

```text
package-lock.json
yarn.lock
bun.lock
```

---

# 7. Architecture

Use:

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── Server Components
   ├── Client Components
   ├── Server Actions
   └── Route Handlers
   │
   ▼
Application / Service Layer
   │
   ▼
Prisma
   │
   ▼
MySQL
```

Use Server Components by default.

Use Client Components only where browser interactivity is actually required.

---

# 8. State Management

Do NOT install Redux.

Do NOT install Zustand initially.

This project should not require a global state management library.

Use:

- React state
- React reducer where appropriate
- Context only when genuinely needed
- URL search parameters
- Server Components
- Server Actions
- localStorage for the guest cart

The database is the source of truth for server data.

Do not duplicate server state unnecessarily in a global client store.

---

# 9. Customer Accounts

There must be **NO customer account system** for the initial version.

Do not implement:

- Customer registration
- Customer login
- Customer password
- Customer profile
- Customer dashboard
- Customer authentication

Customers are guests.

They can:

```text
Browse
  ↓
Search
  ↓
View Product
  ↓
Add to Cart
  ↓
Checkout
  ↓
Enter Details
  ↓
Place Order
  ↓
Receive Order Number
  ↓
Track Order
```

---

# 10. Admin Authentication

Only administrators require authentication.

Admin login:

```text
/admin/login
```

Protect:

```text
/admin/*
```

Use:

- Secure password hashing
- Server-side sessions
- HTTP-only cookies
- Secure cookies in production
- Server-side authorization
- Login rate limiting

Never store plaintext passwords.

Never expose password hashes.

Never rely solely on frontend route protection.

Every admin mutation must verify authorization server-side.

> **Implementation status: DONE (+ extended beyond spec).** Beyond the items above: a 10-minute idle timeout (server-side authoritative check in `getAdminSession()` + a client-side warning watcher, `components/admin/IdleTimeoutWatcher.tsx`), and a self-service account menu (`components/admin/AdminUserMenu.tsx`, topbar avatar dropdown) letting the signed-in admin change their own password or profile picture without touching `.env`/reseeding. Full detail in section 104.

---

# 11. Recommended Project Structure

Use a clean structure similar to:

```text
patron-electronics/
│
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   ├── search/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── order-confirmation/
│   │   ├── order-status/
│   │   ├── services/
│   │   ├── repair/
│   │   ├── about/
│   │   └── contact/
│   │
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── services/
│   │   ├── repair-requests/
│   │   ├── reviews/
│   │   └── settings/
│   │
│   ├── api/
│   ├── actions/
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/
│   ├── storefront/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   └── shared/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── products/
│   ├── orders/
│   ├── inventory/
│   ├── services/
│   ├── repairs/
│   ├── validations/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
├── types/
├── hooks/
├── config/
│
├── .env.example
├── .prettierrc
├── .prettierignore
├── CLAUDE.md
├── README.md
└── package.json
```

Adapt this when necessary.

Do not create unnecessary abstractions.

---

# 12. Design System

Use the **UI/UX Pro Max skill** to establish a polished design system.

The design should communicate:

- Technology
- Reliability
- Trust
- Professionalism
- Modern electronics
- Quality service

Avoid a generic AI-generated template appearance.

Avoid excessive:

- Gradients
- Glassmorphism
- Blur
- Huge shadows
- Excessive rounded cards
- Decorative animations

Prioritize:

- Typography
- Product imagery
- Strong visual hierarchy
- Clean spacing
- Professional cards
- Clear CTAs
- Good contrast

---

# 13. Color Direction

Use UI/UX Pro Max to refine the final palette.

Initial direction:

```text
Midnight
#0F172A

Electric Blue
#2563EB

Cyan
#06B6D4

Amber
#F59E0B
```

Use neutral white/slate backgrounds.

Maintain accessible contrast.

---

# 14. Typography

Use:

### Headings

Poppins or Space Grotesk

### Body

Inter

Use `next/font`.

Do not load unnecessary fonts or weights.

---

# 15. Animations

Use Framer Motion selectively.

Good uses:

- Page transitions
- Product card entrance
- Hover interactions
- Mobile menu
- Cart feedback
- Dialog transitions
- Hero animation

Avoid:

- Constant movement
- Excessive parallax
- Long animations
- Animations that slow interaction

Respect:

```text
prefers-reduced-motion
```

---

# 16. Public Navigation

Desktop:

```text
Patron Electronics

Home
Shop
Categories
Services
About
Contact

[ Search mobiles, laptops, accessories... ]

Cart
```

Mobile:

```text
Logo
Search
Cart
Menu
```

Use a sticky header.

---

# 17. Global Search

The search bar must search the entire product catalog.

Search fields:

- Product name
- Brand
- Category
- SKU
- Tags
- Short description
- Description
- Specifications

Search must happen server-side.

Never download the entire product catalog to the browser.

---

# 18. Search Autocomplete

As the user types, show matching products.

Display:

- Image
- Product name
- Price
- Availability

Show approximately 5–8 suggestions.

Include:

```text
View all results →
```

Debounce search requests.

---

# 19. Search Results

Example:

```text
Search Results

Results for "iphone"

23 products found

[Filters]

Sort:
Most Relevant
```

Support:

- Search
- Filters
- Sorting
- Pagination

All server-side.

---

# 20. Sorting

Support:

```text
Most Relevant
Newest
Oldest
Most Sold
Most Popular
Featured
Price: Low to High
Price: High to Low
```

Sorting must be implemented at database/server level.

Never fetch the entire catalog and sort it in the browser.

---

# 21. Filtering

Support:

### Category

Database-driven categories.

### Brand

Database-driven brands.

### Price

Minimum and maximum.

### Availability

- In Stock
- Out of Stock

### Product Type

- Mobile
- Laptop
- Accessories
- Gadgets

Filters must be combinable.

Desktop:

Sidebar.

Mobile:

Filter drawer/sheet.

---

# 22. URL Search State

Search/filter/sort must use query parameters.

Example:

```text
/shop?category=mobile&brand=samsung&sort=price-asc&q=galaxy
```

Benefits:

- Shareable URLs
- Bookmarkable searches
- Browser navigation
- Refresh persistence
- Better SEO

Do not store search/filter/sort state in Redux/Zustand.

---

# 23. Categories

Initial categories:

- Mobile Phones
- Laptops
- Accessories
- Gadgets
- Chargers & Cables
- Earphones & Headphones
- Smart Watches
- Power Banks
- Cases & Covers
- Screen Protectors
- Other Electronics

Categories must be database-driven.

Admin can:

- Create
- Edit
- Archive
- Enable/disable
- Reorder

---

# 24. Product Flags

Do NOT create separate categories for:

- New
- Featured
- Best Seller
- Top Sales

Use product flags:

```text
isNew
isFeatured
isBestSeller
isTopSale
isRecommended
isOnSale
```

Products can have multiple flags.

---

# 25. Homepage

Create:

1. Announcement bar
2. Hero
3. Categories
4. New Arrivals
5. Featured Products
6. Best Sellers
7. Top Sales
8. Accessories
9. Gadgets
10. Repair Services
11. Why Choose Patron Electronics
12. Reviews
13. CTA
14. Contact
15. Footer

All product/service information must come from MySQL.

> **Implementation note**: the "Shop by Category" row (`components/storefront/CategoryScroller.tsx`) is a horizontally-scrollable strip with edge-aware chevron buttons (hidden on mobile, where swipe is the primary interaction) instead of a wrapping grid — same `getActiveCategories()` data, no model change.

> **Footer social media links — implementation status: DONE (+ extended beyond spec).** The original single `SiteSettings.facebookUrl` column was replaced with a proper `SocialLink` model (`platform`, `url`, `displayOrder`, `isActive`) — a flat, admin-manageable list edited inline within the existing Settings page (no new admin nav item), so adding a brand-new platform later is a new *row*, never a new *column*/schema change. `platform` is a free-text key; `lib/utils/social-icon.ts` maps known platforms (`facebook`/`instagram`/`whatsapp`/`viber`/`tiktok`) to real hand-authored brand-color icon components (`components/icons/SocialIcons.tsx`) and falls back to a generic icon + title-cased label for anything else an admin types. Renders as an icon row in `Footer.tsx` and as icon cards on `/contact`; nothing renders if the list is empty. The pre-existing `facebookUrl` value was migrated into this table via a one-off script before the old column was dropped — full detail in section 104.

---

# 26. Hero

Suggested messaging:

### Heading

**Your Trusted Mobile & Laptop Store**

### Supporting text

**Quality devices, accessories, professional repairs, and reliable service — all in one place.**

Buttons:

```text
Shop Now
Repair Your Device
```

Use high-quality electronics imagery.

> **Implementation status: DONE (+ extended beyond spec).** `components/storefront/HeroSection.tsx` is a single two-column (`lg:grid-cols-5`) section, not two stacked sections — an earlier revision stacked a full-width `HeroSection` above a full-width `BannerCarousel`, but that put the promo slider below the fold and wasted the identity text's own row; this is the current, live design:
> - **Left/first column (`lg:col-span-3`, 60% width)** — the admin-configured banner slider (`components/storefront/BannerCarousel.tsx`, new `Banner` model: `title`, `image`, `linkUrl`, `displayOrder`, `isActive`; admin CRUD at `/admin/banners` mirrors `Category` CRUD exactly, including image-upload cleanup ordering — full detail in section 104), rendered **only when at least one active `Banner` exists**, at every breakpoint (not `lg`-only) — below `lg` the grid collapses to one column so the slider stacks above the text instead of beside it. Pure image carousel with **no text overlay** — an earlier version overlaid the heading/subheading on top of the sliding images; that design was scrapped specifically because of the overlap. Crossfade autoplay pauses on hover/focus and is skipped entirely (not just slowed) under `prefers-reduced-motion`; chevron arrows + dots for manual navigation; each slide is a whole-slide `Link` when `linkUrl` is set (plain anchor → native pointer cursor, no manual cursor handling needed) or an unlinked `div` otherwise. Images use `object-contain` (never cropped) inside a fixed `aspect-[2/1]` box — `BannerForm`'s image field documents 2:1 (e.g. 1920×960px) as the recommended upload ratio so a correctly-shaped banner fills the slot exactly; a banner uploaded at a different ratio will still show letterbox bars, since there's no way to fill the box exactly without cropping unless the image's own ratio matches it.
> - **Right/second column (`lg:col-span-2`, 40% width)** — the heading/subheading/CTA buttons, **always rendered** regardless of whether any banners exist. This is the site's identity/trust statement, not a promotion, so it never gets replaced or covered by anything.
> - Zero banners → the first column falls back to the original "Trusted Local Service / Expert Repairs / Cash on Delivery" decorative trust-card grid (still `lg`-only, i.e. not shown on mobile, unchanged from the original static hero) — no blank/broken state on a fresh install.

---

# 27. Product Cards

Display:

- Product image
- Product name
- Brand
- Rating if available
- Current price
- Original price
- Discount
- Stock
- Badges
- Add to Cart

Badges:

```text
NEW
FEATURED
BEST SELLER
TOP SALE
SALE
POPULAR
```

---

# 28. Product Details

Route:

```text
/products/[slug]
```

Include:

- Image gallery
- Product name
- Brand
- SKU
- Price
- Discount
- Stock
- Quantity
- Add to Cart
- Buy Now
- Description
- Specifications
- Warranty
- Related products

Never allow purchasing more than available stock.

---

# 29. Guest Cart

Customers do not need accounts.

Cart must support:

- Add
- Remove
- Increase
- Decrease
- Clear

Persist cart using localStorage.

Do not store sensitive customer information in localStorage.

The browser cart is not authoritative.

Server must recalculate totals during checkout.

---

# 30. Checkout

Route:

```text
/checkout
```

Required:

- Full Name
- Phone
- Address

Optional:

- Email
- City
- Area
- Notes

Payment:

```text
Cash on Delivery
```

Do not implement fake online payment.

Design the payment layer so future providers can be added:

- eSewa
- Khalti
- Bank Transfer

---

# 31. Checkout Integrity

Never trust client-provided:

- Price
- Discount
- Stock
- Subtotal
- Total

During order creation:

1. Validate input.
2. Retrieve products from MySQL.
3. Verify active products.
4. Verify stock.
5. Retrieve real prices.
6. Calculate subtotal.
7. Calculate discounts.
8. Calculate delivery fee.
9. Calculate total.
10. Create order.
11. Create order items.
12. Update inventory.
13. Commit everything in one transaction.

If any step fails, rollback.

---

# 32. Orders

Generate human-readable order numbers:

```text
PE-2026-000001
PE-2026-000002
```

Order fields should include:

```text
id
orderNumber

customerName
customerPhone
customerEmail

address
city
area
notes

subtotal
discount
deliveryFee
total

paymentMethod
paymentStatus
orderStatus

createdAt
updatedAt
```

---

# 33. Order Items

Store historical product information:

```text
orderId
productId
productName
quantity
unitPrice
total
```

Historical orders must remain correct even after product changes.

---

# 34. Order Status

Use:

```text
Pending
Confirmed
Processing
Ready for Delivery
Shipped
Delivered
Cancelled
```

Payment:

```text
Pending
Paid
Failed
Refunded
```

COD starts as:

```text
paymentStatus = Pending
```

---

# 35. Guest Order Tracking

Route:

```text
/order-status
```

Require:

```text
Order Number
+
Phone Number
```

Example:

```text
PE-2026-000001
9843012697
```

Only return the order if both match.

Do not expose sequential database IDs.

Do not expose unnecessary customer information.

---

# 36. Repair Services

Route:

```text
/services
```

Initial services:

- Mobile Repair
- Laptop Repair
- Screen Replacement
- Battery Replacement
- Charging Port Repair
- Software Installation
- Phone Troubleshooting
- Laptop Troubleshooting
- Water Damage Repair
- Hardware Repair
- Software Repair
- General Maintenance

Services must be database-driven.

---

# 37. Repair Request

Route:

```text
/repair
```

Fields:

```text
Name
Phone
Device Type
Brand
Model
Problem
Additional Notes
```

Generate:

```text
REP-2026-000001
```

No customer account required.

---

# 38. Admin Dashboard

Create a professional admin dashboard.

Navigation:

```text
Dashboard
Products
Categories
Inventory
Orders
Services
Repair Requests
Reviews
Settings
Logout
```

Metrics:

- Total products
- Categories
- Orders
- Pending orders
- Completed orders
- Sales
- Low-stock products
- Repair requests

Charts:

- Sales over time
- Orders over time
- Best-selling products
- Sales by category

Use real MySQL data.

Do not use fake dashboard statistics after database integration.

> **Implementation note**: nav gained a **Banners** item (between Categories and Inventory) for the homepage hero carousel content — see section 26 and section 104.

---

# 39. Product CRUD

Admin can:

- Create
- Read
- Update
- Archive
- Safely delete when appropriate
- Search
- Filter
- Sort
- Manage images
- Manage inventory

Product fields:

```text
Name
Slug
SKU
Brand
Category
Description
Short Description
Price
Discount Price
Stock
Low Stock Threshold
Warranty
Tags
Images

isNew
isFeatured
isBestSeller
isTopSale
isRecommended
isOnSale

isActive
```

---

# 40. Category CRUD

Admin can:

- Create
- Edit
- Archive
- Enable/disable
- Reorder
- Upload image

Do not hard-delete categories referenced by products.

Prefer archive/disable.

---

# 41. Inventory

Track:

```text
stock
lowStockThreshold
```

Display:

```text
In Stock
Low Stock
Out of Stock
```

Never allow negative inventory.

Inventory updates must happen server-side.

---

# 42. Admin Orders

Admin can:

- Search
- Filter
- Sort
- View
- Update order status
- Update payment status
- Cancel

Search by:

- Order number
- Customer name
- Phone

---

# 43. Admin Services

Admin can:

- Create
- Edit
- Archive
- Enable/disable
- Delete safely
- Upload image
- Set starting price
- Set display order

---

# 44. Admin Repair Requests

Admin can:

- Search
- View
- Update status
- Add internal notes

Statuses:

```text
Requested
Diagnosing
Waiting for Customer
Repairing
Ready
Completed
Cancelled
```

---

# 45. Reviews

Initial business information:

```text
Rating: 4.2 / 5
Reviews: 5
```

Admin can:

- Add
- Edit
- Approve
- Hide
- Delete

Customer accounts are not required.

---

# 46. Prisma Database

Use Prisma with MySQL.

Create appropriate models:

```text
Admin
Category
Product
ProductImage
ProductSpecification
Order
OrderItem
Service
RepairRequest
Review
```

Do not create customer authentication models.

Use appropriate relationships.

Avoid destructive cascades where historical data must be preserved.

---

# 47. Product Model

Conceptually:

```text
id
name
slug
sku
brand
description
shortDescription
price
discountPrice
stock
lowStockThreshold
warranty

isNew
isFeatured
isBestSeller
isTopSale
isRecommended
isOnSale
isActive

categoryId
createdAt
updatedAt
```

Use appropriate Prisma data types.

---

# 48. Money

Never use floating-point arithmetic for financial calculations.

Use Prisma Decimal or another precise representation.

Display Nepalese currency as:

```text
Rs. 85,000
```

---

# 49. Database Indexes

Create indexes appropriate for:

```text
Product.slug
Product.sku
Product.name
Product.brand
Product.categoryId
Product.price
Product.createdAt
Product.stock

Order.orderNumber
Order.customerPhone
Order.createdAt

RepairRequest.requestNumber
RepairRequest.phone
```

Use composite indexes when query patterns justify them.

Do not blindly index every column.

---

# 50. Best Sellers

Determine best sellers using successful order data.

Do not count:

- Cancelled orders
- Failed orders

Use OrderItem quantities.

Do not manually maintain sales counters unless performance requirements justify it.

---

# 51. Images

Do not store image binaries in MySQL.

Store image URLs/paths.

Create an image storage abstraction that can later support:

- Local storage
- Cloudinary
- S3
- Cloudflare R2

For development, local storage is acceptable.

Validate:

- File type
- File size
- Filename
- Destination

Use `next/image`.

> **Implementation status: DONE.** A real upload pipeline exists — see `lib/uploads/`. Summary:
> - `lib/uploads/storage/` — the abstraction: an `ImageStorage` interface (`upload`/`delete`/`getUrl`/`exists`) with a `LocalImageStorage` implementation writing under `public/images/<destination>/<yyyy>/<mm>/`, selected via a `STORAGE_PROVIDER` env var (`local` is the only implemented provider; adding S3/R2/Azure later means adding one new class, no other file changes). Destinations: `products`, `categories`, `services`, `avatars`, `banners` (`lib/uploads/upload.constants.ts`).
> - **Served via `app/uploads/[...path]/route.ts`, not Next's static `public/` serving** — `next start` computes its set of servable `public/` files once at server boot and never rescans, so a file written at runtime (every upload, by definition) 404s forever under plain static serving no matter how long it's been on disk. This route handler reads the filesystem fresh on every request instead. Full detail/history in section 104.
> - `public/seed/` (static, git-tracked, generated by `prisma/seed.ts`) and `public/images/` (runtime-upload space only, `.gitignore`'d) are deliberately separate trees — see [README.md § Image Handling](README.md#image-handling).
> - `lib/uploads/upload.validation.ts` — validates real file size, a MIME allowlist (JPEG/PNG/WebP/GIF/AVIF, no SVG), sniffs actual file bytes with `file-type` (rejects spoofed extensions), decodes with `sharp` to reject corrupted files and enforce a dimension/pixel ceiling (decompression-bomb guard), then re-encodes to optimized WebP (strips metadata, normalizes format).
> - `lib/uploads/upload.service.ts` — orchestrates `requireAdmin()` → validate → store, and owns all deletion logic (`deleteUploadedImage`/`deleteUploadedImageInternal`) so Product/Category/Service/Admin business logic never touches the filesystem directly.
> - Filenames are always server-generated (`crypto.randomUUID()` + extension from the *validated* format) — the client's original filename is kept only as inert display metadata, never used for paths.
> - Lifecycle/cleanup: `lib/products/product.service.ts`, `lib/products/category.service.ts`, `lib/services/service.service.ts`, `lib/auth/admin.service.ts`, `lib/banners/banner.service.ts` all clean up superseded/orphaned files — new images are uploaded and confirmed stored *before* an old image is ever deleted (delete-old-only-after-DB-success ordering); a failed DB write cleans up the file it would have referenced; hard-deleting a product/category/service/banner cleans up its image file(s) after the DB delete succeeds. No file is ever deleted while still referenced by a DB row.
> - `components/admin/ImageUpload.tsx` — the admin-facing drag-and-drop/click-to-browse widget (native HTML5 DnD, no extra dependency), wired into `ProductForm` (multi-image, with reorder and an explicit "set as primary" control), `CategoryForm`, `ServiceForm`, `BannerForm` (single image each), and `ChangeAvatarDialog` (the admin's own profile picture). The manual URL text field is kept alongside the upload control in every form for backward compatibility with externally-hosted or legacy seed-generated images.
> - `ProductImage` gained nullable metadata columns (`storageKey`, `originalName`, `mimeType`, `fileSize`, `width`, `height`, `format`) — nullable specifically so pre-upload/legacy rows need no backfill. `Admin` gained a single nullable `avatarUrl` (same single-scalar pattern as `Category.image`/`Service.image`, since it's one image, not a gallery).

---

# 52. Validation

Use Zod.

Validate server-side:

- Admin login
- Product forms
- Category forms
- Service forms
- Checkout
- Repair requests
- Search
- Filters
- Sorting
- Order tracking

Client validation is only for user experience.

Server validation is authoritative.

---

# 53. Server Actions

Use Server Actions for appropriate mutations.

Examples:

```text
createProduct()
updateProduct()
archiveProduct()

createCategory()
updateCategory()

createService()
updateService()

createOrder()

updateOrderStatus()

updateRepairRequest()
```

Every admin mutation must verify authorization.

---

# 54. API Route Handlers

Use Route Handlers when an HTTP API is genuinely useful.

Possible:

```text
/api/products
/api/products/search
/api/products/[slug]

/api/orders
/api/orders/track

/api/admin/products
/api/admin/categories
/api/admin/orders
/api/admin/services
/api/admin/repair-requests
```

Do not create APIs unnecessarily.

---

# 55. Product Discovery

Create reusable product discovery logic:

```text
Product Discovery
├── Search
├── Category
├── Brand
├── Price
├── Availability
├── Sorting
└── Pagination
```

Reuse it for:

- Shop
- Search
- Categories
- Featured
- New arrivals
- Best sellers
- Top sales

Do not duplicate query logic.

---

# 56. Pagination

Use server-side pagination.

Never load the entire catalog.

Example:

```text
?page=1&limit=24
```

Return appropriate pagination metadata.

---

# 57. SEO

Implement:

- Dynamic page titles
- Meta descriptions
- Open Graph metadata
- Canonical URLs
- Product structured data
- Organization structured data
- Breadcrumb structured data
- SEO-friendly slugs

Example:

```text
/products/samsung-galaxy-s25
```

---

# 58. Performance

Optimize for:

- Fast initial load
- Low client-side JavaScript
- Low memory usage
- Fast server response
- Good Core Web Vitals
- Mobile performance

Prefer:

- Server Components
- Server Actions
- Streaming/Suspense
- Dynamic imports
- `next/image`
- `next/font`
- Proper caching
- Revalidation
- Database indexes
- Efficient Prisma queries
- Pagination
- Debounced search
- Lazy loading

Do not introduce unnecessary client-side JavaScript.

---

# 59. Client Bundle

Do not make entire pages Client Components unnecessarily.

Bad:

```tsx
'use client';

export default function ProductPage() {
  // everything client-side
}
```

Preferred:

```text
ProductPage
├── Server Component
│   ├── Product information
│   ├── Images
│   ├── Description
│   └── Specifications
│
└── Client Components
    ├── QuantitySelector
    └── AddToCartButton
```

---

# 60. Database Performance

Avoid:

- N+1 queries
- Fetching unnecessary columns
- Unbounded queries
- Loading entire tables
- Unnecessary joins

Use Prisma deliberately:

```text
select
include
where
orderBy
take
skip
```

Use transactions for order/inventory operations.

Run independent queries concurrently when safe.

---

# 61. Caching

Use Next.js caching and revalidation appropriately.

Cache/revalidate where safe:

- Products
- Categories
- Services

Use fresh data for:

- Inventory
- Checkout
- Orders
- Order tracking
- Admin mutations

Never cache private customer information incorrectly.

---

# 62. Loading States

Create polished loading states for:

- Products
- Search
- Cart
- Checkout
- Dashboard
- Admin tables
- Forms

Use Suspense where appropriate.

---

# 63. Empty States

Implement clear states for:

- No products
- No search results
- Empty cart
- No orders
- No repair requests
- Empty categories

Never leave blank screens.

---

# 64. Error Handling

Handle:

- 404
- Unauthorized
- Forbidden
- Product unavailable
- Out of stock
- Invalid checkout
- Failed order
- Database failure
- Server errors

Never expose stack traces or internal database errors to customers.

---

# 65. Accessibility

Implement:

- Semantic HTML
- Keyboard navigation
- Proper labels
- Focus states
- Accessible dialogs
- Accessible menus
- Alt text
- Color contrast
- Reduced motion
- Touch-friendly controls

---

# 66. Responsive Design

Support:

```text
320px
375px
425px
768px
1024px
1280px
1440px+
```

Pay particular attention to:

- Navbar
- Search
- Product grids
- Filters
- Cart
- Checkout
- Forms
- Admin tables
- Admin navigation

Mobile must be treated as a first-class experience.

---

# 67. Admin UX

Storefront:

```text
Premium
Visual
Shopping-focused
```

Admin:

```text
Professional
Efficient
Data-focused
Information-dense
```

Do not over-animate the admin dashboard.

---

# 68. Security

Implement:

- Secure authentication
- Strong password hashing
- HTTP-only cookies
- Server-side authorization
- Rate limiting
- Input validation
- Secure headers
- Secure file uploads
- Environment variables
- Injection protection
- Safe error handling

Never expose:

- Password hashes
- Database credentials
- Secrets
- Stack traces

---

# 69. Environment Variables

Create:

```text
.env.example
```

Example:

```env
DATABASE_URL=

AUTH_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=

NODE_ENV=development

STORAGE_PROVIDER=local
```

Never commit real credentials.

---

# 70. Seed Data

Create Prisma seed data.

Include:

### Categories

At least 10.

### Products

At least 20 realistic products across:

- Mobile phones
- Laptops
- Accessories
- Chargers
- Cables
- Earphones
- Power banks
- Smart watches
- Cases
- Gadgets

Use realistic prices and multiple brands.

Use multiple product flags.

### Services

At least 10.

### Reviews

Create representative reviews.

### Admin

Create initial admin credentials from environment variables.

Do not hard-code production credentials.

---

# 71. Coding Standards

The codebase must follow professional production-grade standards.

Prioritize:

- Readability
- Maintainability
- Strong typing
- Modularity
- Security
- Testability
- Simplicity

Avoid over-engineering.

---

# 72. TypeScript Standards

Enable strict TypeScript.

Avoid:

```ts
any
```

unless unavoidable and explicitly justified.

Prefer:

```ts
unknown
```

with proper type narrowing.

Do not use:

```ts
// @ts-ignore
// @ts-nocheck
```

to hide problems.

Avoid unnecessary type assertions.

---

# 73. Naming Conventions

Components:

```text
ProductCard
SearchBar
CheckoutForm
```

Functions:

```text
getProduct()
createOrder()
updateInventory()
```

Variables:

```text
product
productList
orderNumber
customerPhone
```

Constants:

```ts
const DEFAULT_PAGE_SIZE = 24;
const MAX_CART_QUANTITY = 20;
```

Types:

```text
Product
Order
ProductFilters
```

---

# 74. File Naming

Components:

```text
ProductCard.tsx
SearchBar.tsx
CheckoutForm.tsx
```

Utilities:

```text
formatCurrency.ts
generateOrderNumber.ts
validatePhone.ts
```

Services:

```text
product.service.ts
order.service.ts
inventory.service.ts
```

Maintain consistency.

---

# 75. Component Responsibility

Avoid giant components.

Break large pages into meaningful components.

Example:

```text
ProductPage
├── ProductGallery
├── ProductInformation
├── ProductPrice
├── ProductStock
├── ProductActions
├── ProductSpecifications
└── RelatedProducts
```

Do not create meaningless micro-components solely to reduce line count.

---

# 76. Business Logic

Do not put significant business logic directly into UI components.

Prefer:

```text
UI
 ↓
Application/Service Logic
 ↓
Prisma
 ↓
MySQL
```

Example:

```ts
const products = await getProducts(filters);
```

instead of scattering raw Prisma queries throughout UI components.

---

# 77. Database Access

Centralize reusable database/application logic where practical.

Do not create excessive abstraction layers.

The goal is maintainability, not abstraction for its own sake.

---

# 78. DRY

Avoid unnecessary duplication.

Extract genuinely reusable logic such as:

```text
calculateOrderTotals()
getProductStatus()
getProductBadge()
buildProductFilters()
```

But do not create complicated generic abstractions for code that is only superficially similar.

---

# 79. Async Code

Prefer `async/await`.

Run independent operations concurrently where safe:

```ts
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);
```

Avoid unnecessary sequential requests.

---

# 80. React Best Practices

Avoid unnecessary:

- `useEffect`
- `useMemo`
- `useCallback`
- Context
- Client Components

Do not use hooks simply because they are available.

Prefer server-side computation and derived values where possible.

---

# 81. React Keys

Use stable IDs.

Bad:

```tsx
items.map((item, index) => (
  <ProductCard key={index} />
))
```

Preferred:

```tsx
items.map((item) => (
  <ProductCard key={item.id} />
))
```

---

# 82. Imports

Use the configured alias:

```text
@/
```

Prefer:

```ts
import { ProductCard } from '@/components/products/ProductCard';
```

over:

```ts
import { ProductCard } from '../../../../components/products/ProductCard';
```

Keep imports organized:

1. Framework
2. Third-party
3. Internal aliases
4. Relative imports

Use type-only imports where appropriate.

---

# 83. Formatting

Use **Prettier**.

Create:

```text
.prettierrc
.prettierignore
```

Recommended:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100
}
```

All code must be formatted.

---

# 84. ESLint

Use ESLint as a mandatory quality gate.

Configure appropriately for:

- Next.js
- React
- TypeScript
- Hooks
- Accessibility where appropriate

Fix lint issues.

Do not disable ESLint globally.

Avoid:

```text
/* eslint-disable */
```

If a rule genuinely must be disabled, keep the scope minimal and explain why.

---

# 85. Type Checking

Add:

```json
"typecheck": "tsc --noEmit"
```

to package scripts.

The project should support:

```bash
pnpm typecheck
```

---

# 86. Package Scripts

Maintain appropriate scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Adapt these to the current Next.js configuration if necessary.

---

# 87. Git Hooks

If appropriate, configure lightweight Git hooks.

They may run:

```text
lint
typecheck
format check
```

Do not make commits excessively slow.

Git hooks are supplementary; the commands must still work manually.

---

# 88. Comments

Comments should explain:

- Why
- Business rules
- Security decisions
- Performance decisions
- Non-obvious workarounds

Do not comment obvious code.

Avoid:

```ts
// Increment quantity
quantity++;
```

---

# 89. TODOs

Do not leave vague TODOs.

Bad:

```ts
// TODO: fix later
```

If genuinely necessary:

```ts
// TODO(#issue): Explain exactly what remains.
```

Do not leave incomplete core functionality.

---

# 90. Logging

Avoid excessive `console.log`.

Use structured logging where appropriate.

Never log:

- Passwords
- Tokens
- Secrets
- Payment credentials
- Sensitive customer information

Use appropriate log levels:

```text
debug
info
warn
error
```

---

# 91. Security Principle

Treat all client input as untrusted.

Never trust client:

- Price
- Total
- Stock
- Role
- Permission
- Product ID
- Discount

Sensitive values must be recalculated or verified server-side.

---

# 92. Testing

Test:

### Storefront

- Homepage
- Navigation
- Search
- Autocomplete
- Filters
- Sorting
- Pagination
- Categories
- Product page
- Cart
- Checkout
- Order confirmation
- Order tracking
- Repair request

### Admin

- Login
- Logout
- Protected routes
- Dashboard
- Product CRUD
- Category CRUD
- Inventory
- Orders
- Services
- Repairs
- Reviews

---

# 93. Security Testing

Verify:

- Unauthenticated users cannot access admin.
- Unauthenticated users cannot perform admin mutations.
- Customers cannot modify product prices.
- Customers cannot modify inventory.
- Customers cannot manipulate order totals.
- Customers cannot purchase beyond stock.
- Customers cannot access another customer's order.
- Order tracking requires both order number and phone.
- Passwords are never exposed.
- Secrets are never exposed.
- Uploaded files are validated.

---

# 94. No Fake Functionality

Do not leave:

- Fake products
- Fake search
- Fake CRUD
- Fake checkout
- Fake orders
- Fake inventory
- Fake dashboard metrics
- Fake payment success

Seed data is allowed for development.

But the actual application must use MySQL.

Example:

Admin creates:

```text
Samsung Galaxy S25
Rs. 120,000
Stock: 5
```

It must immediately be available to the storefront.

Admin changes price to:

```text
Rs. 115,000
```

The storefront must reflect it.

Customer purchases 2.

Inventory must become:

```text
3
```

and persist in MySQL.

---

# 95. Development Phases

Implement in this order.

## Phase 1 — Foundation

- Inspect repository
- Initialize Next.js if necessary
- Configure pnpm
- Configure Tailwind
- Configure ESLint
- Configure Prettier
- Configure TypeScript
- Configure Prisma
- Configure MySQL
- Environment variables
- Database schema
- Migrations
- Seed data
- Base UI system

## Phase 2 — Admin Authentication

- Login
- Sessions
- Protected routes
- Authorization
- Logout
- Rate limiting

## Phase 3 — Admin

- Dashboard
- Products
- Categories
- Inventory
- Orders
- Services
- Repairs
- Reviews

## Phase 4 — Storefront

- Homepage
- Navbar
- Shop
- Categories
- Search
- Autocomplete
- Filters
- Sorting
- Pagination
- Product details

## Phase 5 — Commerce

- Guest cart
- Checkout
- COD
- Order creation
- Inventory transaction
- Confirmation
- Tracking

## Phase 6 — Repair

- Services
- Repair requests
- Admin repair management

## Phase 7 — Polish

- Responsive design
- Animations
- Loading states
- Empty states
- Error states
- SEO
- Accessibility
- Performance

## Phase 8 — Verification

- Type checking
- Lint
- Formatting
- Tests
- Production build
- Security review
- End-to-end verification

---

# 96. Quality Gate

Before considering a feature complete:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm build
```

All commands must pass.

Do not mark the project complete if:

- TypeScript errors exist
- ESLint errors exist
- Formatting is inconsistent
- Production build fails
- Core functionality is mocked
- Security checks are missing
- Database integrity can be violated
- Sensitive data is exposed
- Mobile layout is broken
- Critical accessibility issues remain

---

# 97. Performance Review

Before completion, inspect:

- Client Components
- Bundle size
- Image sizes
- Database queries
- Missing indexes
- N+1 queries
- Unnecessary API calls
- Unnecessary `useEffect`
- Unnecessary dependencies
- Caching
- Pagination
- Search performance

Remove unnecessary client-side JavaScript.

---

# 98. README

Create a complete README containing:

- Project overview
- Technology stack
- Requirements
- Installation
- MySQL setup
- Environment variables
- Prisma setup
- Migrations
- Seed
- Development
- Production
- Admin setup
- Image handling
- Available scripts

Development:

```bash
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

Production:

```bash
pnpm build
pnpm start
```

---

# 99. Claude Code Working Rules

When starting work:

### Step 1

Inspect the existing repository.

### Step 2

Read this entire `CLAUDE.md`.

### Step 3

Inspect existing files before creating new ones.

### Step 4

Do not overwrite existing functionality without understanding it.

### Step 5

Plan the architecture.

### Step 6

Implement incrementally.

### Step 7

After each major phase run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

### Step 8

Fix errors before proceeding.

### Step 9

Do not stop after creating UI.

### Step 10

Verify the actual database-backed functionality.

---

# 100. Claude Code Decision Rules

When requirements are ambiguous:

1. Prefer the simplest production-quality solution.
2. Follow this `CLAUDE.md`.
3. Follow established project conventions.
4. Avoid unnecessary dependencies.
5. Avoid over-engineering.
6. Preserve security.
7. Preserve database integrity.
8. Prefer server-side operations where appropriate.
9. Prefer Server Components.
10. Keep client-side JavaScript minimal.

Do not ask unnecessary questions when a reasonable engineering decision can be made.

If a decision materially affects architecture, security, cost, or data integrity, explain the decision before implementing it.

---

# 101. Final Definition of Done

The project is complete only when:

- Next.js works
- pnpm works
- MySQL works
- Prisma works
- Migrations work
- Seed data works
- Admin authentication works
- Admin routes are protected
- Product CRUD works
- Category CRUD works
- Inventory works
- Products come from MySQL
- Global search works
- Search autocomplete works
- Filters work
- Sorting works
- Pagination works
- Guest cart works
- Guest checkout works
- COD orders work
- Inventory updates atomically
- Order confirmation works
- Order tracking works
- Services work
- Repair requests work
- Admin repair management works
- Reviews work
- Responsive design works
- Accessibility basics work
- SEO works
- TypeScript passes
- ESLint passes
- Prettier passes
- Production build succeeds
- No critical runtime errors remain
- No secrets are committed
- No fake core functionality remains
- README is complete

---

# 102. Final Engineering Priorities

When making engineering decisions, prioritize:

```text
1. Security
2. Correctness
3. Database integrity
4. Maintainability
5. Performance
6. Accessibility
7. UX
8. Visual polish
```

Never sacrifice security or data integrity for visual effects.

Never sacrifice maintainability for premature optimization.

Do not add dependencies unless they solve a real problem.

Do not add Redux.

Do not add Zustand unless a real requirement emerges.

Do not create a separate Express backend.

Do not create customer accounts.

Do not duplicate server state unnecessarily.

Use URL parameters for search/filter/sort.

Use React state for client-only interaction.

Use Server Components by default.

Use Server Actions for appropriate mutations.

Use Prisma for database access.

Use MySQL as the source of truth.

Use Tailwind CSS.

Use UI/UX Pro Max for design decisions.

Use pnpm.

Use the latest stable Next.js.

---

# 103. Build It

The final instruction is simple:

**Build the complete Patron Electronics application according to this specification.**

Do not merely create a design.

Do not merely create static pages.

Do not leave core functionality mocked.

Do not stop at the frontend.

Build the database, backend logic, authentication, admin portal, storefront, search, filters, sorting, cart, checkout, orders, inventory, services, repair requests, and all required functionality.

Make it responsive.

Make it secure.

Make it performant.

Make it maintainable.

Make it production-ready.

Before declaring the project complete, run the full quality gate:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm build
```

Fix all issues and verify the application end-to-end.

---

# 104. Implementation Notes (post-spec deviations and additions)

These are facts a future session needs that either didn't exist when the spec above was written, or extend it — kept short and only for things that deviate from or add to the sections above.

- **Prisma 7 driver adapters**: this Prisma version requires a driver adapter (`@prisma/adapter-mariadb`) instead of a bare connection string in `schema.prisma`; config lives in `prisma.config.ts`, and the generated client is emitted as plain TypeScript to `lib/generated/prisma/` (import from the `/client` subpath, not the directory root).
- **`prisma db push` instead of `prisma migrate dev`**: the deployed MySQL host is a free/shared tier that doesn't allow creating a shadow database (required by `migrate dev`). Schema changes are applied directly with `pnpm db:push`. If a data-loss warning appears, review it carefully before passing `--accept-data-loss` — Prisma's own safety guard requires explicit human sign-off before an AI agent runs it, enforced *mechanically*, not just as a convention: `prisma db push --accept-data-loss` invoked from this environment errors out demanding a `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var, set to the exact text of the user's explicit consent message, before it will run at all. When a column being dropped still holds real data, migrate that data into its replacement first (a one-off `pnpm exec tsx` script, deleted immediately after use, never committed) — confirmed working end-to-end when `SiteSettings.facebookUrl` was retired in favor of `SocialLink` (see section 25).
- **`middleware.ts` → `proxy.ts`**: Next.js 16 renamed the file; same functionality (`proxy.ts` here does an optimistic, cookie-presence-only redirect for `/admin/*` GET requests — the real authorization check is `requireAdmin()`, called inside the protected layout and inside every mutating service function).
- **Image upload**: fully implemented — see the note inside section 51 above and `lib/uploads/`.
- **Git root**: this directory (`patron-electronics/`) is the git repo root, not its parent. `.gitignore` excludes `.agents/`, `.claude/`, `.windsurf/`, `.cursor/`, and `skills-lock.json` — these are auto-generated agent-facing reference docs (e.g. Prisma's bundled skills), not hand-authored project source.
- **`public/`**: contains only real, referenced content — the `create-next-app` default scaffold SVGs (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) were removed as genuinely unused (nothing in the codebase ever referenced them). Do not recreate them. Two deliberately separate trees hold the only real assets: `public/seed/products/` (the 26 seed-generated placeholder SVGs, static and git-tracked — do not point runtime uploads here) and `public/images/<products|categories|services|avatars>/<yyyy>/<mm>/` (runtime-upload space only, `.gitignore`'d, meant to be a mounted persistent volume in production — see next bullet and README.md § Production Persistence).
- **Uploaded images are served by `app/uploads/[...path]/route.ts`, never by Next's static `public/` serving.** `next start` computes its list of servable `public/` files once at server boot and never rescans the filesystem afterward — a file that appears after boot (every runtime upload, by definition) 404s forever under plain static serving no matter how long it's actually on disk. This bit a real deployment: the file persisted correctly on a Railway volume, but the already-running server still 404'd it. `next dev` never reproduces this (it watches the filesystem), so this class of bug only shows up under `next start`/production — test image uploads in production mode (`pnpm build && pnpm start`), not just `pnpm dev`, before considering an image-pipeline change verified. If this route handler or the `/uploads/` URL prefix is ever changed, also update `LocalImageStorage.getUrl()` and `extractStorageKeyFromUrl()` (`lib/uploads/`) — they must agree on the prefix.
- **Admin idle timeout**: `AdminSession.lastActiveAt`, checked and refreshed (throttled) inside `getAdminSession()`; `ADMIN_IDLE_TIMEOUT_MINUTES`/`ADMIN_IDLE_WARNING_SECONDS` in `config/site.ts`. Server-side check is authoritative; `components/admin/IdleTimeoutWatcher.tsx` is the client-side half that actually forces a logout while an admin is idle on a static page (the server check alone only fires on the *next* request).
- **Admin account menu**: `components/admin/AdminUserMenu.tsx` (topbar avatar dropdown) → Change Password / Change Profile Picture / Logout. Password change re-verifies the current password server-side and calls `invalidateOtherAdminSessions()` (`lib/auth/session.ts`) to sign out every other session for that admin — the session making the change stays signed in. This is a day-to-day alternative to the `.env` + `pnpm db:seed` provisioning path in section 10, not a replacement for it (reseeding still works and is still the way to recover a fully locked-out admin). Both dialogs use `components/ui/Dialog.tsx`, a thin wrapper around the native `<dialog>` element rather than a hand-rolled overlay component.
- **Homepage hero/carousel + category scroller**: new `Banner` model and `/admin/banners` CRUD (mirrors `Category` CRUD file-for-file) back `components/storefront/BannerCarousel.tsx`, embedded as the wider, leading column of `components/storefront/HeroSection.tsx`'s two-column grid (there is no `HeroCarousel.tsx` — an earlier version combined the two into one text-overlaid-on-image component, and a later revision stacked them as two full-width sections; both were deliberately superseded, don't recreate either). `components/storefront/CategoryScroller.tsx` replaced the "Shop by Category" wrapping grid with a horizontal scroller. Full detail in sections 25–26 and 38.
- **Admin list filters apply live**: `components/admin/AdminFilterBar.tsx` (used on `/admin/products`, `/admin/orders`, `/admin/repair-requests`) replaced the old submit-button filter forms on those three pages — the search box debounces (~400ms, `router.replace` so typing doesn't spam browser history) and dropdowns apply immediately (`router.push`), still entirely through URL search params per section 22, just without the extra click. Categories/Services/Reviews admin pages still use the older button-based filter form — not yet converted, by choice, not oversight.
- **Page-level content constants live in `config/storefront-content.ts`**, not inline in the page files that render them (`WHY_CHOOSE_US` for the homepage, `ABOUT_CAPABILITIES` for `/about`) — a deliberate convention, matching `config/site.ts` already centralizing `NAV_LINKS`/`SORT_OPTIONS`. Any new "icon + title + description" style marketing-copy array belongs there, not hardcoded into a `page.tsx`.
- **Footer social links**: see the note in section 25 for the full `SocialLink` design. The one operationally interesting part: retiring `SiteSettings.facebookUrl` in favor of it was the first time this project needed to drop a column with live data in it — see the `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` note above for exactly how that was done safely.
