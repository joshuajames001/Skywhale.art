# 04. Feature-Sliced Design & Architectural Constraints

> Aktualizováno: 2026-03-23

## 1. Folder Structure Rules

| Adresář | Účel | Příklad |
|---------|------|---------|
| `src/features/` | Business logic — 1 složka = 1 doména | `features/story-builder/` |
| `src/components/` | Generic UI only (buttons, layout) | `components/layout/AppLayout.tsx` |
| `src/hooks/` | Sdílené cross-cutting hooks | `hooks/useStory.ts` |
| `src/lib/` | Konfigurace, helpery, integrace | `lib/ai.ts`, `lib/supabase.ts` |
| `src/types/` | Globální TypeScript typy | `types/index.ts` |
| `src/app/` | Route config a bootstrap | `app/routes.tsx` |
| `src/providers/` | Adapter hooks (feature ↔ Supabase/AI) | `providers/useCardStudioAdapter.ts` |

**Anti-Pattern:** `src/components/StoryGenerator.tsx`
**Correct:** `src/features/story-builder/components/StoryGenerator.tsx`

## 2. Feature Inventory (19 features)

### Content Creation
| Feature | Účel |
|---------|------|
| `story-builder` | AI story wizard (StorySetup, modes) |
| `custom-book` | Manuální editor knih (Magic Mirror, WriterPanel, IllustratorPanel) |
| `card-studio` | Greeting card editor (Konva canvas, ToolsDock) |

### Content Consumption
| Feature | Účel |
|---------|------|
| `discovery` | Veřejný browsing hub s kategoriemi a trailery |
| `reader` | Paginated storybook reader (BookReader, StorySpread) |
| `library` | Osobní knihovna uživatele |

### Gamification & Engagement
| Feature | Účel |
|---------|------|
| `game-hub` | Mini-hry (puzzle, memory, coloring) |
| `gamification` | Daily reward modal, streak systém |
| `profile` | Profil, achievementy, referraly, avatar |
| `social` | Reakce (ReactionBar) |
| `feedback` | Feedback board |
| `onboarding` | Tutorial overlaye, coach marks |
| `audio` | Audio playback, TTS controls, voice preview |

### Core & Infrastructure
| Feature | Účel |
|---------|------|
| `auth` | Supabase autentizace |
| `store` | Energy purchase (Gumroad tiers) |
| `landing` | Marketing landing pages |
| `navigation` | Global navigation hub |
| `legal` | Cookie consent, privacy, terms |
| `core` | Background animation orchestration |

## 3. Separation of Concerns

### The Brain: `orchestrator.ts` (`src/lib/ai/`)
- Sekvence, stav, "co dělat dál"
- Input: user preferences → Output: structured StoryBook

### The Mouth: `storyteller.ts` (`src/lib/`)
- Prompty, kreativita, "jak se zeptat AI"
- Input: StoryParams → Output: creative prompts (coverPrompt, visualDna, pages)

### The Hands: Edge Functions (`supabase/functions/`)
- Serverová logika, AI volání, platby
- 9 funkcí + 3 sdílené moduly

## 4. Strict Prohibitions

- **NEVER** circular import mezi features
- **NEVER** modifikovat core types (`src/types/index.ts`) bez impact analysis
- **NEVER** přímé Supabase/AI volání v UI komponentách — vždy přes adapter nebo hook
- **NEVER** business logic v `src/components/`
