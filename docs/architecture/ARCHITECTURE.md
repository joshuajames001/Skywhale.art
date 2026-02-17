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

### Directory Structure
- **`src/features/`**: The core of the application. Contains **Domain-Specific Modules**. Each folder here represents a distinct business domain with its own state, components, and logic.
- **`src/components/`**: Strictly for **"Dumb", Shared UI Elements** (buttons, inputs, layout frames). These components contain **NO business logic**.
- **`src/hooks/`**: Global, cross-cutting hooks (e.g., `useEnergy`, `useToast`).
- **`src/lib/`**: configuration, helpers, and third-party integrations (Supabase, OpenAI).

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
- **`profile`**: Manages user identity, statistics (levels, badges), and settings. *Recently refactored to pure FSD.*

### ⚙️ Core & Infrastructure
- **`auth`**: Handles user authentication, registration, password recovery, and session management.
- **`store`**: The commercial interface for purchasing "Energy" packs or managing subscriptions.
- **`landing`**: Public-facing marketing pages and "Hero" sections to convert visitors.
- **`audio`**: Manages background music, sound effects, and voice-overs.
- **`core`**: Shared kernel logic used across multiple features.

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
- **Adapters**: We utilizes the "Adapter Pattern" (e.g., `GameHubAdapter`) to decouple complex UI components from direct API calls. This allows for easier testing and mocking.
- **Hooks**: Logic is extracted into custom hooks (e.g., `useProfileStats`, `useDailyReward`) to keep UI components clean and focused on rendering.
- **Local State**: Complex features (like `story-builder`) manage their transient state locally or via Context before persisting to Supabase.
