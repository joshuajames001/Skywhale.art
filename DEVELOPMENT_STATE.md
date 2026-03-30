# DEVELOPMENT STATE

Source of Truth pro aktuální stav vývoje. Aktualizováno: **2026-03-30**.

## 1. Aktuální metriky

| Metrika | Hodnota |
|---------|---------|
| App.tsx | **86 řádků**, 15 importů |
| Features | **19** v `src/features/` |
| Edge Functions | **9** v `supabase/functions/` |
| Sdílené moduly | 5 v `supabase/functions/_shared/` (ai-clients, cors, lang-utils, costs, rate-limit) |
| Code splitting | 10 lazy-loaded chunks (via `src/app/routes.tsx`) |
| Main bundle | **185.94 kB** (vendor chunks separated) |
| Test coverage | **298 testů**, ~76% statements |
| Build | `tsc && vite build` — zelený |
| ESLint | **0 errors**, 304 warnings (eslint 9.39.4, flat config) |
| Mobile audit | **40/40** issues opraveno (GF-165) |
| Mobile editory | CustomBookEditor + CardStudio — dual-variant (Desktop/Mobile) |

## 2. Dokončené refaktory (GF-10 → GF-138)

| Issue | Co se stalo | Výsledek |
|-------|-------------|----------|
| GF-10 | Edge Functions split | `generate-story-content` 653→200 řádků, +3 nové funkce |
| GF-11 | useCustomBookEditor split | 485→167 řádků + useBookEditorAI + useBookEditorPersistence |
| GF-12 | GreetingCardEditor split | 671→216 řádků + useCardEditorState + useCardEditorAI + CardToolbar |
| GF-13 | ToolsDock split | 547→158 řádků + 5 tool sections |
| GF-14 | Smazán duplicitní usePdfExport | Dead code removal |
| GF-15 | Canceled | Types jsou správně feature-lokální (false alarm) |
| GF-16 | App.tsx lazy routes | 258→86 řádků, code splitting −25% bundle |
| GF-17 | Quick wins refactor | Discovery BookReader→DiscoveryPageView, STORY_COSTS→constants.ts |
| GF-18 | Audio components přesun | `features/audio/` → `components/audio/` (sdílené UI) |
| GF-19 | Three-Layer Rule — adapter hooks | FeedbackBoard, ReportDialog, ReactionBar |
| GF-20 | Coverage sprint 1 | +76 testů (156→232), 7 nových test souborů |
| GF-21 | FSD fix — domain hooks | useFeedbackData, useReportData, useReactionData do feature složek |
| GF-22 | Fix afterEach imports | `tsc --noEmit` poprvé 0 chyb |
| GF-23 | Three-Layer Rule — 4 komponenty | HeroMode, StorySetup, StoryChat, EnergyCard |
| GF-24 | Coverage sprint 2 | +41 testů (232→273) |
| GF-25 | AppLayout split | 244→211 řádků, routeHelpers.ts |
| GF-26 | Bundle manualChunks | Main bundle 995→186 kB (−81%), 5 vendor chunks |
| GF-27 | AppLayout PublishDialog | supabase.update → onPublishBook |
| GF-28 | Security + cleanup | generate-idea auth guard, 44→17 console.log |
| GF-76 | Bucket name fix | story-covers → book-covers |
| GF-80 | Konva fix | isDestroyed?.() optional chaining |
| GF-81 | VoicePreview fix | Audio instance reset |
| GF-80b | Custom Book PDF export | HiddenCustomBookTemplate + isExportingPdf flag |
| GF-133 | Three-Layer fix CustomBookEditor | Přesun Supabase volání do hooks |
| GF-134 | shared_cards migrace | CREATE TABLE + RLS (public read, auth insert) |
| GF-77 | Card Studio share URL | onShareCard adapter, /card/:id route, CardViewerRoute |
| GF-58 | Coverage sprint 3 | +21 testů (273→294), 65%→75.18%, adaptery pokryté |
| GF-78 | Discovery cover fallback | storage_folder field + processBooks generic fallback |
| GF-137 | Encyklopedie v1 (Three.js) | **Cancelled** — přesunuto na GF-138 (2D approach) |
| GF-138 | Encyklopedie v2 (CSS/Framer) | **Done** — WorldsScene, SVG animace, custom ikony, reader propojení, 9 legacy souborů smazáno |
| GF-141–164 | Payment + UI sprint | Stripe migrace, Feedback→email, Energy rebalance, Three-Layer fixes, Library light mode |
| GF-165–166 | Mobile audit + fixes | 40/40 issues (7 CRITICAL + 17 HIGH + 12 MEDIUM + 4 LOW) |
| GF-166 | CustomBookEditor mobile | Dual-variant split, 3 swipovatelné views, voice/style pickers, overflow menu |
| GF-175–187 | Card Studio mobile | Dual-variant split, dark canvas, 6 panelů, text editor sheet, dictionary, refaktor do mobile/ |
| GF-188–189 | CustomBookEditor polish | Title input, max pages, expert mode, voice preview, charge energy, new book |
| GF-190 | Voice preview fix | URLs z Supabase Storage (book-media bucket), disabled guard + error state |
| GF-191–193 | Cleanup | Publish button smazán, style audit OK, Hero Mode smazán z mobile |
| GF-194 | Discovery audit | Three-Layer čisté, žádné any[], žádné hardcoded URLs |
| GF-195 | i18n mobile | ~40 klíčů cs.json + en.json, 8 souborů |
| GF-196 | ESLint migrace | Flat config (9.39.4), 0 errors, hooks violations fixed |
| GF-195b | Library scroll-hide | useScrollDirection + ScrollDirectionContext, auto-hide header+nav |
| GF-196b | Library grid alignment | BookCard h-full flex-col, grid bez auto-rows-max |
| GF-144a | WhaleLoginModal | Animovaný oceánský login místo plain Auth modalu |
| GF-209 | WelcomeModal + is_new_user | Welcome modal pro nové uživatele, DB migrace, ?pages query param |
| GF-213–214 | Whale modal fixes | Desktop flex-row layout, X button re-open guard |
| GF-207 | Auth gate | ProtectedRoute → /home, LandingPage auto-open |
| GF-215 | Daily reward fix | Claim-first-show-after, testy aktualizovány |
| GF-216 | Image gen tier fix | continuity ≠ premium, character sheet gen, cost log fix |
| GF-219 | Magic mirror sheet | img2img reference + dnaToText parser |
| GF-221 | FROG_PROTOCOL style | selectedStyle předáván do edge function |
| GF-222 | Gemini → Claude Sonnet | Image prompts přes Anthropic, callAnthropic jsonMode |
| GF-fix | content-tools base64 | Chunked loop místo spread (stack overflow fix) |
| GF-fix | Style normalization | normalizeStyleKey(), DEFAULT_STYLE → pixar_3d |
| GF-57 | pdfGenerator chunk warning | chunkSizeWarningLimit: 600, komentář ve vite.config.ts, CLAUDE.md záznam |
| GF-227 | Atomic energy deduction | deduct_energy_if_sufficient RPC migrace, TOCTOU race condition fix ve 3 EF (generate-audio, generate-story-image, skywhale-flux) |
| GF-194 | ESLint 0 errors | Ověřeno — 0 errors, 304 warnings, žádné změny potřeba |
| GF-235 | Story prompt tuning | Czech naming rules, story arc structure, character consistency, language purity guardrails v generate-story-content EF |
| GF-fix | energyDeducted scoping | Hoist proměnných před try block v generate-story-image + skywhale-flux (ReferenceError v catch) |

