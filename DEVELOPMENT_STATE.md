# DEVELOPMENT STATE

Source of Truth pro aktuální stav vývoje. Aktualizováno: **2026-03-23**.

## 1. Aktuální metriky

| Metrika | Hodnota |
|---------|---------|
| App.tsx | **86 řádků**, 15 importů |
| Features | **19** v `src/features/` |
| Edge Functions | **9** v `supabase/functions/` |
| Sdílené moduly | 3 v `supabase/functions/_shared/` |
| Code splitting | 10 lazy-loaded chunks (via `src/app/routes.tsx`) |
| Main bundle | 995 kB (cíl: pod 500 kB — viz Backlog) |
| Test coverage | ~17% (cíl: 40%) |
| Build | `tsc && vite build` — zelený |

## 2. Dokončené refaktory (GF-10 → GF-16)

| Issue | Co se stalo | Výsledek |
|-------|-------------|----------|
| GF-10 | Edge Functions split | `generate-story-content` 653→200 řádků, +3 nové funkce |
| GF-11 | useCustomBookEditor split | 485→167 řádků + useBookEditorAI + useBookEditorPersistence |
| GF-12 | GreetingCardEditor split | 671→216 řádků + useCardEditorState + useCardEditorAI + CardToolbar |
| GF-13 | ToolsDock split | 547→158 řádků + 5 tool sections |
| GF-14 | Smazán duplicitní usePdfExport | Dead code removal |
| GF-15 | Canceled | Types jsou správně feature-lokální (false alarm) |
| GF-16 | App.tsx lazy routes | 258→86 řádků, code splitting −25% bundle |

## 3. Strategic Rules (The Constitution)

> [!IMPORTANT]
> Dodržovat striktně při dalším vývoji.

1. **No direct Supabase or AI calls in UI components.** Vždy přes Adapter (`src/providers/`) nebo hook (`src/hooks/`).
2. **New features must be created in `src/features/`**. `src/components` pouze pro sdílené UI elementy.
3. **`App.tsx` is an orchestrator only.** Top-level state, provider composition, route rendering.

## 4. Zbývající tech debt

- `src/lib/storyteller.ts` — legacy TypeScript errors (non-blocking, ignorované)
- `AppLayout.tsx` — 244 řádků, kandidát na další split
- `getUser` v `ReactionBar.tsx` — degree 28, extrahovat do sdíleného utility
- Main bundle 995 kB — potřeba `manualChunks` v Vite config
- `process-story-image` Edge Function — legacy, nahrazena `generate-story-image`

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
  lib/                    ← 12 knihoven (supabase, ai, storyteller, moderation, ...)
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
