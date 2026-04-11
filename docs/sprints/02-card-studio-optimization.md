# 02. Card Studio (Ateliér) Optimization

> **STRICT RULE:** The Card Studio (Greeting Cards) MUST NOT use the heavy `generate-story-image` (Flux Pro) endpoint.

## 1. The "Schnell" Lane
Greeting cards require speed and interactivity, not the ultra-coherence of a storybook. Therefore, the architecture bifurcates:

*   **Story Builder:** Uses `Flux 2 Pro` (High Cost, High Latency, High Coherence).
*   **Card Studio:** Uses `Flux Schnell` (Low Cost, Low Latency, "Good Enough" Quality).

## 2. The Implementation Flow
The Card Studio uses a dedicated adapter pattern to enforce this rule.

1.  **Component:** `GreetingCardEditor.tsx`
2.  **Hook:** `useCardStudioAdapter.ts`
3.  **Edge Function:** `skywhale-flux` (NOT `generate-story-image`)
4.  **Model:** `black-forest-labs/flux-schnell` (Hardcoded in adapter)

## 3. Supported Modes
The Adapter supports two specific generation modes:

### A. Sticker Mode (`mode: 'sticker'`)
*   **Purpose:** Generating isolated elements (pumpkins, hearts, characters).
*   **Prompting:** Automatically appends "isolated on white background, die-cut sticker" (or similar logic).
*   **Post-Process:** Frontend handles background removal (if applicable).

### B. Background Mode (`mode: 'background'`)
*   **Purpose:** Generating full-card textures or scenes.
*   **Prompting:** Optimized for seamless or fill-coverage textures.

## 4. Strict Prohibitions
*   **NEVER** import `orchestrator.ts` into the Card Studio.
*   **NEVER** use the "StoryBook" type for Card Projects. They are distinct entities.
