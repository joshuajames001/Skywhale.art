# Backlog & Roadmap

> Aktualizováno: 2026-03-24 | Zdroj: Linear (Skywhale.art) + audity

## Stav projektu

- **Linear issues:** 20 celkem (17 done, 1 canceled, 0 in progress)
- **Poslední sprint:** GF-17 → GF-81 (refactoring + coverage + bundle + bugfixes, 2026-03-24)
- **Build:** Zelený (tsc 0 errors + vite build pass)
- **Test coverage:** 273 testů, ~65% statements
- **Main bundle:** 186 kB (vendor chunks separated)

## Otevřené technické dluhy

### Vysoká priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| DB migrace | `style_manifest` + `status` sloupce — migrace vytvořena, potřeba spustit | GF-76 audit |
| `shared_cards` tabulka | CardViewer.tsx čte z ní, ale neexistuje migrace — ověřit v DB | GF-76 audit |
| PDF export | Custom Book template přidán (GF-80b), Story Reader opraven (html2canvas). CORS s cross-origin obrázky stále potenciální. | GF-80 |

### Střední priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| pdfGenerator chunk | 591 kB — lazy-loaded, kandidát na lighter PDF lib | Build output |
| Coverage gaps | `useCardStudioAdapter`, `useGameHubAdapter` — 0% coverage | GF-24 |
| `storyteller.ts` | Legacy TypeScript errors (non-blocking) + fragile response parsing | Audit |
| Zastaralé buckety | `dino-content`, `card-assets`, `book-images` — kód je nepoužívá | Storage audit |

### Nízká priorita

| Oblast | Problém |
|--------|---------|
| `process-story-image` | Legacy Edge Function, nahrazena `generate-story-image` — zvážit odstranění |
| MASTER_BLUEPRINT.md | Zastaralý (Jan 2026), odkazuje na Stripe a staré komponenty |
| E2E testy | Žádné — Playwright/Cypress setup by pokryl kritické flows |

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
| 2026-03-24 | GF-17→GF-81: Coverage 65%, bundle 186 kB, Three-Layer 100%, security audit, bucket fix, Konva/Audio fix |
| 2026-03-23 | Refactoring sprint complete (god components split, lazy routes, code splitting) |
| 2026-03-22 | Edge Functions refactor (generate-story-content split) |
| 2026-03-07 | Security + Gumroad payment integration |
| 2026-02-15 | FSD architecture + adapter pattern |
| 2026-01-18 | Flux 2 Pro pipeline + content moderation |
