# 03. Routing & Entry Architecture

> Aktualizováno: 2026-03-23 (po GF-16 lazy routes refactoru)

## 1. Route Configuration

Všechny routes jsou definovány v **`src/app/routes.tsx`** jako typed config array.
`App.tsx` je jen orchestrátor — renderuje `<Routes>` uvnitř `<Suspense>`.

```typescript
// src/app/routes.tsx
export const createRoutes = (ctx: RouteContext): RouteConfig[] => [
    { path: '/terms', element: ... },
    { path: '/library', element: ... },
    ...
];

// src/App.tsx
const routes = createRoutes({ navigate, user, ... });
<Suspense fallback={<div className="min-h-screen bg-black" />}>
    <Routes>
        {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    </Routes>
</Suspense>
```

## 2. Lazy-Loaded Components (Code Splitting)

10 komponent je lazy-loaded. Vite je automaticky splituje do separátních chunků.

| Component | Export type | Chunk size |
|-----------|-----------|------------|
| CinematicLanding | named | ~26 kB |
| LandingPage | named | ~16 kB |
| Library | named | ~28 kB |
| GameHub | named | ~36 kB |
| DiscoveryHub | named | ~26 kB |
| CreateStoryWrapper | named | ~43 kB |
| CustomBookEditor | **default** | ~40 kB |
| CardStudioWrapper | named | ~40 kB |
| UserProfile | named | ~22 kB |
| BookRouteWrapper | named | ~27 kB |

Named exporty používají: `.then(m => ({ default: m.ComponentName }))`
Default export používá přímý: `lazy(() => import('./path'))`

## 3. The Entry Point Strategy

| Zóna | Path | Component | UI |
|------|------|-----------|----|
| Public Face | `/` | CinematicLanding | Bez navigace, immersive |
| App Hub | `/home`, `/library`, `/studio`, ... | AppLayout + Feature | Plné UI (dock, nav) |

**STRICT RULE:** `/` MUST renderovat `CinematicLanding`. Bez Global Navbar.

## 4. Non-Lazy Routes (vždy v hlavním bundlu)

PricingPage, FeedbackBoard, EnergyStore, CardViewer, LegalAgreements — malé komponenty,
zůstávají v hlavním bundlu (static import v routes.tsx).

## 5. Provider Wrapping

Providers (LibraryProvider, GameHubProvider, CardStudioProvider) obalují lazy komponenty
přímo v route config, ne v App.tsx:

```typescript
{ path: '/library', element: (
    <LibraryProvider adapter={ctx.libraryAdapter}>
        <LazyLibrary ... />
    </LibraryProvider>
)}
```
