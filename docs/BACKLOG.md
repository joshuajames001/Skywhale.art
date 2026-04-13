# Backlog & Roadmap

> Aktualizováno: 2026-04-13 | Zdroj: Linear (Skywhale.art) + audity

## Stav projektu

- **Linear issues:** 80+ celkem (75 done, 2 canceled, 0 in progress, 2 odložené)
- **Poslední sprint:** Sprint 16 (2026-04-13) — Bugfix Sprint (illustration fallback, audio refund)
- **Mobile nav:** 4+burger pattern (Home, Knihovna, Vlastní kniha, Herna + BottomSheet)
- **Build:** Zelený (tsc 0 errors + vite build pass)
- **Test coverage:** 298 testů, ~76% statements
- **Main bundle:** ~186 kB (vendor chunks separated)
- **Platební brána:** Stripe (migrace z Gumroad dokončena GF-141)
- **Mobile editory:** CustomBookEditor + CardStudio — dual-variant (Desktop/Mobile)
- **Auth flow:** WhaleLoginModal + WelcomeModal (oceánský styl)
- **Image prompts:** Claude Sonnet (claude-sonnet-4-6) místo Gemini

## In Progress

(žádné)

## Odložené

| Issue | Popis | Důvod |
|-------|-------|-------|
| GF-59 | E2E testy (Playwright) | Nízká priorita pro launch |
| GF-136 | Parent Hub — rodičovský dashboard | Post-launch feature |

## Otevřené technické dluhy

### Vysoká priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| DB migrace | `style_manifest` + `status` sloupce — migrace vytvořena, potřeba spustit | GF-76 audit |
| DB migrace | `shared_cards` — migrace vytvořena (GF-134), potřeba spustit v Supabase SQL Editor | GF-134 |
| PDF export | CORS s cross-origin obrázky stále potenciální issue | GF-80 |
| Card Studio mobile | Chybí: translation tool, reset bg to black, bg category grouping | Audit GF-175 |

### Střední priorita

| Oblast | Problém | Zdroj |
|--------|---------|-------|
| pdfGenerator chunk | 591 kB — lazy-loaded, warning suppressed (GF-57), kandidát na lighter PDF lib | Build output |
| `storyteller.ts` | Legacy TypeScript errors (non-blocking) + fragile response parsing | Audit |
| Zastaralé buckety | `dino-content`, `card-assets`, `book-images` — kód je nepoužívá | Storage audit |

### Nízká priorita

| Oblast | Problém |
|--------|---------|
| `process-story-image` | Legacy Edge Function — zvážit odstranění |
| E2E testy | Žádné — Playwright setup by pokryl kritické flows |

## Plánované features

| Feature | Popis | Stav |
|---------|-------|------|
| Community Library | Veřejná knihovna s hodnocením | Planned |
| Parent Hub | Rodičovský dashboard (GF-136) | Odloženo |
| AI Voiceover v2 | Vylepšené TTS s výběrem hlasů | Částečně (4 hlasy ElevenLabs) |
| Magic Mirror v2 | Vylepšená face reference konzistence | Partial (Visual DNA + character sheet gen) |
| Offline mode | PWA + service worker | Not started |

## Dokončené milestones

| Datum | Milestone |
|-------|-----------|
| 2026-04-13 | Sprint 16 Bugfix: illustration styl pridan do STYLE_PROMPTS (fix silent fallback na pixar_3d), generate-audio EF energy refund pri ElevenLabs API selhani (konzistentni pattern s generate-story-image a skywhale-flux) |
| 2026-04-01 | Legal sekce: LegalAgreements rozšířen na 4 taby (Podmínky, Soukromí, Cookies, Platby), nové CookiePolicy.tsx + RefundPolicy.tsx, routy /cookies + /refund, odkaz "Zásady cookies" ve footeru |
| 2026-03-31 | GF-233–GF-238: GameHub & UX Sprint — GameHub vizuální overhaul (ilustrační bg, light mode, statický wrapper), MemoryGame full-bleed, PuzzleGame větší předloha + tap-to-swap touch, dead code cleanup, PDF CORS fix, AiChat removed, BookReader prefetch, mobile nav 4+burger, burger z-index fix, GameHub mobile optimalizace |
| 2026-03-30 | GF-57–GF-235: Stability & Prompt Tuning Sprint — atomic deduct_energy_if_sufficient RPC (TOCTOU race condition fix), story prompt guardrails (Czech names, story arc, character consistency, language purity), pdfGenerator chunk warning suppressed, energyDeducted scoping hotfix |
| 2026-03-30 | GF-144a–GF-222: Freemium & Image Gen Sprint — WhaleLoginModal, WelcomeModal, is_new_user flag, daily reward claim-first, image tier fix, character sheet gen, style normalization, Gemini→Claude Sonnet for image prompts, content-tools base64 fix |
| 2026-03-27 | GF-188–GF-194: Tech Debt + Polish — title/maxPages/expert mode/voice preview/charge energy on mobile, Wave 4+5 complete (40/40), shared BottomSheet + useClipboardCopy + DictionaryResults, Discovery audit clean, Hero Mode removed |
| 2026-03-27 | GF-165–GF-187: Mobile Responsivity Sprint — 40/40 audit fixes, CustomBookEditor mobile (3-view swipe), Card Studio mobile (dark canvas + 6 panels), refaktor do panel souborů, 26 commitů |
| 2026-03-27 | GF-146–GF-164: Energy refund, Three-Layer fixes (CardViewer, PublicProfile, BookReader), Library light mode, sidebar fix, i18n, debug cleanup, CinematicLanding hero-only |
| 2026-03-26 | GF-141/143/145/148/151: Stripe migrace, Feedback→email, Energy rebalance, IMAGE_COSTS SSoT, daily reward fix + RPC migrace |
| 2026-03-26 | GF-138 dokončen: Encyklopedie v2 plně propojená (reader, audio, backgrounds, custom SVG ikony, 9 legacy souborů smazáno) |
| 2026-03-25 | GF-133→GF-138: Card Studio share, coverage 75%, Encyklopedie v2 UI, Three.js cancelled |
| 2026-03-24 | GF-17→GF-81: Coverage 65%, bundle 186 kB, Three-Layer 100%, security audit |
| 2026-03-23 | Refactoring sprint complete (god components split, lazy routes, code splitting) |
| 2026-03-22 | Edge Functions refactor (generate-story-content split) |
| 2026-03-07 | Security + Gumroad payment integration (now replaced by Stripe) |
| 2026-02-15 | FSD architecture + adapter pattern |
| 2026-01-18 | Flux 2 Pro pipeline + content moderation |
