# Tech Debt — Mobile Sprint (GF-165–187)

> Vytvořeno: 2026-03-27 po dokončení mobile sprintu

---

## 1. Slovník (Dictionary) — 4× duplikace

Stejná logika (search input → emoji + primary_en + synonyma + adjectives) existuje ve **4 nezávislých souborech**, žádný neimportuje druhý:

| # | Soubor | Používá se v | Search handler | Styl |
|---|--------|-------------|----------------|------|
| 1 | `custom-book/components/DictionarySidebar.tsx` | Desktop CustomBookEditor | `actions.searchDictionary` (props) | Amber sidebar, motion slide-in |
| 2 | `custom-book/components/CustomBookEditorMobile.tsx` (inline View 3) | Mobile CustomBookEditor | `actions.searchDictionary` (props) | White cards, clipboard copy |
| 3 | `card-studio/components/tools/DictionaryPanel.tsx` | Desktop Card Studio (ToolsDock) | `useCardStudio().onDictionaryLookup` | Dark glass, fixed popover |
| 4 | `card-studio/mobile/panels/DictionaryPanel.tsx` | Mobile Card Studio | `useCardStudio().onDictionaryLookup` | White cards, clipboard copy |

### Odlišnosti mezi implementacemi
- **Callback pro synonym klik**: #1 vkládá do promptu, #2/#4 kopírují do clipboardu, #3 volá `onInsertWord` callback
- **Wrapper/layout**: #1 je motion sidebar, #2 inline view, #3 fixed popover, #4 fullscreen panel
- **Search handler zdroj**: #1/#2 přes props (useCustomBookEditor), #3/#4 přes context (useCardStudio)
- **i18n**: #1/#3 používají `t()`, #2/#4 mají hardcoded CZ texty

### Navrhovaný fix
Extrahovat `src/components/DictionaryResults.tsx` — **pouze výsledková sekce** (emoji karta + synonyma + adjectives), ne wrapper/layout/search input:

```tsx
interface DictionaryResultsProps {
    result: { emoji?: string; primary_en?: string; synonyms?: string[]; related_adjectives?: string[] };
    query: string;
    onWordClick?: (word: string) => void; // synonym klik — každý consumer definuje chování
}
```

Každý consumer si ponechá vlastní: wrapper layout, search input, search handler, animace. Jen výsledky budou sdílené.

**Odhadovaný dopad**: -120 řádků duplicitního kódu, 4 soubory importují 1 shared komponentu.

---

## 2. BottomSheet — 3× duplikace

Identický Framer Motion pattern (overlay + slide-up + drag handle):

| # | Soubor | Řádky |
|---|--------|-------|
| 1 | `custom-book/components/CustomBookEditorMobile.tsx` (BottomSheet component) | ~20 řádků |
| 2 | `card-studio/mobile/sheets/TextEditorSheet.tsx` | ~15 řádků |
| 3 | `card-studio/mobile/sheets/OverflowMenuSheet.tsx` | ~15 řádků |

### Navrhovaný fix
Extrahovat `src/components/BottomSheet.tsx`:

```tsx
interface BottomSheetProps {
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: string; // default '80vh'
}
```

CustomBookEditorMobile už má lokální `BottomSheet` komponentu (řádek ~599) — stačí přesunout do `src/components/` a reusovat.

**Odhadovaný dopad**: -30 řádků, konzistentní z-index (90/91) a animace.

---

## 3. Clipboard Copy — 2× duplikace

Identická logika `navigator.clipboard.writeText` + `copied` state + 1500ms reset + Check icon:

| # | Soubor |
|---|--------|
| 1 | `custom-book/components/CustomBookEditorMobile.tsx` (DictionaryViewContent) |
| 2 | `card-studio/mobile/panels/DictionaryPanel.tsx` |

### Navrhovaný fix
Extrahovat `src/hooks/useClipboardCopy.ts`:

```tsx
export const useClipboardCopy = (resetMs = 1500) => {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), resetMs);
    };
    return { copied, copy };
};
```

**Odhadovaný dopad**: -10 řádků, eliminuje duplicitní setTimeout logiku.

---

## 4. `any` typy

| Soubor | Řádek | Problém |
|--------|-------|---------|
| `CardStudioDesktop.tsx` | 19 | `GreetingCardPage` props typed as `any` |
| `CardStudioDesktop.tsx` | 90 | `sticker: any` v onAddSticker callback |
| `DictionarySidebar.tsx` | 5 | Props typed as `any` |
| `card-studio/components/tools/DictionaryPanel.tsx` | 8 | `result: any` |

### Fix
Definovat `GreetingCardPageProps` interface, `StickerItem` import, `DictionaryResult` shared type.

---

## 5. Hardcoded stringy (~50+) bez i18n

Nové mobile komponenty mají většinu UI textů hardcoded v CZ/EN:

| Oblast | Příklady |
|--------|---------|
| CustomBookEditorMobile | "Hlas vypravěče", "Bez hlasu", "Vizuální styl", "Uložit", "Exportovat PDF", "Publikovat", "Strana — Obrázek", "Magičtinář (slovník)", "Hero mode — AI obrázek" |
| CardStudio panels | "Barvy", "Vzory", "Nadpis", "Tělo textu", "Citát", "Popisek", "Nálepka", "Pozadí", "Generuji…", "Hledám..." |
| CardStudio sheets | "Velikost", "Barva", "Písmo", "Přidat na kartu", "Stáhnout PNG", "Sdílet", "Nová karta" |

### Fix
Přidat i18n klíče do `cs.json` / `en.json` a nahradit `t('key')` voláními. Rozsah: ~50 stringů, 8 souborů.

**Priorita**: MEDIUM — app je primárně CZ, ale EN překlad bude potřeba pro launch.

---

## 6. ESLint nefungční

Nainstalovaný ESLint 10.x vyžaduje `eslint.config.js` (flat config), ale projekt má `.eslintrc.*`. Script `npm run lint` selhává.

### Fix
Buď downgrade ESLint na 8.x, nebo migrace na flat config (`eslint.config.js`).

---

## Stav řešení

| # | Item | Stav | Commit |
|---|------|------|--------|
| 1 | Slovník 4× duplikace | ✅ 3/4 refaktorováno (shared DictionaryResults) | `2fa7689` |
| 2 | BottomSheet 3× duplikace | ✅ Extrahován `src/components/BottomSheet.tsx` | `200cdfb` |
| 3 | Clipboard copy 2× duplikace | ✅ Extrahován `src/hooks/useClipboardCopy.ts` | `200cdfb` |
| 4 | `any` typy (4 místa) | ✅ Všechny opraveny | `200cdfb` |
| 5 | i18n stringy (~50+) | ⏳ Backlog — low priority pro CZ-first app |
| 6 | ESLint nefungční | ⏳ Backlog — ESLint 10 flat config migrace |
