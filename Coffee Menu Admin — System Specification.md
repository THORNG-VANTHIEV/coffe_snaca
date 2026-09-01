# Coffee Menu Admin — System Specification

## 1. Project Overview

### Project Name
**Coffee Menu Admin** (SNACA Cafe)

### Project Type
Laravel + Filament administration panel and REST API for the existing
**Coffee Menu Web App** (see `Coffee Menu Web App — System Specification.md`).

### Main Purpose
Give the shop owner a screen to create, update and delete menu data without
editing `public/data/db.json` by hand.

The admin is the **write side**. The customer menu stays **read-only** and
keeps working exactly as it does today.

### The rule that governs everything here

> The customer menu must never depend on this backend being online.

Customers keep loading a static `db.json` from GitHub Pages. The admin edits
MySQL and **publishes** — it regenerates `db.json`, commits it to the menu
repository, and the existing `.github/workflows/deploy.yml` republishes the
site. If the Laravel server is down at 8pm on a Saturday, the menu still works.

---

# 2. Technology Stack

## Backend

Use:

```text
Laravel 12 (or current LTS)
PHP 8.3+
MySQL 8
Filament 3 (or current major)
```

## Admin UI

```text
Filament resources (Livewire + Alpine + Tailwind)
```

Do **not** build a separate React admin in version 1. Filament generates the
CRUD screens; a custom React admin is a possible version 2 and is out of scope
here.

## Not required in version 1

- Laravel Sanctum — the Filament panel uses standard session auth, and the
  public API endpoints are unauthenticated read-only.
- Laravel Breeze / Jetstream — Filament ships its own login.
- Queues, Redis, Horizon, websockets.

---

# 3. System Architecture

```text
                       ┌─────────────────────────────┐
   Owner (phone/laptop) │  Filament admin  /admin     │
                       └──────────────┬──────────────┘
                                      │ writes
                                      ▼
                              ┌───────────────┐
                              │    MySQL      │
                              └───────┬───────┘
                                      │ "Publish" action
                                      ▼
                    generates db.json  +  commits to GitHub
                                      │
                                      ▼
                       .github/workflows/deploy.yml (existing)
                                      │
                                      ▼
   Customer (QR scan) ──────►  GitHub Pages  ──►  static db.json
```

Optional live path (phase 6):

```text
   Customer menu ──► GET /api/availability ──► Laravel (sold-out only)
```

---

# 4. Scope

## In scope

- CRUD for products, categories, tables, settings
- Image upload for products, categories, logo and hero banners
- Server-side validation matching `scripts/validate-data.mjs`
- Publish action that regenerates and commits `db.json`
- `GET /api/menu` returning the exact current `db.json` shape
- `GET /api/availability` for live sold-out state
- Owner and staff roles

## Out of scope

Ordering, cart, checkout, payment, KHQR, customer accounts, kitchen queue,
inventory, sales reporting, receipt printing, multi-branch, analytics.

These stay out for the same reason they are out of the menu spec (§4 of the
menu spec): the shop takes orders in person.

---

# 5. Users and Roles

Two roles. Both log in at `/admin`.

| Role | Can do |
|---|---|
| `owner` | Everything, including delete and publish |
| `staff` | Toggle `available`, edit prices; cannot delete or publish |

Version 1 may ship with `owner` only if that is faster; the `role` column must
exist from the first migration either way.

---

# 6. Database Schema

Five tables. Column names deliberately match the JSON keys in `db.json` so the
export is a near-direct dump.

## 6.1 `users`

Laravel default, plus:

```php
$table->enum('role', ['owner', 'staff'])->default('staff');
```

## 6.2 `settings`

Single row, `id = 1`. Never deleted.

