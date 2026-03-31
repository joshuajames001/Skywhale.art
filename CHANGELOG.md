# Changelog

Všechny významné změny projektu Magické Příběhy (SkyWhale).

## [Unreleased] — 2026-03-31

### GameHub & UX Sprint (GF-233, GF-236, GF-237, GF-238)

- **GF-238:** PDF export CORS fix — stardust.png + graphy.png staženy do `public/textures/`, nahrazeno 7 transparenttextures.com URL
- **GF-237:** AiChat mode removed — smazány AiChatMode.tsx, StoryChat.tsx, useStoryChat.ts (chat-turn akce neexistuje v EF)
  - StorySetup: 4 módy → 3 (Magic, Hero, Custom)
- **GF-236:** BookReader prefetch — `usePrefetchNextPage` hook, po dokončení stránky N tiše generuje N+1
  - Deduplikace přes prefetchedRef Set, max 1 in-flight, non-fatal error handling
- **GF-233:** GameHub kompletní vizuální overhaul:
  - Dead code: smazán `useEdgeDetection.ts` (217 řádků), 7× console.log odstraněno
  - Fix: Tailwind dynamic class bug v GameMenu (`border-${color}` → statická mapa)
  - Light mode: Profile gradient (`from-blue-100 via-purple-50 to-pink-100`) → ilustrační background ze Supabase Storage
  - Statický background: jeden root wrapper, žádné blikání při view změnách
  - MemoryGame: karty full-bleed (`object-contain p-2` → `object-cover`)
  - PuzzleGame: referenční obrázek zvětšen (`w-20/w-24` → `w-32/w-48`)
  - Kontrast: všechny texty, karty, tlačítka aktualizovány pro light bg
  - MagicMirrorGame placeholder: light mode styl
- **Mobile nav:** 4+burger pattern
  - Bottom bar: Home, Knihovna, Vlastní kniha, Herna + Více (Menu ikona)
  - Více → BottomSheet s 8 položkami (Příběh, Encyklopedie, Profil, Ateliér, Obchod, Feedback, Podmínky, Soukromí)
  - Nahrazuje ScrollableRow s 10 položkami

---

## [Unreleased] — 2026-03-30

### Stability & Prompt Tuning Sprint (GF-57–GF-235)

- **GF-57:** pdfGenerator chunk warning suppressed — `chunkSizeWarningLimit: 600` ve vite.config.ts
  - Komentář vysvětlující rozhodnutí (lazy-loaded, html2canvas+jsPDF, neblokuje initial load)
  - Nová sekce "Known Large Chunks" v CLAUDE.md
- **GF-227:** Atomic energy deduction — `deduct_energy_if_sufficient` RPC
  - Nová migrace `20260330_deduct_energy_if_sufficient.sql`
  - Eliminuje TOCTOU race condition (SELECT→CHECK→DEDUCT → single atomic UPDATE WHERE balance >= cost)
  - 3 Edge Functions přepsány: `generate-audio`, `generate-story-image`, `skywhale-flux`
  - Refund logika (`add_energy`) zachována pro error recovery
- **GF-194:** ESLint 0 errors ověřeno — žádné změny potřeba (304 warnings)
- **GF-235:** Story prompt tuning v `generate-story-content` Edge Function
  - `<naming_rules>`: česká/česky znějící jména (banned: Kevin, Tyler, Ashley...), animal names (Kulička, Puntík), fantasy exception
  - `<story_arc_rules>`: dynamická struktura (intro → rising action → climax → resolution) s page ranges dle targetLength
  - Storytelling rule 8: character consistency across pages
  - Constraint 9: language purity zero tolerance (žádný mix cz/en)
- **GF-fix:** energyDeducted ReferenceError — hoist proměnných (`energyDeducted`, `supabaseAdmin`, `user`, `cost`) před `try` block
  - Opraveno v `generate-story-image` + `skywhale-flux` (catch block neviděl `let` z try scope)

### Migrace

- `20260330_deduct_energy_if_sufficient.sql` — atomic energy deduction RPC (GF-227)

### Edge Function Deploys

- `generate-story-content` — story prompt tuning deployed (GF-235)
- `generate-story-image` — atomic energy + scoping fix deployed (GF-227 + hotfix)
- `skywhale-flux` — atomic energy + scoping fix deployed (GF-227 + hotfix)
- `generate-audio` — atomic energy deployed (GF-227)

---

## [Unreleased] — 2026-03-30

### Freemium & Image Generation Sprint (GF-144a–GF-222)

