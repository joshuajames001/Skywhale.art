# 🖼️ PROTOCOL OBRAZOVÉ GENERACE 2026 (Flux 2 Pro)

Tento dokument slouží jako **Jediný Zdroj Pravdy** pro logiku generování obrázků, prompt engineering a bezpečnostní pravidla implementovaná v StoryCloud (Projekt SkyWhale).

---

## 🔒 1. ZÁKON JAZYKOVÉ PURITY ("Frog Protocol")
**Problém:** Modely Flux 2 Pro nerozumí českým nuancím a často generují text (bubliny) nebo doslovné překlady.
**Řešení:** Všechny vizuální instrukce (prompty) musí být **striktně v angličtině**, i když je příběh psán česky.

### Implementace:
1.  **Thinking Phase (Edge Function):** AI "přemýšlí" v angličtině, vygeneruje koncept, a teprve poté překládá text příběhu do češtiny.
2.  **Separate Field (`art_prompt_en`):** V JSON výstupu je dedikované pole `art_prompt_en`, které se **NIKDY** nepřekládá.
3.  **Explicitní Příklady v Systémovém Promptu:**
    *   *Input:* "Byla jednou jedna malá žabička Kvák..."
    *   *Output:* "A small green frog with a red vest sitting on a mossy log..." (Nikdy ne "Little frog Kvak").

---

## 🦁 2. ZÁKON ANATOMICKÉ ČISTOLY ("Animal Purity Law")
**Problém:** AI má tendenci dělat zvířata "humanoidní" (ruce, lidské tělo, stání na dvou), což působí děsivě ("uncanny valley").
**Řešení:** Třístupňová ochrana vynucující biologickou přesnost.

### Pravidla:
1.  **Biologická Anatomie:** Zvíře musí mít **100% zvířecí tělo** (čtyři nohy, křídla, srst, ne lidská kůže).
2.  **Zákaz Lidských Rysů:** Žádné lidské ruce, žádný lidský hrudník.
3.  **Povolené Doplňky (Softened Rule):** Zvířata **MOHOU** nosit oblečení (vesty, klobouky, brýle), ale musí to sedět na jejich *přirozeném* těle.
    *   *Příklad:* Kocour v botách (OK, ale stojí na zadních jen pokud je to pro kočku v té scéně přirozené, jinak raději na čtyřech).
    *   *Form Factor String:* `VISUAL SPECIES: FOX [BIOLOGICAL ANIMAL ANATOMY. NATURAL POSTURE. ACCESSORIES ALLOWED BUT MUST FIT NATURAL BODY].`

---

## ⛓️ 3. CONTINUITY CHAINING ("Dynamic Pose Logic")
**Problém:** Pokud použijeme pro každou stranu jednu statickou referenční fotku (Hero Portrait), postava vypadá jako "nálepka" – má stále stejný výraz a úhel ("The Sticker Effect").
**Řešení:** Dynamické řetězení referencí v `BookReader.tsx`.

### Logika:
1.  **Strana 1 (Kotva):** Použije se **Hero Portrait (Character Sheet)**. Tím se nastaví základní identita.
2.  **Strana N (Řetěz):** Jako reference se použije **vygenerovaný obrázek ze strany N-1**.
    *   *Efekt:* Postava se může přirozeně otáčet, měnit výraz a hýbat se, protože reference se "posouvá" s dějem.
    *   *Fallback:* Pokud předchozí strana nemá obrázek, vrátíme se k Hero Portraitu (reset).
3.  **Pojistka (DNA):** Vždy se posílá i textová `visual_dna`, aby se identita nerozpadla úplně ("Identity Drift Prevention").

---

## 🚀 4. FLUX 2 PRO OPTIMALIZACE ("Hi-Fi Settings")
**Cíl:** Maximální kvalita výstupu pro platící uživatele ('pro' tier).

### Nastavení (`src/lib/ai.ts`):
*   **Mode:** `pro` (Flux 1.1 Pro / Ultra)
*   **Steps:** **28** (Hardcoded Sweet Spot – nejlepší poměr detailů a koherence).
*   **Quality:** `ultra`
*   **Prompt Injection:** Automaticky přidáváme tokeny kvality, pokud chybí:
    > "extremely high detail, 8k resolution, cinematic lighting, photorealistic textures, depth of field, masterpiece"

---

## 🛡️ 5. INTERNÍ BEZPEČNOST ("Triple-Layer Defense")
Kde se tato pravidla vynucují?

1.  **Vrstva 1: `storyteller.ts` (Client)**
    *   Detekuje zvířecí druhy (pole 15+ klíčových slov).
    *   Vynucuje `formFactor` string s pravidly anatomie.
    *   Sanitizuje `visual_dna`.

2.  **Vrstva 2: Edge Function "Idea Generation" (Server)**
    *   Systémový prompt obsahuje `ANIMAL PURITY LAW`.
    *   Zakazuje generování humanoidních popisů už v zárodku (v JSONu).

3.  **Vrstva 3: Edge Function "Image Prompt" (Server)**
    *   Obsahuje "Frog Protocol" příklady pro překlad.
    *   Vynucuje angličtinu a vizuální styl (Pixar/Watercolor).

---

*Poslední aktualizace: 18.2.2026 (Implementováno Antigravity Agentem)*
