# God Components Audit

> **Datum:** 2026-03-23 | **Zdroj:** GitNexus (884 nodes, 1583 edges) + statická analýza

## Kritické god komponenty (doporučeno rozdělit)

| Soubor | Řádky | Stav | Řešení |
|--------|-------|------|--------|
| `GreetingCardEditor.tsx` | ~~671~~ → 120 | ✅ GF-175 | Split: orchestrátor + CardStudioDesktop + CardStudioMobile + mobile/panels/ + mobile/sheets/ |
| `ToolsDock.tsx` | ~~547~~ → 158 | ✅ GF-13 | Split do 5 tool sections |
| `useCustomBookEditor.ts` | ~~485~~ → 170 | ✅ GF-11 | Split: useBookEditorAI + useBookEditorPersistence |
| `App.tsx` | ~~258~~ → 86 | ✅ GF-16 | Split: routes.tsx, lazy imports, code splitting |

## Velké, ale méně provázané (sledovat)

| Soubor | Řádky | Importy | Poznámka |
|--------|-------|---------|----------|
| `LandingPage.tsx` | 469 | 7 | Velký ale self-contained (marketing) |
| `CinematicLanding.tsx` | 435 | — | Vizuální, málo závislostí |
| `Library.tsx` | 364 | 14 | 14 importů + 10 degree — roste |
| `BookCard.tsx` | 363 | 9 | 17 degree — překvapivě propojený na kartičku |
| `GameHub.tsx` | 322 | 12 | 22 degree — orchestruje 4+ mini-hry |
| `BookReader.tsx` | 316 | 14 | 18 degree |
| `BackgroundOrchestrator.tsx` | 294 | — | Animace, self-contained |

## Nejvíc importované soubory (blast radius při změně)

| Importuje ho X souborů | Soubor | Riziko |
|------------------------|--------|--------|
| 36 | `features/custom-book/types.ts` | HIGH |
| 36 | `features/card-studio/types.ts` | HIGH |
| 35 | `lib/supabase.ts` | HIGH (expected) |
| 10 | `types/discovery.ts` | MEDIUM |
| 8 | `lib/edge-functions.ts` | MEDIUM |
| 8 | `lib/content-policy.ts` | MEDIUM |

## Anomálie

- **`getUser` v `ReactionBar.tsx`** — degree 28, extrémně vysoké pro funkci uvnitř social komponenty. Měla by být extrahovaná do sdíleného utility.
- **`card-studio/types.ts`** a **`custom-book/types.ts`** — GitNexus hlásil degree 36, ale grep ukázal 0 přímých importů mimo vlastní feature. Degree byl tvořen transitivními hranami. Typy jsou správně feature-lokální — žádná akce nepotřeba. (Ověřeno 2026-03-23, GF-15 closed as no-op.)

## Doporučené refaktory (prioritizováno)

1. **`GreetingCardEditor.tsx` (671 řádků, degree 32)** — rozdělit na `useCardEditorState` hook + menší sub-komponenty (`CardToolbar`, `CardPreview`, `CardAIGenerator`)
2. **`useCustomBookEditor.ts` (485 řádků, degree 28)** — extrahovat AI logiku do `useBookEditorAI`, persistence do `useBookEditorPersistence`
3. **`App.tsx` (37 importů)** — lazy importy + route config objekt by snížily coupling
4. **`getUser` z `ReactionBar.tsx`** — extrahovat do `src/hooks/` nebo `src/lib/`
5. **Feature-lokální types** — zhodnotit jestli `card-studio/types.ts` a `custom-book/types.ts` nepatří do `src/types/`