```php
$table->id();
$table->string('shop_name_en');
$table->string('shop_name_km');
$table->string('tagline_en')->nullable();
$table->string('tagline_km')->nullable();
$table->string('logo')->nullable();
$table->json('hero_images')->nullable();
$table->string('phone')->nullable();
$table->string('address_en')->nullable();
$table->string('address_km')->nullable();
$table->string('opening_hours_en')->nullable();
$table->string('opening_hours_km')->nullable();
$table->boolean('currency_usd')->default(true);
$table->boolean('currency_khr')->default(true);
$table->enum('default_language', ['km', 'en'])->default('km');
$table->boolean('show_unavailable_products')->default(true);
$table->string('facebook')->nullable();
$table->string('telegram')->nullable();
$table->timestamps();
```

## 6.3 `tables`

```php
$table->id();
$table->string('number')->unique();   // zero-padded: "01", "02"
$table->string('name');
$table->boolean('active')->default(true);
$table->timestamps();
```

**Name the Eloquent model `ShopTable`, not `Table`.** Every Filament resource
imports `Filament\Tables\Table`, and a model called `Table` collides with it in
every single resource file. Map it explicitly:

```php
class ShopTable extends Model
{
    protected $table = 'tables';
}
```

## 6.4 `categories`

```php
$table->id();
$table->string('slug')->unique();
$table->string('name_en');
$table->string('name_km');
$table->text('description_en')->nullable();
$table->text('description_km')->nullable();
$table->string('image')->nullable();
$table->string('icon')->nullable();
$table->enum('kind', ['drink', 'food'])->default('drink');
$table->boolean('active')->default(true);
$table->unsignedInteger('sort_order')->default(0);
$table->timestamps();
```

## 6.5 `products`

```php
$table->id();
$table->string('slug')->unique();
$table->foreignId('category_id')->constrained()->restrictOnDelete();
$table->string('name_en');
$table->string('name_km');
$table->text('description_en')->nullable();
$table->text('description_km')->nullable();
$table->string('image')->nullable();
$table->json('ingredients_en')->nullable();
$table->json('ingredients_km')->nullable();
$table->json('sizes');                        // required, at least one
$table->json('extras')->nullable();
$table->json('options')->nullable();
$table->json('temperature')->nullable();      // ["hot","iced"]
$table->json('sugar_levels')->nullable();     // [0,25,50,75,100]
$table->json('ice_levels')->nullable();       // ["none","less","normal","extra"]
$table->boolean('available')->default(true);
$table->boolean('best_seller')->default(false);
$table->boolean('recommended')->default(false);
$table->boolean('featured')->default(false);
$table->unsignedInteger('sort_order')->default(0);
$table->timestamps();
```

`restrictOnDelete()` is deliberate — deleting a category that still has
products must fail loudly rather than orphan them.

## 6.6 `product_showcase_category` (pivot)

Backs `also_in_categories`. A showcase category such as *Signature Drinks* is a
window onto the menu, not a shelf — the product keeps its real `category_id`
and appears a second time.

```php
$table->foreignId('product_id')->constrained()->cascadeOnDelete();
$table->foreignId('category_id')->constrained()->cascadeOnDelete();
$table->unique(['product_id', 'category_id']);
```

A pivot rather than a JSON column, because three of the four integrity rules
in `validate-data.mjs` (category must exist, no duplicates, cascade on delete)
then come free.

## 6.7 Model casts

```php
// Product
protected $casts = [
    'ingredients_en' => 'array',
    'ingredients_km' => 'array',
    'sizes'          => 'array',
    'extras'         => 'array',
    'options'        => 'array',
    'temperature'    => 'array',
    'sugar_levels'   => 'array',
    'ice_levels'     => 'array',
    'available'      => 'boolean',
    'best_seller'    => 'boolean',
    'recommended'    => 'boolean',
    'featured'       => 'boolean',
];
```

---

# 7. The Data Contract

`GET /api/menu` and the generated `db.json` must both produce **exactly** the
shape the front end already reads. The front end's mapper
(`src/services/menuMapper.ts`) is the authority — do not invent new field names.

```json
{
  "settings": { },
  "tables":     [ ],
  "categories": [ ],
  "products":   [ ]
}
```

