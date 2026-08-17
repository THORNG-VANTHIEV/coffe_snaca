# Coffee Menu Web App — System Specification

## 1. Project Overview

### Project Name
**Coffee Menu Web App**

### Project Type
QR-based digital menu web application for a local coffee shop.

### Main Purpose
The system allows dine-in customers to scan a QR code placed on each table and view the coffee shop menu using their phone, tablet, or computer.

The system is **read-only**. Customers cannot:

- Place orders
- Make payments
- Create accounts
- Submit reports
- Manage inventory

The application focuses mainly on **coffee and drinks**, while also supporting food categories such as lunch, noodles, rice, snacks, desserts, and other menu items.

---

# 2. Technology Stack

## Frontend

Use:

- React
- Vite
- JavaScript or TypeScript
- React Router
- CSS Modules, Tailwind CSS, or modern CSS
- Lucide React for icons
- LocalStorage for language and preferences

Recommended:

```text
React
Vite
TypeScript
React Router
Tailwind CSS
Lucide React
```

## Data Source

### Development

```text
React
   ↓
json-server
   ↓
db.json
```

json-server is used only during development.

### Production

```text
GitHub Pages
      │
      ▼
React Application
      │
      ▼
Static JSON
/public/data/db.json
```

Do not depend on json-server in production.

---

# 3. Deployment Architecture

```text
Customer Phone
      │
      │ Scan QR
      ▼
GitHub Pages
https://username.github.io/coffee-menu/
      │
      ▼
React + Vite
      │
      ▼
Static JSON Data
/public/data/db.json
```

Example Table 05 QR URL:

```text
https://username.github.io/coffee-menu/?table=05
```

React reads the table number from the URL.

Example:

```javascript
const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table");
```

Result:

```text
Welcome
Table 05
```

---

# 4. System Scope

## Included in Version 1

The application must support:

- QR code table access
- Table number detection
- Khmer and English languages
- Coffee menu
- Drink menu
- Food menu
- Categories
- Product details
- Product images
- Product description
- Ingredients
- Size information
- Drink customization information
- USD pricing
- KHR pricing
- Product availability
- Best seller products
- Recommended products
- Search
- Category filtering
- Responsive design
- Mobile-first layout
- Local JSON data
- GitHub Pages hosting
- Local data update workflow
- Dark/coffee-inspired modern UI

## Not Included in Version 1

Do not implement:

- Login
- Registration
- Customer accounts
- Admin dashboard
- Ordering
- Cart
- Checkout
- Payment
- KHQR
- Inventory
- Stock management
- Receipt printing
- Reports
- Sales reports
- Kitchen management
- Barista order queue
- Online database

These features may be added later.

---

# 5. Target Users

## Customer

Customer can:

- Scan QR code
- View table number
- Browse categories
- Browse menu items
- Search products
- View product details
- View prices
- View available sizes
- View drink options
- View ingredients
- Switch Khmer/English
- View recommended items
- View best sellers

## Coffee Shop Owner

The owner manages menu data from a local computer.

Owner does not use an online admin dashboard.

Workflow:

```text
Open Local Project
      ↓
Edit db.json
      ↓
Add/Edit Product Images
      ↓
Test Locally
      ↓
git add .
      ↓
git commit
      ↓
git push
      ↓
GitHub Pages Updates
```

---

# 6. Menu Categories

Initial categories should include:

1. Coffee
2. Non-Coffee Drinks
3. Tea
4. Smoothies
5. Frappe
6. Soft Drinks
7. Breakfast
8. Lunch
9. Rice
10. Noodles
11. Snacks
12. Desserts

Categories must be data-driven.

Do not hard-code categories inside React components.

Example:

```json
{
  "id": 1,
  "slug": "coffee",
  "name_en": "Coffee",
  "name_km": "កាហ្វេ",
  "icon": "coffee",
  "image": "/images/categories/coffee.webp",
  "active": true,
  "sort_order": 1
}
```

---

# 7. Application Pages

