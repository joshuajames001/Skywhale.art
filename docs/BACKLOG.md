# Backlog & Roadmap

> Aktualizováno: 2026-03-24 | Zdroj: Linear (Skywhale.art) + audity

## Stav projektu

- **Linear issues:** 20 celkem (17 done, 1 canceled, 0 in progress)
- **Poslední sprint:** GF-17 → GF-26 (refactoring + coverage + bundle, 2026-03-24)
- **Build:** Zelený (tsc 0 errors + vite build pass)
- **Test coverage:** 273 testů, ~65% statements
- **Main bundle:** 186 kB (vendor chunks separated)

## Otevřené technické dluhy

### Vysoká priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| `storyteller.ts` | Legacy TypeScript errors (non-blocking, ignorované) | DEVELOPMENT_STATE.md |
| Deployment | 4 kritické security gaps (unprotected Edge Functions, API Schema) | DEPLOYMENT_READINESS_AUDIT.md |
| AppLayout PublishDialog | Přímé `supabase.from('books').update()` v L222 — Three-Layer violation | GF-23 audit |

### Střední priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| pdfGenerator chunk | 591 kB — lazy-loaded, ale kandidát na lighter PDF lib | Build output |
| Coverage gaps | `useCardStudioAdapter`, `useGameHubAdapter` — 0% coverage | GF-24 coverage report |
| E2E testy | Žádné — Playwright/Cypress setup by pokryl kritické flows | — |

### Nízká priorita

| Oblast | Problém |
|--------|---------|
| `process-story-image` | Legacy Edge Function, nahrazena `generate-story-image` — zvážit odstranění |
| MASTER_BLUEPRINT.md | Zastaralý (Jan 2026), odkazuje na Stripe a staré komponenty |

## Plánované features (z MASTER_BLUEPRINT + audits)

| Feature | Popis | Stav |
|---------|-------|------|
| Community Library | Veřejná knihovna s hodnocením | Planned |
| AI Voiceover v2 | Vylepšené TTS s výběrem hlasů | Částečně (4 hlasy ElevenLabs) |
| Magic Mirror v2 | Vylepšená face reference konzistence | Partial (Visual DNA extraction) |
| Offline mode | PWA + service worker | Not started |
| Multi-language | Podpora dalších jazyků (EN plně) | Partial (CS primary, EN secondary) |

## Dokončené milestones

| Datum | Milestone |
|-------|-----------|
| 2026-03-24 | GF-17→GF-26: Coverage 65%, bundle 186 kB, Three-Layer compliant, AppLayout split |
| 2026-03-23 | Refactoring sprint complete (god components split, lazy routes, code splitting) |
| 2026-03-22 | Edge Functions refactor (generate-story-content split) |
| 2026-03-07 | Security + Gumroad payment integration |
| 2026-02-15 | FSD architecture + adapter pattern |
| 2026-01-18 | Flux 2 Pro pipeline + content moderation |
