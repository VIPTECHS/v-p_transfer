# /deneyim — Cinematic Experience Page — Build Plan

> Goal: a Radian-style (https://www.rideradian.com/) cinematic, scroll-driven landing
> page for VIP Transfer, mounted at **`/deneyim`** as a **separate page**. The existing
> homepage (`/`) must stay exactly as-is. This doc is self-contained: another AI/dev can
> execute it end-to-end without further context.

---

## 0. Reference & feel

- Reference: rideradian.com — full-screen hero with a huge headline + scroll cue, then
  scroll-triggered sections (feature showcase, a **scroll-scrubbed video**, a fleet
  carousel `01/06`, story/parallax, stats, strong CTA), clean high-contrast, bold
  sans-serif, generous whitespace, smooth transitions.
- Our theme: **dark luxury**, gold accent `--gold: #d4af37`, deep blacks, cinematic.
- Copy language: Turkish primary, plus English + German (i18n, see §7).

---

## 1. Assets (already placed in the repo)

| Role | File in repo | Notes |
|------|--------------|-------|
| Scroll-scrub video (car approaches camera) | `public/videos/deneyim-scrub-raw.mp4` | **MUST be re-encoded**, see §8 → `deneyim-scrub.mp4` |
| Hero ambient loop (V-Class parked, night) | `public/videos/deneyim-hero-raw.mp4` | Loops muted; re-encode optional → `deneyim-hero.mp4` |
| CTA / closing still | `public/images/deneyim-cta.jpg` | Wide night shot: chauffeur + V-Class + jet + terminal |
| Extra luxury still (optional) | `public/images/luxury-hero.png` | Already in repo, reusable for parallax |
| Fleet vehicle images (optional carousel) | `public/images/fleet/*.jpg` | Existing exterior shots |

`*-raw.mp4` are AI-generated → almost certainly **sparse keyframes**. Scroll-scrub will
stutter / show black frames until re-encoded with dense keyframes (see §8).

---

## 2. Routing integration (exact changes)

Routing lives in `src/App.jsx` via `parseRoute(pathname)` (around line 40-58) and a series
of `if (route.type === ...)` render blocks.

1. In `parseRoute`, **before** the `getLandingPage` lookup, add:
   ```js
   if (clean === "/deneyim") return { type: "experience" };
   ```
2. Add a render block next to the other page types (mirror the `landing` block, ~line 115):
   ```jsx
   if (route.type === "experience") {
     return (
       <div id="top">
         <Header isHome={false} navigate={navigate} onBook={startBooking} />
         <ExperiencePage navigate={navigate} onBook={startBooking} />
         <Footer navigate={navigate} />
         <WhatsAppCTA />
       </div>
     );
   }
   ```
3. Import at top of `App.jsx`:
   ```js
   import ExperiencePage from "./components/experience/ExperiencePage";
   ```
4. Link to it from the header/nav or a homepage button if desired (optional):
   `navigate("/deneyim")`.
5. **SEO / prerender:** add `deneyim` to the prerender route list so it ships static HTML.
   Check `scripts/prerender.mjs` and `public/sitemap.xml`; add `/deneyim` to both.
   Give it its own `<title>`/meta (reuse the `HomeSeo`/SEO pattern in `src/i18n/seo.js`).

---

## 3. Page structure — `src/components/experience/ExperiencePage.jsx`

Render these sections **in order**. Each is its own component under
`src/components/experience/`. Keep the existing site `Header`/`Footer` (already wrapped in
App.jsx). All copy comes from i18n keys under `experience.*` (see §7).

1. **HeroExperience** — full-screen (`100vh`).
   - Background: `deneyim-hero.mp4` (autoplay, muted, loop, playsInline) with a dark scrim;
     poster = `deneyim-cta.jpg` for first paint / mobile.
   - Foreground: giant headline (e.g. "Sıradanın ötesinde bir yolculuk"), sub-line, a
     primary CTA button → `onBook()` (opens booking), and a scroll-down cue.
   - Big bold type: `clamp(40px, 7vw, 96px)`, white, tight leading.

2. **ScrollScrubSection** — the signature effect (the car approaching).
   - **Reuse the working implementation in `src/components/ScrollIntro.jsx`** (already in
     repo). It is a faithful Atoms "scroll scrub": a tall section + `sticky` stage + a
     `<video>` that stays **paused**; scroll progress maps to `video.currentTime`, eased in
     a single `requestAnimationFrame` loop, written at most once per frame. See
     `atoms-guide/04-scroll-scrub.prompt.md` for the spec.
   - Swap its video src to `/videos/deneyim-scrub.mp4`.
   - Overlay a short line that fades as progress increases (e.g. "Kapıdan piste.").
   - Height ≈ `320vh`; `object-fit: cover`.

3. **FleetCarousel** — `01 / 06` style horizontal showcase.
   - Data source: `fleetItems` from `src/data/content.js` (keys + images), names via
     `t(\`fleet.items.${key}.name\`)`.
   - Big vehicle image per slide + name + 1-line spec + passenger/luggage from
     `src/utils/fleetSpecs.js`. Slide index indicator `01/06`, prev/next, keyboard + swipe.
   - CTA per slide → `onBook()` (optionally prefill vehicle).

4. **FeatureShowcase** — 3-4 scroll-revealed feature blocks (alternating image/text).
   - Features: Havalimanı karşılama (meet & greet), Profesyonel şoför, 7/24 & dakiklik,
     Global kapsama. Use `deneyim-cta.jpg` / `luxury-hero.png` / fleet images as visuals
     until dedicated lifestyle shots arrive.
   - Reveal on scroll via `IntersectionObserver` (fade/translate up).

5. **StoryParallax** — one wide cinematic image (`luxury-hero.png`) with a subtle parallax
   translate on scroll + a short brand narrative (reuse `about.story` copy if useful).

6. **StatsStrip** — big numbers: 26+ yıl, şehir/ülke sayısı, 7/24, memnuniyet. Count-up on
   reveal (optional). Keep it one clean row (wrap on mobile).

7. **CtaFinale** — full-bleed `deneyim-cta.jpg`, dark gradient with **negative space on the
   left** for text, headline + "Hemen rezervasyon" button → `onBook()`. This mirrors
   Radian's closing pre-order block.

Then App.jsx already appends the shared **Footer**.

---

## 4. Scroll-scrub algorithm (must follow — from `atoms-guide/04-scroll-scrub.prompt.md`)

- `<video muted playsInline preload="auto">`, **never call `play()`** — seek only.
- `progress = clamp(-sectionRect.top / (sectionRect.height - innerHeight), 0, 1)`.
- Keep `targetTime` and `displayedTime`. On scroll set `targetTime = progress * duration`.
- One `requestAnimationFrame` loop eases `displayedTime` toward `targetTime` and writes
  `video.currentTime` **at most once per frame**; stop when settled, restart on next scroll.
- Wait for `loadedmetadata` before reading `duration`.
- `object-fit: cover`. Under `prefers-reduced-motion`, show a static frame (no tall scroll).
- A ready implementation already exists in `src/components/ScrollIntro.jsx` — lift it.

---

## 5. Styling

- Put page styles in `src/styles.css` (site-wide sheet) under a clear
  `/* ── Experience page ── */` banner, prefixed `.xp-*` to avoid collisions.
- Tokens: background `#000`/`#0b0b0f`, text `#fff`, muted `rgba(255,255,255,.7)`,
  accent `var(--gold, #d4af37)`. Bold sans-serif already loaded site-wide.
- Sections full-bleed (edge-to-edge), content in a max-width container (~1200px) except
  full-screen media.
- Smooth: `scroll-behavior` stays default; do **not** hijack/lock scroll anywhere.
- Header over dark hero: ensure logo/nav are light. Check `Header.jsx` `isHome=false`
  styling; add a variant if it renders dark-on-light.

---

## 6. Responsive & a11y

- Mobile (`<=760px`): hero video may be replaced by the poster image for perf; scrub
  section still works but shorten to ~`220vh`; carousel becomes 1-up swipe.
- `prefers-reduced-motion`: disable scrub/parallax, show static media.
- All videos `muted playsInline`; provide `aria-label`s; CTA buttons are real `<button>`.
- Keep Largest Contentful Paint reasonable: `preload="auto"` only for the scrub video that
  is above the fold-ish; lazy the rest.

---

## 7. i18n keys (add to all three: `src/i18n/translations.js` en + tr blocks, and
`src/i18n/translations/de.js`)

