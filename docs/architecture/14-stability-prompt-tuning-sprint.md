# Sprint 14: Stability & Prompt Tuning (2026-03-30)

## Cíl
Odstranit race condition v energy systému, vylepšit kvalitu generovaných příběhů (jména, struktura děje, konzistence), supprimovat build warningy a opravit scoping bug v error recovery.

## Dokončené issues

### Build & Config
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-57 | pdfGenerator chunk warning suppressed (chunkSizeWarningLimit: 600) | `vite.config.ts`, `CLAUDE.md` |
| GF-194 | ESLint 0 errors ověřeno — žádné změny potřeba | (audit only) |

### Energy System Security
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-227 | Atomic `deduct_energy_if_sufficient` RPC — eliminuje TOCTOU race condition | `supabase/migrations/20260330_deduct_energy_if_sufficient.sql` (new) |
| GF-227 | generate-audio: separátní check+deduct → single RPC | `supabase/functions/generate-audio/index.ts` |
| GF-227 | generate-story-image: `add_energy(-cost)` → `deduct_energy_if_sufficient` | `supabase/functions/generate-story-image/index.ts` |
| GF-227 | skywhale-flux: `add_energy(-cost)` → `deduct_energy_if_sufficient` | `supabase/functions/skywhale-flux/index.ts` |
| GF-fix | energyDeducted scoping — hoist před `try` block (ReferenceError v catch) | `generate-story-image/index.ts`, `skywhale-flux/index.ts` |

### Story Quality
| Issue | Popis | Soubory |
|-------|-------|---------|
| GF-235 | `<naming_rules>` — česká jména, animal names, fantasy exception | `supabase/functions/generate-story-content/index.ts` |
| GF-235 | `<story_arc_rules>` — dynamická arc struktura dle targetLength | `supabase/functions/generate-story-content/index.ts` |
| GF-235 | Character consistency rule (storytelling rule 8) | `supabase/functions/generate-story-content/index.ts` |
| GF-235 | Language purity constraint 9 (zero tolerance) | `supabase/functions/generate-story-content/index.ts` |

## Klíčová architektonická rozhodnutí

### 1. Atomic energy deduction (GF-227)

**Problém:** Starý pattern `SELECT balance → CHECK >= cost → UPDATE balance - cost` jsou 3 separátní operace. Mezi CHECK a UPDATE může jiný request (dvojklik, druhý tab) projít stejnou kontrolou → záporný zůstatek.

**Řešení:** Nová PostgreSQL funkce `deduct_energy_if_sufficient`:
```sql
UPDATE profiles
SET energy_balance = energy_balance - p_amount
WHERE id = p_user_id AND energy_balance >= p_amount
RETURNING energy_balance INTO v_new_balance;
```
Jeden `UPDATE ... WHERE` = atomická operace. Buď projde celá, nebo nic. Vrací `{success: bool, new_balance: int}`.

**Refund logika:** `add_energy` RPC zůstává pro error recovery (Replicate API selhání → vrátit energii). Refund není race-condition-sensitive — přidání energy je vždy bezpečné.

### 2. Variable scoping fix (energyDeducted hotfix)

**Problém:** `let energyDeducted = false` deklarované uvnitř `try {}` bloku není viditelné v `catch {}` (JavaScript block scoping). Catch block refundoval energii na základě proměnné, která v jeho scope neexistovala → `ReferenceError`.

**Řešení:** Hoist `energyDeducted`, `supabaseAdmin`, `user`, `cost` před `try` block. Přiřazení uvnitř try místo `const` deklarací. Catch block nyní vidí všechny proměnné potřebné pro refund.

**Dotčené soubory:**
- `generate-story-image/index.ts` — `let energyDeducted`, `let supabaseAdmin`, `let user`, `let cost`
- `skywhale-flux/index.ts` — stejný pattern

### 3. pdfGenerator chunk akceptace (GF-57)

**Rozhodnutí:** Chunk (~591 kB) zůstává jako jeden celek. Je lazy-loaded — stahuje se pouze při explicitní akci uživatele (export PDF). Neovlivňuje initial load, TTI ani FCP.

**Alternativy zvážené a zamítnuté:**
- `manualChunks` split html2canvas/jsPDF — zbytečná komplexita, obě knihovny se vždy používají společně
- Lighter PDF lib — potenciální future optimalizace, ale html2canvas+jsPDF funguje spolehlivě

### 4. Story prompt guardrails (GF-235)

**Problém:** Claude Sonnet 4.6 generoval příběhy s anglickými jmény (Kevin, Tyler), nekonzistentními postavami (odvážný → zbabělý bezdůvodně) a slabou strukturou děje (chybí jasný konflikt).

**Řešení:** 4 nové sekce/pravidla v system promptu:

| Sekce | Účel |
|-------|------|
| `<naming_rules>` | Česká jména (GOOD: Tomáš, Anežka; BANNED: Kevin, Tyler), animal names (Kulička, Puntík), fantasy exception |
| `<story_arc_rules>` | Dynamické page ranges: intro (1–2) → rising action (3–40%) → climax (40–80%) → resolution (80–end) |
| Storytelling rule 8 | Character consistency — vlastnosti nesmí kontradikovat bez story důvodu |
| Constraint 9 | Language purity zero tolerance — žádný mix cz/en v text polích |

**Page ranges jsou dynamické** — počítají se z `targetLength` parametru:
- 10 stránek: intro 1–2, rising 3–4, climax 5–8, resolution 9–10
- 15 stránek: intro 1–2, rising 3–6, climax 7–12, resolution 13–15
- 25 stránek: intro 1–2, rising 3–10, climax 11–20, resolution 21–25

## Edge Function Deploys

| Funkce | Důvod |
|--------|-------|
| `generate-story-content` | GF-235: prompt tuning |
| `generate-story-image` | GF-227 + scoping fix |
| `skywhale-flux` | GF-227 + scoping fix |
| `generate-audio` | GF-227 |

Všechny deploynuty s `--no-verify-jwt` (standardní pattern projektu — auth řešena interně via `supabase.auth.getUser()`).

## Migrace

| Soubor | Účel |
|--------|------|
| `20260330_deduct_energy_if_sufficient.sql` | `SECURITY DEFINER`, `SET search_path = ''`, vrací JSON `{success, new_balance}` |

## Zbývající tech debt identifikovaný během sprintu

- `FROG_PROTOCOL` konstanta v `book-editor-assist/index.ts` — dead code, kandidát na smazání (akce `generate-image-prompt` používá Anthropic, ne Gemini)
- `"illustration"` option v EditorToolbar — nemá STYLE_PROMPTS entry, fallback na pixar_3d
- `process-story-image` Edge Function — legacy, plně nahrazena `generate-story-image`
- `generate-audio` nemá refund logiku při ElevenLabs API selhání (ostatní EF refundují)