## 7.1 Splash / Initial Loading

Purpose:

- Load application
- Load JSON menu data
- Detect language
- Detect table number
- Prepare application state

Display:

- Coffee shop logo
- Coffee shop name
- Coffee shop tagline
- Small loading animation
- Visible “View Menu” button as soon as the menu data is ready

Keep loading screen short.

Behavior:

- Open the menu only after the customer presses “View Menu”
- Show the branded welcome only once per browser session
- On repeat views in the same session, show only real loading time and then open the menu

---

# 7.2 Home Page

The Home page is the main customer experience.

### Header

Display:

- Logo
- Coffee shop name
- Table number
- Language selector

Example:

```text
☕ Coffee House

Table 05

ខ្មែរ | EN
```

---

## Hero Section

Use a modern coffee shop promotional banner.

Example content:

```text
Fresh Coffee.
Better Moments.

Discover your favorite drink.
```

Khmer:

```text
កាហ្វេស្រស់
សម្រាប់ពេលវេលាដ៏ល្អរបស់អ្នក
```

Hero may include:

- Coffee image
- Gradient overlay
- Shop slogan
- Recommended drink

Do not make the hero excessively tall on mobile.

---

# 8. Search

Provide search near the top of the Home page.

Example:

```text
🔍 Search coffee, tea, food...
```

Search must support:

- English product name
- Khmer product name
- Ingredients
- Category
- Description

Search should update results immediately.

No page reload.

---

# 9. Category Navigation

Display categories using horizontal scrollable chips/cards on mobile.

Example:

```text
[☕ Coffee]
[🧋 Drinks]
[🍵 Tea]
[🍜 Noodles]
[🍚 Rice]
```

Selected category must have a visually distinct state.

Desktop/tablet can use a larger category grid.

---

# 10. Best Seller Section

Display products where:

```json
"best_seller": true
```

Example title:

```text
🔥 Best Sellers
```

Khmer:

```text
🔥 លក់ដាច់បំផុត
```

Use horizontal scrolling product cards on mobile.

---

# 11. Recommended Section

Display products where:

```json
"recommended": true
```

Title:

```text
Recommended For You
```

Khmer:

```text
ណែនាំសម្រាប់អ្នក
```

---

# 12. Product Listing

Products should display as modern coffee-shop cards.

Each card should contain:

- Product image
- Product name
- Short description
- Starting price
- Availability
- Best seller badge when applicable
- Recommended badge when applicable

Example:

```text
┌─────────────────────────┐
│                         │
│      Product Image      │
│                         │
├─────────────────────────┤
│ Iced Caramel Latte      │
│ ការ៉ាមែលឡាតេទឹកកក      │
│                         │
│ Creamy caramel coffee   │
│                         │
│ $2.50 | 10,000៛         │
│                         │
│ 🔥 Best Seller          │
└─────────────────────────┘
```

---

# 13. Product Detail Page

Route:

```text
/menu/:productSlug
```

Example:

```text
/menu/iced-caramel-latte
```

Display:

## Product Image

Large image with appropriate aspect ratio.

Recommended:

```text
4:3
```

or

```text
1:1
```

---

## Product Information

Display:

- Khmer name
- English name
- Description
- Category
- Ingredients
- Availability

---

## Pricing

Example:

```text
Small
$2.00
8,000៛

Medium
$2.50
10,000៛

Large
$3.00
12,000៛
```

---

# 14. Drink Options

Because Version 1 does not support ordering, options are for information only.

Support:

## Size

```text
Small
Medium
Large
```

## Temperature

```text
Hot
Iced
```

## Sugar Level

```text
0%
25%
50%
75%
100%
```

## Ice Level

```text
No Ice
Less Ice
Normal Ice
Extra Ice
```

## Extras

Examples:

```text
Extra Espresso Shot
Extra Milk
Whipped Cream
Caramel
Pearl
Jelly
```

Optional additional price may be displayed.

Example:

```text
Extra Shot +$0.50 / +2,000៛
```

Do not implement Add to Cart.

