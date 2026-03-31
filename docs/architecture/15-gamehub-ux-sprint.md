# Sprint 15: GameHub & UX (2026-03-31)

## Cíl
Vizuální overhaul GameHub (light mode, ilustrační background, herní karty), cleanup dead code, prefetch pattern pro BookReader, odstranění nefunkčního AiChat mode, a restrukturalizace mobile navigace na 4+burger pattern.

## Dokončené issues

### GameHub Vizuální Overhaul (GF-233)
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-233 | Dead code: smazán useEdgeDetection.ts (217 řádků) | `magic-coloring/useEdgeDetection.ts` (deleted) |
| GF-233 | 7× console.log odstraněno z game-hub/ | `GameHub.tsx`, `ColoringCanvas.tsx` |
| GF-233 | Tailwind dynamic class bug: `border-${color}` → statická mapa | `GameMenu.tsx` |
| GF-233 | Light mode background → ilustrační bg ze Supabase Storage | `GameHub.tsx` |
| GF-233 | Statický root wrapper (žádné blikání při view změnách) | `GameHub.tsx` |
| GF-233 | MemoryGame full-bleed obrázky (object-contain → object-cover) | `MemoryGame.tsx` |
| GF-233 | PuzzleGame referenční obrázek zvětšen (w-20 → w-32, md:w-48) | `PuzzleGame.tsx` |
| GF-233 | Kontrast textu/karet pro light bg | `GameHub.tsx`, `GameMenu.tsx`, `BookSelector.tsx`, `DifficultySelector.tsx`, `PageSelector.tsx`, `MagicMirrorGame.tsx` |

### BookReader & Story Pipeline
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-236 | usePrefetchNextPage hook — tiché generování N+1 | `src/features/reader/hooks/usePrefetchNextPage.ts` (new), `BookReader.tsx` |
| GF-237 | AiChat mode removed (chat-turn/ask-architect neexistují v EF) | `AiChatMode.tsx` (del), `StoryChat.tsx` (del), `useStoryChat.ts` (del), `StorySetup.tsx` |
| GF-238 | PDF CORS fix — textury lokálně v public/textures/ | 7 souborů + `public/textures/stardust.png`, `graphy.png` |

### Mobile Navigation
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-233 | 4+burger pattern: Home, Knihovna, Vlastní kniha, Herna + BottomSheet | `NavigationHub.tsx` |

## Klíčová architektonická rozhodnutí

### 1. GameHub statický background wrapper

**Problém:** Background obrázek byl aplikovaný na každý view wrapper zvlášť (4× early return). Při přepínání views background blikal a přenačítal se.

**Řešení:** Jeden root `motion.div` s `fixed inset-0` + `backgroundImage`. Overlay `bg-white/35` jako statický child. Game/menu views jako `relative z-10` children — přepínají se bez re-renderu backgroundu.

### 2. Mobile nav 4+burger

**Problém:** ScrollableRow s 10 položkami — horizontální scroll na mobilu je špatný UX, uživatel nevidí všechny položky.

**Řešení:** 4 hlavní tlačítka (`flex justify-around`) + "Více" burger → `BottomSheet` (existující komponenta z Card Studio). Burger obsahuje 8 sekundárních položek se zvýrazněním aktivní sekce (`bg-purple-50`).

**Výběr hlavních 4:** Home (navigace), Knihovna (core), Vlastní kniha (creation), Herna (nově přidaná). Příběh a Ateliér v burgeru — jsou méně frekventované.

### 3. BookReader prefetch (GF-236)

**Pattern:** `usePrefetchNextPage` hook sleduje `story.pages[currentIndex].image_url`. Když se změní z null na URL (generování dokončeno), spustí se `generateImage()` pro stránku N+1.

**Ochranné mechanismy:**
- `prefetchedRef` Set — žádné duplikáty
- `inFlightRef` — max 1 concurrent prefetch
- Přeskakuje stránky s existujícím obrázkem
- Non-fatal error handling (console.warn)
- Energy se strhává normálně (žádná změna v deduct RPC)

### 4. Tailwind dynamic class fix

**Problém:** `border-${color}-400/30` v GameMenu.tsx — Tailwind neparsuje runtime string interpolaci, třída se negeneruje.

**Řešení:** Rozšíření existující `colorStyles` mapy o `orbital` field s plnými statickými třídami (`border-amber-400/30`, `border-cyan-400/30`, atd.). Lookup místo interpolace.

## Smazané soubory (dead code)

| Soubor | Řádky | Důvod |
|--------|-------|-------|
| `src/features/game-hub/magic-coloring/useEdgeDetection.ts` | 217 | 0 importerů, nahrazeno useImageSegmentation |
| `src/features/story-builder/components/modes/AiChatMode.tsx` | 23 | chat-turn akce neexistuje v EF |
| `src/features/story-builder/components/shared/StoryChat.tsx` | 233 | Závislost AiChatMode |
| `src/features/story-builder/hooks/useStoryChat.ts` | 55 | chat-turn + ask-architect API volání |

### Mobile Optimalizace (GF-233b)
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-233b | PuzzleGame tap-to-swap: tap A (amber highlight) → tap B → swap | `PuzzleGame.tsx` |
| GF-233b | MemoryGame responsive grid: `grid-cols-3 sm:grid-cols-4` | `MemoryGame.tsx` |
| GF-233b | ColoringToolbar back button: `p-2` → `p-3` (44px min) | `ColoringToolbar.tsx` |
| GF-233 | Burger menu z-index fix: nav bar skryt při otevřeném BottomSheet | `NavigationHub.tsx` |

### 5. PuzzleGame tap-to-swap (GF-233b)

**Problém:** HTML5 DragEvent nefunguje na touch zařízeních — puzzle na mobilu nehratelný.

**Řešení:** Tap-to-swap pattern místo drag-and-drop:
1. Tap na piece A → `selectedPiece = index`, amber ring highlight (`ring-2 ring-amber-400`)
2. Tap na piece B → `handleSwap(A, B)`, `selectedPiece = null`
3. Tap na stejný piece → deselect
4. Drag-and-drop zůstává funkční pro desktop

Jednoduchý, intuitivní pattern — uživatel vidí vybraný dílek a klikne kam ho chce přesunout.

## Zbývající GameHub tech debt

- ColoringCanvas: paint-by-number tap funguje, freehand kreslení by vyžadovalo `onTouchMove`
- GameHub: 12× `any` typy (ColoringCanvas, BookSelector, GameMenu, DifficultySelector)
- GameHub: 0 testů — potřeba test suite
- `FROG_PROTOCOL` v book-editor-assist — stále dead code, kandidát na smazání