- **GF-144a:** WhaleLoginModal — animovaná oceánská scéna se spící velrybou místo plain Auth modalu
  - Framer Motion float animace, JS-generované hvězdy, plovoucí emoji rybky
  - Klik na velrybu → probuzení (glow, bubliny) → fade-in Auth formulář
  - Desktop: flex-row (velryba vlevo, formulář vpravo), mobile: flex-col
- **GF-209:** WelcomeModal pro nové uživatele — oceánský styl, 160⚡ energy badge, CTA → `/custom?pages=3`
  - DB migrace: `is_new_user` boolean na profiles + handle_new_user() update
  - useAppAuth: `isNewUser` + `clearNewUserFlag()` (update profiles → refreshProfile)
- **GF-213:** WhaleLoginModal desktop layout — flex-row na md+ breakpointu
- **GF-214:** Fix X button re-open loop — useRef guard v LandingPage (efekt jen jednou)
- **GF-207:** Auth gate rozšíření — ProtectedRoute redirect `/ → /home`
- **GF-215:** Daily reward fix — claim-first-show-after pattern
  - RPC `claim_daily_reward` se volá v checkDailyReward(), ne v handleClaimReward()
  - `{ success: false }` → modal se nezobrazí, tiše ignorovat
  - Testy aktualizovány (7 testů, nový test pro "Already claimed" scénář)
- **GF-216:** CustomBookEditor image generation opravy
  - Tier logika: `continuityImageUrl` nepromuje na premium (jen magicMirrorUrl)
  - costPerImage konzistentní s tier logikou
  - Character sheet generování z DNA po magic mirror uploadu (Flux Dev + storageService)
  - Zastaralý log 50⚡/30⚡ → 40⚡/25⚡
- **GF-209:** CustomBookEditor `?pages` query param — useSearchParams override na mountu
- **GF-219:** Magic mirror sheet — originální fotka jako img2img reference + dnaToText JSON→text parser
- **GF-221:** FROG_PROTOCOL — selectedStyle se předává do generate-image-prompt edge function
  - STYLE_NAMES lookup mapa (16 stylů + compatibility keys)
  - Gemini prompt instrukce nahrazena dynamickým stylem
- **GF-222:** generate-image-prompt přepnut z Gemini na Claude Sonnet (claude-sonnet-4-6)
  - Nový strukturovaný systém prompt: `[STYLE]. [SUBJECT]. [ACTION]. [SETTING]. [LIGHTING]`
  - characterDescription (magicMirrorDna) se předává do edge function
  - callAnthropic: přidán `jsonMode` parametr (default true, image prompt false)
- **GF-fix:** content-tools base64 stack overflow — `String.fromCharCode(...spread)` → chunked loop
- **GF-fix:** Style key normalizace — `normalizeStyleKey()` (lowercase + underscore)
  - DEFAULT_STYLE změněn z watercolor na pixar_3d
  - Stejná normalizace v book-editor-assist STYLE_NAMES lookup

### Migrace

- `20260329_add_is_new_user_flag.sql` — is_new_user boolean + handle_new_user() update

### Edge Function Deploys

- `content-tools` — base64 fix deployed
- `book-editor-assist` — Anthropic switch + jsonMode + style normalizace deployed

---

## [Unreleased] — 2026-03-27

### Mobile Responsivity Sprint (GF-165–GF-187)

- **GF-165:** Kompletní mobile audit — 40 issues identifikováno (7 CRITICAL, 17 HIGH, 12 MEDIUM, 4 LOW)
- **GF-166 Wave 1–3:** 24/24 CRITICAL+HIGH opraveno
  - Touch targety 44px (BookCard, BookReader), responsive gridy (CustomMode, HeroMode)
  - CardCanvas containerRef + resize listener, CardViewer aspect-[5/7]
  - Font scaling (CinematicLanding), nav arrows (BookReader), modal widths (PublicProfile, EnergyStore)
  - Streak circles (DailyRewardModal), tooltip flip (ElevenLabsProfile), voice grid (CustomMode)
- **GF-166:** CustomBookEditor mobile redesign
  - Nová architektura: orchestrátor + `CustomBookEditorDesktop` + `CustomBookEditorMobile`
  - `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`)
  - `SharedEditorProps` interface, 3 swipovatelné views (Text/Obrázek/Slovník)
  - Hero mode slide-up overlay, bottom nav, page timeline
- **GF-169–173:** CustomBookEditor bugfixy
  - GraduationCap → Hero mode button, Magic Mirror do Image view
  - Synonym chips → clipboard copy, prompt input text contrast
  - Smazání duplicitních elementů (hero btn, mirror overlay, add-word btn)
