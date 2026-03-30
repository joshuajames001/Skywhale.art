# Sprint 13: Freemium & Image Generation (2026-03-29 → 2026-03-30)

## Cíl
Implementovat freemium onboarding flow (whale login, welcome modal, energy grant) a opravit image generation pipeline (style normalizace, tier logika, Gemini→Claude přepnutí).

## Dokončené issues

### Auth & Onboarding
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-144a | WhaleLoginModal — animovaný oceán, spící velryba, probuzení → Auth form | `src/features/auth/components/WhaleLoginModal.tsx` (new) |
| GF-209 | WelcomeModal + is_new_user flag + ?pages query param | `WelcomeModal.tsx` (new), `useAppAuth.ts`, `useCustomBookEditor.ts`, migrace |
| GF-207 | ProtectedRoute → /home, LandingPage auto-open auth | `ProtectedRoute.tsx`, `LandingPage.tsx` |
| GF-213 | Desktop layout: velryba vlevo, formulář vpravo (md+ flex-row) | `WhaleLoginModal.tsx` |
| GF-214 | X button re-open fix: useRef guard (jednou za mount) | `LandingPage.tsx` |

### Daily Reward
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-215 | Claim-first-show-after pattern — RPC v checkDailyReward, ne handleClaimReward | `useDailyReward.ts`, `useDailyReward.test.ts` |

### Image Generation Pipeline
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-216 | Tier logika: continuity ≠ premium, costPerImage fix, character sheet gen, log fix | `useBookEditorAI.ts`, `useBookEditorPersistence.ts`, `useCustomBookEditor.ts` |
| GF-219 | Magic mirror: img2img reference (publicUrl) + dnaToText JSON parser | `useBookEditorPersistence.ts` |
| GF-221 | selectedStyle → edge function (STYLE_NAMES lookup) | `book-editor-assist/index.ts`, `useGemini.ts`, `useBookEditorAI.ts` |
| GF-222 | generate-image-prompt: Gemini → Claude Sonnet (claude-sonnet-4-6) | `book-editor-assist/index.ts`, `_shared/ai-clients.ts` |
| GF-fix | callAnthropic jsonMode param (text vs JSON response) | `_shared/ai-clients.ts` |
| GF-fix | Style key normalizace + DEFAULT_STYLE watercolor → pixar_3d | `ai.ts`, `book-editor-assist/index.ts`, `ai.test.ts` |
| GF-fix | content-tools base64 stack overflow (spread → loop) | `content-tools/index.ts` |

## Klíčová architektonická rozhodnutí

### 1. WhaleLoginModal embeds Auth.tsx
Auth.tsx se nesmí měnit (fixed inset-0 z-[100] overlay). WhaleLoginModal neutralizuje pozicování přes CSS overrides: `[&>div]:!static [&>div>div:first-child]:!hidden`. Auth card tak plyne inline uvnitř whale scény.

### 2. Claim-first-show-after (daily reward)
Starý pattern: klientský date check → show modal → user klikne claim → RPC.
Nový pattern: klientský date check → RPC claim → pokud success → show modal.
Eliminuje problém s duplicitním modalem po logout→login.

### 3. Character sheet pipeline
Upload fotky → extractVisualIdentity (Gemini DNA) → generateImage (Flux Dev, DNA text + originální foto jako characterReference) → storageService upload → vrátí sheet URL místo raw fotky. Všechna další generování používají sheet jako referenci.

### 4. Image prompt: Gemini → Claude Sonnet
Důvod: Gemini FROG_PROTOCOL si vybíral styl sám (watercolor/Pixar), ignoroval selectedStyle. Claude Sonnet dostává explicitní styl v user promptu a dodržuje ho.

### 5. Style normalizace
Dropdown posílá `"Pixar 3D"`, STYLE_PROMPTS má `"pixar_3d"`. Řešení: `normalizeStyleKey()` (lowercase + replace spaces/hyphens → underscores). Aplikováno v `ai.ts` i `book-editor-assist`. DEFAULT_STYLE změněn z watercolor na pixar_3d — většina uživatelů volí Pixar 3D.

## DB migrace
- `20260329_add_is_new_user_flag.sql` — `is_new_user boolean DEFAULT true` na profiles, handle_new_user() update, existing users set false

## Edge Function deploys
- `content-tools` — base64 fix
- `book-editor-assist` — Anthropic switch, jsonMode, style normalizace, debug logy

## Metriky
- **tsc:** 0 errors
- **Build:** zelený (~5s)
- **Testy:** 298/298 pass (26 souborů)
- **Commitů:** 6
- **Nových souborů:** 3 (WhaleLoginModal, WelcomeModal, migrace)
- **Modifikovaných souborů:** ~20

## Známé tech debt z tohoto sprintu
1. Debug logy (`🎯`) v ai.ts a book-editor-assist — smazat po ověření
2. FROG_PROTOCOL v book-editor-assist — dead code, kandidát na smazání
3. EditorToolbar dropdown `"illustration"` nemá STYLE_PROMPTS entry
