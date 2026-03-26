# Changelog

Všechny významné změny projektu Magické Příběhy (SkyWhale).

## [Unreleased] — 2026-03-26

### Card Studio & Encyclopedia Sprint (GF-133 → GF-138)

- **GF-133:** Three-Layer fix CustomBookEditor — Supabase volání přesunuta do hooks
- **GF-134:** `shared_cards` tabulka — CREATE TABLE + RLS migrace (public read, auth insert)
- **GF-77:** Card Studio share URL — `onShareCard` adapter, `/card/:id` route, CardViewerRoute
- **GF-58:** Coverage sprint 3 — +21 testů (273→294), 65%→75.18%, useCardStudioAdapter 0→92%, useGameHubAdapter 0→100%
- **GF-78:** Discovery cover fallback — `storage_folder` field + generic `processBooks()` fallback
- **GF-137:** Encyklopedie v1 (Three.js) — **Cancelled** (bundle +999 kB, přesunuto na 2D approach)
- **GF-138:** Encyklopedie v2 (CSS/Framer Motion) — **Done**
  - WorldsScene: fullscreen snap scroll, 6 sekcí, IntersectionObserver dot navigator
  - WorldSection: unikátní gradienty, CSS particle animace, animované SVG pozadí per slug
  - WorldIcons: 6 custom SVG ikon (dinosaurus, raketa, ryba, opice, tučňák, lev) — nahrazují emoji
  - DiscoveryBookGrid: slide-up panel, bílé karty, stagger animace
  - DiscoveryReader: swipe navigace, drag gesture, responsive prev/next, page indicator
  - DiscoveryPageView: dual layout (book/cinematic), audio autoplay, hotspots, progress bar
  - useDiscoveryScene: tří-úrovňový data hook (categories → books → pages) s plným DB propojením
  - Reader backgrounds: Supabase obrázky (dinosauri, vesmir) + CSS gradienty (ocean, prales, arktida, savana)
  - Audio cleanup: `discovery:stop-audio` event při navigaci zpět
  - Smazáno 9 legacy souborů: BookList, CategoryGrid, DiscoveryBackground, DiscoveryCard, DiscoveryHeader, TrailerOverlay, useDiscoveryData, useDiscoveryNav, useTrailers
  - WorldSVGBackground: opraveny obrácené ryby v ocean scéně

### Refactoring & Quality Sprint (GF-17 → GF-81)

- **GF-17:** Quick wins — DiscoveryPageView rename, STORY_COSTS → `lib/constants.ts`, generateId → `lib/id-utils.ts`
- **GF-18:** Audio components přesun `features/audio/` → `components/audio/` (sdílené UI)
- **GF-19:** Three-Layer Rule — FeedbackBoard, ReportDialog, ReactionBar: supabase → adapter hooks
- **GF-20:** Coverage sprint 1 — +76 testů (156→232), 7 nových test souborů
- **GF-21:** FSD fix — domain hooks přesunuty do feature složek
- **GF-22:** Fix afterEach imports — `tsc --noEmit` poprvé 0 chyb
- **GF-23:** Three-Layer Rule — HeroMode, StorySetup, StoryChat, EnergyCard: supabase vyextrahován do hooks
- **GF-24:** Coverage sprint 2 — +41 testů (232→273), themes/useGuide/edge-functions/storage-service/useGemini
- **GF-25:** AppLayout split — 244→211 řádků, `routeHelpers.ts` extrahováno
- **GF-26:** Bundle manualChunks — main bundle 995→186 kB (−81%), 5 vendor chunks
- **GF-27:** AppLayout PublishDialog — `supabase.update` → `onPublishBook` prop z useStory
- **GF-28:** Security — `generate-idea` auth guard, console.log cleanup (44→17)

### Bug Fixes

- **GF-76:** Storage bucket: `story-covers` → `book-covers` (matching real Supabase bucket)
- **GF-80:** Konva CardCanvas: `isDestroyed()` → `isDestroyed?.()` optional chaining
- **GF-80b:** Custom Book PDF export — `HiddenCustomBookTemplate` + separátní `isExportingPdf` flag
- **GF-81:** VoicePreviewButton: Audio instance reset on previewUrl change
- **PDF export:** `allowTaint:false`, `scale:2`, wrapper `height:auto` (Story Reader)
- **vercel.json:** UTF-16LE → UTF-8 encoding fix (broke SPA routing on Vercel)
- **portal-poster.jpg:** Removed missing poster attribute from CinematicLanding
- **Storage bucket:** `story-covers` → `book-covers` (DB schema audit)