---

# 15. Food Product Options

Food products should not be forced to use coffee-specific drink options.

Example food fields:

- Size
- Portion
- Spice level
- Extra egg
- Extra meat
- Ingredients

Options must be configurable per product.

---

# 16. Product Availability

Each product contains:

```json
"available": true
```

If false:

```json
"available": false
```

UI should display:

```text
Temporarily Unavailable
```

Khmer:

```text
អស់ជាបណ្តោះអាសន្ន
```

Unavailable products may remain visible but should appear slightly disabled.

Recommended behavior:

- Keep card visible
- Reduce image opacity slightly
- Show unavailable badge
- Disable unnecessary interaction if desired

---

# 17. Dual Currency

Support:

- USD
- KHR

Recommended data model:

```json
{
  "price_usd": 2.5,
  "price_khr": 10000
}
```

Do not use online currency conversion APIs.

Coffee shop pricing should remain manually controlled.

---

# 18. Language System

Support:

```text
ខ្មែរ
English
```

Language switch:

```text
ខ្មែរ | EN
```

Save selection using:

```javascript
localStorage
```

Example:

```javascript
localStorage.setItem("language", "km");
```

Default language:

```text
Khmer
```

unless configured otherwise.

---

# 19. Translation Data

Do not create completely separate JSON files for Khmer and English.

Prefer bilingual fields.

Example:

```json
{
  "name_en": "Iced Latte",
  "name_km": "ឡាតេទឹកកក",
  "description_en": "Espresso mixed with fresh milk and ice.",
  "description_km": "កាហ្វេ Espresso លាយជាមួយទឹកដោះគោស្រស់ និងទឹកកក។"
}
```

---

# 20. Table QR System

Each table gets its own QR URL.

Example:

```text
Table 01
https://username.github.io/coffee-menu/?table=01
```

```text
Table 02
https://username.github.io/coffee-menu/?table=02
```

```text
Table 05
https://username.github.io/coffee-menu/?table=05
```

React should extract:

```text
table=05
```

and display:

```text
Table 05
```

Because there is no ordering system, the table number is only informational in Version 1.

It prepares the app for Version 2 ordering.

---

# 21. Invalid Table Handling

If user manually enters:

```text
?table=999
```

validate against the table list in JSON.

If invalid:

Display:

```text
Welcome to Coffee House
```

without table information.

Do not display application errors.

---

# 22. Recommended JSON Structure

File:

```text
/public/data/db.json
```

Structure:

```json
{
  "settings": {},
  "tables": [],
  "categories": [],
  "products": []
}
```

---

# 23. Settings Data Model

Example:

```json
{
  "settings": {
    "shop_name_en": "Brown Bean Coffee",
    "shop_name_km": "ប្រោនប៊ីន កាហ្វេ",
    "logo": "/images/logo.png",
    "phone": "012345678",
    "address_en": "Siem Reap, Cambodia",
    "address_km": "សៀមរាប កម្ពុជា",
    "currency_usd": true,
    "currency_khr": true,
    "default_language": "km",
    "show_unavailable_products": true,
    "facebook": "",
    "telegram": ""
  }
}
```

---

# 24. Table Data Model

```json
{
  "id": 5,
  "number": "05",
  "name": "Table 05",
  "active": true
}
```

---

# 25. Product Data Model

Example:

