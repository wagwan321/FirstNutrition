# First Nutrition — E-Commerce Site

A custom storefront for **First Nutrition**, official distributor of the world's leading
sports-nutrition brands. Built with **React + Vite**. Clean red & white retail design,
the store's real catalog (69 products with variants), Jordan / Lebanon country switch,
English / Arabic (right-to-left), and WhatsApp cash-on-delivery ordering.

> ⚠️ Before launch, the owners need to confirm (all marked `TODO(owner)` in `src/config.js`):
> - the **WhatsApp business numbers** for Jordan and Lebanon (currently a test number);
> - **Lebanon prices** — estimated from Jordan JOD prices × `rate` (1.41);
> - the exact addresses / hours of the Sweifieh and Rabieh branches, and the Lebanon branches;
> - the **ISO 22000 badge**: the store's own TÜV artwork for its food-safety claim reads "ISO 26000:2010", so it is hidden until the correct certificate artwork is supplied (`src/pages/About.jsx`).

## Tech
- React 18 + React Router · Vite
- Cart via Context + localStorage (stores product + variant ids; prices always come from the catalog)
- `src/i18n.jsx` — country (currency, branches, WhatsApp) + language; `t('English text')`
  returns the Arabic from `src/i18n-ar.js` when Arabic is on
- Icons: `lucide-react` (+ WhatsApp/Instagram/Facebook glyphs in `BrandIcons.jsx`)
- Fonts: Saira Stencil (variable width, display) + Cairo (text and Arabic), self-hosted in `public/fonts`
- Design: built with the Impeccable skill. Product facts in `PRODUCT.md`, visual system in `DESIGN.md`,
  homepage direction contract in `.impeccable/surfaces/`

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
```

## Structure
- `src/pages/` — Home, Shop, ProductDetail, Checkout, Brands, Branches, About
- `src/components/`
  - `Navbar.jsx` (+ `HeaderSearch.jsx`), `Footer.jsx`, `CartDrawer.jsx`, `ProductCard.jsx`
  - `HeroStage.jsx` — hero product photos; `Teardown.jsx` + `ProteinTub.jsx` — the pinned,
    scroll-driven exploded view of a tub (lid, scoop, powder, nutrition callouts)
  - `Reveal.jsx`, `ScrollScene.jsx`, `SectionHead.jsx`, `KineticBand.jsx` — scroll animations
  - `GoalFinder.jsx`, `BrandMarquee.jsx`, `FloatingWidgets.jsx`
- `src/config.js` — per-country WhatsApp numbers, delivery areas, branches, price rate
- `src/data/products.json`, `brands.json`, `reels.json` — generated catalog (see below)
- `public/images/fn/` — the store's product photos, brand logos, category icons, logo and TÜV badges

Shop filters live in the URL (`/shop/protein?brand=Rule1&goal=muscle&q=whey&sort=price-low`),
so any filtered view can be shared or linked to.

## Refreshing the catalog
The catalog was pulled (with the owners' approval) from the store's current site.
To refresh names, prices, variants, descriptions and images:
```bash
node scripts/catalog/scrape.mjs . scripts/catalog/.data
node scripts/catalog/bundle-prices.mjs scripts/catalog/.data
node scripts/catalog/build-catalog.mjs scripts/catalog/.data .
```
Add or remove products in `scripts/catalog/index.json` (`[id, name, label]`).

## Roadmap
- Connect directly to the store's Odoo ERP for live stock and prices.
- Online card payment + customer accounts.
