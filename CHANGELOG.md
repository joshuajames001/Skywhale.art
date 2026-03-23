# Changelog

Všechny významné změny projektu Magické Příběhy (SkyWhale).

## [Unreleased] — 2026-03-23

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
