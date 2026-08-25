# SNACA Cafe — Digital Menu

A QR-based digital menu for SNACA Cafe in Siem Reap. A customer scans the code
on their table, the menu opens on their phone in Khmer or English, with prices
in USD and riel. It is **read-only** — there is no ordering, no cart, no
accounts and no backend.

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
| `npm test` | Runs the focused component and welcome-flow tests once |
| `npm run validate` | Checks `db.json` for the mistakes listed in spec §58 |
| `npm run contrast` | Checks colour contrast in both themes |
| `npm run check` | validate + contrast + typecheck + lint + test |
| `npm run images` | Generates any missing product/category artwork |
| `npm run tables` | Prints the QR link for every table |

---

## What is on the menu

Eleven categories, ordered as the customer meets them. Drinks first, then food.

| # | Category | ខ្មែរ | kind |
| ---: | --- | --- | --- |
| 1 | Signature Drinks | ភេសជ្ជៈប្រចាំហាង | drink |
| 2 | Iced Coffee | កាហ្វេត្រជាក់ | drink |
| 3 | Hot Coffee | កាហ្វេក្ដៅ | drink |
| 4 | Matcha Series | Matcha Series | drink |
| 5 | Tea & Soda | តែ & សូដា | drink |
| 6 | Blended Drinks / Frappes | ភេសជ្ជៈក្រឡុក | drink |
| 7 | Breakfast | អាហារពេលព្រឹក | food |
| 8 | Noodle Soup | គុយទាវ | food |
| 9 | Lunch | អាហារពេលថ្ងៃត្រង់ | food |
| 10 | Snacks | អាហារសម្រន់ | food |
| 11 | Others | ផ្សេងៗ | food *(inactive)* |

