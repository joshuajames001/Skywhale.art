# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Magické Příběhy** (Magic Stories) — an AI-powered children's storybook platform by ANELA Digital ("SkyWhale"). Users create personalized illustrated storybooks and greeting cards using AI image generation, TTS audio, and AI-written stories.

## Commands

```bash
npm run dev        # Vite dev server (default port 5173)
npm run build      # tsc + vite build (production)
npm run lint       # ESLint (0 max-warnings, strict)
npm run preview    # Preview production build on port 5174

# Testing (vitest, no npm script defined)
npx vitest run                                 # Run all tests
npx vitest run src/tests/specific.test.ts      # Run a single test file
npx vitest                                     # Watch mode
```

## Required Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The app degrades gracefully when these are absent (platform features disabled, warning logged).

## Architecture

### Frontend Stack

- **React 18 + TypeScript + Vite** — SPA with React Router DOM for routing
- **Tailwind CSS + Framer Motion** — styling and animations
- **Zustand** — state management where used
- **i18next** — internationalization; Czech (`cs`) is the default, English (`en`) is secondary

### Feature-Sliced Design (FSD)

All product features live in `src/features/<feature-name>/`. Key features:

| Feature | Purpose |
|---|---|
| `story-builder` | Multi-step story creation wizard (`StorySetup`) |
| `reader` | Paginated storybook reader (`BookReader`) |
| `card-studio` | Greeting card editor with Konva canvas |
| `custom-book` | Custom book editor with Magic Mirror (face reference) |
| `discovery` | Public book discovery/browsing hub |
| `library` | User's personal book library |
| `game-hub` | Mini-games and gamification |
| `auth` | Supabase authentication |
| `store` | Energy purchase (Stripe) |
| `profile` | User profile management |

### The Three-Layer Rule (from `DEVELOPMENT_STATE.md`)

1. **No direct Supabase/AI calls in UI components.** Use adapters (`src/providers/`) or custom hooks (`src/hooks/`).
2. **New features must be created in `src/features/`**, not `src/components` (shared UI only).
3. **`App.tsx` is an orchestrator only** — top-level state and provider composition, nothing else.

### Core Libraries (`src/lib/`)

- **`supabase.ts`** — Supabase client; exports `supabase` and `getStorageUrl()`
- **`edge-functions.ts`** — `invokeEdgeFunction()`: all calls to Supabase Edge Functions go through this; it handles session refresh and direct `fetch()` (bypasses stale supabase-js tokens)
- **`ai.ts`** — `generateImage()` for Replicate (Flux 2 Pro / Flux Dev); exports `STYLE_PROMPTS` map
- **`storyteller.ts`** — `generateStoryStructure()` calling the `generate-story-content` Edge Function; has known legacy TypeScript errors (non-blocking)
- **`moderation.ts`** — OpenAI Moderation API wrapper; called pre-generation in Card Studio and Smart Quotes
- **`ai/orchestrator.ts`** — `generateCompleteStory()`: the 3-phase story generation pipeline

### Story Generation Pipeline (`src/lib/ai/orchestrator.ts`)

**Phase 1 — Structure:** Calls `generate-story-content` Edge Function → returns pages array, cover prompt, identity prompt, visual DNA (JSON schema).

**Phase 2 — Visual DNA:** Generates a hero portrait via Flux Dev as the identity reference image.

**Phase 3 — Illustration:** Generates cover + all page images via `generateImage()`, injecting character references (10-slot identity lock protocol).

### Supabase Edge Functions (`supabase/functions/`)

| Function | Purpose |
|---|---|
| `generate-story-content` | Story text + structure generation (AI model via OpenAI-compatible API) |
| `generate-story-image` | Flux 2 Pro image generation with multi-reference slots |
| `skywhale-flux` | Flux Dev for card studio, stickers, backgrounds |
| `generate-audio` | ElevenLabs TTS (1 Energy per 20 characters) |
| `process-story-image` | Post-processing pipeline for generated images |
| `create-checkout` | Stripe checkout session creation |
| `stripe-webhook` | Stripe payment webhook handler |
| `cleanup-storage` | Storage maintenance |

Edge Functions are Deno/TypeScript. `generate-story-image` has JWT verification disabled in Supabase Dashboard; auth is handled internally via `supabase.auth.getUser()`.

### Adapters (`src/providers/`)

Each adapter abstracts a feature's data dependencies:
- `useCardStudioAdapter` — Card Studio ↔ Supabase + AI
- `useGameHubAdapter` — Game Hub ↔ Supabase
- `useLibraryAdapter` — Library ↔ Supabase
- `useBookReaderAdapter` — Book Reader ↔ Supabase

### Shared Hooks (`src/hooks/`)

- **`useStory`** — story CRUD and generation state
- **`useGemini`** — Google Gemini AI (guides, hints, creative text)
- **`useEnergy`** — user energy balance management
- **Core hooks** (`src/hooks/core/`): `useAppAuth`, `useAppNavigation`, `useMagicTransition`, `useUrlHandlers`

### Data Model (`src/types/index.ts`)

Key types: `StoryBook`, `StoryPage`, `UserProfile`, `Achievement`, `CardProject`. These are the shared data contracts across the entire app.

### Dual-Language Content Architecture

- `text_cz` — Czech story text (user-facing, **absolute priority**)
- `text_en` — English translation
- `art_prompt_en` — English-only (AI image generation prompts)

All AI text generation enforces Czech output for `text_cz` fields. Art prompts are always in English.

### Energy Economy

- **Flux 2 Pro (story images):** 50 Energy / image
- **Flux Dev (card studio/stickers):** 30 Energy / image
- **Audio (ElevenLabs):** 1 Energy per 20 characters (min 1)

### Path Alias

`@` maps to `src/` (configured in both `vite.config.ts` and `vitest.config.ts`).
