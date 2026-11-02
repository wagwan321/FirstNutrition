---
name: First Nutrition
description: The official supplement store for Jordan and Lebanon, set on a competition lifting platform.
colors:
  competition-red: "#E02D2A"
  competition-red-pressed: "#C42320"
  logo-red: "#ED312E"
  plate-red: "#C9221E"
  red-on-chalk: "#B51E1B"
  chalk-wall: "#ECEBEA"
  shelf-white: "#FFFFFF"
  ticket-paper: "#EFE6DA"
  rubber-floor: "#6F7279"
  rubber-black: "#1C1D20"
  rubber-rim: "#2E3034"
  ink: "#1A1B1E"
  muted-on-wall: "#4E5056"
  steel: "#A7ACB2"
  whatsapp-green: "#25D366"
typography:
  display:
    fontFamily: "Saira Stencil, Cairo, system-ui, sans-serif"
    fontSize: "8.52cqw"
    fontWeight: 800
    lineHeight: 0.79
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 80"
  headline:
    fontFamily: "Saira Stencil, Cairo, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 88px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 80"
  title:
    fontFamily: "Saira Stencil, Cairo, system-ui, sans-serif"
    fontSize: "clamp(20px, 2.1vw, 32px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 82"
  plate-label:
    fontFamily: "Saira Stencil, Cairo, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 84"
  body:
    fontFamily: "Cairo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Cairo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
  arabic-display:
    fontFamily: "Cairo, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.2vw, 60px)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "0em"
rounded:
  stamp: "3px"
  plate: "6px"
  pill: "999px"
  disc: "50%"
spacing:
  gutter: "24px"
  grid-gap: "20px"
  section-sm: "48px"
  section: "96px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.competition-red}"
    textColor: "{colors.shelf-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "{colors.competition-red-pressed}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "#06331A"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-add:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.shelf-white}"
    rounded: "{rounded.pill}"
    height: "38px"
    padding: "0 14px 0 11px"
  button-add-hover:
    backgroundColor: "{colors.competition-red}"
  product-card:
    backgroundColor: "{colors.shelf-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "14px 16px 16px"
  goal-plate:
    backgroundColor: "{colors.rubber-black}"
    textColor: "{colors.shelf-white}"
    typography: "{typography.title}"
    rounded: "{rounded.disc}"
  goal-plate-loaded:
    backgroundColor: "{colors.plate-red}"
    textColor: "{colors.shelf-white}"
  category-plate:
    backgroundColor: "{colors.rubber-black}"
    textColor: "{colors.shelf-white}"
    rounded: "{rounded.disc}"
  price-ticket:
    backgroundColor: "{colors.ticket-paper}"
    textColor: "{colors.ink}"
    padding: "9px 16px 10px"
  badge:
    backgroundColor: "{colors.competition-red}"
    textColor: "{colors.shelf-white}"
    rounded: "{rounded.stamp}"
    padding: "4px 8px"
  competition-banner:
    backgroundColor: "{colors.competition-red}"
    textColor: "{colors.shelf-white}"
    typography: "{typography.plate-label}"
    padding: "13px 0"
  scoreboard:
    backgroundColor: "{colors.rubber-black}"
    textColor: "{colors.shelf-white}"
    rounded: "{rounded.plate}"
---

# Design System: First Nutrition

## Overview

**Creative North Star: "The Loaded Bar"**

The store is a competition lifting platform. The page is a chalk-white wall standing on a rubber floor, competition red appears at the scale of a whole plate, and the visitor's goal is the selection that loads the bar. Every surface is an object that belongs on that platform. Categories and goals are calibrated rubber plates. Prices are written on paper tickets. The stack total sits on the hub of a 25 kg plate. Bands of grey rubber floor carry the offers, and the footer is the floor the whole page stands on.

The colourway is red and white, never a full-black theme. Black rubber appears only at plate faces, rims, the scoreboard panel and the footer floor; the ground everywhere else is the textured chalk wall (`wall.webp` over chalk-wall) and white shelf faces. Display type is a worn condensed stencil, like paint sprayed through a plate stencil, and Cairo carries everything you actually read, in English and in Arabic.

Density is retail: four-up product grids, five-up plate grids, 96px section rhythm. The craft is in the materials. Rasters are photographic platform objects (knurled bar, sleeve, change plates, collar, tickets, floor chalk), each with a provenance sidecar. They are not illustrations.