Add an `experience` block. Suggested TR copy:

```
experience: {
  hero: {
    eyebrow: "VIP DENEYİM",
    title: "Sıradanın ötesinde bir yolculuk.",
    text: "Havalimanı karşılamadan şehirler arası transfere; şoförlü lüks, dakik ve zarif.",
    cta: "Hemen rezervasyon",
    scroll: "Keşfetmek için kaydırın",
  },
  scrub: { line: "Kapıdan piste — kusursuz." },
  fleet: { eyebrow: "FİLO", title: "Her yolculuğa uygun araç." },
  features: {
    title: "Neden VIP Transfer?",
    meet:    { title: "Havalimanı Karşılama", text: "Uçuşunuzu takip eder, tabelayla kapıda karşılarız." },
    driver:  { title: "Profesyonel Şoför", text: "Deneyimli, takım elbiseli, çok dilli şoförler." },
    always:  { title: "7/24 & Dakiklik", text: "Her zaman erken, her zaman hazır." },
    global:  { title: "Global Kapsama", text: "Türkiye, AB, ABD ve Uzak Doğu." },
  },
  stats: { years: "Yıl Tecrübe", cities: "Şehir", support: "Destek", guests: "Mutlu Misafir" },
  cta: { title: "Yolculuğunuz bir dokunuş uzağınızda.", button: "Rezervasyon yap" },
}
```
Provide EN + DE equivalents. (The unused `intro.*` / `reveal.*` keys already added earlier
can be reused or deleted.)

