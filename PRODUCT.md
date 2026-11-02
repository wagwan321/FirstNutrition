# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone in Jordan or Lebanon who trains: people bulking or cutting, gym regulars, and people who play sport. They visit on phones, tablets and desktops. Some already know the exact tub and flavour they want. Others arrive with a goal (gain, lose, perform) and need help choosing. Their job is to find the right product, see its real price in their own currency, and place the order without friction.

A second audience matters for this build: the First Nutrition owners. They will compare this site with a rival agency's build at new-website.firstnutrition.com and pick one.

## Product Purpose

This is the online storefront for First Nutrition, an official sports-supplement distributor. Head office is in Amman (Al Abdali, Al Fareed Complex) and there are branches in Lebanon. Visitors can:

- browse by goal, category or brand;
- compare real prices and size/flavour variants;
- build a cart and send the complete order on WhatsApp, paying cash on delivery.

Success has two parts. A visitor gets from landing to a sent WhatsApp order quickly and confidently on any device. The owners choose this site over the competitor's.

## Positioning

First Nutrition's edge is a combination a gym-counter shop or a grey importer cannot claim truthfully:

- **Authentic stock.** It is an official distributor, certified to ISO 9001, ISO 22000 and ISO 45001.
- **Range.** It carries 21 brands and 69 products in one store, with real prices and variants.
- **Reach.** It has physical branches, and cash-on-delivery covers the whole country.
- **Advice.** Expert staff help visitors choose a product or stack, in store or on WhatsApp.

## Operating Context

- **Checkout is WhatsApp.** The cart composes a full order message (items, variants, quantities, totals, customer details, area) and opens wa.me. There is no payment gateway; payment is cash on delivery only.
- **Two countries.** Jordan is the default and uses real prices in JOD. Lebanon uses USD; for now its prices are estimated as JOD × 1.41.
- **Per-country content.** Each country has its own WhatsApp number, delivery areas and branches.
- **Two languages.** The site is in English and Arabic, with a full right-to-left layout in Arabic.
- **Traffic is mostly mobile.** Visitors usually come from Instagram (which has reels) and from search.

## Capabilities and Constraints

- **Stack.** The site is a React 18 + Vite 5 + react-router 6 single-page app, deployed on Vercel. A hook auto-commits and pushes to GitHub `main` every turn.
- **No backend.** The cart is stored in localStorage (`fn_cart_v2`).
- **Catalog.** `src/data/products.json`, `brands.json` and `reels.json` were scraped with the owners' approval from the store's own Odoo site. The scripts are in `scripts/catalog/`. Variants carry their own prices. Bundle prices are the ERP price ÷ 1.16, because the ERP adds 16% tax.
- **Routes.** Home, Shop (URL filters: query, brand, category/tag, goal, price range, sort), product detail (`/product/:id/:slug`), Brands, Branches (country tabs), About, Checkout, and 404.
- **Features the user asked for:**
  - a product "teardown" animation, a clean isometric exploded view of a tub with callouts (the reference is an Instagram reel);
  - a brand-logo marquee;
  - varied, direction-based scroll animations, with things coming from left and right rather than uniform fades.
- **Undecided or owner-supplied (do not invent):**
  - the real WhatsApp numbers for Jordan and Lebanon (a test number is in place);
  - real Lebanon prices;
  - the exact addresses, phones and hours of the Sweifieh and Rabieh branches (unconfirmed);
  - opening hours for the Jordan branches;
  - the Jordan Instagram account.

## Brand Commitments

- **Name:** First Nutrition.
- **Logo:** the official logo is in `public/images/fn/site/logo.svg`, with a light version in `logo-light.svg`. The logo red is `#ED312E`.
- **Colours:** the user made the colourway binding. It is red and white, not a full-black theme.
- **Icons:** no emoji anywhere in the UI. Use real icons and brand logos.

## Evidence on Hand

- Product photos for the whole catalog, on white backgrounds: `public/images/fn/products/{id}.webp`.
- 21 brand logos (`public/images/fn/brands/`) and category icons (`public/images/fn/categories/`).
- ISO certification badges: `public/images/fn/site/tuv-iso-*.svg`.
- A payment-methods strip: `public/images/fn/site/payment-methods.png`.
- Four Instagram reel links with Arabic titles, listed in `src/data/reels.json`. There are no cover images.
- Branch addresses for the Jordan head office and four Lebanon branches. The Lebanon details are listed but not yet confirmed by the owners.
- Some generic Unsplash lifestyle photos. These are stock, not the store's own.
- **Absent:** customer reviews, testimonials, ratings, athlete or coach partners, store or team photos, and sales or customer counts. None of these may be fabricated or implied.

## Product Principles

1. **Authenticity is the product.** Every claim must be traceable: official distributor, ISO certificates, real brands, real prices.
2. **Order in a minute, on any screen.** Nothing should stand between choosing a variant and sending the WhatsApp order.
3. **Fast lane and guided lane.** People who know what they want go straight to the product. Newcomers choose by goal and are never made to feel lost.
4. **Two countries, two languages, one store.** Currency, branches and Arabic RTL are first-class, not afterthoughts.
5. **Show only what is real.** Proof comes from the catalog, the brands, the certificates and the branches, never from invented numbers or people.

## Accessibility & Inclusion

- The site is fully bilingual in English and Arabic, with a mirrored right-to-left layout, so it uses logical CSS properties throughout.
- It must work equally well on phone, tablet and desktop.
- It respects `prefers-reduced-motion`.
