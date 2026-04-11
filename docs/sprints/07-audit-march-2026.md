# Audit: Komponenty, naming, shared logic

> **Datum:** 2026-03-23 | **Zdroj:** Statická analýza + GitNexus (884 nodes)

## Velké soubory (nad 200 řádků)

34 souborů celkem. Kandidáti na budoucí split:

| Řádky | Importy | Soubor | Poznámka |
|-------|---------|--------|----------|
| 469 | 7 | `landing/components/LandingPage.tsx` | Self-contained marketing — OK |
| 435 | 5 | `landing/components/CinematicLanding.tsx` | Vizuální — OK |
| 364 | 14 | `library/Library.tsx` | Orchestruje knihovnu — kandidát |
| 363 | 9 | `library/BookCard.tsx` | Velká karta — kandidát |
| 335 | 1 | `game-hub/magic-coloring/useImageSegmentation.ts` | Algoritmus — OK |
| 322 | 12 | `game-hub/GameHub.tsx` | Orchestruje 4 hry — kandidát |
| 316 | 14 | `reader/BookReader.tsx` | Kandidát |
| 307 | 13 | `story-builder/components/modes/CustomMode.tsx` | Kandidát |
| 302 | 4 | `hooks/useStory.ts` | Sdílený hook — OK |
| 298 | 5 | `discovery/components/BookReader.tsx` | NAMING CONFLICT |
| 294 | 2 | `core/components/BackgroundOrchestrator.tsx` | Animace — OK |
| 281 | 6 | `store/components/EnergyStore.tsx` | Sledovat |
| 279 | 6 | `story-builder/components/shared/StoryChat.tsx` | Sledovat |
| 274 | 6 | `profile/components/PublicProfile.tsx` | Sledovat |
| 272 | 2 | `lib/storyteller.ts` | Legacy TS errors — OK |
| 268 | 3 | `game-hub/MemoryGame.tsx` | Sledovat |
| 256 | 2 | `lib/ai.ts` | Focused lib — OK |
| 255 | 3 | `story-builder/components/effects/MagicLoading.tsx` | Animace — OK |
| 255 | 5 | `card-studio/CardCanvas.tsx` | Konva canvas — OK |
| 244 | 19 | `components/layout/AppLayout.tsx` | 19 importů — kandidát |

## Naming konflikty

### CRITICAL: Duplicitní BookReader

| Soubor | Feature | Export |
|--------|---------|--------|
| `features/reader/BookReader.tsx` | reader | `BookReader` — hlavní čtečka knih |
| `features/discovery/components/BookReader.tsx` | discovery | `BookReader` — discovery preview |

**Doporučení:** Přejmenovat discovery verzi na `DiscoveryReader.tsx`.

### "Card" naming chaos

11+ souborů s "Card" napříč 5 features. V card-studio znamená greeting card, jinde info card/tile.

**Doporučení:** Žádná akce nutná — kontext je jasný z feature složky.

### Nekonzistentní export

`features/custom-book/components/CustomBookEditor.tsx` je jediný soubor s `export default` v celém projektu. Všechny ostatní používají named exporty.

## FSD porušení — cross-feature importy

Všechna porušení se týkají `audio` feature (importovaná ze 4 jiných features):

| Importující soubor | Co importuje |
|---------------------|-------------|
| `custom-book/components/EditorToolbar.tsx` | `VoicePreviewButton` |
| `library/Library.tsx` | `AudioConfirmDialog` |
| `reader/BookReader.tsx` | `MiniPlayer`, `AudioConfirmDialog` |
| `story-builder/modes/CustomMode.tsx` | `VoicePreviewButton` |
| `story-builder/modes/HeroMode.tsx` | `VoicePreviewButton` |

**Doporučení:** Přesunout `VoicePreviewButton`, `AudioConfirmDialog`, `MiniPlayer` do `src/components/audio/` (sdílené UI).

## Three-Layer Rule porušení

22 přímých Supabase volání v UI komponentách:

| Feature | Počet | Soubory | Závažnost |
|---------|-------|---------|-----------|
| story-builder | 4 | HeroMode.tsx, StorySetup.tsx | HIGH |
| feedback | 2 | FeedbackBoard.tsx | HIGH |
| library | 2 | ReportDialog.tsx | HIGH |
| social | 1 | ReactionBar.tsx | HIGH |
| discovery | 2 | utils.ts | MEDIUM |
| auth | 2 | Auth.tsx | LOW (auth je speciální případ) |
| custom-book | 9 | useBookEditorPersistence.ts | OK (je to hook) |
| App.tsx | 1 | signOut handler | LOW |

## Duplicitní logika

| Duplikát | Kde | Doporučení |
|----------|-----|------------|
| `generateId()` (Math.random) | `card-studio/hooks/useCardEditorState.ts`, `card-studio/data/templates.ts` | → `src/lib/id-utils.ts` |
| `STORY_COSTS` objekt | `story-builder/modes/CustomMode.tsx`, `story-builder/modes/HeroMode.tsx` | → `src/lib/constants.ts` |

## Doporučené sprinty

1. **Quick wins:** Přejmenovat DiscoveryReader, extrahovat STORY_COSTS + generateId, named export CustomBookEditor
2. **Audio shared:** Přesunout audio komponenty do `src/components/audio/`
3. **Three-Layer:** Adapter hooks pro FeedbackBoard, ReportDialog, ReactionBar, StorySetup, HeroMode
4. **God components (volitelné):** Library.tsx, BookCard.tsx, GameHub.tsx