## 7.1 Rules that are easy to get wrong

1. **No envelope.** Laravel's `JsonResource` wraps responses in `{"data": …}`
   by default and that breaks the mapper. Call
   `JsonResource::withoutWrapping()` in `AppServiceProvider::boot()`, or return
   plain arrays.
2. **`settings` is an object, not an array of one.**
3. **`tables[].number` is a string**, zero-padded (`"01"`), never an integer.
4. **Booleans are real JSON booleans**, not `1`/`0`. The casts above handle it.
5. **Prices are numbers**, not strings. Cast decimals before encoding.
6. **`sizes[].name`** is the short code (`"R"`, `"L"`) — the front end expands
   it into Regular/Large itself.
7. **Omit nothing.** Empty collections serialise as `[]`, not `null`.
8. **Image paths stay root-relative** (`/images/menu-items/x.webp`) while
   images live in the menu repo. `resolveAssetUrl` in `src/utils/url.ts`
   already passes absolute URLs through untouched, so switching to
   Laravel-hosted absolute URLs later needs no front-end change.

## 7.2 Product shape reference

```json
{
  "id": 105,
  "slug": "cafe-snaca",
  "category_id": 2,
  "also_in_categories": [1],
  "name_en": "Snaca Edition",
  "name_km": "កាហ្វេ ស្នាក់ការ",
  "description_en": "…",
  "description_km": "…",
  "image": "/images/menu-items/cafe-snaca.webp",
  "ingredients_en": [],
  "ingredients_km": [],
  "sizes": [
    { "name": "R", "price_usd": 2.25, "price_khr": 9300 },
    { "name": "L", "price_usd": 2.7,  "price_khr": 11100 }
  ],
  "temperature": ["iced"],
  "sugar_levels": [0, 25, 50, 75, 100],
  "ice_levels": ["none", "less", "normal", "extra"],
  "extras": [
    { "name_en": "Extra Shot", "name_km": "ថែម Espresso",
      "price_usd": 0.5, "price_khr": 2100 }
  ],
  "options": [],
  "available": true,
  "best_seller": true,
  "recommended": false,
  "featured": true,
  "sort_order": 1
}
```

---

# 8. Validation Rules

Every rule below currently lives in `scripts/validate-data.mjs` and runs at
build time. The admin bypasses that script entirely, so **all of it must be
re-implemented server-side** as FormRequest / Filament rules.

## 8.1 The riel rule — most important

The shop converts at a fixed **4,100៛ per dollar** and always rounds **up** to
the next 100៛ note:

```php
public static function khrFromUsd(float $usd): int
{
    return (int) (ceil($usd * 4100 / 100) * 100);
}
```

`price_khr` must equal that value exactly, for every size and every extra.

**In the Filament form, do not ask the owner to type it.** Make the USD field
`live(onBlur: true)` and compute KHR in `afterStateUpdated()`, leaving the KHR
field read-only. The rule then cannot be broken by hand.

## 8.2 Settings

- `shop_name_en` and `shop_name_km` — at least one required
- `default_language` — `km` or `en`
- `currency_usd` and `currency_khr` — **not both false**
- `hero_images` — array of paths; warn when empty

## 8.3 Tables

- `number` — non-empty string, unique
- Warn when a single digit is not zero-padded (`"5"` → suggest `"05"`)

## 8.4 Categories

- `slug` — unique, matches `^[a-z0-9-]+$`
- `name_en` / `name_km` — at least one required
- `kind` — `drink` or `food`
- `icon` — must be one of the 13 registered in `src/utils/icons.ts`:
  `blend`, `cake-slice`, `coffee`, `cookie`, `cup-soda`, `egg-fried`,
  `glass-water`, `leaf`, `milk`, `snowflake`, `soup`, `utensils`, `wheat`
- At least one category must exist

## 8.5 Products

