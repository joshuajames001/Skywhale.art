# Tech Stack

> Aktualizováno: 2026-03-23

## Frontend

| Technologie | Verze | Účel |
|-------------|-------|------|
| React | 18.x | UI framework |
| TypeScript | 5.2 | Type safety |
| Vite | 5.4 | Build tool + dev server |
| React Router DOM | 7.13 | Routing (lazy-loaded routes) |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | — | Animace a přechody |
| Zustand | — | State management (useGuide) |
| i18next | — | Internationalizace (CS/EN) |
| Konva + react-konva | — | Canvas editor (Card Studio) |
| Lottie | — | Vektorové animace |

## Backend (Supabase)

| Služba | Účel |
|--------|------|
| Supabase Auth | Autentizace uživatelů |
| Supabase Database (PostgreSQL) | Persistence (books, pages, profiles) |
| Supabase Storage | Obrázky (story-assets, audio-books) |
| Supabase Edge Functions (Deno) | Serverless backend logic |
| Supabase RPC | Atomické transakce (energy, rewards) |

## AI Services

| Služba | Model | Účel |
|--------|-------|------|
| Replicate | Flux 2 Pro | Story ilustrace (50 Energy) |
| Replicate | Flux Dev / Schnell | Card Studio, samolepky (30 Energy) |
| Anthropic | claude-sonnet-4-6 | Story struktura generace |
| Google | gemini-2.5-flash | Suggestions, image prompts, ideas, dictionary, moderace |
| ElevenLabs | — | TTS audio (1 Energy / 20 znaků) |

## Platby

| Služba | Účel |
|--------|------|
| Gumroad | Subscription tiers + one-time packages |

## Edge Functions

| Funkce | Runtime | AI Model |
|--------|---------|----------|
| `generate-story-content` | Deno | Anthropic + Gemini |
| `book-editor-assist` | Deno | Gemini |
| `content-tools` | Deno | Gemini |
| `generate-story-image` | Deno | Replicate (Flux 2 Pro) |
| `skywhale-flux` | Deno | Replicate (Flux Dev/Schnell) |
| `generate-audio` | Deno | ElevenLabs |
| `gumroad-webhook` | Deno | — |
| `process-story-image` | Deno | Replicate (legacy) |
| `cleanup-storage` | Deno | — |

## Dev Tools

| Nástroj | Účel |
|---------|------|
| Vitest | Unit + integration testy |
| GitNexus | Code intelligence (884 nodes, 1583 edges) |
| Linear | Issue tracking (projekt Skywhale.art) |
