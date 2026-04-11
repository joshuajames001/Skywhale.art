# Mobile Responsivity Audit — 2026-03-27

## Shrnutí

Kompletní audit mobilního zobrazení (target: 320px–768px) pro všechny feature komponenty.
Stack: React 18, Tailwind CSS, Framer Motion. Breakpointy: sm (640px), md (768px).

**Stav:** ~~7 CRITICAL, 17 HIGH~~ → **Opraveno 24/24** (Wave 1–3). Zbývá 12 MEDIUM, 4 LOW.

---

## CRITICAL (použitelnost znemožněna)

| # | Soubor | Řádek | Problém | Navrhovaný fix |
|---|--------|-------|---------|----------------|
| 1 | `BookCard.tsx` | 144, 160, 175 | Touch targety 32x32px (heart, report, menu) — pod 44px minimum | `p-2` → `p-2.5` |
| 2 | `BookReader.tsx` | 138, 151, 168 | Audio/PDF/Save buttony 36x36px | `p-2.5` → `p-3` |
| 3 | `CustomMode.tsx` | 248 | 4-sloupcový grid délky na mobilu (44px buttony) | `grid-cols-2 sm:grid-cols-4` |
| 4 | `HeroMode.tsx` | 201 | Stejný 4-sloupcový grid | `grid-cols-2 sm:grid-cols-4` |
| 5 | `CardCanvas.tsx` | 189-190 | Fixed 400x560px canvas, overflow na mobilu | Responsive: `Math.min(vw-32, 400)` |
| 6 | `CardViewer.tsx` | 99 | Fixed 400x560px placeholder | `w-full max-w-[400px]` |
| 7 | `ElevenLabsProfile.tsx` | 42 | Fixed `right-6` squeezes content na 320px | `right-3 sm:right-6` |

---

## HIGH (výrazně špatný UX)

| # | Soubor | Řádek | Problém | Navrhovaný fix |
|---|--------|-------|---------|----------------|
| 8 | `CinematicLanding.tsx` | 131 | `text-6xl` nadpis na 320px | `text-3xl sm:text-5xl md:text-8xl` |
| 9 | `CinematicLanding.tsx` | 142 | CTA `w-64` fixed | `w-full sm:w-64` |
| 10 | `CinematicLanding.tsx` | 74 | Žádné mobilní menu (nav hidden md:flex) | Hamburger nebo zjednodušit |
| 11 | `CinematicLanding.tsx` | 80 | Dropdown `w-64` overflow na <320px | `w-56 sm:w-64` |
| 12 | `Library.tsx` | 198 | 3 buttony v řadě overflow na <375px | `flex-wrap` nebo `flex-col sm:flex-row` |
| 13 | `Library.tsx` | 254 | `h-[calc(100vh-280px)]` hardcoded | Dynamický nebo `min-h-0 flex-1` |
| 14 | `Library.tsx` | 177-182 | Dekorativní emoji přetékají na mobilu | `hidden sm:block` na větší emoji |
| 15 | `BookReader.tsx` | 273, 285 | Nav šipky `-left-16` off-canvas na mobilu | Bottom nav nebo swipe |
| 16 | `StorySpread.tsx` | 129 | Text area `h-1/2` příliš malá na mobilu | `h-auto min-h-[50%]` |
| 17 | `HeroMode.tsx` | 141 | Upload box `w-64` fixed na 320px | `w-40 sm:w-64` |
| 18 | `DailyRewardModal.tsx` | 68-74 | Streak 7 kruhů se mačkají na 320px | Menší kruhy + `gap-1 sm:gap-2` |
| 19 | `PublicProfile.tsx` | 39 | `max-w-4xl` příliš široký modal | `max-w-lg sm:max-w-4xl` |
| 20 | `PublicProfile.tsx` | 66 | `text-4xl` jméno na mobilu | `text-2xl sm:text-4xl` |
| 21 | `EnergyStore.tsx` | 142 | `max-w-6xl` příliš široký | `max-w-lg sm:max-w-6xl` |
| 22 | `EnergyStore.tsx` | 164-165 | Tab `w-[140px]` overflow | `flex-1 sm:w-[140px]` |
| 23 | `ElevenLabsProfile.tsx` | 85 | Tooltip overflow screen edge | Flip direction na mobilu |
| 24 | `CustomMode.tsx` | 213 | Voice grid 2-col na mobilu, malé targety | `grid-cols-1 sm:grid-cols-2` |

---

## MEDIUM (suboptimální ale použitelné)

| # | Soubor | Řádek | Problém |
|---|--------|-------|---------|
| 25 | `LandingPage.tsx` | 202 | `text-5xl` stále velké na 320px |
| 26 | `LandingPage.tsx` | 421 | Footer `gap-8` přetéká |
| 27 | `Library.tsx` | 271 | Grid `grid-cols-2` tight na <375px |
| 28 | `CustomMode.tsx` / `HeroMode.tsx` | 143/161 | `gap-12` příliš velký na mobilu |
| 29 | `CustomMode.tsx` / `HeroMode.tsx` | 287/222 | Button `px-12` příliš široký |
| 30 | `UserProfile.tsx` | 74 | `p-8` bez mobilní varianty |
| 31 | `UserProfile.tsx` | 65-72 | Dekorativní emoji dominují na mobilu |
| 32 | `FeedbackForm.tsx` | 68 | Textarea `h-36` s klávesnicí overflow |
| 33 | `NavigationHub.tsx` | 230-232 | Mobile nav ikony `p-1` = 30px target |
| 34 | `AppLayout.tsx` | 155-160 | Toast `top-16` overlap s profilem |
| 35 | `PublicProfile.tsx` | 51-52 | Avatar `w-32` fixed |
| 36 | `EnergyStore.tsx` | 145, 193 | Close btn 32px, toggle malý |

---

## LOW (kosmetické)

| # | Soubor | Problém |
|---|--------|---------|
| 37 | `StorySpread.tsx:145` | `first-letter:text-6xl` overflow |
| 38 | `BookCard.tsx:322` | `text-lg` bez mobilní redukce |
| 39 | `BookReader.tsx:293` | Pagination dots 2-4px (visual only) |
| 40 | `GameHub.tsx:238` | `p-6` bez mobilní redukce |

---

## Silné stránky

- Dobrá základní mobile-first struktura: `flex-col md:flex-row` pattern konzistentně použit
- NavigationHub má separátní mobilní bottom nav
- Modaly používají `fixed inset-0 p-4` — základní mobilní bezpečnost
- Grid layouty většinou kolapsují na menší počet sloupců
- `overflow-x-auto` na tabs — scroll místo overflow

## Implementace — stav

| Wave | Rozsah | Commit | Stav |
|------|--------|--------|------|
| Wave 1 | CRITICAL #1–7 | `78a9bc8` | ✅ Done |
| Wave 2 | HIGH #8–17 | `2353b90` | ✅ Done |
| Wave 3 | HIGH #18–24 | `f2f1421` | ✅ Done |
| Wave 4 | MEDIUM #25–36 | — | ⏳ Backlog |
| Wave 5 | LOW #37–40 | — | ⏳ Backlog |
