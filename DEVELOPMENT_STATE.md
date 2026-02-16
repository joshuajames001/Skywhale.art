# DEVELOPMENT STATE

This file serves as the **Source of Truth** for the current state of refactoring.

## 1. Current Architecture Progress
- **Feature Extraction:**
  - `card-studio` has been successfully extracted to `src/features/card-studio`.
  - `game-hub` has been successfully extracted to `src/features/game-hub`.
- **Adapter Pattern:**
  - Implemented `src/providers` to handle external dependencies.
  - `useCardStudioAdapter` and `useGameHubAdapter` now abstract Supabase and AI logic.

## 2. Current Project Health
- **App.tsx Size:** Reduced to **778 lines** (previously >900).
- **Goal:** Continue reducing `App.tsx` complexity by extracting efficient modules.
- **Known Issues:**
  - `src/lib/storyteller.ts` contains legacy TypeScript errors that are currently ignored but must be addressed eventually.
  - `src/lib/supabase.ts` and global hooks (`useStory`, `useGemini`) remain in place as shared resources.

## 3. Strategic Rules (The Constitution)
> [!IMPORTANT]
> Adhere to these rules strictly during future development.

1.  **Rule 1:** **No direct Supabase or AI calls in UI components.** Always use an Adapter or custom hook from `src/providers` or `src/hooks`.
2.  **Rule 2:** **New features must be created in `src/features/`**. Do not add to `src/components` unless it is a shared UI element.
3.  **Rule 3:** **`App.tsx` is an orchestrator only.** It should only manage top-level state and provider composition.

## 4. Next Planned Steps
1.  **Module Extraction:** Extract the next large module (likely **Library** or **Encyclopedia**).
2.  **Routing:** Implement **React Router** to replace the conditional `viewMode` rendering in `App.tsx`.
3.  **Refactoring:** Address the legacy errors in `storyteller.ts` to improve type safety.

*State saved: 2026-02-15*
