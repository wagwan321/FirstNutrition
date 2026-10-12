# First Nutrition Lebanon — E-Commerce Site

A custom storefront for **First Nutrition**, Lebanon's leading sports-nutrition retailer.
Built with **React + Vite**. Dark black/red athletic theme, full product catalog,
cart, and cash/card-on-delivery checkout flow.

> ⚠️ Demo notes: product **prices are placeholders (USD)** and the product **photos are
> generic free-to-use stock images**, not the exact branded products. Delivery fees and
> the checkout flow are sensible defaults and should be confirmed with the store. See
> `AI-IMAGE-PROMPTS.md` for how to swap in custom images.

## Tech
- React 18 + React Router
- Vite
- Cart state via Context + localStorage (no backend yet)
- Icons: `lucide-react` (+ WhatsApp/Instagram/Facebook glyphs in `BrandIcons.jsx`)
- Fonts: Archivo (condensed display) + Manrope (body), from Google Fonts

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
```

## Structure
- `src/pages/` — Home, Shop, ProductDetail, Checkout, Branches, About
- `src/components/` — Navbar (+ SearchOverlay), Footer, CartDrawer, ProductCard, Loader
  - `ProteinTub.jsx` — the realistic SVG tub; `HeroTub.jsx` — the hero display stage around it
  - `Reveal.jsx` / `CountUp.jsx` — scroll-reveal animations and animated counters
  - `BrandMarquee.jsx` / `BrandLogo.jsx` — scrolling brand logo strip
  - `GoalFinder.jsx`, `FloatingWidgets.jsx` — home goal finder, WhatsApp / back-to-top buttons
- `src/data/catalog.js` — products, brands, branches, product-image mapping, and
  `BRAND_LOGOS` (map a brand to a logo file in `public/images/brands/` to replace its wordmark)
- `public/images/` — site & product photography

Shop filters live in the URL (`/shop/protein?brand=BSN&sale=1&q=whey&sort=price-low`),
so any filtered view can be shared or linked to.

## Roadmap
- Backend (Node + SQLite) for real order capture + an admin dashboard to manage
  products/prices/stock and view orders.
