# 03. Routing & Entry Architecture

> **STRICT RULE:** The Application Root (`/`) MUST always render the `CinematicLanding` component.

## 1. The Entry Point Strategy
The application is divided into two conceptual zones:

1.  **The Public Face (SaaS Intro)**
    *   **Path:** `/`
    *   **Component:** `CinematicLanding.tsx`
    *   **Immersive Rule:** NO Global Navigation Bar. NO Sidebar. The user enters a "movie theater" experience.

2.  **The App Hub (Internal Tool)**
    *   **Path:** `/home` (and children like `/library`, `/studio`, `/profile`)
    *   **Component:** `AppLayout` + Feature Routes
    *   **UI:** Full "Sky Whale" OS Interface (Dock, Navigation).

## 2. Implementation Detail
In `AppLayout.tsx`, we enforce the visual separation:

```typescript
const isLanding = location.pathname === '/';

// Logic:
// If isLanding === true -> HIDE NavigationHub
// If isLanding === false -> SHOW NavigationHub
```

## 3. Strict Prohibitions
*   **NEVER** route the logged-in user directly to `/home` if they explicitly requested `/`. The Landing Page is part of the experience.
*   **NEVER** add the Global Navbar to the `CinematicLanding` component. It destroys the immersion.
