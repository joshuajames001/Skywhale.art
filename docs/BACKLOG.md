# Backlog & Roadmap

> Aktualizováno: 2026-03-23 | Zdroj: Linear (Skywhale.art) + audity

## Stav projektu

- **Linear issues:** 11 celkem (9 done, 1 canceled, 0 in progress)
- **Poslední sprint:** GF-10 → GF-16 (refactoring, 2026-03-22/23)
- **Build:** Zelený (tsc + vite build pass)
- **Test coverage:** ~17%

## Otevřené technické dluhy

### Vysoká priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| `storyteller.ts` | Legacy TypeScript errors (non-blocking, ignorované) | DEVELOPMENT_STATE.md |
| Deployment | 4 kritické security gaps (unprotected Edge Functions, API Schema) | DEPLOYMENT_READINESS_AUDIT.md |
| Test coverage | 17% — cíl minimálně 40% | GF-9 audit |
| Main bundle | 995 kB (nad 500 kB Vite limit) — potřeba manualChunks | Build warning |

### Střední priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| `App.tsx` | 86 řádků (OK), ale AppLayout.tsx 244 řádků — další god component | Audit GF-12 |
| `getUser` v ReactionBar | Degree 28, měl by být extrahován do sdíleného utility | 06-god-components-audit.md |
| pdfGenerator chunk | 591 kB — dynamický import, ale mohl by být lazy-loaded lépe | Build output |

### Nízká priorita

| Oblast | Problém |
|--------|---------|
| `process-story-image` | Legacy Edge Function, nahrazena `generate-story-image` — zvážit odstranění |
| MASTER_BLUEPRINT.md | Zastaralý (Jan 2026), odkazuje na Stripe a staré komponenty |
| DEVELOPMENT_STATE.md | Zastaralý (Feb 2026), App.tsx údajně 778 řádků (reálně 86) |

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
| 2026-03-23 | Refactoring sprint complete (god components split, lazy routes, code splitting) |
| 2026-03-22 | Edge Functions refactor (generate-story-content split) |
| 2026-03-07 | Security + Gumroad payment integration |
| 2026-02-15 | FSD architecture + adapter pattern |
| 2026-01-18 | Flux 2 Pro pipeline + content moderation |