```json
{
  "id": 1,
  "slug": "iced-caramel-latte",
  "category_id": 1,

  "name_en": "Iced Caramel Latte",
  "name_km": "ការ៉ាមែលឡាតេទឹកកក",

  "description_en": "Smooth espresso with fresh milk and caramel.",
  "description_km": "កាហ្វេ Espresso លាយជាមួយទឹកដោះគោស្រស់ និងការ៉ាមែល។",

  "image": "/images/products/coffee/iced-caramel-latte.webp",

  "ingredients_en": [
    "Espresso",
    "Fresh Milk",
    "Caramel",
    "Ice"
  ],

  "ingredients_km": [
    "កាហ្វេ Espresso",
    "ទឹកដោះគោស្រស់",
    "ការ៉ាមែល",
    "ទឹកកក"
  ],

  "sizes": [
    {
      "name": "S",
      "price_usd": 2.0,
      "price_khr": 8000
    },
    {
      "name": "M",
      "price_usd": 2.5,
      "price_khr": 10000
    },
    {
      "name": "L",
      "price_usd": 3.0,
      "price_khr": 12000
    }
  ],

  "temperature": [
    "hot",
    "iced"
  ],

  "sugar_levels": [
    0,
    25,
    50,
    75,
    100
  ],

  "ice_levels": [
    "none",
    "less",
    "normal",
    "extra"
  ],

  "extras": [
    {
      "name_en": "Extra Shot",
      "name_km": "ថែម Espresso",
      "price_usd": 0.5,
      "price_khr": 2000
    }
  ],

  "available": true,

  "best_seller": true,

  "recommended": true,

  "featured": false,

  "sort_order": 1
}
```

---

# 26. Category Data Model

```json
{
  "id": 1,
  "slug": "coffee",
  "name_en": "Coffee",
  "name_km": "កាហ្វេ",
  "description_en": "Freshly brewed coffee",
  "description_km": "កាហ្វេឆុងថ្មីៗ",
  "image": "/images/categories/coffee.webp",
  "icon": "coffee",
  "active": true,
  "sort_order": 1
}
```

---

# 27. Application Routes

Recommended:

```text
/
```

Home page.

```text
/menu
```

All products.

```text
/menu/:slug
```

Product details.

```text
/category/:slug
```

Products by category.

```text
/search
```

Optional search results page.

```text
/about
```

Coffee shop information.

---

# 28. Recommended Folder Structure

