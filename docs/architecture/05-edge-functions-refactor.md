# Refactor: Edge Functions — rozdělit generate-story-content

> **Linear:** [GF-10](https://linear.app/gf-aos/issue/GF-10/refactor-rozdelit-generate-story-content-na-fokusovane-edge-functions) | **Status:** Done | **Datum:** 2026-03-22

## Motivace

Původní `generate-story-content/index.ts` byl god object — 653 řádků, 9 různých akcí, vše na jednom místě.

## Nová struktura Edge Functions

### `supabase/functions/_shared/` — sdílené moduly

| Modul | Účel |
|-------|------|
| `cors.ts` | CORS hlavičky |
| `lang-utils.ts` | Jazykové utility (CS/EN) |
| `ai-clients.ts` | `callGemini()` (gemini-2.5-flash) + `callAnthropic()` (claude-sonnet-4-6) se sanitizací JSON |

### `generate-story-content` — slim-down na 2 akce

| Akce | Popis |
|------|-------|
| `generate-structure` | Generování struktury příběhu (Anthropic, vyžaduje auth) |
| `generate-idea` | Generování nápadu na příběh (Gemini, guest-friendly) |

### `book-editor-assist` — 4 akce pro Custom Book Editor

| Akce | Popis |
|------|-------|
| `generate-suggestion` | Pokračování textu |
| `generate-image-prompt` | FROG PROTOCOL art prompt |
| `generate-initial-ideas` | 5 nápadů na příběhy |
| `dictionary-lookup` | Česko-anglický kreativní slovník |

### `content-tools` — 2 utility akce

| Akce | Popis |
|------|-------|
| `moderate-text` | Content safety moderace |
| `extract-visual-dna` | Multimodální analýza postavy z obrázku |

## Technické detaily

- Všechny nové funkce deployují s `--no-verify-jwt` (auth řeší interně přes `supabase.auth.getUser()`)
- Gemini model aktualizován z `gemini-2.0-flash` na `gemini-2.5-flash`
- Přidána sanitizace JSON v `callAnthropic` (strip control chars + trailing commas)
- Všechny frontend importy přepojeny na správné funkce

## Výsledek

- **generate-story-content:** 653 → ~200 řádků, 9 → 2 akce
- **Otestováno:** Card Studio, Custom Book Editor, Magic Wand, samolepky — vše funguje