---

## 8. Video encoding (required before scrub looks good)

AI mp4s have sparse keyframes → seeking stutters. Re-encode with dense keyframes + faststart
(needs ffmpeg installed — it is NOT available in this environment yet):

```bash
# scrub video (dense keyframes are essential here)
ffmpeg -i public/videos/deneyim-scrub-raw.mp4 -an -vf "scale=1920:-2" \
  -c:v libx264 -g 6 -keyint_min 6 -sc_threshold 0 -crf 20 -movflags +faststart \
  public/videos/deneyim-scrub.mp4

# hero loop (lighter, just faststart + web-friendly)
ffmpeg -i public/videos/deneyim-hero-raw.mp4 -an -vf "scale=1920:-2" \
  -c:v libx264 -crf 22 -movflags +faststart \
  public/videos/deneyim-hero.mp4
```
Then reference `deneyim-scrub.mp4` / `deneyim-hero.mp4` in the components. Keep the `-raw`
files out of git if size matters (add to `.gitignore`).

---

## 9. Existing pieces to reuse (already in repo)

- `src/components/ScrollIntro.jsx` — working scroll-scrub (lift into ScrollScrubSection).
- `src/components/ExperienceReveal.jsx` — cursor colour-reveal band (optional extra section).
- CSS already appended in `src/styles.css`: `/* ── Cinematic scroll intro ── */` and
  `/* ── Cinematic colour-reveal band ── */` (reuse/rename to `.xp-*`).
- `@property --reveal-r` and `--p` patterns already there.
- These were removed from the homepage render (homepage is back to original) but the files
  and CSS remain as building blocks for `/deneyim`.

---

## 10. Verification (do NOT skip)

- Run the web dev server on a **free port** (5173 is often taken by the user's own server):
  `npm run dev:web -- --port 5174 --strictPort` (or use the `vite-preview` config in
  `.claude/launch.json`).
- Open `/deneyim`. Check: hero video plays & is readable; **scroll-scrub is smooth** (no
  black frames — if it stutters, the encode step §8 was skipped); carousel works with
  keyboard + swipe; features reveal on scroll; CTA button opens booking; footer present.
- Test mobile viewport + `prefers-reduced-motion`.
- Confirm the **homepage `/` is unchanged**.

---

## 11. Acceptance criteria

- [ ] `/deneyim` renders the full section order (§3) with the shared Header/Footer.
- [ ] Scroll-scrub maps scroll → `video.currentTime` smoothly, video stays paused.
- [ ] Fleet carousel shows `01/06`, navigates, is swipeable.
- [ ] All copy via i18n in tr/en/de; no raw keys visible.
- [ ] Reduced-motion + mobile fallbacks work.
- [ ] Homepage `/` and admin are untouched.
- [ ] `/deneyim` prerenders with its own SEO title/meta and is in the sitemap.
- [ ] Videos re-encoded (dense keyframes) so scrub is clean.

---

## 12. File checklist

Create:
- `src/components/experience/ExperiencePage.jsx`
- `src/components/experience/HeroExperience.jsx`
- `src/components/experience/ScrollScrubSection.jsx` (from ScrollIntro.jsx)
- `src/components/experience/FleetCarousel.jsx`
- `src/components/experience/FeatureShowcase.jsx`
- `src/components/experience/StoryParallax.jsx`
- `src/components/experience/StatsStrip.jsx`
- `src/components/experience/CtaFinale.jsx`

Edit:
- `src/App.jsx` (route + render + import — §2)
- `src/styles.css` (`.xp-*` styles)
- `src/i18n/translations.js` + `src/i18n/translations/de.js` (`experience.*`)
- `scripts/prerender.mjs` + `public/sitemap.xml` (add `/deneyim`)
- Produce `public/videos/deneyim-scrub.mp4` + `deneyim-hero.mp4` (§8)
