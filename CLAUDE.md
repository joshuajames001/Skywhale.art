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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ann** (877 symbols, 1576 relationships, 31 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/ann/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/ann/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ann/clusters` | All functional areas |
| `gitnexus://repo/ann/processes` | All execution flows |
| `gitnexus://repo/ann/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