- `slug` — unique, matches `^[a-z0-9-]+$`
- `category_id` — must exist
- `also_in_categories` — must exist, must not repeat the product's own
  `category_id`, no duplicates
- `name_en` / `name_km` — at least one required
- `sizes` — **at least one**, or the product has no price
- `sizes[].name` — unique within the product
- `price_usd`, `price_khr` — numeric, `>= 0`, and satisfy §8.1
- `temperature` — subset of `hot`, `iced`
- `ice_levels` — subset of `none`, `less`, `normal`, `extra`
- `sugar_levels` — integers 0–100
- `ingredients_km` — same length as `ingredients_en` when either is used

## 8.6 Bilingual fallback

The front end falls back to the other language when one side is missing, so a
half-translated record is a **warning**, not an error. Show it in the UI as a
non-blocking notice.

---

# 9. Filament Panel Configuration

```php
return $panel
    ->default()
    ->id('admin')
    ->path('admin')
    ->login()
    ->brandName('SNACA CAFE')
    ->brandLogo(asset('images/logo.png'))
    ->favicon(asset('favicon.png'))
    ->colors(['primary' => Color::Sky])
    ->font('Kantumruy Pro')
    ->sidebarCollapsibleOnDesktop()
    ->resources([...])
    ->pages([...]);
```

## 9.1 Khmer text — required

`->font('Kantumruy Pro')` is not cosmetic. The default Filament font stack has
no Khmer coverage and `ស្នាក់ការ កាហ្វេ` renders as fallback glyphs across
every form. Kantumruy Pro is already the menu's typeface
(`src/styles/globals.css`), so the admin matches the shop.

## 9.2 On the brand colour

The shop palette is deliberately two-tone — navy `#00283f` and white, with no
accent hue (`src/styles/variables.css`). Filament generates a full ramp from
the primary hex, and a near-black navy produces buttons that vanish in dark
mode.

Use navy for the **sidebar and page background** via a custom theme, and pick
one legible accent for buttons and links. The admin is a tool, not brand
surface — legible controls beat palette purity when tapping "sold out"
mid-service.

Generate the theme with `php artisan make:filament-theme` and import the
tokens from `src/styles/variables.css`.

---

# 10. Products Resource

The main screen. Optimise it for the one action performed daily: marking an
item sold out.

## 10.1 Table (list) view

| Column | Type |
|---|---|
| `image` | ImageColumn, circular thumbnail |
| `name_en` | TextColumn, searchable, sortable |
| `name_km` | TextColumn, searchable, toggleable |
| `category.name_en` | TextColumn, sortable |
| starting price | TextColumn, computed from cheapest size |
| `available` | **ToggleColumn — editable inline** |
| `best_seller` / `recommended` / `featured` | IconColumn, toggleable |

Required behaviour:

- `->reorderable('sort_order')` — drag to reorder
- Filters: category, `available`, and each badge
- Bulk actions: delete, bulk toggle availability
- Default sort: `sort_order`
- The `available` toggle must save without opening the record

## 10.2 Form

| Field | Component |
|---|---|
| `name_en`, `name_km` | TextInput, side by side |
| `slug` | TextInput, auto-generated from `name_en`, editable |
| `description_en`, `description_km` | Textarea |
| `category_id` | Select, relationship, searchable |
| also-in categories | Select multiple, relationship to the pivot |
| `image` | FileUpload, image editor enabled, see §12 |
| `sizes` | **Repeater** — `name`, `price_usd`, `price_khr` (read-only, computed) |
| `extras` | Repeater — `name_en`, `name_km`, `price_usd`, `price_khr` |
| `temperature` | CheckboxList — hot, iced |
| `sugar_levels` | CheckboxList — 0, 25, 50, 75, 100 |
| `ice_levels` | CheckboxList — none, less, normal, extra |
| `available`, `best_seller`, `recommended`, `featured` | Toggle |
| `sort_order` | TextInput, numeric |

Group the drink-only fields (`temperature`, `sugar_levels`, `ice_levels`) in a
Section that is hidden when the selected category's `kind` is `food`.

