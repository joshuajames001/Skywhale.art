# DEVELOPMENT STATE

Source of Truth pro aktuální stav vývoje. Aktualizováno: **2026-03-24**.

## 1. Aktuální metriky

| Metrika | Hodnota |
|---------|---------|
| App.tsx | **86 řádků**, 15 importů |
| Features | **19** v `src/features/` |
| Edge Functions | **9** v `supabase/functions/` |
| Sdílené moduly | 3 v `supabase/functions/_shared/` |
| Code splitting | 10 lazy-loaded chunks (via `src/app/routes.tsx`) |
| Main bundle | **186 kB** (vendor chunks separated, down from 995 kB) |
| Test coverage | **273 testů**, ~65% statements |
| Build | `tsc && vite build` — zelený |

## 2. Dokončené refaktory (GF-10 → GF-26)

| Issue | Co se stalo | Výsledek |
|-------|-------------|----------|
| GF-10 | Edge Functions split | `generate-story-content` 653→200 řádků, +3 nové funkce |
| GF-11 | useCustomBookEditor split | 485→167 řádků + useBookEditorAI + useBookEditorPersistence |
| GF-12 | GreetingCardEditor split | 671→216 řádků + useCardEditorState + useCardEditorAI + CardToolbar |
| GF-13 | ToolsDock split | 547→158 řádků + 5 tool sections |
| GF-14 | Smazán duplicitní usePdfExport | Dead code removal |
| GF-15 | Canceled | Types jsou správně feature-lokální (false alarm) |
| GF-16 | App.tsx lazy routes | 258→86 řádků, code splitting −25% bundle |
| GF-17 | Quick wins refactor | Discovery BookReader→DiscoveryPageView, STORY_COSTS→constants.ts, generateId→id-utils.ts |
| GF-18 | Audio components přesun | `features/audio/components/` → `src/components/audio/` (sdílené UI) |
| GF-19 | Three-Layer Rule — adapter hooks | FeedbackBoard, ReportDialog, ReactionBar: supabase vyextrahován do hooks |
| GF-20 | Coverage sprint | +76 testů (156→232), 7 nových test souborů |
| GF-21 | FSD fix — domain hooks | useFeedbackData, useReportData, useReactionData přesunuty do feature složek |
| GF-22 | Fix afterEach imports | 3 test soubory opraveny → `tsc --noEmit` poprvé 0 chyb |
| GF-23 | Three-Layer Rule — 4 komponenty | HeroMode, StorySetup, StoryChat, EnergyCard: supabase vyextrahován |
| GF-24 | Coverage sprint 2 | +41 testů (232→273), themes/useGuide/edge-functions/storage-service/useGemini |
| GF-25 | AppLayout split | 244→211 řádků, routeHelpers.ts extrahováno |
| GF-26 | Bundle manualChunks | Main bundle 995→186 kB (−81%), 5 vendor chunks |

## 3. Strategic Rules (The Constitution)

> [!IMPORTANT]
> Dodržovat striktně při dalším vývoji.

1. **No direct Supabase or AI calls in UI components.** Vždy přes Adapter (`src/providers/`) nebo hook (`src/hooks/`).
2. **New features must be created in `src/features/`**. `src/components` pouze pro sdílené UI elementy.
3. **`App.tsx` is an orchestrator only.** Top-level state, provider composition, route rendering.

## 4. Zbývající tech debt

- `src/lib/storyteller.ts` — legacy TypeScript errors (non-blocking, ignorované)
- `AppLayout.tsx` — 211 řádků (PublishDialog stále volá supabase přímo — L222)
- `pdfGenerator` chunk — 591 kB (lazy-loaded, ale velký — kandidát na tree-shaking/lighter lib)
- `process-story-image` Edge Function — legacy, nahrazena `generate-story-image`
- 3 komponenty stále volají supabase přímo (false positives — jen string check `url.includes('supabase.co')`)

Kompletní seznam: `docs/BACKLOG.md`

## 5. Architektura (quick reference)

```
src/
  app/routes.tsx          ← typed route config + lazy imports
  App.tsx                 ← orchestrátor (86 řádků)
  features/               ← 19 feature modules (FSD)
  hooks/                  ← sdílené hooks (useStory, useGemini, useEnergy, ...)
  hooks/core/             ← core hooks (useAppAuth, useAppNavigation, ...)
  providers/              ← 4 adaptery (CardStudio, GameHub, Library, BookReader)
  lib/                    ← knihovny (supabase, ai, storyteller, moderation, constants, id-utils, ...)
  components/audio/       ← sdílené audio UI (VoicePreviewButton, MiniPlayer, AudioConfirmDialog)
  components/layout/      ← sdílené layout komponenty
  types/                  ← globální TypeScript typy

supabase/functions/
  _shared/                ← ai-clients, cors, lang-utils
  generate-story-content/ ← story structure (Anthropic) + ideas (Gemini)
  book-editor-assist/     ← 4 akce pro Custom Book Editor
  content-tools/          ← moderace + visual DNA extraction
  generate-story-image/   ← Flux 2 Pro (50 Energy)
  skywhale-flux/          ← Flux Dev/Schnell (30 Energy)
  generate-audio/         ← ElevenLabs TTS
  gumroad-webhook/        ← platby
  process-story-image/    ← legacy
  cleanup-storage/        ← údržba
```
