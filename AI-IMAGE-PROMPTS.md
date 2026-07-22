# First Nutrition — AI Image Prompt Pack

The site currently uses free-to-use stock photos in `public/images/`.
To replace any of them with a **custom AI-generated image**, generate the image
in your tool of choice (ChatGPT/DALL·E, Midjourney, Leonardo, etc.), then **save
it over the matching file** in `public/images/` using the **same filename**.
No code changes needed — the site picks it up automatically.

**Brand direction to keep consistent across every image:**
> Premium sports-nutrition brand. Cinematic, high-contrast, **black background with
> bold red (#E11722) accents**. Athletic, moody studio lighting. Dark, gritty, modern.
> Photorealistic. No text or logos in the image.

Add `--ar 16:9` (Midjourney) or "wide 16:9 aspect ratio" for the wide slots and
`--ar 4:5` / "portrait" for the tall ones, as noted.

---

## 1. `training.jpg` — Homepage "Fuel Every Rep" band  *(portrait / 4:5)*
> A muscular male athlete performing battle ropes in a dark industrial gym, dramatic
> side lighting, deep shadows, red rim light on one side, sweat and intensity, black
> background, cinematic photorealistic sports photography, high contrast. No text.

## 2. `protein.jpg` — About "Only The Real Thing" band  *(wide 16:9)*
> Extreme close-up of white whey protein powder with a matte-black scoop, dramatic
> studio lighting, a subtle red glow from the side, dark background, premium product
> photography, ultra-detailed, photorealistic. No text or labels.

## 3. `gym.jpg` — Homepage CTA banner background  *(wide 16:9, sits under a red overlay)*
> Low-angle shot of an athlete mid-deadlift with a loaded black barbell on a dark gym
> floor, moody low-key lighting, motion and power, black background, cinematic
> photorealistic, high contrast. Keep it dark — a red gradient will be layered on top.

## 4. `shake.jpg` — About page header background  *(wide 16:9, sits under a dark→red overlay)*
> A lean athlete lifting a barbell in a shadowy gym, dramatic single-source lighting
> from the right, deep blacks, faint red ambient glow, cinematic sports photography,
> photorealistic. Composition with empty darker space on the left for headline text.

## 5. `hero.jpg` — spare / lifestyle  *(wide 16:9)*  — currently unused, ready if you want it
> Interior of a premium modern gym, racks of black dumbbells in sharp foreground,
> blurred athlete training in the background, clean but moody lighting with red accent
> highlights, black-and-red color grade, photorealistic, high contrast. No text.

## 6. `athlete.jpg` — spare / lifestyle  *(wide 16:9)*  — currently unused
> A focused female athlete doing core training on a mat, backlit by a bright window,
> strong silhouette, warm-to-red color grade, energetic and aspirational, photorealistic
> fitness photography.

---

### Product photos  *(square 1:1)*
Every product now shows a **real photo** from `public/images/products/` — assigned by
category (`tub1/jar1/tubshaker/jar2` = proteins, `preworkout/powder` = pre-workout,
`capsules` = vitamins & burners, `bar2` = bars, etc.). To make them fully custom &
on-brand, generate images with the prompt below and **save over the same filenames**.
Because photos are shared across products in a category, replacing one file updates
several cards at once. (Category→file mapping lives in `src/data/catalog.js` → `CAT_IMG`.)

> A glossy black protein-supplement tub with a bold red lid and a clean red-and-white
> label, centered on a dark charcoal background, dramatic studio lighting with a red rim
> light, subtle powder particles in the air, premium commercial product render,
> photorealistic, ultra-detailed, square crop. No brand names or readable text.

For non-powder categories, swap the subject: "a matte-black supplement bottle of capsules"
(vitamins), "a dark chocolate protein bar unwrapped" (bars), "a black pre-workout tub with
red accents" (pre-workout) — same lighting/background direction each time for consistency.

---

**Image sizing tips:** export at ~1600px on the long edge, JPEG, quality ~80. Keep files
under ~500 KB each so pages stay fast.
