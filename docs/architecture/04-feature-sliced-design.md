# 04. Feature-Sliced Design & Architectural Constraints

> **STRICT RULE:** This codebase follows a strict Feature-Sliced Design philosophy. "Everything in its place."

## 1. folder Structure Rules
We do **NOT** dump complex business logic into generic folders.

*   `src/components/` -> **Generic UI Only.** Buttons, Inputs, Modals. No business logic.
*   `src/features/` -> **Business Logic.**
    *   `story-builder/` -> All logic for creating stories (`CustomMode`, `MagicWand`).
    *   `reader/` -> The Book Reader experience.
    *   `card-studio/` -> The Greeting Card Editor.
    *   `library/` -> User's saved content.

**Anti-Pattern:** Creating a file like `src/components/StoryGenerator.tsx`.
**Correct:** `src/features/story-builder/components/StoryGenerator.tsx`.

## 2. Separation of Concerns: The Brain vs. The Mouth

### The Brain: `orchestrator.ts`
*   **Responsibility:** Sequence, State, "What to do next".
*   **Input:** User preferences.
*   **Output:** A structured `StoryBook` object.
*   **Rule:** It does NOT write the creative text. It calls the Storyteller.

### The Mouth: `storyteller.ts`
*   **Responsibility:** Prompts, Creativity, "How to ask the AI".
*   **Input:** `StoryParams`.
*   **Output:** Creative Prompts (`coverPrompt`, `visualDna`, `pages`).
*   **Rule:** It performs sanitation (e.g., stripping technical jargon from DNA).

## 3. Strict Prohibitions
*   **NEVER** circular import between Features. If features need to share logic, move that logic to `src/lib` or `src/hooks` (if generic).
*   **NEVER** modify the "Core Types" (`src/types.ts`) without a full impact analysis of all Features.
