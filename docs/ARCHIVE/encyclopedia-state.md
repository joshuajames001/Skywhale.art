# Encyklopedie v2 — Stav implementace

> GF-138 | Aktualizováno: 2026-03-25

## Co je hotové

### UI vrstva (kompletní)
- **WorldsScene** — snap scroll container, IntersectionObserver dot navigator, hidden scrollbar
- **WorldSection** — fullscreen sekce per kategorie:
  - Unikátní radial-gradient background per slug
  - CSS particle animace per slug (drift/twinkle/rise/fall/snow/wind)
  - Animované SVG pozadí per slug (kapradiny, hvězdy, ryby, sníh, ptáci...)
  - Floating emoji, whileInView fade-in, glow efekt
  - "Prozkoumat →" button
- **DiscoveryBookGrid** — slide-up panel (Framer Motion spring):
  - Bílé karty knih s cover_url, rounded-2xl, shadow-lg
  - Stagger animace, whileHover scale 1.03
  - Back button + kategorie header s emoji
- **DiscoveryHub** — orchestrátor:
  - Tří-úrovňový flow: planety → books → reader
  - AnimatePresence pro transitions
  - Body overflow hidden při mountu
  - Back button s kontextovým labelem
- **WorldSVGBackground** — 6 unikátních SVG scén:
  - dinosauri: kapradiny, pterodaktyl, stopy
  - vesmir: hvězdičky, kometa, mlhovina
  - ocean: řasy, ryby, bublinky
  - prales: stromy, padající listí, motýl
  - arktida: polární záře, sněhové vločky, ledové krystaly
  - savana: tráva, ptáci, slunce

### Data hook
- **useDiscoveryScene** — tří-úrovňový stav:
  - `categories` načtené z DB (discovery_categories WHERE is_active = true)
  - `selectCategory(cat)` → load books z discovery_books
  - `selectBook(book)` → set selectedBook
  - `clearBook()` → zpět na books (selectedCategory zachován!)
  - `clearCategory()` → zpět na planety

## Co zbývá

### 1. DB propojení pro reader
useDiscoveryScene potřebuje loadPagesForBook:
```ts
// Přidat do useDiscoveryScene:
const selectBook = async (book: DiscoveryBook) => {
  setSelectedBook(book);
  setPagesLoading(true);
  const { data } = await supabase
    .from('discovery_pages')
    .select('*')
    .eq('book_id', book.id)
    .order('page_number', { ascending: true });
  setPages(processPages(data || [], book.storage_folder === 'T-Rex'));
  setPagesLoading(false);
};
```

### 2. Napojení DiscoveryReader na pages z useDiscoveryScene
V DiscoveryHub.tsx — aktuálně reader dostává `pages={[]}`. Potřeba:
- Předat `pages` z useDiscoveryScene
- Přidat `readerPage` stav + `onPageChange` handler
- Předat `isDinoCategory` / `isSpaceCategory` z selectedCategory

### 3. Back routing fix
Aktuální flow funguje pro planets → books → reader.
Potřeba ověřit:
- Back z readeru → books (clearBook, selectedCategory zachován)
- Back z books → planety (clearCategory)
- Browser back button (popstate handling)

### 4. Cleanup starého kódu
Po dokončení GF-138 smazat:
- `src/features/discovery/components/CategoryGrid.tsx`
- `src/features/discovery/components/BookList.tsx`
- `src/features/discovery/components/DiscoveryCard.tsx`
- `src/features/discovery/components/DiscoveryBackground.tsx`
- `src/features/discovery/hooks/useDiscoveryData.ts`
- `src/features/discovery/hooks/useDiscoveryNav.ts`
- `src/features/discovery/hooks/useTrailers.ts`
- `src/features/discovery/components/TrailerOverlay.tsx`

## Soubory

| Soubor | Stav |
|--------|------|
| `hooks/useDiscoveryScene.ts` | Hotový (chybí pages loading) |
| `components/WorldsScene.tsx` | Hotový |
| `components/WorldSection.tsx` | Hotový |
| `components/WorldSVGBackground.tsx` | Hotový |
| `components/DiscoveryBookGrid.tsx` | Hotový |
| `components/DiscoveryHub.tsx` | Hotový (reader needs pages) |
| `components/DiscoveryReader.tsx` | Existující, beze změn |
| `components/DiscoveryPageView.tsx` | Existující, beze změn |

## DB schéma

```sql
-- discovery_categories
id              uuid PRIMARY KEY
title           text        -- "Dinosauři", "Vesmír", ...
slug            text        -- "dinosauri", "vesmir", ...
description     text
theme_color_hex text        -- "#22c55e", "#7c3aed", ...
is_active       boolean

-- discovery_books
id              uuid PRIMARY KEY
category_id     uuid REFERENCES discovery_categories(id)
title           text
summary         text
cover_url       text        -- full Supabase URL or null
storage_folder  text        -- "T-Rex", "Stars" (for fallback cover)
trailer_url     text
difficulty_level integer
species_code    text
weight_text     text
period_text     text
diet_text       text
audio_url       text

-- discovery_pages
id              uuid PRIMARY KEY
book_id         uuid REFERENCES discovery_books(id)
page_number     integer
content_text    text        -- mapped to text_content in UI
image_url       text
audio_url       text
```

## Routing

```
/encyclopedia → LazyDiscoveryHub (lazy-loaded)
  → DiscoveryHub orchestrátor
    → WorldsScene (snap scroll, 6 sekcí)
    → DiscoveryBookGrid (overlay po kliknutí na svět)
    → DiscoveryReader (existující, po kliknutí na knihu)
```