- **GF-176:** CustomBookEditor top bar — voice/style pickers + overflow menu (save/PDF/publish)
- **GF-175:** Card Studio mobile redesign
  - `CardStudioDesktop` + `CardStudioMobile` + `SharedCardStudioProps`
  - Dark canvas bg (#0d1117) + starfield, portrait karta (max 200px), page strip 52×72px
  - 5-tab bottom toolbar: Šablony, Pozadí, Nálepky, Text, AI
  - Fullscreen panely s Framer Motion transitions
- **GF-177:** Card Studio Text Editor bottom sheet (textarea + size/color/font picker)
- **GF-178:** Přáníčkový vibe — teplá bílá #fffef8, inset shadow, decorative empty hint
- **GF-179:** Undo/Redo v top baru + overflow menu (Stáhnout PNG, Sdílet, Nová karta)
- **GF-182:** Sticker grid + → AI panel s předvoleným sticker tabem
- **GF-185:** Slovník panel v Card Studio (search, clipboard copy, synonyma)
- **GF-186:** EN suggestion chips + "Write in English" hint pod prompt inputy
- **GF-187:** CardStudioMobile refaktor — 700→160 řádků, split do `mobile/panels/` + `mobile/sheets/`

### Payment, Feedback, Energy, UI & Quality Sprint (GF-141–GF-164)

- **GF-156:** CardViewer Three-Layer fix — `useSharedCard` hook
- **GF-158:** PublicProfile Three-Layer fix — `usePublicProfile` hook
- **GF-159:** BookRouteWrapper — smazán nepoužívaný supabase import
- **GF-160:** BookReader — `useAudioGeneration` hook (nahrazuje přímé `invokeEdgeFunction`)
- **GF-163:** Library light mode — sky gradient, mráčky/zvířátka dekorace, BookCard bílé karty
- **GF-164:** Sidebar aktivní ikona fix — `/home` chyběl v `getNavigationView`, navigace pozice fix pro feedback view
- **i18n:** Chybějící `library.*` klíče (title, subtitle, tabs.community, tabs.my_books aj.)
- **Cleanup:** Smazány debug soubory (list-models.js, models.json, models.md, supabase_migration_trailer.sql)
- **GF-146:** Energy refund pattern — generate-story-image + skywhale-flux refundují energy při Replicate selhání
- **GF-148:** IMAGE_COSTS single source of truth — `_shared/costs.ts` + `src/lib/constants.ts`, STORY_COSTS odvozené výpočtem
- **GF-150:** purchaseEnergy test coverage — +4 testy (294→298), Stripe checkout flow pokryt
- **GF-151:** Daily reward fix — odstraněn `window.location.reload()` race condition + `claim_daily_reward` RPC migrace
- **GF-152:** Odstraněn ElevenLabsProfile console.log spam
- **CinematicLanding:** Hero-only refactor (434→147 řádků), video z Supabase Storage, smazány carousel/features/about/footer
- **GF-145:** Energy cost rebalance
  - Flux 2 Pro (story/Magic Mirror): 50 → **40** Energy/obrázek
  - Flux Dev (custom book bez reference): 30 → **25** Energy/obrázek
  - Card Studio (skywhale-flux): 0 → **5** Energy/obrázek (nový energy gate)
  - `STORY_COSTS`: přidána délka 3 strany (200 Energy)
- **GF-141:** Gumroad → Stripe migrace
  - Nová Edge Function `stripe-webhook` — zpracovává `checkout.session.completed` + `invoice.payment_succeeded`, deduplikace přes `transactions`, grantuje energii přes `add_energy` RPC
  - Nová Edge Function `create-checkout-session` — vytváří Stripe Checkout session s auth, origin z request headeru (funguje lokálně i v produkci)
  - `src/features/store/constants.ts` — STRIPE_PRICES (11 price IDs, one-time + subscription monthly/yearly)
  - `useEnergy` — `buyPackage()` (Gumroad redirect) nahrazen `purchaseEnergy()` (Stripe Checkout via Edge Function)
  - EnergyStore + SubscriptionCard — priceId z konstant, přímé volání `purchaseEnergy`
  - Smazáno: `supabase/functions/gumroad-webhook/` (celá složka)
  - Config: `supabase/config.toml` — nové funkce, smazané legacy `create-checkout` + `stripe-webhook` entries
- **GF-143:** Feedback přepis — nástěnka → email form
  - Smazáno: FeedbackBoard.tsx + useFeedbackData.ts (Supabase CRUD nástěnka)
  - Nová Edge Function `send-feedback` — Resend API email na FEEDBACK_EMAIL
  - FeedbackForm.tsx — jednoduchý textarea + submit, success/error stavy
  - useFeedbackForm.ts — hook s invokeEdgeFunction (Three-Layer Rule)
  - Route `/feedback` — lazy loaded FeedbackForm místo přímého importu

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
