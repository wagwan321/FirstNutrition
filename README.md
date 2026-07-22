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

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
```

## Structure
- `src/pages/` — Home, Shop, ProductDetail, Checkout, Branches, About
- `src/components/` — Navbar, Footer, CartDrawer, ProductCard, ProteinTub (SVG), Loader
- `src/data/catalog.js` — products, brands, branches, and product-image mapping
- `public/images/` — site & product photography

## Roadmap
- Backend (Node + SQLite) for real order capture + an admin dashboard to manage
  products/prices/stock and view orders.
