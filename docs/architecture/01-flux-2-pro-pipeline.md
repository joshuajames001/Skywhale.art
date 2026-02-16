# 01. Flux 2 Pro Pipeline & The "Three Sources of Truth"

> **STRICT RULE:** The Story Builder MUST use the `generate-story-image` endpoint with the `flux-2-pro` model for Cover and Page generation.

## 1. The Pipeline Flow
The generation pipeline follows a strict strict sequence to ensure character consistency without "Sheet Syndrome" (Grid artifacts).

1.  **Phase 1: Text & DNA**
    *   Generates the Story Structure and valid `visual_dna` text.
2.  **Phase 2: Character Sheet (Flux 1 Dev)**
    *   Generates a Grid/Sheet using Flux 1 Dev (Structure-capable).
    *   *Result:* `character_sheet_url`.
3.  **Phase 3: The Cover (Flux 2 Pro)**
    *   Generates a Cinematic Cover using **TEXT DNA ONLY**.
    *   *Critical:* We intentionally DISABLE the image reference here to prevent the model from replicating the grid structure.
4.  **Phase 4: The Pages (Flux 2 Pro)**
    *   **The Swap:** The System sets the Book's `character_sheet_url` to the **Cover URL** (if available).
    *   *Why:* The Cover becomes the "Cinematic Reference" for all subsequent pages.

## 2. The "Three Sources of Truth"
When `StorySpread.tsx` (The Reader) requests an image, it must pass three distinct "Truths" to the `ImageGenerator`:

1.  **The Visual DNA (Text):**
    *   `visualDna` string.
    *   *Role:* Provides the semantic description (Species, Colors, Vibe).
2.  **The Identity Reference (Image):**
    *   `referenceImageUrl`.
    *   *Mapped to:* `Slot 1` (Identity) in the Edge Function.
    *   *Source:* The **Cover Image** (preferred) or the original Sheet.
3.  **The Context (Prompt):**
    *   The Page Text / Action Prompt.
    *   *Role:* Describes the specific scene action.

## 3. Strict Prohibitions
> **WARNING:** Future Agents / Refactors

*   **NEVER** implement an automatic "Loop" that generates all pages at once.
    *   *Rule:* Page generation must be **Lazy** and **Manual** (User clicks "Generate").
    *   *Reason:* Cost control and User Experience.
*   **NEVER** merge `storyteller.ts` (Prompts) and `orchestrator.ts` (Sequence). They must remain separate.