## 3. Strategic Rules (The Constitution)

> [!IMPORTANT]
> Dodržovat striktně při dalším vývoji.

1. **No direct Supabase or AI calls in UI components.** Vždy přes Adapter (`src/providers/`) nebo hook (`src/hooks/`, `src/features/*/hooks/`).
2. **New features must be created in `src/features/`**. `src/components` pouze pro sdílené UI elementy.
3. **`App.tsx` is an orchestrator only.** Top-level state, provider composition, route rendering.

## 4. Zbývající tech debt

- `src/lib/storyteller.ts` — legacy TypeScript errors (non-blocking, ignorované)
- `pdfGenerator` chunk — 591 kB (lazy-loaded; warning suppressed GF-57; html2canvas CORS s cross-origin obrázky stále potenciální issue)
- `process-story-image` Edge Function — legacy, nahrazena `generate-story-image`
- `style_manifest` + `status` sloupce na books — migrace vytvořena, potřeba spustit v Supabase SQL Editor
- Zastaralé Storage buckety: `dino-content`, `card-assets`, `book-images` — kód je nepoužívá
- Card Studio mobile: translation tool, reset bg to black, bg category grouping
- ESLint: 304 warnings (mostly no-explicit-any + unused-vars) — nízká priorita
- `FROG_PROTOCOL` v book-editor-assist — dead code (akce generate-image-prompt používá Anthropic), kandidát na smazání
- EditorToolbar dropdown `"illustration"` — nemá STYLE_PROMPTS entry, fallback na pixar_3d

## 5. Architektura (quick reference)

```
src/
  app/routes.tsx          ← typed route config + lazy imports
  App.tsx                 ← orchestrátor (86 řádků)
  features/               ← 19 feature modules (FSD)
  hooks/                  ← sdílené hooks (useStory, useGemini, useEnergy, useMediaQuery, useScrollDirection, useClipboardCopy, ...)
  hooks/core/             ← core hooks (useAppAuth, useAppNavigation, ...)
  contexts/               ← ScrollDirectionContext
  providers/              ← 4 adaptery (CardStudio, GameHub, Library, BookReader)
  lib/                    ← knihovny (supabase, ai, storyteller, moderation, constants, ...)
  components/             ← sdílené UI (BottomSheet, DictionaryResults)
  components/audio/       ← sdílené audio UI (VoicePreviewButton, MiniPlayer, AudioConfirmDialog)
  components/layout/      ← sdílené layout komponenty
  types/                  ← globální TypeScript typy (+ DictionaryResult)

supabase/functions/
  _shared/                ← ai-clients, cors, lang-utils, costs, rate-limit
  generate-story-content/ ← story structure (Anthropic) + ideas (Gemini)
  book-editor-assist/     ← 4 akce pro Custom Book Editor
  content-tools/          ← moderace + visual DNA extraction
  generate-story-image/   ← Flux 2 Pro (40 Energy) / Flux Dev (25 Energy)
  skywhale-flux/          ← Flux Dev/Schnell (5 Energy)
  generate-audio/         ← ElevenLabs TTS
  stripe-webhook/          ← platby (Stripe)
  create-checkout-session/ ← Stripe Checkout
  process-story-image/    ← legacy
  cleanup-storage/        ← údržba

supabase/migrations/
  20260330_deduct_energy_if_sufficient.sql ← nejnovější migrace (GF-227)
```