**Signature Drinks holds no products of its own.** It is a *showcase*: it
borrows items that already live elsewhere, so Snaca Edition is an iced coffee
listed under Iced Coffee *and* shown again under Signature Drinks. See
[Showcase categories](#showcase-categories).

**Others is switched off** (`"active": false`). It is empty, and an empty
category would otherwise show as a "0 items" tile on the home page. Set
`active` back to `true` if you put products in it again.

---

## For the shop owner

Everything on the menu lives in one file: **`public/data/db.json`**.
No React code needs to change for a normal menu update.

> **Edit `public/data/db.json`, never `dist/data/db.json`.** `dist/` is build
> output: it is wiped on every build and excluded from git, so changes made
> there are lost and never reach the published site.

### Change a price

1. Open `public/data/db.json`
2. Find the product by its `name_en`
3. Change **`price_usd`**
4. Work out `price_khr` with the shop's rule below — or just run
   `npm run validate`, which prints the number it expects
5. Save, run `npm run dev`, check the menu
6. Publish:

```bash
git add public/data/db.json
git commit -m "raise the iced latte to $2.20"
git push
```

GitHub Actions rebuilds and redeploys within a couple of minutes.

### The riel rule

The shop converts at a **fixed 4,100៛ to the dollar, always rounded up to the
next 100៛ note**:

```
price_khr = ceil(price_usd × 4100 ÷ 100) × 100
```

| USD | × 4,100 | rounded up |
| --- | --- | --- |
| $2.07 | 8,487 | **8,500៛** |
| $2.50 | 10,250 | **10,300៛** |
| $3.50 | 14,350 | **14,400៛** |

USD is the authored price; riel is derived from it. `npm run validate`
**fails the build** if any `price_khr` disagrees, so the two currencies cannot
drift apart by hand:

```
✖ product "beef-lok-lak" size "Regular": price_khr should be 14400
  (3.5 x 4100, rounded up to 100៛) — got 14000
```

The rate lives in one place — `KHR_PER_USD` at the top of
`scripts/validate-data.mjs`. If the shop ever changes it, change it there and
re-run `npm run validate` to see every price that needs updating.

### Sizes

Drinks are sold in two cup sizes. Use the short codes — the app expands them
into both languages by itself:

```json
"sizes": [
  { "name": "R", "price_usd": 2.07, "price_khr": 8500 },
  { "name": "L", "price_usd": 2.45, "price_khr": 10100 }
]
```

| Code | English | ខ្មែរ |
| --- | --- | --- |
| `R` | Regular | ធម្មតា |
| `S` | Small | តូច |
| `M` | Medium | មធ្យម |
| `L` | Large | ធំ |
| `XL` | Extra Large | ធំបំផុត |

A drink sold in one size only gets one entry. Anything outside this list
(`Bowl`, `6 pcs`) needs `name_en` and `name_km` spelled out beside `name`.
Food uses a single `"Regular"` portion.

Cards print the **cheapest** size after "From", so ordering a category by
price uses the small cup, which is the number the customer can actually see.

### What leads a category

Three badges an item can carry double as its running order inside its own
category:

```
🔥 best_seller  →  ✨ recommended  →  ⭐ featured  →  then price, dearest first
```

So marking a drink `"best_seller": true` puts it at the top of its section even
when a pricier item would otherwise outrank it. An item wearing several badges
takes its best one. `sort_order` only breaks ties between equally priced items.

Sold-out items sink to the bottom of their own category, never the bottom of
the menu — and a sold-out house pick does not open a section.

This is the whole ordering rule, in `getVisibleProducts`
(`src/services/menuSelectors.ts`):

```
category → available → badge rank → price (high→low) → sort_order → id
```

### Showcase categories

A category can display a product that lives somewhere else. The product keeps
its real home and appears in both places:

```json
{
  "slug": "cafe-snaca",
  "category_id": 2,            // Iced Coffee — where it really lives
  "also_in_categories": [1],   // borrowed by Signature Drinks
}
```

The product page still names the real category, and "You may also like" still
pulls from it — the showcase only adds a second place to find the item. Leave
the field out (or use `[]`) for a normal product.

`npm run validate` fails if `also_in_categories` names a category that does not
exist, repeats the product's own category, or lists one twice.

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

1. Add the photo to `public/images/menu-items/<slug>.webp`
2. Copy an existing product object in `db.json` and edit it
3. Give it an `id` and a `slug` that no other product uses
4. Point `category_id` at the right category
5. Fill in `name_en`, `name_km`, `description_en`, `description_km`
6. Set the `sizes` with both prices — riel by the rule above
7. Set `available`, and any of `best_seller` / `recommended` / `featured`
8. `npm run validate` — it will tell you if anything is wrong
9. Test locally, then commit and push

Never reuse or renumber an existing `id` or `slug`; old QR links and bookmarks
point at them.

A product with no photo yet is fine: leave `"image": ""` and it falls back to
the shipped default. `npm run validate` prints a warning for each one, which is
a useful running list of what still needs shooting.

### Rename the shop

Change `shop_name_en` **and** `shop_name_km` in `settings`. Both matter — the
menu opens in Khmer by default, so leaving the Khmer name behind means most
customers still see the old one.

Nothing else needs editing. The browser tab, the social preview card and the
"Add to Home Screen" name are generated from these fields at build time by the
`shop-identity` plugin (`vite/shop-identity.ts`), so they can never drift out
of step with the menu.

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

**Size: 1920 × 1280 (3:2)**, WebP, quality ~82, which lands around 100–250 KB.
That is the native ratio of the shop's camera, so photos need no cropping
before export.

The banner is a fixed-height band that the image fills (`object-fit: cover`),
not a fixed ratio — 240px tall on a phone, 368px on desktop, at most 1216px
wide. On a wide screen that shows roughly the middle 45% of the picture, so
**keep the subject vertically centred**. The headline sits over the bottom
left, so keep that corner quiet.

Only the visible slide and the next one are loaded, so a seven-slide hero still
costs one image on first paint. It does not auto-advance for visitors who have
asked their device for reduced motion.

### Photos

Real photos are the single biggest quality win. Drop a photo in with the same
filename as a placeholder and nothing else changes.

| | |
| --- | --- |
| Format | **WebP** (JPEG works too — update the path in `db.json`) |
| Products | **1200 × 900** (4:3), plain light background |
| Hero | **1920 × 1280** (3:2) |
| Weight | Well under 300 KB each |

To convert a photo the shop sends over:

```bash
cwebp -q 82 -resize 1200 900 photo.jpg -o public/images/menu-items/<slug>.webp
```

Missing photos never break the page — the app falls back to
`public/images/default-product.webp`, and then to a neutral icon tile.

> Some early items shipped with **generated placeholder art** rather than
> photography: flat coloured discs produced by `npm run images`. They pass
> validation because the file exists, so they are easy to miss. They are
> distinguishable by weight — generated art is 9–13 KB, a real photo 20–100 KB.

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

**Pushing to `main` is the publish button.** There is no staging site: the
workflow in `.github/workflows/deploy.yml` runs `npm run check`, builds, and
deploys to GitHub Pages on every push. If `check` fails, nothing is published —
the live menu keeps the last good version.

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

### Caching

The menu is fetched with `cache: 'no-cache'` (`src/services/menuService.ts`),
so a price edit shows up on the customer's next refresh rather than after a CDN
TTL, while an unchanged file still costs only a 304. JS and CSS carry hashed
filenames. There is no service worker, so there is no stale cache to clear on a
customer's phone.

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
  "id": 2, "slug": "iced-coffee",
  "name_en": "Iced Coffee", "name_km": "កាហ្វេត្រជាក់",
  "description_en": "…", "description_km": "…",
  "image": "/images/menu-items/ice-latte.webp",
  "icon": "glass-water", "kind": "drink",
  "active": true, "sort_order": 2
}
```

`icon` must be one of the names registered in `src/utils/icons.ts` — that file
is a deliberate allow-list, because importing all 2,000 Lucide icons would
dwarf the rest of the bundle. Currently: `blend`, `cake-slice`, `coffee`,
`cookie`, `cup-soda`, `egg-fried`, `glass-water`, `leaf`, `milk`, `snowflake`,
`soup`, `utensils`, `wheat`. Add a line there to add an icon.

`kind` is `"drink"` or `"food"`. It decides whether the product page labels a
section **Size** or **Portion**, so food is never forced through
coffee-shaped options (spec §15).

`image` is the tile shown on the home page. Point it at a real photo of
something in the category.

### `products`

See spec §25 for the full shape. Four things worth calling out:

- **`also_in_categories`** — extra showcase categories, on top of the product's
  own. See [Showcase categories](#showcase-categories).
- **`best_seller` / `recommended` / `featured`** — badges that also set the
  order inside a category. See [What leads a category](#what-leads-a-category).
- **`options`** — free-form option groups for food (spice level, dipping
  sauce, cooked-ness). Drinks keep the fixed `temperature` / `sugar_levels` /
  `ice_levels` fields.
- **`sizes[].name_en` / `name_km`** — optional. `R`, `S`, `M`, `L` and `XL` are
  expanded to Regular/ធម្មតា automatically; anything else should spell out both
  languages.

All options are **informational**. Version 1 has no ordering, so the product
page presents them as a description of what is possible, not as controls.

### Validation

```bash
npm run validate
```

Checks duplicate ids and slugs, missing categories, invalid showcase
references, missing names, missing image files, invalid prices, riel that does
not match the fixed rate, unknown temperature/ice values, sugar levels outside
0–100, and missing translations (spec §58). Errors fail the build; warnings are
printed and let through, because the app degrades around them. It runs
automatically as part of `npm run build` and in CI.

### Working files

Some files used to maintain the menu are kept out of git (`.gitignore`),
because they are the shop's paperwork rather than part of the app:

| File | What it is |
| --- | --- |
| `drink_menu.md`, `food_menu.md` | The shop's standard price lists — the source of truth `db.json` is reconciled against |
| `remain_menu_without_system.md` | Full records of items removed from the menu, with a JSON block for restoring any of them |
| `none-img-menu.xlsx` | The shooting list: every item still waiting for a photo, with the filename each one needs |

---

## Project structure

```
public/
  data/db.json          the entire menu
  images/               logo, banners, menu items
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
  validate-data.mjs     pre-deploy data checks, including the riel rule
  generate-images.mjs   placeholder artwork generator
  check-contrast.mjs    WCAG contrast gate for both themes
  table-links.mjs       QR link list
