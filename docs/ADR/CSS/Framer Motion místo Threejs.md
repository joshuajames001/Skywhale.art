ADR-007: Encyklopedie UI — CSS/Framer Motion místo Three.js
Datum: 2026-03-25
Status: Accepted
Autoři: Jiří Joneš, GhostFactory
Kontext: GF-137 → GF-138 (Skywhale.art)

Kontext
Encyklopedie (Discovery Hub) potřebovala nové UI po tom, co původní grid layout měl broken cover URLs a hardcoded assety mimo git repo. Rozhodli jsme se přepsat celou feature od základu.
Během session jsme prošli třemi iteracemi:

Three.js v1 — geometrické tvary (koule, kroužky, oktahedron) → zamítnuto vizuálně
Three.js v2 — procedurální GLSL shadery, glow, organické rozmístění → zamítnuto vizuálně
CSS/Framer Motion — fullscreen scroll vrstvy → přijato


Rozhodnutí
Použít CSS + Framer Motion místo Three.js pro Encyklopedii.
Konkrétně:

Fullscreen snap-scroll sekce (scroll-snap-type: y mandatory)
Každý svět = h-screen sekce s radial-gradient pozadím
Animované SVG ilustrace na pozadí každé sekce (per slug)
Framer Motion pro přechody a overlay animace
Žádné Three.js, žádný WebGL


Důvody
Proč Three.js nevyšel
Vizuální kvalita bez designéra je nedostatečná. Obě Three.js iterace produkoval Claude Code správně z technického hlediska, ale výsledek vypadal jako generické demo:

Holé geometrické tvary bez textury → "bland"
Procedurální GLSL shadery → planety se překrývaly, Arktida jako rotující čtverec, glow kruhy příliš dominantní

Three.js umožňuje vytvořit výjimečnou vizuální kvalitu, ale vyžaduje designéra nebo Spline předlohu. Code-first přístup k 3D scénám bez vizuální reference produkuje průměrné výsledky.
Bundle size. Three.js + @react-three/fiber + @react-three/drei = ~1MB chunk (998 kB gzip 282 kB). I lazy-loaded je to zátěž navíc pro dětskou platformu.
Komplexita vs. hodnota. Tři iterace = hodiny práce pro vizuální výsledek který uživatel odmítl dvakrát. CSS/Framer Motion přístup přinesl lepší výsledek na první pokus.
Proč CSS/Framer Motion

Předvídatelný výsledek — vývojář/LLM ví přesně co dostane, ne jako GLSL shadery
Bundle size — nulové extra závislosti, Framer Motion už v projektu je
Maintainability — každý frontend dev rozumí CSS animacím, GLSL je specializovaná dovednost
Mobile — WebGL na mobilech je problematický (výkon, baterie), CSS animace fungují všude
Iterační rychlost — CSS změny jsou instantní, Three.js rebuild je pomalejší


Zamítnuté alternativy
Spline embed
Spline community scény vypadají profesionálně (referenční scéna e4b9c2b8-b8a6-4196-bde8-e78ece8381d6). Zamítnuto protože:

Závislost na externí službě
Omezená interaktivita s Reactem (data z DB, routing)
Spline soubory jsou těžké

Three.js se Spline předlohou
Stáhnout Spline scénu jako referenci a přepsat do Three.js. Zamítnuto — časová náročnost přesahuje hodnotu pro pre-launch stav produktu. Vhodné pro M6+.

Architektonické poznámky z iterací
FSD violation (Geminiho feedback)
První návrh vytvářel src/features/encyclopedia/ vedle existující src/features/discovery/. Zamítnuto — dvě feature domény pro stejná DB data je špagetová architektura. Správné řešení: vše zůstává v src/features/discovery/, jen se vyměňují komponenty.
Data fetching před Canvas inicializací
(Platí i pro budoucí Three.js použití v projektu.)
Data musí být načtena před inicializací WebGL Canvas. Míchat async Supabase fetch s R3F render loop způsobuje stuttery a race conditions. Pattern:
tsx// ✅ Správně
const { categories, loading } = useDiscoveryScene()
if (loading) return <LoadingScreen />
return <Suspense><LazyCanvas categories={categories} /></Suspense>

// ❌ Špatně
const MyScene = () => {
  const [data, setData] = useState([])
  useEffect(() => { fetchData().then(setData) }, []) // uvnitř Canvas
  return <mesh />
}
vendor chunk pro těžké závislosti
Pokud se Three.js v projektu někdy použije (M6 redesign Encyklopedie), musí jít do separátního vendor chunku:
ts// vite.config.ts
'vendor-threejs': ['three', '@react-three/fiber', '@react-three/drei']
Main bundle musí zůstat pod 200 kB.

Důsledky
Pozitivní:

Encyklopedie UI je maintainable bez 3D/shader znalostí
Nulový dopad na bundle size
Vizuální výsledek přijat na první CSS iteraci

Negativní / trade-offs:

CSS/SVG animace mají vizuální strop — nemůžou dosáhnout Spline-quality 3D efektů
Pro budoucí "wow factor" redesign bude potřeba Spline nebo dedikovaný design

Budoucí rozhodnutí:

Po launchi v1.0 zvážit GF-137 redesign s Three.js + Spline předlohou jako M6 feature


Reference

GF-78 — původní bug (cancelled)
GF-137 — Three.js v1 (done, pak revertováno)
GF-138 — CSS/Framer Motion verze (in progress)
Geminiho architektonický review — FSD violation + bundle size feedback