`options` and `ingredients` are **unused across all 85 current products**.
Model the columns, but keep the form fields collapsed in an "Advanced" section
rather than cluttering the main form.

---

# 11. Other Resources

## 11.1 Categories

Standard CRUD. `icon` is a `Select` restricted to the 13 names in §8.4 — never
a free-text field. Reorderable on `sort_order`. Deleting a category with
products must fail with a clear message (§6.5).

## 11.2 Tables (`ShopTable`)

Simple CRUD on `number`, `name`, `active`. Auto-pad `number` to two digits on
save.

## 11.3 Settings

Not a resource — a single Filament **Page** with a form, always editing row 1.
Sections: Identity (names, tagline, logo), Contact (phone, address, hours,
facebook, telegram), Display (currencies, default language,
`show_unavailable_products`), Hero (reorderable multi-image upload).

---

# 12. Image Handling

1. Uploads accept JPEG, PNG and WebP, max 8 MB.
2. On save, convert to **WebP**, resize longest edge to 1200px, quality ~80.
   Products in the repo today are all `.webp`.
3. Store on a local `staging` disk until published.
4. Filename is derived from the record slug: `cafe-snaca.webp`.
5. The value written to the database is the **root-relative repo path**:
   `/images/menu-items/<slug>.webp`.
6. Images reach the live site through the publish action (§13), in the same
   commit as `db.json`.

Category images and hero banners follow the same pipeline into
`/images/categories/` and `/images/banners/`.

---

# 13. Publish Workflow

The single most important custom feature, and the only part Filament does not
provide.

## 13.1 Behaviour

A **Publish menu** button in the panel header:

1. Runs the full §8 validation across all records. Any error blocks the
   publish and is listed in a notification.
2. Builds the `db.json` payload (§7).
3. Collects any staged images not yet in the repository.
4. Creates **one commit** on `main` of the menu repository containing
   `public/data/db.json` plus those images.
5. That push triggers the existing `.github/workflows/deploy.yml`, which runs
   `npm run check` as a second safety net and redeploys GitHub Pages.
6. Records `published_at` and shows the resulting commit URL.

## 13.2 Implementation

Use the GitHub **Git Data API** so everything lands in one commit and one
deploy:

```text
POST /repos/{owner}/{repo}/git/blobs      (per changed file)
POST /repos/{owner}/{repo}/git/trees      (base_tree = current main)
POST /repos/{owner}/{repo}/git/commits
PATCH /repos/{owner}/{repo}/git/refs/heads/main
```

Authenticate with a fine-grained personal access token holding **Contents:
write** on the menu repository only. Store it in `.env` as `GITHUB_TOKEN`;
never commit it.

The simpler `PUT /repos/{owner}/{repo}/contents/{path}` is acceptable as a
fallback, but it makes one commit per file and therefore one deploy per image.

## 13.3 Publish state

Show an indicator in the panel: **"3 changes not published"**, derived from
comparing `max(updated_at)` across the four tables with `published_at`. The
owner must never wonder whether an edit is live.

---

# 14. REST API

Public, read-only, unauthenticated. Rate limit generously (60/min).

## 14.1 `GET /api/menu`

Returns the complete document in the §7 shape. This is what `VITE_MENU_URL`
would point at if the front end ever reads live instead of static.

Cache the serialised payload and bust it on any write.

## 14.2 `GET /api/availability`

```json
{ "105": true, "112": false }
```

Product id → `available`. Small, cacheable, and the only endpoint the customer
menu would call at runtime.

## 14.3 CORS

Allow the GitHub Pages origin only:

```php
'allowed_origins' => [env('MENU_ORIGIN')],  // https://<user>.github.io
'supports_credentials' => false,
```

---

# 15. Seeding from the existing menu

The first migration run must import the current
`public/data/db.json` — **85 products, 11 categories, 12 tables, 1 settings
row**.