vite/
  shop-identity.ts      fills the shop name into index.html at build time
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

- **Ordering lives in one selector.** Every list of products — the menu page,
  a category page, the home rails — comes out of `getVisibleProducts`, so the
  badge-then-price rule is written once and cannot disagree between pages.
- **Loading and welcome state live in one place.** `MainLayout` shows the
  loading splash, the error panel, the short branded welcome, or the pages.
  The customer enters with the visible **View menu** button, and that choice
  is remembered in SessionStorage so repeat views in the same browser session
  go straight to the menu. Pages therefore never handle a null menu.
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

Two themes, **light by default**, with a Moon/Sun button in the header shaped
to match the language button beside it. The choice is remembered in
LocalStorage and survives a refresh or a re-scan.

Both palettes live in `src/styles/variables.css`:

- **dark** on bare `:root`, so a browser running no JavaScript still lands on a
  complete, readable palette
- **light** under `:root[data-theme="light"]`, the spec §31 palette

An inline script in `index.html` stamps the saved theme — defaulting to
`light` — onto the root element *before the first paint*, which is what stops a
customer seeing a flash of the wrong palette on every load. It reads the same
storage key as `ThemeProvider` (`coffee-menu.theme`); change one and change the
other. The default also lives in `DEFAULT_THEME`
(`src/features/theme/themeContext.ts`) and must match the script's fallback.