```text
coffee-menu/
│
├── public/
│   │
│   ├── data/
│   │   └── db.json
│   │
│   ├── images/
│   │   ├── logo/
│   │   ├── banners/
│   │   ├── categories/
│   │   └── products/
│   │       ├── coffee/
│   │       ├── drinks/
│   │       ├── tea/
│   │       ├── food/
│   │       ├── rice/
│   │       └── noodles/
│   │
│   └── favicon.ico
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   │
│   │   ├── menu/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── AvailabilityBadge.tsx
│   │   │   └── ProductBadge.tsx
│   │   │
│   │   └── layout/
│   │       └── MainLayout.tsx
│   │
│   ├── features/
│   │   ├── home/
│   │   ├── menu/
│   │   ├── product/
│   │   ├── categories/
│   │   ├── search/
│   │   ├── language/
│   │   └── table/
│   │
│   ├── hooks/
│   │   ├── useMenu.ts
│   │   ├── useLanguage.ts
│   │   └── useTable.ts
│   │
│   ├── models/
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── table.ts
│   │   └── settings.ts
│   │
│   ├── services/
│   │   └── menuService.ts
│   │
│   ├── store/
│   │
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── translation.ts
│   │   ├── search.ts
│   │   └── url.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── variables.css
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# 29. Service Layer Requirement

React components must not directly depend on json-server.

Create:

```text
menuService
```

Example:

```javascript
export async function getMenuData() {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/db.json`
  );

  if (!response.ok) {
    throw new Error("Unable to load menu data");
  }

  return response.json();
}
```

Components use:

```text
menuService
```

instead of accessing JSON directly.

This makes future migration easier.

Version 1:

```text
React
  ↓
menuService
  ↓
db.json
```

Future:

```text
React
  ↓
menuService
  ↓
Laravel REST API
```

---

# 30. UI Design Direction

The interface should feel like a modern premium coffee shop.

Avoid:

- Traditional admin dashboard appearance
- Excessive borders
- Strong blue corporate UI
- Dense layout
- Old Bootstrap appearance
- Too many buttons
- Too many colors

Use:

- Warm backgrounds
- Coffee brown
- Cream
- Beige
- Espresso tones
- Soft shadows
- Large food photography
- Rounded cards
- Modern typography
- Comfortable spacing

---

# 31. Suggested Color Palette

## Primary

Dark Espresso:

```text
#3B2416
```

## Secondary

Coffee Brown:

```text
#6F4E37
```

## Accent

Caramel:

```text
#C68B59
```

## Background

Warm Cream:

```text
#FAF7F2
```

## Surface

```text
#FFFFFF
```

## Secondary Surface

```text
#F2E9DF
```

## Text Primary

```text
#251A14
```

## Text Secondary

```text
#74675F
```

## Success / Available

```text
#387A45
```

## Unavailable

```text
#B34A3C
```

These values may be adjusted to match the client's logo.

---

# 32. Typography

Khmer font recommendations:

```text
Noto Sans Khmer
```

or

```text
Battambang
```

English:

```text
Inter
```

or

```text
Poppins
```

Recommended combination:

```text
English: Inter
Khmer: Noto Sans Khmer
```

Use Google Fonts where appropriate.

---

# 33. Card Design

Product cards should use:

```text
Border Radius: 16px–24px
```

Use soft shadow.

Example:

```text
0 8px 30px rgba(0,0,0,0.06)
```

Images should have:

```text
object-fit: cover
```

Avoid distorted food/drink images.

---

# 34. Mobile-First Design

Primary usage:

```text
Customer Phone
```

Design from approximately:

```text
360px
```

upward.

Recommended responsive ranges:

```text
Mobile
< 640px

Tablet
640px – 1024px

Desktop
> 1024px
```

---

# 35. Mobile Layout

Example:

```text
┌────────────────────────┐
│ ☕ Coffee House   ខ្មែរ │
│ Table 05               │
├────────────────────────┤
│                        │
│ Fresh Coffee           │
│ Better Moments         │
│                        │
├────────────────────────┤
│ 🔍 Search menu...      │
├────────────────────────┤
│ Coffee Drinks Food →   │
├────────────────────────┤
│ 🔥 Best Sellers        │
│                        │
│ [Product] [Product] →  │
├────────────────────────┤
│ ⭐ Recommended         │
│                        │
│ [ Product Card ]       │
│ [ Product Card ]       │
│                        │
└────────────────────────┘
```

---

# 36. Desktop Layout

Desktop should use a maximum content width.

Recommended:

```text
1200px–1440px
```

Example:

```text
┌────────────────────────────────────────────┐
│ Logo       Categories      Search   EN/KH │
├────────────────────────────────────────────┤
│                                            │
│             Hero Banner                    │
│                                            │
├────────────────────────────────────────────┤
│ Categories                                 │
│                                            │
│ Coffee | Tea | Drinks | Rice | Noodles    │
├────────────────────────────────────────────┤
│ Best Sellers                               │
│                                            │
│ [Card] [Card] [Card] [Card]               │
│                                            │
├────────────────────────────────────────────┤
│ Recommended                                │
│                                            │
│ [Card] [Card] [Card] [Card]               │
└────────────────────────────────────────────┘
```

---

# 37. Navigation

Mobile can use:

- Sticky top header

Optional bottom navigation:

```text
Home
Menu
Search
About
```

However, for a simple menu application, avoid unnecessary navigation complexity.

Preferred:

```text
Header
+
Scrollable Home
+
Category navigation
```

---

# 38. Product Images

Use optimized formats:

```text
WebP
```

Preferred.

Fallback:

```text
JPEG
PNG
```

Recommended image size:

```text
800 × 800
```

or:

```text
1200 × 900
```

Compress images before committing to GitHub.

Avoid multi-megabyte menu images.

---

# 39. Image Fallback

If a product image does not exist:

Display:

```text
/default-product.webp
```

Never show broken image icons.

---

# 40. Empty State

If category has no products:

Display:

```text
No menu items available in this category.
```

Khmer:

```text
មិនទាន់មានមុខម្ហូបនៅក្នុងប្រភេទនេះទេ។
```

---

# 41. Error Handling

If `db.json` fails to load:

Display friendly message.

Example:

```text
Unable to load the menu.
Please refresh the page.
```

Do not display raw JavaScript errors.

---

# 42. Loading State

Use product skeleton cards rather than only displaying:

```text
Loading...
```

Example:

```text
[████████]
[████ ███]
[████████]

[████████]
[████ ███]
```

This creates a more professional experience.

---

# 43. Search Behavior

Search should:

1. Trim whitespace
2. Convert English search to lowercase
3. Match Khmer directly
4. Search product name
5. Search description
6. Search ingredients

Example:

```text
latte
```

results:

```text
Iced Latte
Caramel Latte
Vanilla Latte
Matcha Latte
```

---

# 44. Product Sorting

Support:

```text
sort_order
```

Example:

```json
"sort_order": 1
```

Do not rely on JSON insertion order.

---

# 45. Recommended Product Logic

Best sellers:

```javascript
products.filter(product => product.best_seller)
```

Recommended:

```javascript
products.filter(product => product.recommended)
```

Available:

```javascript
products.filter(product => product.available)
```

---

# 46. LocalStorage

Use LocalStorage only for non-sensitive preferences.

Store:

```text
language
last_selected_category
```

Potentially:

```text
table_number
```

But URL table number should remain the main source.

Do not store sensitive data.

---

# 47. Accessibility

Ensure:

- Images have alt text
- Buttons have labels
- Text has sufficient contrast
- Font size remains readable
- Touch targets are large enough
- Keyboard navigation works on desktop
- Don't use color alone to communicate availability

Recommended mobile touch target:

```text
44px minimum
```

---

# 48. Performance Requirements

The first page should load quickly on mobile internet.

Optimize:

- Images
- JavaScript bundles
- Lazy loading
- Product image loading
- Fonts

Use:

```html
loading="lazy"
```

for non-critical images.

Hero image may load eagerly.

---

# 49. Progressive Loading

Prioritize:

1. Header
2. Hero
3. Categories
4. Best sellers
5. Menu items
6. Footer

Lazy load lower-page images.

---

# 50. SEO

Because the project is public on GitHub Pages, include:

```text
<title>
<meta name="description">
<meta property="og:title">
<meta property="og:description">
<meta property="og:image">
```

Example:

```text
Brown Bean Coffee | Digital Menu
```

---

# 51. PWA — Optional Enhancement

The application can later be converted into a Progressive Web App.

Potential benefits:

- Add to Home Screen
- Faster repeat loading
- Basic offline menu cache

This is optional for Version 1.

---

# 52. GitHub Pages Configuration

For Vite, configure:

```javascript
export default defineConfig({
  base: '/coffee-menu/'
});
```

The value must match the GitHub repository name.

Example repo:

```text
coffee-menu
```

Then:

```javascript
base: '/coffee-menu/'
```

---

# 53. Asset Path Requirement

Do not assume the application runs at `/`.

Use:

```javascript
import.meta.env.BASE_URL
```

when necessary.

This prevents broken assets on GitHub Pages.

---

# 54. Git Deployment Workflow

Initial:

```bash
git init
git add .
git commit -m "Initial coffee menu"
git branch -M main
git remote add origin <repository>
git push -u origin main
```

Subsequent updates:

```bash
git add .
git commit -m "Update coffee menu"
git push
```

GitHub Actions can automatically deploy the Vite build.

---

# 55. Owner Update Workflow

Example: owner wants to change:

```text
Iced Latte
$2.50 → $2.75
```

Steps:

```text
1. Open project
2. Open db.json
3. Find product
4. Change price
5. Save
6. Run local preview
7. Confirm menu
8. git add .
9. git commit
10. git push
11. GitHub Pages redeploys
```

No React source code should need modification for normal menu changes.

---

# 56. Adding a New Product

Owner/developer should:

```text
1. Add product image
2. Add JSON object
3. Set category_id
4. Enter Khmer name
5. Enter English name
6. Enter description
7. Enter price
8. Enter size/options
9. Set availability
10. Set best_seller/recommended flags
11. Test locally
12. Push
```

---

# 57. Product IDs

Use stable IDs.

Do not change existing IDs unnecessarily.

Example:

```json
"id": 105
```

Also use unique slugs:

```json
"slug": "iced-caramel-latte"
```

---

# 58. Validation During Development

Before deployment validate:

- Duplicate IDs
- Duplicate slugs
- Missing category
- Missing name
- Invalid image
- Invalid price
- Missing translations

Consider adding a small validation script later.

---

# 59. Suggested Home Screen Component Structure

```text
HomePage
│
├── Header
├── HeroBanner
├── SearchBar
├── CategoryScroller
├── BestSellerSection
│   └── ProductCard
├── RecommendedSection
│   └── ProductCard
├── MenuSection
│   └── ProductGrid
└── Footer
```

---

# 60. Product Detail Structure

```text
ProductDetailPage
│
├── BackButton
├── ProductImage
├── ProductBadges
├── ProductName
├── Description
├── PriceSection
├── SizeSection
├── TemperatureSection
├── SugarSection
├── IceSection
├── ExtrasSection
├── IngredientsSection
└── RelatedProducts
```

---

# 61. Related Products

At the bottom of Product Detail:

```text
You May Also Like
```

Display products from the same category.

Example:

```javascript
product.category_id === currentProduct.category_id
```

Exclude current product.

---

# 62. Footer

Display:

- Shop name
- Address
- Phone
- Facebook
- Telegram
- Opening hours

Example:

```text
Brown Bean Coffee

Siem Reap, Cambodia

Open Daily
7:00 AM – 9:00 PM

Facebook | Telegram
```

---

# 63. Modern UI Interaction

Use subtle animations.

Examples:

- Card hover
- Button feedback
- Smooth category scroll
- Fade-in product images
- Modal/page transitions
- Badge animation kept minimal

Animation duration:

```text
150ms–300ms
```

Avoid excessive motion.

---

# 64. UI States

Every data component should support:

```text
Loading
Success
Empty
Error
Unavailable
```

---

# 65. Code Quality Requirements

Follow:

- Component reusability
- DRY
- KISS
- Clear naming
- Feature-based structure
- No unnecessary dependencies
- No giant components
- Separate UI and data logic
- Type-safe models if TypeScript is used

Recommended component size:

Keep components focused on one responsibility.

---

# 66. Recommended TypeScript Interfaces

Example:

```typescript
interface Product {
  id: number;
  slug: string;
  categoryId: number;
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  image: string;
  available: boolean;
  bestSeller: boolean;
  recommended: boolean;
  sizes: ProductSize[];
}
```

---

# 67. Future Backend Migration

Version 1:

```text
React
 ↓
Static JSON
```

Future Version 2:

```text
React
 ↓
Laravel REST API
 ↓
MySQL
```

Because data access is isolated in:

```text
services/menuService
```

migration should mainly require changing the service layer.

For example:

Current:

```javascript
fetch('/data/db.json')
```

Future:

```javascript
fetch('https://api.coffeeshop.com/api/products')
```

UI components should remain mostly unchanged.

---

# 68. Potential Version 2 Features

Future system may add:

- Cart
- Customer ordering
- Table-based ordering
- Kitchen/barista order queue
- Admin dashboard
- Laravel API
- MySQL
- Product management
- Category management
- Real-time availability
- Payment
- KHQR
- Sales reporting
- Inventory
- Receipt printing

These must not be implemented in Version 1 unless client requirements change.

---

# 69. Development Phases

## Phase 1 — Project Setup

- Create React + Vite project
- Configure TypeScript
- Install React Router
- Configure styles
- Configure Git
- Configure GitHub Pages base path

## Phase 2 — Data Design

Create:

```text
settings
tables
categories
products
```

Populate sample JSON.

## Phase 3 — Core UI

Build:

- Header
- Hero
- Search
- Category list
- Product cards
- Footer

## Phase 4 — Menu Features

Build:

- Category filtering
- Search
- Best sellers
- Recommended products
- Availability

## Phase 5 — Product Detail

Build:

- Product detail
- Sizes
- Prices
- Ingredients
- Drink options
- Related products

## Phase 6 — QR/Table System

Implement:

```text
?table=XX
```

validation and display.

## Phase 7 — Language

Implement:

```text
KM / EN
```

and LocalStorage.

## Phase 8 — Responsive UI

Optimize:

- Phone
- Tablet
- Desktop

## Phase 9 — Performance

Optimize:

- Images
- Lazy loading
- Bundles
- Fonts

## Phase 10 — Deployment

- Push GitHub
- Configure GitHub Actions
- Deploy GitHub Pages
- Test table QR codes

---

# 70. Testing Checklist

Before delivery verify:

- [ ] Application loads on GitHub Pages
- [ ] No broken asset paths
- [ ] QR links load correct table
- [ ] Invalid table handled gracefully
- [ ] Khmer works
- [ ] English works
- [ ] Language preference persists
- [ ] Categories load
- [ ] Category filtering works
- [ ] Search works
- [ ] Best seller works
- [ ] Recommended products work
- [ ] Product detail works
- [ ] USD displays correctly
- [ ] KHR displays correctly
- [ ] Sizes display correctly
- [ ] Drink options display correctly
- [ ] Ingredients display correctly
- [ ] Unavailable state works
- [ ] Images have fallback
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] No console errors
- [ ] Refreshing a route does not break deployment
- [ ] JSON updates appear after deployment

