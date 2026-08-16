# Coffee Menu Web App

A QR-based digital menu for a coffee shop. A customer scans the code on their
table, the menu opens on their phone in Khmer or English, with prices in USD
and KHR. It is **read-only** — there is no ordering, no cart, no accounts and
no backend.

Built to [`Coffee Menu Web App — System Specification.md`](./Coffee%20Menu%20Web%20App%20—%20System%20Specification.md),
which stays the source of truth for version 1.

```
Customer phone → scan QR → GitHub Pages → React app → public/data/db.json
```

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173/coffe_snaca/
```

The dev server serves `public/data/db.json` directly, so there is nothing else
to run. Edit the file, save, and the browser reloads.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Validates menu + contrast, type-checks, then builds to `dist/` |
| `npm run preview` | Serves `dist/` exactly as GitHub Pages will |
| `npm run validate` | Checks `db.json` for the mistakes listed in spec §58 |
| `npm run contrast` | Checks colour contrast in both themes |
| `npm run check` | validate + contrast + typecheck + lint |
| `npm run images` | Generates any missing product/category artwork |
| `npm run tables` | Prints the QR link for every table |

---

## For the shop owner

Everything on the menu lives in one file: **`public/data/db.json`**.
No React code needs to change for a normal menu update.

### Rename the shop

Change `shop_name_en` **and** `shop_name_km` in `settings`. Both matter — the
menu opens in Khmer by default, so leaving the Khmer name behind means most
customers still see the old one.

Nothing else needs editing. The browser tab, the social preview card and the
"Add to Home Screen" name are generated from these fields at build time by the
`shop-identity` plugin, so they can never drift out of step with the menu.

> **Edit `public/data/db.json`, never `dist/data/db.json`.** `dist/` is build
> output: it is wiped on every build and excluded from git, so changes made
> there are lost and never reach the published site.

### Change a price

1. Open `public/data/db.json`
2. Find the product by its `name_en`
3. Change `price_usd` and `price_khr` — **both**, they are set by hand and
   nothing converts between them
4. Save, then run `npm run dev` and check the menu
5. Publish:

```bash
git add .
git commit -m "Update iced latte price"
git push
```

GitHub Actions rebuilds and redeploys within a couple of minutes.

### Mark something sold out

```json
"available": false
```

The item stays on the menu, dimmed, with a **អស់ជាបណ្តោះអាសន្ន / Temporarily
Unavailable** badge, and drops to the bottom of its category. Set it back to
`true` when it is available again.

To hide sold-out items entirely instead, set
`"show_unavailable_products": false` in `settings`.

### Add a product

1. Add the photo to `public/images/products/<folder>/<slug>.webp`
2. Copy an existing product object in `db.json` and edit it
3. Give it an `id` and a `slug` that no other product uses
4. Point `category_id` at the right category
5. Fill in `name_en`, `name_km`, `description_en`, `description_km`
6. Set the `sizes` with both prices
7. Set `available`, `best_seller`, `recommended`, `sort_order`
8. `npm run validate` — it will tell you if anything is wrong
9. Test locally, then commit and push

Never reuse or renumber an existing `id` or `slug`; old QR links and
bookmarks point at them.

### The hero slideshow

The banner cycles through `settings.hero_images` every 5 seconds with a
cross-fade. Add or remove paths to change it — one entry makes it a static
banner, and an empty list falls back to the shipped default.

```json
"hero_images": [
  "/images/banners/hero-1.webp",
  "/images/banners/hero-2.webp"
]
```

Use wide images (**1600 × 900**). The headline sits over the left half, so
keep the subject on the right where the overlay is lightest.

Only the visible slide and the next one are loaded, so a four-slide hero still
costs one image on first paint. It does not auto-advance for visitors who have
asked their device for reduced motion.

### Photos

Real photos are the single biggest quality win. Replace the generated
placeholder with a photo of the same filename and nothing else changes.

- Format: **WebP** (JPEG works too — update the path in `db.json`)
- Size: **1200 × 900** for products, 800 × 600 for categories
- Compress before committing. Keep each file well under 300 KB.

Missing photos never break the page — the app falls back to
`public/images/default-product.webp`, and then to a neutral icon tile.

### Table QR codes

Each table gets its own link:

```
https://thorng-vanthiev.github.io/coffe_snaca/?table=05
```

Print the list, then paste the URLs into any QR generator:

```bash
npm run tables -- https://thorng-vanthiev.github.io/coffe_snaca/
npm run tables -- https://thorng-vanthiev.github.io/coffe_snaca/ --write   # writes table-links.md
```

Add or remove tables in the `tables` array in `db.json`. A link pointing at a
table that does not exist shows a plain welcome instead of the table number —
never an error (spec §21).

---

## Deployment

Live at **https://thorng-vanthiev.github.io/coffe_snaca/**
(repository: `THORNG-VANTHIEV/coffe_snaca`).

### First time

1. Push this project to the repository's `main` branch
2. In **Settings → Pages**, set **Source: GitHub Actions**
3. Push again, or re-run the workflow

**Step 2 is not optional.** Until Pages is switched on, the
`actions/configure-pages` step fails with:

```
Error: Get Pages site failed. Please verify that the repository has Pages
enabled and configured to build using GitHub Actions … Error: Not Found
```

That is the repository setting missing, not a problem with the build. The
action's `enablement: true` input can create the Pages site instead, but it
needs a Personal Access Token rather than the built-in `GITHUB_TOKEN`, so
flipping the setting is the simpler route.

The workflow derives the base path from the repository name, so renaming the
repository does not break asset URLs. A `<user>.github.io` repository is
published at `/` automatically.

### The base path

`vite.config.ts` defaults to `base: '/coffe_snaca/'` to match the repository
name (spec §52). This default only affects local `dev` and `preview` — CI sets
`VITE_BASE` itself. Override it for any other host:

```bash
VITE_BASE=/ npm run build            # custom domain or user site
VITE_BASE=/other-repo/ npm run build # a differently named repository
```

Nothing in the source assumes the app runs at `/` — image paths from
`db.json` are resolved through `import.meta.env.BASE_URL` in one place
(`src/utils/url.ts`), which is what keeps assets working under a sub-path.

### Deep links on GitHub Pages

GitHub Pages has no SPA rewrite, so refreshing `/coffe_snaca/menu/espresso`
would normally 404. A generated `404.html` bounces the request back into the
app, and a snippet in `index.html` restores the address before React Router
reads it. Both are produced automatically from `base` — see the
`github-pages-spa-fallback` plugin in `vite.config.ts`.

---

## Data reference

`public/data/db.json` has four top-level keys.

### `settings`

| Field | Notes |
| --- | --- |
| `shop_name_en` / `shop_name_km` | Header, footer, browser tab, social card and PWA name |
| `tagline_en` / `tagline_km` | Hero subtitle and footer line |
| `logo` | Path under `public/`, e.g. `/images/logo/logo.png` |
| `hero_images` | Banner slides, cross-faded every 5s. One entry = a static banner |
| `phone`, `address_*`, `opening_hours_*` | Footer and About page |
| `currency_usd`, `currency_khr` | Switch a currency off to hide it everywhere |
| `default_language` | `"km"` or `"en"` — used until the customer chooses |
| `show_unavailable_products` | `false` hides sold-out items instead of dimming |
| `facebook`, `telegram` | Leave empty to hide the link |

### `tables`

```json
{ "id": 5, "number": "05", "name": "Table 05", "active": true }
```

`number` must match what the QR link says. `?table=5` is accepted too and
normalised to `"05"`.

### `categories`

```json
{
  "id": 1, "slug": "coffee",
  "name_en": "Coffee", "name_km": "កាហ្វេ",
  "description_en": "…", "description_km": "…",
  "image": "/images/categories/coffee.webp",
  "icon": "coffee", "kind": "drink",
  "active": true, "sort_order": 1
}
```

`icon` must be one of the names registered in `src/utils/icons.ts` — that file
is a deliberate allow-list, because importing all 2,000 Lucide icons would
dwarf the rest of the bundle. Add a line there to add an icon.

`kind` is `"drink"` or `"food"`. It decides whether the product page labels a
section **Size** or **Portion**, so food is never forced through
coffee-shaped options (spec §15).

### `products`

See spec §25 for the full shape. Two additions:

- **`options`** — free-form option groups for food (spice level, dipping
  sauce, cooked-ness). Drinks keep the fixed `temperature` / `sugar_levels` /
  `ice_levels` fields.
- **`sizes[].name_en` / `name_km`** — optional. `S`, `M`, `L` and `XL` are
  expanded to Small/តូច automatically; anything else (`Regular`, `Bowl`,
  `6 pcs`) should spell out both languages.

All options are **informational**. Version 1 has no ordering, so the product
page presents them as a description of what is possible, not as controls.

### Validation

```bash
npm run validate
```

Checks duplicate ids and slugs, missing categories, missing names, missing
image files, invalid prices, unknown temperature/ice values, sugar levels
outside 0–100, and missing translations (spec §58). Errors fail the build;
warnings are printed and let through, because the app degrades around them.
It runs automatically as part of `npm run build` and in CI.

---

## Project structure

```
public/
  data/db.json          the entire menu
  images/               logo, banners, categories, products
