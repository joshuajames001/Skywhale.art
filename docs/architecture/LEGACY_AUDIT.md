# Legacy Code Reconnaissance Report

**Date:** 2026-02-18
**Analyst:** System Architect
**Objective:** Assess remaining legacy files in `src/components` and root for FSD compliance.

## 1. Executive Summary
The audit reveals that **4 major features** are currently disguised as "Dumb Components" in `src/components/`. These contain complex business logic, Supabase integration, and state management, violating FSD principles. They must be promoted to the `features` directory to complete the architectural cleanup.

## 2. Detailed Analysis

### 🚨 Critical Misplacements (Must Move)

#### 1. `src/components/NavigationHub.tsx`
- **Current Status:** 15KB "Component".
- **Real Nature:** **Core Feature Orchestrator**.
- **Logic Found:**
    - Authentication state monitoring.
    - User Profile data fetching (`profiles.nickname`).
    - Routing logic for 10+ views.
    - Responsive layout logic (Desktop Dock vs Mobile Menu).
- **Recommendation:** move to `src/features/navigation/` or `src/features/ui/NavigationHub.tsx`.

#### 2. `src/components/community/FeedbackBoard.tsx`
- **Current Status:** 14KB "Component".
- **Real Nature:** **Community/Feedback Feature**.
- **Logic Found:**
    - Supabase CRUD (Read/Write `feedback` table).
    - Auth checks.
    - Tab switching logic (Read/Write).
    - Form validation.
- **Recommendation:** move to `src/features/feedback/` or `src/features/support/`.

#### 3. `src/components/guide/` (`GuideOverlay.tsx`, `CoachMark.tsx`)
- **Current Status:** Helper Components.
- **Real Nature:** **Onboarding Feature**.
- **Logic Found:**
    - DOM manipulation (coordinate calculation).
    - `useGuide` hook integration (stateful).
    - Hardcoded guide step data.
- **Recommendation:** move to `src/features/onboarding/` or `src/features/guide/`.

#### 4. `src/components/social/ReactionBar.tsx`
- **Current Status:** 5.5KB Component.
- **Real Nature:** **Social Interaction Feature**.
- **Logic Found:**
    - **Realtime Subscriptions** (`supabase.channel`).
    - Optimistic UI updates.
    - Complex aggregation logic.
- **Recommendation:** move to `src/features/social/` or `src/features/interactions/`.

### ⚠️ Content & UI (Low Priority)

#### 5. `src/components/legal/` (`PrivacyPolicy`, `Terms`, etc.)
- **Status:** Static Content.
- **Nature:** "Dumb" Pages.
- **Recommendation:** Can remain in `components/legal` or move to `features/legal`. Moving to `features/legal` aligns better with strict FSD (treating "Legal" as a domain).

#### 6. `src/components/Controls.tsx`
- **Status:** Pure UI.
- **Nature:** Reusable visual component.
- **Recommendation:** Keep in `src/components/ui/` or `src/features/reader/components/` if specific to reading.

## 3. Root Files Analysis

- **`src/types.ts`**: Contains Domain Entities (`StoryBook`, `UserProfile`, `Achievement`). In a mature FSD setup, these should be split into `dest/entities/`, but for now, a central `types.ts` is acceptable to avoid circular dependency hell during refactoring.
- **`src/data.ts`**: Trivial sample data. harmless.
- **`bootstrap.tsx`**: Emergency fallback. harmless.

## 4. Migration Action Plan
1.  **Refactor Navigation**: Extract `NavigationHub` to `features/navigation`.
2.  **Promote Features**: Move `community` -> `features/feedback`, `guide` -> `features/onboarding`, `social` -> `features/social`.
3.  **Clean Components**: Ensuring `src/components` ONLY contains strictly presentational code (buttons, inputs, layout frames).
