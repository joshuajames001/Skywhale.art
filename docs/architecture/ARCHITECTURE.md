# Skywhale System Architecture

## 1. Project Vision
**Skywhale** is a next-generation AI-powered platform designed to revolutionize children's storytelling and creativity. It combines:
- **AI Story Generation**: Custom illustrated stories created on-demand.
- **Interactive Reading**: An immersive reader for exploring content.
- **Creativity Tools**: "Wish Studio" (Ateliér přání) for e-cards and a "Custom Book" editor.
- **Gamified Learning**: An "Encyclopedia" (Discovery) and "Arcade" (GameHub) to make learning fun.
- **Economy**: An energy-based system that rewards engagement and manages resource usage.

## 2. Feature-Sliced Design (FSD) Paradigm
This project strictly adheres to **Feature-Sliced Design (FSD)** constraints to maintain scalability and modularity.

### Directory Structure & Strict Rules
- **`src/features/`**: The core of the application. Contains **Domain-Specific Modules**. Each folder here represents a distinct business domain with its own state, components, and logic.
- **`src/components/`**: **RESTRICTED ZONE.** strictly for **"Dumb", Shared UI Elements** (buttons, inputs) and **Layout Wrappers**.
    - **Prohibited:** Business logic, data fetching, state management, or feature-specific code.
- **`src/hooks/`**: Global, cross-cutting hooks (e.g., `useToast`). Feature-specific hooks belong in `src/features/<domain>/hooks`.
- **`src/lib/`**: Configuration, helpers, and third-party integrations (Supabase, OpenAI).
- **`src/types/`**: Global TypeScript definitions (`src/types/index.ts`).
- **`src/config/`**: Static configuration and data files (`src/config/data.ts`).
- **`src/app/`**: Application startup and bootstrap logic.

### Project Root Hygiene
- **`logs/`**: All compilation logs, error reports, and temporary output files must be directed here. The project root should remain clean.

## 3. The Domains (Feature Inventory)
The application logic is partitioned into the following domains within `src/features/`:

### 🎨 Content Creation
- **`story-builder`**: The AI engine. Orchestrates the generation of text and images for new stories. Handles the "Wizard" flow.
- **`custom-book`**: A manual editor allowing users to write, illustrate, and publish their own books from scratch.
- **`card-studio` (Ateliér přání)**: A creative studio for designing and sending digital greeting cards (e-cards).

### 📚 Content Consumption
- **`discovery` (Encyclopedia)**: The knowledge hub. Users explore categories, animals, and facts.
- **`reader`**: The dedicated interface for reading books, featuring page-turning animations and immersive layouts.
- **`library`**: The user's personal vault. Stores generated stories, saved custom books, and favorite items.

### 🎮 Gamification & Engagement
- **`game-hub` (Arcade)**: A collection of mini-games (Pexeso, Puzzle, Coloring) to engage users between reading sessions.
- **`gamification`**: Manages retention mechanics like Daily Rewards, Streaks, and unlocking logic.
- **`profile`**: Manages user identity, statistics (levels, badges), settings, and achievements.
- **`social`**: Manages user interactions, reactions (likes/stars) on books, and community features.
- **`feedback`**: Community feedback board for suggestions and bug reports.
- **`onboarding`**: Guide overlays, coach marks, and tutorial flows.

### ⚙️ Core & Infrastructure
- **`auth`**: Handles user authentication, registration, password recovery, and session management.
- **`store`**: The commercial interface for purchasing "Energy" packs or managing subscriptions.
- **`landing`**: Public-facing marketing pages and "Hero" sections to convert visitors.
- **`navigation`**: The "NavigationHub" orchestrator that manages the main application dock and routing menu.
- **`legal`**: Legal documents (Terms of Service, Privacy Policy, Cookie Consent).
- **`audio`**: Manages background music, sound effects, and voice-overs.