src/
  app/                  App, routes, error boundary, scroll restoration
  components/
    common/             Header, Footer, Button, ImageWithFallback, states
    menu/               ProductCard/Grid/Rail, CategoryChip/List/Grid, PriceDisplay, badges
    layout/             MainLayout — the loading / error / ready gate
  features/
    home/ menu/ product/ categories/ search/ about/ splash/
    language/           LanguageProvider + the ខ្មែរ / EN toggle
    table/              TableBadge
  hooks/                useMenu, useLanguage, useTable, useMediaQuery, useDocumentTitle
  i18n/strings.ts       UI labels only — menu content is bilingual in db.json
  models/               typed domain models
  services/
    menuService.ts      the only module that knows where data comes from
    menuMapper.ts       raw JSON → typed models, defensively
    menuSelectors.ts    pure read models (visible products, best sellers, related…)
  store/                MenuProvider — loads once, holds for the session
  utils/                currency, translation, search, url, storage, icons
scripts/
  validate-data.mjs     pre-deploy data checks
  generate-images.mjs   placeholder artwork generator
  table-links.mjs       QR link list
```

---

## Architecture

The one rule that matters (spec §73):

> **The UI must not know where menu data comes from.**

```
React component → hooks → services/menuService → public/data/db.json
```

No component imports `db.json`, and no component fetches anything. Moving to a
REST API in version 2 means changing the `fetch` inside `menuService.ts` and
the mapper's field names — the pages and components do not change:

```js
// today
fetch(`${import.meta.env.BASE_URL}data/db.json`)
// version 2
fetch('https://api.coffeeshop.com/api/menu')
```

`VITE_MENU_URL` already overrides the source without touching code, which is
also how you point the app at a local `json-server` if you prefer one:

```bash
npx json-server public/data/db.json --port 3001
VITE_MENU_URL=http://localhost:3001/db npm run dev
```

(Use whichever endpoint your json-server version prints for the whole
document. The plain dev server needs none of this.)

Other decisions worth knowing:

- **Loading state lives in one place.** `MainLayout` shows the splash, the
  error panel, or the pages. Pages therefore never handle a null menu.
- **Filters live in the URL.** `?category=`, `?q=` and `?table=` mean any view
  of the menu can be shared, bookmarked and undone with the back button.
- **The data is read defensively.** A typo in `db.json` falls back to a safe
  value instead of throwing; `npm run validate` is what reports it, before
  deployment.
- **Themes are a token swap.** Components only reference semantic tokens
  (`surface`, `text`, `accent`), so both palettes live entirely in
  `src/styles/variables.css` and no component carries a `dark:` variant.

---

## Theme

Two themes, **dark by default** — the coffee-house look the spec asks for
(§4) — with a Moon/Sun button in the header, shaped to match the language
button beside it. The choice is remembered in LocalStorage and survives a
refresh or a re-scan.

Both palettes live in `src/styles/variables.css`:

- **dark** on bare `:root`, so it is what a browser lands on even if no script
  runs
- **light** under `:root[data-theme="light"]`, the spec §31 palette

An inline script in `index.html` applies the saved theme *before the first
paint*, which is what stops a light-theme customer seeing a dark flash on
every load. It reads the same storage key as `ThemeProvider`
(`coffee-menu.theme`) — change one and change the other.

The theme is intentionally **not** a `db.json` setting. It has to be applied
before any data has loaded, so a setting would arrive too late to prevent
exactly the flash the inline script exists to avoid. To change the shop's
default, edit `DEFAULT_THEME` in `src/features/theme/themeContext.ts` and the
matching fallback in the `index.html` script.

There is no "system" option: the default is dark whatever the phone is set to,
and a third state would make a two-icon switch ambiguous.

### Adding a colour

Add the token to **both** blocks in `variables.css`, then expose it in the
`@theme inline` block in `globals.css`. Never write a colour directly into a
component — a hex in a `className` only looks right in the theme it was
picked for, and Tailwind's utility ordering makes overriding it unreliable.

Foreground/background pairs come as tokens (`--accent` / `--on-accent`) so
contrast holds in both themes. Colours that flip lightness between themes —
`--secondary` is a dark brown in light and a light tan in dark — must never be
paired with a fixed `text-white`.

Two tokens exist specifically because one value cannot serve both jobs:

- **`--accent` vs `--accent-strong`.** The brand caramel `#C68B59` is only
  2.9:1 on white, so it is used for fills and for `aria-hidden` icons that sit
  beside a label. Anything that has to be *read* — accent links, the focus
  ring — uses `--accent-strong`, a deepened caramel in the light theme.
- **`--border` vs `--border-interactive`.** Card hairlines can be faint;
  a boundary that identifies a control cannot, because an outline button's
  fill is nearly the page colour.

`npm run contrast` reads the real values out of `variables.css` and fails if
any pair drops below its WCAG target in either theme. It runs as part of
`npm run build`, so a palette tweak cannot quietly break legibility.

## Accessibility and performance

- Every image has alt text and a fallback chain; no broken-image icons
- Touch targets are at least 44px; there is a skip link and visible focus rings
- Availability is carried by an icon and words, never colour alone
- Khmer gets its own line-height so stacked diacritics are not clipped
- The hero loads eagerly, everything else lazily; skeleton cards hold the
  layout while data arrives
- Motion is disabled for `prefers-reduced-motion`

Production build: ~93 KB gzipped JS, ~8 KB gzipped CSS, plus images.

---

## Not in version 1

Ordering, cart, checkout, payment, KHQR, accounts, admin dashboard,
inventory, reports, kitchen queue, online database. The table number is read
and displayed but is informational only — it is there so version 2 can attach
orders to it (spec §4, §68).