Non-negotiable rules:

- **Preserve existing `id` values exactly** (products start at 105, not 1).
  Insert with explicit ids and reset the auto-increment afterwards.
- **Preserve every `slug` exactly.** Slugs are the customer-facing URLs
  (`/menu/cafe-snaca`) and printed QR links depend on them.
- Import `also_in_categories` into the pivot table.
- Do not "fix" any data during import. If a record fails §8 validation, import
  it anyway and report it — the seeder is a migration, not a cleanup.

Ship it as `php artisan menu:import path/to/db.json`, re-runnable.

---

# 16. Environment

```env
APP_URL=https://admin.example.com
DB_CONNECTION=mysql
DB_DATABASE=snaca_menu

GITHUB_TOKEN=github_pat_…
GITHUB_REPO=THORNG-VANTHIEV/coffe_snaca
GITHUB_BRANCH=main
MENU_ORIGIN=https://thorng-vanthiev.github.io

KHR_PER_USD=4100
```

`KHR_PER_USD` is configurable but must never be changed casually — every
existing `price_khr` was computed from 4100.

---

# 17. Development Phases

Build in this order. Each phase ends in something verifiable.

## Phase 1 — Data foundation
Laravel install, migrations, models, casts, pivot, `menu:import` seeder,
`GET /api/menu`.

**Acceptance test — the hard gate:**

```bash
curl -s http://localhost:8000/api/menu > /tmp/api.json
node -e "
  const a = require('/tmp/api.json');
  const b = require('./public/data/db.json');
  const s = o => JSON.stringify(o, Object.keys(o).sort());
  console.assert(JSON.stringify(a) === JSON.stringify(b), 'MISMATCH');
"
```

The API output must be **deep-equal to the current `db.json`**. Do not start
phase 2 until it is.

## Phase 2 — Filament panel
Install Filament, panel branding (§9), Products / Categories / ShopTables
resources, Settings page. Owner can log in and edit everything.

## Phase 3 — Validation
Port every §8 rule. USD→KHR auto-compute. Delete guards.

## Phase 4 — Images
Upload, WebP conversion, staging disk, path convention (§12).

## Phase 5 — Publish
Git Data API commit, validation gate, unpublished-changes indicator (§13).

## Phase 6 — Live availability (optional)
`GET /api/availability`, plus the only change needed in the menu repository: a
small service that fetches it **after** the static menu has rendered and
merges the result, failing silently. The menu must render correctly when that
request fails.

---

# 18. Testing Checklist

- [ ] `GET /api/menu` is deep-equal to the committed `db.json`
- [ ] Existing product ids and slugs survive the import
- [ ] Entering `$2.25` produces `9300៛` automatically
- [ ] Saving a hand-edited wrong `price_khr` is rejected
- [ ] Deleting a category holding products fails with a readable message
- [ ] `also_in_categories` rejects the product's own category
- [ ] Duplicate slug is rejected
- [ ] A product with zero sizes is rejected
- [ ] Khmer text renders correctly in every form, table and PDF-free view
- [ ] The availability toggle saves from the list view without opening a record
- [ ] Publish produces exactly one commit and one Pages deploy
- [ ] Publish is blocked when validation fails
- [ ] `npm run check` passes on the generated `db.json` in CI
- [ ] Turning the Laravel server off leaves the customer menu fully working

---

# 19. Definition of Done

1. Owner can add, edit and delete a product from a phone.
2. Owner can mark an item sold out in two taps from the list.
3. Prices in riel can never disagree with dollars.
4. Publishing updates the live menu without anyone touching git.
5. Invalid data cannot reach `db.json` — blocked in Filament, and blocked
   again by `npm run check` in the deploy workflow.
6. The customer menu's source files are unchanged, except the optional
   phase 6 availability service.
7. The backend can be offline without any customer noticing.

---

# 20. Project Principle

> The admin owns the data. The menu owns the customer.
>
> They meet at `db.json`, and nowhere else.
