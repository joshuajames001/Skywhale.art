# Sprint 16: Bugfix Sprint (2026-04-13)

## Cil
Oprava dvou bugov: tiche fallbackovani stylu "illustration" na pixar_3d v EditorToolbar, a chybejici energy refund pri selhani ElevenLabs API v generate-audio Edge Function.

## Dokoncene issues

### EditorToolbar: illustration style fallback
| Issue | Popis | Soubory |
|-------|-------|---------|
| - | `illustration` v dropdown chybel v STYLE_PROMPTS -> tichy fallback na pixar_3d | `src/lib/ai.ts` |
| - | Pridan `illustration` entry: "gentle storybook illustration, soft ink linework, delicate watercolor wash, hand-drawn charm, warm muted palette, children's book art aesthetic" | `src/lib/ai.ts` |

**Root cause:** EditorToolbar.tsx (radek 69) nabizi `illustration` jako hardcoded option, ale STYLE_PROMPTS map v ai.ts neobsahoval odpovidajici klic. Lookup chain v `generateImage()` (radky 82-87) projel obe cesty (normalized + raw) bez vysledku a pouzil `DEFAULT_STYLE = STYLE_PROMPTS["pixar_3d"]`.

**Fix:** Pridan novy entry do STYLE_PROMPTS mapy. Zadne zmeny v EditorToolbar ani generateImage logice — dropdown uz spravne referencoval `"illustration"` jako value.

### generate-audio: energy refund pri API selhani
| Issue | Popis | Soubory |
|-------|-------|---------|
| - | Chybejici energy refund v generate-audio EF pri selhani ElevenLabs API | `supabase/functions/generate-audio/index.ts` |
| - | Pridan refund pattern konzistentni s generate-story-image a skywhale-flux | `supabase/functions/generate-audio/index.ts` |

**Root cause:** generate-story-image a skywhale-flux obe maji `energyDeducted` flag + `add_energy` RPC refund v catch bloku. generate-audio tento pattern postradale — pri selhani ElevenLabs API se energie nevratila.

**Fix (4 kroky):**
1. Hoisted promenne (`energyDeducted`, `supabaseAdmin`, `user`, `cost`) pred try blok
2. User destructuring alias (`user: authUser`) + prirazeni do hoisted `user`
3. `energyDeducted = true` po uspesnem deductu
4. Catch blok: `add_energy` RPC refund s nested try/catch pro selhani refundu (identicky pattern jako generate-story-image radky 297-304)

**Deploy:** EF deployovana s `--no-verify-jwt` (auth se resi interne pres `supabase.auth.getUser()`).

## Overeni

- `tsc --noEmit` — 0 errors
- Vsechny 4 hardcoded dropdown styly maji entry v STYLE_PROMPTS: `Pixar 3D`, `watercolor`, `ghibli_anime`, `illustration`
- Refund pattern konzistentni across 3 EF: generate-story-image, skywhale-flux, generate-audio
