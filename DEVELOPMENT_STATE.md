# DEVELOPMENT STATE

Source of Truth pro aktuální stav vývoje. Aktualizováno: **2026-03-26**.

## 1. Aktuální metriky

| Metrika | Hodnota |
|---------|---------|
| App.tsx | **86 řádků**, 15 importů |
| Features | **19** v `src/features/` |
| Edge Functions | **9** v `supabase/functions/` |
| Sdílené moduly | 3 v `supabase/functions/_shared/` |
| Code splitting | 10 lazy-loaded chunks (via `src/app/routes.tsx`) |
| Main bundle | **185.94 kB** (vendor chunks separated) |
| Test coverage | **294 testů**, 75.18% statements |
| Build | `tsc && vite build` — zelený |

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

## 3. Strategic Rules (The Constitution)

> [!IMPORTANT]
> Dodržovat striktně při dalším vývoji.

1. **No direct Supabase or AI calls in UI components.** Vždy přes Adapter (`src/providers/`) nebo hook (`src/hooks/`, `src/features/*/hooks/`).
2. **New features must be created in `src/features/`**. `src/components` pouze pro sdílené UI elementy.
3. **`App.tsx` is an orchestrator only.** Top-level state, provider composition, route rendering.

## 4. Zbývající tech debt

- `src/lib/storyteller.ts` — legacy TypeScript errors (non-blocking, ignorované)
- `pdfGenerator` chunk — 591 kB (lazy-loaded; html2canvas CORS s cross-origin obrázky stále potenciální issue)
- `process-story-image` Edge Function — legacy, nahrazena `generate-story-image`
- `style_manifest` + `status` sloupce na books — migrace vytvořena, potřeba spustit v Supabase SQL Editor
- Zastaralé Storage buckety: `dino-content`, `card-assets`, `book-images` — kód je nepoužívá
- Discovery `DiscoveryPageView.tsx` — Three-Layer violation (přímé Supabase volání hotspotů v komponentě), god component (299 řádků)
- Discovery `utils.ts` — `any[]` typy, přímé Supabase storage volání
- Discovery `DiscoveryHub.tsx` — hardcoded Supabase URLs (reader backgrounds)

## 5. Architektura (quick reference)

```
src/
  app/routes.tsx          ← typed route config + lazy imports
  App.tsx                 ← orchestrátor (86 řádků)
  features/               ← 19 feature modules (FSD)
  hooks/                  ← sdílené hooks (useStory, useGemini, useEnergy, ...)
  hooks/core/             ← core hooks (useAppAuth, useAppNavigation, ...)
  providers/              ← 4 adaptery (CardStudio, GameHub, Library, BookReader)
  lib/                    ← knihovny (supabase, ai, storyteller, moderation, constants, ...)
  components/audio/       ← sdílené audio UI (VoicePreviewButton, MiniPlayer, AudioConfirmDialog)
  components/layout/      ← sdílené layout komponenty
  types/                  ← globální TypeScript typy

supabase/functions/
  _shared/                ← ai-clients, cors, lang-utils
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
  20260325_add_shared_cards.sql  ← nejnovější migrace
```