The theme is intentionally **not** a `db.json` setting. It has to be applied
before any data has loaded, so a setting would arrive too late to prevent
exactly the flash the inline script exists to avoid.

There is no "system" option: the default is the same whatever the phone is set
to, and a third state would make a two-icon switch ambiguous.

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

## Motion

The interface uses a restrained three-speed motion rhythm: **150ms** for
control feedback, **220ms** for route and welcome transitions, and **320ms**
for image/card reveals. Routes fade and rise slightly, search results
cross-fade without shifting, and only the first eight cards in a grid or rail
are staggered. The menu is already mounted behind the welcome, so pressing
**View menu** reveals it smoothly instead of showing a blank frame.

Motion never delays data loading, navigation, scrolling, or control input.
Effects use compositor-friendly opacity and transform properties, and the
global `prefers-reduced-motion` rule removes animation duration and stagger
delay for customers who request less movement. Timing tokens live in
`src/styles/variables.css`; shared keyframes and utilities live in
`src/styles/globals.css`.

## Accessibility and performance

- Every image has alt text and a fallback chain; no broken-image icons
- Touch targets are at least 44px; there is a skip link and visible focus rings
- Availability is carried by an icon and words, never colour alone
- Khmer gets its own line-height so stacked diacritics are not clipped
- The hero loads eagerly, everything else lazily; skeleton cards hold the
  layout while data arrives
- Motion is disabled for `prefers-reduced-motion`

Production build: ~97 KB gzipped JS, ~9 KB gzipped CSS, plus images.

---

## Not in version 1

Ordering, cart, checkout, payment, KHQR, accounts, admin dashboard,
inventory, reports, kitchen queue, online database. The table number is read
and displayed but is informational only — it is there so version 2 can attach
orders to it (spec §4, §68).