**Key Characteristics:**
- Competition red (#E02D2A / #ED312E) used at plate scale, on chalk-white and white.
- Saira Stencil caps with an ink-wear mask for display. Arabic display is unmasked Cairo 900.
- Rubber plates for categories and goals; paper tickets for prices.
- One corner language for flat surfaces (6px). Pills only for actions.
- Bilingual EN/AR with full RTL through logical properties.
- The official logo SVG is binding and is never redrawn or recoloured.

## Colors

One loud red, two grounds (chalk wall and white shelf), and rubber and steel as the materials of the platform.

### Primary
- **Competition Red** (competition-red): the action and banner red. Primary buttons, the WhatsApp stack CTA, the ticker banner, the CTA band, red reel cards, badges, focus outlines, nav underline. White text on it passes AA.
- **Competition Red, Pressed** (competition-red-pressed): hover and pressed state of red actions.
- **Logo Red** (logo-red): the official logo's red. Decorative only, matched to `public/images/fn/site/logo.svg`; never used for text.
- **Plate Red** (plate-red): the face of a loaded or highlighted rubber plate (every third category plate, the loaded goal plate), with a darker rim ring (#A71C19) and a lighter lip (#DB2F2A).
- **Red on Chalk** (red-on-chalk): red text on the chalk wall or paper: arrow links, the "Official stock" stamp on tickets. Use it wherever red is text on a non-white ground.

### Neutral
- **Chalk Wall** (chalk-wall): the page ground, always under the `wall.webp` texture. The hero stage and every section below it sit on it.
- **Shelf White** (shelf-white): product card faces, header, teardown sheet, menus.
- **Ticket Paper** (ticket-paper): the warm paper of price tickets (rendered from the `ticket-*.webp` rasters; the hex is the fallback tone).
- **Rubber Floor** (rubber-floor): the grey lifting floor under `floor.webp`, used for the hero platform and the offers band.
- **Rubber Black** (rubber-black) and **Rubber Rim** (rubber-rim): plate faces and their inset rims, the scoreboard panel, the footer.
- **Ink** (ink): headings, ticket text, small text, the "Add" button. Never a page ground.
- **Muted on Wall** (muted-on-wall): section subtitles and secondary copy on the chalk wall.
- **Steel** (steel): the hub ring around a category mark; bar and collar tones come from photography.
- **WhatsApp Green** (whatsapp-green): only on WhatsApp buttons and the floating WhatsApp action.

### Named Rules
**The Plate Scale Rule.** Red appears as whole objects (a plate, a banner, a button, a card) rather than thin trim. A red that only outlines or tints something is in the wrong world.

**The Red and White Rule.** The colourway is red and white. Rubber black is a material, not a theme: it may fill a plate, the scoreboard or the footer floor, never a page ground or a full section of the page.

**The Text Red Rule.** Red text on chalk or paper uses red-on-chalk; competition red is for fills with white text.

## Typography

**Display Font:** Saira Stencil, variable weight and width, self-hosted (`/fonts/saira-stencil-*.woff2`), falling back to Cairo.
**Body Font:** Cairo, variable 200-1000, self-hosted with Latin, Latin-ext and Arabic subsets.

**Character:** a plate stencil sprayed onto a wall, compressed to 78-92% width and run at weight 800, over a sturdy, rounded grotesk that reads well in both scripts.

### Hierarchy
- **Display** (800, 8.52cqw on desktop / 15.4cqw on phones, 0.79 line height, 80% width): the hero headline only. It scales with the stage container.
- **Headline** (800, clamp(40px, 5.4vw, 88px), 0.9, 80% width, uppercase): section titles and page heads (page heads go to clamp(44px, 6vw, 96px)). Balanced wrapping.
- **Title** (800, clamp(20px, 2.1vw, 32px), 0.95, 82% width, uppercase): goal plate names, goal panel heads (30px), CTA band heading.
- **Plate Label** (800, 22px, 0.03em, 84-88% width, uppercase): the ticker banner, category plate names (clamp(14px, 1.3vw, 20px)), footer column heads (17px), badges (12.5px), plate rim lettering.
- **Body** (Cairo 400, 16px, 1.6): all running copy, with pretty wrapping; subtitles max 440px wide (600px when centred).
- **Label** (Cairo 700-800, 13-15px): buttons, nav links (clamp(14.5px, 1.08vw, 17px)), product names (15.5px, 800), prices (19px, 900).

### Named Rules
**The Ink-Wear Rule.** Latin stencil headings (hero headline, section titles, page heads) carry the `ink-wear.png` mask, tiled at 200px on sections and 19.05cqw in the hero. Smaller stencil (plate labels, badges, ticker) is unmasked.

**The Arabic Sets Plain Rule.** In Arabic every stencil role switches to Cairo (900 for display, 800 for labels), with no mask, no uppercase, no letter-spacing and an open line height (1.15-1.25). Saira Stencil never renders Arabic.

**The Heading Stands Alone Rule.** Section heads are the stencil title plus an optional subtitle and action. No kicker, eyebrow or small label sits above a heading.

## Layout

Content sits in a 1280px container with 24px inline gutters (safe-area aware). Sections breathe at 96px block padding; compact bands (trust panel, CTA) use 48px. Grids use a 20px gap: products four-up, category plates five-up with a gap of clamp(14px, 2.2vw, 32px), and below 1000px the category row keeps a 132px minimum per plate. Goal plates sit on one bar in a grid set by `--slots`; below 760px they become a horizontal scroller (minimum 150px) and the collar hides.

The hero is one fixed-proportion stage (2688 x 1376 on desktop, 390 x 740 below 900px) with every object positioned in percentages and all type in container units, so the composition scales as a single picture. The stage is `dir="ltr"` in both languages, because it is a physical scene, while its headline, trust line and labels are localised and set their own direction. Everything outside the stage mirrors in RTL through logical properties (`inset-inline`, `margin-inline-start`), and directional icons use the `flip-rtl` mirror.

The header is a single sticky white row 76px tall: logo, links, search, country, language and cart.

## Elevation & Depth

Depth is physical: objects cast soft, low, downward shadows onto the wall or floor, as if lit from above. There are no glows and no hard offset shadows. Raster objects use `drop-shadow` filters; boxes use a two-part shadow (a 1px contact line plus a long, soft fall). Plates are built from inset rings (face, dark rim, lighter lip) plus a heavy shadow underneath. Floor bands are recessed with an inset top shadow where they meet the wall.

### Shadow Vocabulary
- **Shelf** (`box-shadow: 0 1px 0 rgba(26,27,30,.05), 0 20px 34px -26px rgba(26,27,30,.5)`): product cards at rest; on hover the fall deepens to `0 28px 40px -24px rgba(26,27,30,.55)`.
- **Pinned sheet** (`box-shadow: 0 24px 40px -30px rgba(26,27,30,.55)`): the teardown panel; brand logo cards use the lighter `0 14px 24px -22px`.
- **Plate** (`box-shadow: inset 0 0 0 var(--rim) #111214, inset 0 0 0 calc(var(--rim) + 2px) #2E3034, 0 22px 28px -20px rgba(0,0,0,.6)`): rubber plates; red plates swap the rings to #A71C19 / #DB2F2A and tint the shadow red.
- **Floor recess** (`box-shadow: inset 0 22px 30px -22px rgba(0,0,0,.45)`): the top edge of a rubber floor band.
- **Red action** (`box-shadow: 0 8px 20px -8px rgba(224,45,42,.55)`): primary buttons only.
- **Header lift** (`box-shadow: 0 12px 26px -20px rgba(26,27,30,.45)`): the header once scrolled.

### Named Rules
**The Gravity Rule.** Every shadow falls down onto the surface below it. Nothing glows, and nothing casts a hard offset block.

## Shapes

There is one corner for flat surfaces: 6px, the chamfer of a plate's rim. It applies to product cards, the teardown sheet, logo cards, the scoreboard, reel cards and the CTA band. Small printed marks (badges, certificate frames) go tighter (3-4px). Plates are perfect discs. Pills (999px) are reserved for actions: buttons, the add button, the WhatsApp CTA, header search and filter chips. Tickets are torn-paper rasters set at a slight angle (-2.5° on cards, -2° to 1° in the hero), never CSS rectangles.

**The One Corner Rule.** Flat surfaces take 6px, actions take pills and plates are circles. Nothing else.

## Components

### Buttons
Heavy and direct, like a loading call.
- **Shape:** pill (999px).
- **Primary:** competition red with white Cairo 700 15px text, padded 13px 24px (16px 30px for large), with the red action shadow. Hover moves to the pressed red and the trailing arrow slides 3px (mirrored in RTL). Pressing scales to 0.98.
- **WhatsApp:** WhatsApp green with dark green text and the WhatsApp brand icon. The hero version ("Order this stack on WhatsApp") is a red pill with the WhatsApp icon and an arrow.
- **Add:** an ink pill 38px tall that turns competition red on hover.
- **Focus:** a 2px competition-red outline offset 2px; white or ink outlines on plates and inside the hero stage.

### Rubber Plates (categories and goals)
The system's signature component. A disc of rubber black with an inset dark rim and a lighter lip, white stencil label, small Cairo count or blurb. Category plates carry the category mark on a steel hub disc; every third plate is plate red. Goal plates are threaded on a photographic knurled bar. The loaded goal turns plate red, and a photographic collar slides along the bar (0.7s heavy ease) to lock against it. Hover turns the plate (-10° to -14°) on a heavy ease. Goal plates form a tablist and arrow keys move along the bar, mirrored in RTL.

### Product Card
A white shelf face with a 6px corner, the shelf shadow and no border. The product photo sits on white. Under it come the brand in small stencil caps (12.5px, 92% width, 0.08em tracking, grey), the name in Cairo 800 and the type. The price sits on a paper ticket (Cairo 900 19px, rotated -2.5°), and the Add or Options pill sits beside it. Badges are small red stencil stamps (3px corner).

### Price Ticket
A torn paper ticket raster carrying brand, name, size and price (Cairo 900), plus an "Official stock" stamp drawn in red-on-chalk with a rotated outline. In the hero the tickets lean against the tubs and rise 4% on hover.

### Competition Banner (ticker)
A full-bleed competition-red band with white stencil caps at 22px, separated by short white bars. It scrolls left to right in both languages (`direction: ltr`). Arabic uses Cairo 800 at 19px.

### Navigation
A white, sticky single row, 76px tall, with the official logo at 74% of the header height. Links are Cairo 700 in a slate ink, with a 3px red underline that scales in from nothing on hover and on the active page. The header search is a pill field that takes a red border and a soft red halo on focus. Below the breakpoint, a side drawer slides in from the inline start.

### Scoreboard and Floor Bands
The trust panel is a rubber-black panel (6px corner) with stencil numerals in a bright scoreboard red (#FF4A44). The offers band and the footer are rubber floor and rubber black; the footer's perks strip is competition red.

### Hero: The Loaded Bar
A bar sleeve, a stack of change plates naming the other goals, and a giant red 25 kg plate whose rim reads the loaded goal and whose hub reads the stack total. Under them the stack of tubs stands on the floor, each with its ticket. On arrival the bar slides on and the plate rolls in (heavy ease `cubic-bezier(.32, 0, .12, 1)`); switching goals spins the plate once while the tubs drop and rise. All motion is removed under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep the ground chalk-white wall or white shelf, and use competition red at plate scale (#E02D2A for fills, #B51E1B for red text on chalk or paper).
- **Do** render the official `logo.svg` / `logo-light.svg` exactly as supplied.
- **Do** set Latin display headings in Saira Stencil 800 at 78-92% width, uppercase, with the ink-wear mask on headline-size type.
- **Do** switch every stencil role to unmasked Cairo (900/800, no uppercase, no tracking) when the language is Arabic.
- **Do** make choices of category or goal into rubber plates, and put prices on paper tickets.
- **Do** use 6px corners on flat surfaces, pills only on actions, and discs for plates.
- **Do** use logical properties and `flip-rtl` icons so every surface outside the hero stage mirrors in Arabic; keep the hero stage `dir="ltr"` with localised text.
- **Do** give every shipped raster a provenance sidecar (`*.webp.json` pointing to its master in `assets/plates/`).

### Don't:
- **Don't** make any page or section ground full black; rubber black is for plates, the scoreboard and the footer floor.
- **Don't** put a kicker, eyebrow or small label above a section heading.
- **Don't** use emoji anywhere; use lucide-react icons and the brand icons in `BrandIcons.jsx`.
- **Don't** set Arabic in Saira Stencil, or mask Arabic headings.
- **Don't** use 12-28px rounded cards or pill-shaped containers; that is the retired generic-store look.
- **Don't** use glows, hard offset shadows or glossy overlays; shadows fall downward and soft.
- **Don't** use logo red (#ED312E) for text.