## 4. The Financial & Energy Engine
The economy of Skywhale relies on a strict **Server-Side Authority** model to prevent fraud.

### Energy System
- **Source of Truth**: The `energy_balance` column in the `profiles` table.
- **Security**: This column is **Read-Only** for the client (RLS policies). It can ONLY be modified via secure Database Functions (RPCs).

### Active RPCs (Remote Procedure Calls)
All sensitive transactions are executed via atomic, `SECURITY DEFINER` PostgreSQL functions:
1.  **`claim_daily_reward()`**: Checks the last claim date, increments the streak, calculates the reward multiplier, and updates the balance in a single transaction.
2.  **`grant_achievement_reward(achievement_id)`**: Verifies if an achievement is unlocked but unclaimed, then grants the associated energy.
3.  **`claim_monthly_energy()`**: Processes subscription-based monthly grants.

## 5. State & Data Flow
- **Adapters**: We utilize the "Adapter Pattern" (e.g., `GameHubAdapter`) to decouple complex UI components from direct API calls. This allows for easier testing and mocking.
- **Hooks**: Logic is extracted into custom hooks (e.g., `useProfileStats`, `useDailyReward`) to keep UI components clean.
- **Ghost Code Prevention**: We actively audit components (especially layout/navigation) to ensure they do not fetch data they do not render. Unused database calls are treated as technical debt and removed.
- **Local State**: Complex features (like `story-builder`) manage their transient state locally or via Context before persisting to Supabase.

## 6. Code Splitting & Lazy Loading

> Přidáno: 2026-03-23 (GF-16)

Route definitions live in `src/app/routes.tsx`. App.tsx renders them inside a single `<Suspense>` boundary. 10 feature components are lazy-loaded via `React.lazy()`, producing separate Vite chunks (16–43 kB each). Main bundle reduced from 1329 kB to 995 kB.

Non-lazy components (PricingPage, FeedbackBoard, EnergyStore, CardViewer, LegalAgreements) stay in the main bundle due to small size.

Providers wrap their lazy children directly in the route config, not in App.tsx.

## 7. Mobile Responsive Architecture

> Přidáno: 2026-03-27 (GF-166/175)

### Dual-Variant Pattern
Complex editors use a **Desktop/Mobile split** with a shared orchestrator:

```
FeatureEditor.tsx          → orchestrátor (hooks, state, logic)
  ├─ FeatureDesktop.tsx    → desktop layout (beze změny z originálu)
  └─ FeatureMobile.tsx     → dedicated mobile UI
```

Detection via `useMediaQuery('(min-width: 768px)')` from `src/hooks/useMediaQuery.ts`.

**Active implementations:**
- `CustomBookEditor` → `CustomBookEditorDesktop` / `CustomBookEditorMobile`
- `GreetingCardEditor` → `CardStudioDesktop` / `CardStudioMobile`

### SharedProps Pattern
Each editor defines a `SharedEditorProps` / `SharedCardStudioProps` interface in its `types.ts`. The orchestrator creates one props object and passes it to whichever variant is active. Zero logic duplication.

### Mobile UI Patterns
- **Bottom sheets** (Framer Motion slide-up, z-[90]/z-[91]) for pickers, menus, editors
- **Swipeable views** (`motion.div` with `drag="x"`) for tab-like navigation
- **Bottom toolbar** with icon+label tabs for tool switching
- **Page strip** with horizontal scroll thumbnails for page navigation
- **44px minimum touch targets** (Apple HIG + WCAG compliance)
- **Overflow menu** (⋯) for secondary actions (save, export, share)

### Tailwind Conventions
- Mobile-first: base classes = mobile, `sm:` / `md:` for larger screens
- Touch targets: `min-w-[44px] min-h-[44px]`
- Canvas sizing: `Math.min(containerWidth, maxPx)` with resize listener
- Purple accent system: `#534AB7` / `#EEEDFE` / `#AFA9EC`