### Documentation

- DEVELOPMENT_STATE.md aktualizován přes GF-81
- BACKLOG.md přepracován — vyřešené issues odstraněny, nové přidány
- DEPLOYMENT_READINESS_AUDIT.md, PROJECT_AUDIT_JAN_2026.md, MASTER_BLUEPRINT.md → `docs/ARCHIVE/`
- DB migrace: `style_manifest` + `status` sloupce na books tabulce
- DB schema audit: bucket mismatch identifikován a opraven, missing columns dokumentovány
- CLAUDE.md: přidána Git Rules (no auto-push)
- Kompletní docs audit: 12 souborů prověřeno, 3 archivováno

---

## [0.9.1] — 2026-03-23

### Refactoring Sprint (GF-10 → GF-16)

- **GF-16:** App.tsx lazy imports + route config (`src/app/routes.tsx`)
  - App.tsx: 258 → 86 řádků, 37 → 15 importů
  - Code splitting: 10 lazy-loaded chunks, main bundle −25% (1329 → 995 kB)
- **GF-15:** Canceled — card-studio/types.ts a custom-book/types.ts jsou správně feature-lokální (degree 36 v GitNexus byl false alarm z transitivních hran)
- **GF-14:** Smazán duplicitní `src/hooks/usePdfExport.ts` (0 importerů)
- **GF-13:** ToolsDock split: 547 → 158 řádků + 5 tool sections
- **GF-12:** GreetingCardEditor split: 671 → 216 řádků + useCardEditorState, useCardEditorAI, CardToolbar, CardAIPanel
- **GF-11:** useCustomBookEditor split: 485 → 167 řádků + useBookEditorAI, useBookEditorPersistence

### Bug Fixes

- **CardCanvas Transformer:** Fix attachment na async-loaded images (callbackRef → onLoad pattern)
- **AnimatePresence popLayout:** Fix forwardRef warning — SinglePage component → helper function

### Documentation

- CLAUDE.md aktualizován: Edge Functions, features, hooks, lib, energy economy
- Nová sekce "Graph Degree vs. Direct Imports" v CLAUDE.md
- `docs/architecture/05-edge-functions-refactor.md` (z Linear GF-10)
- `docs/architecture/06-god-components-audit.md` — audit + aktualizace anomálií

---

## [0.9.0] — 2026-03-22

### Edge Functions Refactor (GF-10)

- `generate-story-content`: 653 → ~200 řádků, 9 → 2 akce
- Nové funkce: `book-editor-assist` (4 akce), `content-tools` (2 akce)
- Sdílené moduly: `_shared/ai-clients.ts`, `_shared/lang-utils.ts`, `_shared/cors.ts`
- Gemini model: `gemini-2.0-flash` → `gemini-2.5-flash`

## [0.8.0] — 2026-03-07

### Security & Payments

- **GF-8:** Security audit, XSS fix, test coverage 3% → 17%
- **GF-7:** Stripe nahrazen Gumroad platební integrací
- **GF-9:** Testy a deploy příprava
- **GF-6:** FSD refactoring wave

### Features

- Claude story generation (Anthropic claude-sonnet-4-6)
- Content moderation vrstva (input validace, GDPR souhlas)
- Bezpečnostní vrstva (publikační gate, upload validace, report systém)

## [0.7.0] — 2026-02-15

### Architecture

- FSD Refactor & Clean Architecture
- Profile extraction to `src/features/profile/`
- GameHub subcomponent split + Energy Engine
- Discovery Reader overhaul (unified viewport, cinematic mode)
- Card Studio + Game Hub adapter pattern

## [0.6.0] — 2026-01-18

### Core

- Gemini 3 integration & StorySetup UI refinement
- Storyteller Skill implementation
- ElevenLabs audio profile UI
- Content Moderation System (OpenAI API)
- Language enforcement (Czech absolute priority)
- Core authentication overhaul