---

# 71. Definition of Done

Version 1 is complete when:

1. Customer can scan a table QR code.
2. GitHub Pages opens successfully.
3. Correct table number is displayed.
4. Customer can browse all active categories.
5. Customer can browse products.
6. Customer can search menu items.
7. Customer can see best sellers.
8. Customer can see recommended products.
9. Customer can open a product detail.
10. Customer can view Khmer or English.
11. Customer can see USD and KHR prices.
12. Customer can see sizes and drink options.
13. Customer can see ingredients.
14. Customer can see availability.
15. UI is responsive on phone, tablet, and desktop.
16. Owner/developer can update `db.json` locally.
17. Updated data appears after Git push and GitHub Pages deployment.
18. No backend server is required.

---

# 72. Final Architecture

```text
                         CUSTOMER

                   Scan Table QR Code
                           │
                           ▼
              GitHub Pages Public URL
                           │
                           ▼
                  React + Vite App
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       Application UI             URL Parameters
                                        │
                                        ▼
                                   Table Number
              │
              ▼
          Menu Service
              │
              ▼
      /public/data/db.json
              │
     ┌────────┼─────────┬──────────┐
     ▼        ▼         ▼          ▼
 Settings  Tables   Categories   Products
                                  │
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
                   Coffee       Drinks        Food
                                             │
                                  ┌──────────┼──────────┐
                                  ▼          ▼          ▼
                                Rice      Noodles      Lunch
```

---

# 73. Project Principle

The most important architectural principle for this project is:

```text
UI must not know where menu data comes from.
```

Use:

```text
React Component
      ↓
Service Layer
      ↓
Data Source
```

Today:

```text
Service Layer
      ↓
db.json
```

Future:

```text
Service Layer
      ↓
Laravel REST API
      ↓
MySQL
```

This keeps Version 1 simple while making Version 2 much easier to build.

---

# 74. Final Version 1 Stack

```text
Frontend:
React + Vite + TypeScript

UI:
Modern responsive coffee-shop design

State:
React Context / lightweight local state

Routing:
React Router

Icons:
Lucide React

Languages:
Khmer + English

Data:
Static JSON

Development Data Server:
json-server

Production:
GitHub Pages

Deployment:
GitHub Actions

Devices:
Mobile + Tablet + Desktop

Primary Access:
QR Code per table

Backend:
None

Database:
None
```

This specification should be treated as the **source of truth for Version 1 development** of the Coffee Menu Web App.
