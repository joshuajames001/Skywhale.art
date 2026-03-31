import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                {number}
            </span>
            {title}
        </h2>
        {children}
    </section>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 my-4 text-sm text-blue-900 leading-relaxed">
        {children}
    </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-4 text-sm text-amber-900 leading-relaxed">
        {children}
    </div>
);

const ImportantBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 my-4 text-sm text-red-900 leading-relaxed">
        {children}
    </div>
);

export const TermsOfService = ({ onBack }: { onBack: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-blue-100 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Zpět na hlavní menu
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Všeobecné obchodní podmínky</h1>
                            <p className="text-blue-100 mt-1">Platnost od: 1. 5. 2025 &bull; Verze 1.0</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-20 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 prose prose-blue max-w-none text-stone-600 leading-relaxed">

                <InfoBox>
                    <strong>Stručné shrnutí:</strong> Skywhale je platforma pro tvorbu dětských příběhů pomocí AI.
                    Účet zakládá rodič, který spravuje přístup dítěte. Platby probíhají přes Stripe.
                    Vygenerovaný obsah patří vám. AI modely jsme smluvně zavázali vaše data nepoužívat k trénování.
                    Máte 14 dní na odstoupení od smlouvy (s výjimkou okamžitě spotřebovaných digitálních služeb).
                </InfoBox>

                {/* Identifikace provozovatele */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-10">
                    <h3 className="font-bold text-stone-800 mb-3">Identifikace provozovatele</h3>
                    <p className="text-sm text-stone-700 leading-loose font-mono">
                        Provozovatel: <strong>[CELÉ JMÉNO]</strong><br />
                        IČO: [IČO]<br />
                        Místo podnikání: [ADRESA]<br />
                        Zapsán/a v Živnostenském rejstříku<br />
                        Nejsem plátcem DPH.<br />
                        E-mail: <a href="mailto:support@skywhale.art" className="text-blue-600 hover:underline">support@skywhale.art</a><br />
                        Web: <a href="https://skywhale.art" className="text-blue-600 hover:underline">skywhale.art</a>
                    </p>
                </div>

                <Section number={1} title="Úvodní ustanovení a definice">
                    <p>
                        Tyto všeobecné obchodní podmínky (dále jen <strong>„Podmínky"</strong>) upravují práva
                        a povinnosti mezi provozovatelem platformy Skywhale (dále jen <strong>„Poskytovatel"</strong>)
                        a uživatelem (dále jen <strong>„Uživatel"</strong>) při využívání služby dostupné na doméně
                        skywhale.art (dále jen <strong>„Platforma"</strong> nebo <strong>„Služba"</strong>).
                    </p>
                    <p>
                        Tyto Podmínky se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb.
                        (občanský zákoník) a zákonem č. 634/1992 Sb. (zákon o ochraně spotřebitele).
                    </p>
                    <p>
                        Registrací uživatelského účtu nebo využíváním Služby vyjadřuje Uživatel svůj souhlas
                        s těmito Podmínkami v jejich aktuálním znění.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Definice pojmů</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Uživatel</strong> — fyzická osoba (rodič nebo zákonný zástupce), která si na Platformě zaregistrovala účet.</li>
                        <li><strong>Dítě</strong> — fyzická osoba mladší 15 let (v ČR) nebo 16 let (v SR), jejíž přístup k Platformě spravuje Uživatel.</li>
                        <li><strong>Obsah</strong> — veškeré příběhy, obrázky a jiný obsah vygenerovaný Platformou na základě vstupů Uživatele.</li>
                        <li><strong>Vstup</strong> — textové zadání, nahrané fotografie nebo jiné podněty, které Uživatel poskytuje Platformě za účelem generování Obsahu.</li>
                        <li><strong>Energie</strong> — virtuální kredity sloužící k čerpání placených funkcí Platformy.</li>
                        <li><strong>Předplatné</strong> — opakující se platba za přístup k prémiové verzi Platformy.</li>
                    </ul>
                </Section>

                <Section number={2} title="Způsobilost k registraci a ochrana dětí">
                    <WarningBox>
                        <strong>Platforma je určena pro rodiny s dětmi.</strong> Registraci vždy provádí rodič
                        nebo zákonný zástupce, nikoli dítě samotné. Vytvoření účtu přímo dítětem je zakázáno.
                    </WarningBox>
                    <p>
                        Registrací účtu Uživatel prohlašuje a zaručuje, že:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Je plnoletou fyzickou osobou způsobilou k právním úkonům.</li>
                        <li>Registruje-li účet pro dítě mladší 15 let (v ČR) nebo 16 let (v SR), je jeho rodičem nebo zákonným zástupcem a uděluje za dítě souhlas dle čl. 8 GDPR a § 7 zákona č. 110/2019 Sb.</li>
                        <li>Bere na vědomí, že je jako rodič/zákonný zástupce <strong>plně odpovědný</strong> za způsob využívání Platformy dítětem.</li>
                        <li>Bude dohlížet na to, aby dítě Platformu využívalo přiměřeně svému věku a v souladu s těmito Podmínkami.</li>
                    </ul>
                    <p className="mt-4">
                        Poskytovatel si vyhrazuje právo zrušit účet, u nějž existuje důvodné podezření, že byl
                        vytvořen osobou mladší výše uvedených věkových hranic bez souhlasu zákonného zástupce.
                    </p>
                </Section>

                <Section number={3} title="Popis služby">
                    <p>
                        Skywhale je platforma umožňující generování personalizovaných dětských příběhů a ilustrací
                        pomocí technologií umělé inteligence. Platforma využívá následující technologie třetích stran:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Anthropic Claude</strong> — generování textu příběhů na základě zadání Uživatele.</li>
                        <li><strong>Black Forest Labs (Flux)</strong> — generování ilustrací na základě textových promptů a volitelně nahraných fotografií.</li>
                        <li><strong>Supabase</strong> — autentizace, ukládání dat a souborů.</li>
                        <li><strong>Stripe</strong> — zpracování plateb a správa předplatného.</li>
                    </ul>
                    <p className="mt-4">
                        Platforma je poskytována <strong>„tak jak je"</strong> (as-is). Vzhledem k povaze AI technologií
                        Poskytovatel nezaručuje, že vygenerovaný obsah bude vždy přesně odpovídat zadání Uživatele.
                        AI může interpretovat zadání neočekávaným způsobem nebo vygenerovat obsah odlišný od očekávání.
                    </p>
                    <InfoBox>
                        <strong>V souladu s nařízením EU o umělé inteligenci (AI Act):</strong> Veškerý obsah
                        vygenerovaný Platformou je strojově generovaný. Uživatel je o tomto faktu informován
                        prostřednictvím tohoto dokumentu i rozhraní Platformy.
                    </InfoBox>
                </Section>

                <Section number={4} title="Uživatelský účet">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Pro využívání placených a pokročilých funkcí Platformy je nutná registrace.</li>
                        <li>Uživatel je povinen uvádět pravdivé a přesné údaje a udržovat je aktuální.</li>
                        <li>Uživatel nese plnou odpovědnost za bezpečnost svých přihlašovacích údajů.</li>
                        <li>V případě podezření na neoprávněný přístup k účtu je Uživatel povinen neprodleně kontaktovat Poskytovatele na <a href="mailto:support@skywhale.art" className="text-blue-600 hover:underline">support@skywhale.art</a>.</li>
                        <li>Jeden Uživatel může spravovat více profilů dětí v rámci jednoho účtu.</li>
                        <li>Poskytovatel si vyhrazuje právo pozastavit nebo zrušit účet, který porušuje tyto Podmínky nebo platné právní předpisy, a to bez nároku na náhradu nevyčerpané Energie nebo předplatného v případě závažného porušení.</li>
                    </ul>
                </Section>

                <Section number={5} title="Energetický kreditový systém (Energie)">
                    <p>
                        Některé funkce Platformy jsou podmíněny čerpáním virtuálních kreditů označovaných jako
                        <strong> „Energie"</strong>. Energie nejsou měnou, nemají peněžní hodnotu a nelze je převést
                        na peníze ani na jiný účet.
                    </p>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Získávání Energie</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Uvítací bonus:</strong> Každý nový registrovaný účet obdrží jednorázový uvítací bonus Energie.</li>
                        <li><strong>Předplatné:</strong> Aktivní předplatné přináší měsíční přídavek Energie dle zvoleného tarifu.</li>
                        <li><strong>Jednorázové nákupy:</strong> Uživatel si může dokoupit balíčky Energie.</li>
                    </ul>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Pravidla čerpání</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Energie se čerpá automaticky při použití placených funkcí (generování příběhů, obrázků apod.).</li>
                        <li>Aktuální cena v Energii za jednotlivé funkce je zobrazena v rozhraní Platformy před každou akcí.</li>
                        <li>Energie z předplatného <strong>se převádí</strong> do dalšího období, pokud je předplatné aktivní.</li>
                        <li>Energie z jednorázových nákupů <strong>nevyprší</strong> po dobu existence účtu.</li>
                        <li>Po zrušení účtu jsou veškeré nevyčerpané kredity anulovány bez náhrady.</li>
                    </ul>
                </Section>

                <Section number={6} title="Předplatné, platby a fakturace">
                    <h3 className="text-lg font-bold text-stone-700 mt-2 mb-3">Platební podmínky</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Platby jsou zpracovávány prostřednictvím <strong>Stripe Inc.</strong> — zabezpečené platební brány s certifikací PCI-DSS Level 1.</li>
                        <li>Poskytovatel nemá přístup k číslu platební karty ani jiným citlivým platebním údajům.</li>
                        <li>Ceny jsou uvedeny v <strong>českých korunách (CZK)</strong>. Poskytovatel není plátcem DPH — cena zobrazená na Platformě je konečná.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Automatické obnovení předplatného</h3>
                    <WarningBox>
                        <strong>Upozornění na automatické obnovení:</strong> Předplatné se automaticky obnovuje
                        na další období (měsíční nebo roční). Platba za nové období je stržena <strong>24 hodin
                        před koncem aktuálního období</strong> z uložené platební metody. O blížícím se obnovení
                        vás upozorníme e-mailem alespoň 3 dny předem.
                    </WarningBox>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Zrušení předplatného</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Předplatné lze kdykoliv zrušit v <strong>nastavení účtu → Předplatné → Zrušit předplatné</strong>.</li>
                        <li>Zrušení nabývá účinnosti ke <strong>konci aktuálního předplaceného období</strong> — přístup k prémiovým funkcím zůstává aktivní do tohoto data.</li>
                        <li>Po uplynutí předplaceného období bude účet převeden na bezplatný tarif (pokud existuje) nebo deaktivován.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Změny cen</h3>
                    <p>
                        O jakékoli změně ceny předplatného budete informováni <strong>nejméně 30 dní předem</strong> e-mailem.
                        V takovém případě máte právo předplatné zrušit před nabytím účinnosti nové ceny.
                    </p>
                </Section>

                <Section number={7} title="Právo na odstoupení od smlouvy (14denní lhůta)">
                    <InfoBox>
                        <strong>Tato sekce je povinná informace dle zákona č. 634/1992 Sb. a směrnice EU 2011/83/EU
                        o právech spotřebitelů.</strong>
                    </InfoBox>

                    <h3 className="text-lg font-bold text-stone-700 mt-4 mb-3">Základní pravidlo</h3>
                    <p>
                        Jako spotřebitel máte právo odstoupit od smlouvy uzavřené na dálku (přes internet)
                        <strong> bez udání důvodu ve lhůtě 14 dnů</strong> od uzavření smlouvy (tj. od dokončení platby),
                        a to v souladu s § 1829 odst. 1 občanského zákoníku.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Výjimka pro digitální obsah — jednorázové nákupy Energie</h3>
                    <ImportantBox>
                        <strong>Důležité upozornění před nákupem Energie:</strong> Při nákupu balíčku Energie
                        budete před dokončením platby výslovně požádáni o souhlas s okamžitým dodáním digitálního
                        obsahu. Udělením tohoto souhlasu <strong>ztrácíte právo na odstoupení od smlouvy</strong>
                        ve 14denní lhůtě v souladu s § 1837 písm. l) občanského zákoníku — a to v okamžiku,
                        kdy začnete Energii čerpat. Pokud Energii nezačnete čerpat, právo na odstoupení zůstává zachováno.
                    </ImportantBox>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Předplatné — plné právo na odstoupení</h3>
                    <p>
                        Na předplatné se právo na odstoupení vztahuje v plném rozsahu po dobu 14 dnů od uzavření
                        smlouvy, <strong>pokud jste v této lhůtě nečerpali žádnou Energii z předplatného</strong>.
                        V takovém případě vám vrátíme plnou zaplacenou částku.
                    </p>
                    <p className="mt-3">
                        Pokud jste v průběhu 14denní lhůty část Energie z předplatného již vyčerpali, máte právo
                        na <strong>poměrnou část vrácení</strong> odpovídající nevyužité době a nevyčerpané Energii.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Jak odstoupit od smlouvy</h3>
                    <p>Pro uplatnění práva na odstoupení nás kontaktujte e-mailem na{' '}
                        <a href="mailto:support@skywhale.art" className="text-blue-600 hover:underline">support@skywhale.art</a>{' '}
                        s předmětem <strong>„Odstoupení od smlouvy"</strong> a uveďte:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>E-mail spojený s vaším účtem</li>
                        <li>Datum a typ nákupu (předplatné / balíček Energie)</li>
                        <li>Sdělení, že odstupujete od smlouvy</li>
                    </ul>
                    <p className="mt-3">
                        Vrácení platby provedeme <strong>do 14 dnů</strong> od obdržení žádosti, stejnou platební
                        metodou, jakou jste použili při nákupu.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Vzorový formulář pro odstoupení</h3>
                    <div className="bg-stone-100 border border-stone-300 rounded-xl p-5 text-sm font-mono text-stone-700 leading-loose">
                        Komu: Skywhale, [JMÉNO], [ADRESA], support@skywhale.art<br /><br />
                        Oznamuji, že tímto odstupuji od smlouvy o poskytování digitální služby / předplatného<br />
                        uzavřené dne: _______________<br />
                        E-mail účtu: _______________<br />
                        Jméno spotřebitele: _______________<br />
                        Adresa spotřebitele: _______________<br />
                        Datum: _______________<br />
                        Podpis (pouze při zasílání v listinné podobě): _______________
                    </div>
                </Section>

                <Section number={8} title="Duševní vlastnictví a vlastnictví obsahu">
                    <h3 className="text-lg font-bold text-stone-700 mt-2 mb-3">Obsah vygenerovaný Platformou</h3>
                    <p>
                        Příběhy a obrázky vygenerované Platformou na základě vašich vstupů jsou
                        <strong> vaším vlastnictvím</strong> v rozsahu, v jakém to umožňuje platné autorské právo.
                    </p>
                    <InfoBox>
                        <strong>Poznámka k autorskému právu AI obsahu:</strong> Právní úprava autorství AI generovaného
                        obsahu se v EU i ČR stále vyvíjí. V rozsahu, v jakém je obsah chráněn autorským právem,
                        náleží tato práva Uživateli jako osobě, která zadala tvůrčí vstupy. Poskytovatel si
                        nevyhrazuje žádná autorská práva k vygenerovanému obsahu.
                    </InfoBox>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Licence Uživatele vůči Poskytovateli</h3>
                    <p>
                        Uživatel uděluje Poskytovateli <strong>nevýhradní, bezplatnou, odvolatelnou licenci</strong> k vygenerovanému
                        obsahu výhradně za účelem:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Ukládání a zobrazování obsahu v rámci Platformy Uživateli.</li>
                        <li>Technického zpracování nezbytného pro provoz Služby.</li>
                    </ul>
                    <p className="mt-3">
                        <strong>Obsah Uživatelů není a nebude použit k trénování AI modelů.</strong> Poskytovatel
                        smluvně zavázal své AI poskytovatele (Anthropic, Black Forest Labs) k dodržení tohoto principu.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Vstupy Uživatele (nahrané fotografie)</h3>
                    <p>
                        Nahráním fotografie nebo jiného materiálu Uživatel prohlašuje, že:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Je oprávněn daný materiál nahrát a použít pro tento účel.</li>
                        <li>Nenahrává fotografie jiných osob bez jejich souhlasu, zejména fotografie dětí bez souhlasu jejich zákonných zástupců.</li>
                        <li>Materiál neporušuje práva třetích stran (autorská práva, právo na ochranu osobnosti apod.).</li>
                    </ul>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Platforma a její prvky</h3>
                    <p>
                        Veškerá práva k samotné Platformě — včetně kódu, designu, loga Skywhale, systému Energie
                        a dalších prvků — náležejí výhradně Poskytovateli a jsou chráněna autorským právem.
                    </p>
                </Section>

                <Section number={9} title="Pravidla přijatelného použití">
                    <p>Uživatel se zavazuje Platformu nevyužívat k:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Generování obsahu, který je nezákonný, nenávistný, pornografický, násilný nebo podněcující k diskriminaci.</li>
                        <li>Generování obsahu poškozujícího děti nebo ohrožujícího jejich bezpečnost.</li>
                        <li>Porušování autorských práv, ochranných známek nebo práv na ochranu osobnosti třetích stran.</li>
                        <li>Šíření dezinformací nebo obsahu, který by mohl uvést ostatní v omyl.</li>
                        <li>Pokusům o obejití bezpečnostních mechanismů Platformy nebo jejích AI filtrů.</li>
                        <li>Automatizovanému přístupu k Platformě (scrapování, boty) bez výslovného písemného souhlasu Poskytovatele.</li>
                        <li>Komerčnímu využití vygenerovaného obsahu způsobem, který poškozuje dobré jméno Skywhale.</li>
                    </ul>
                    <p className="mt-4">
                        Při zjištění porušení těchto pravidel si Poskytovatel vyhrazuje právo okamžitě pozastavit
                        nebo trvale zrušit účet bez nároku na vrácení nevyčerpané Energie nebo předplatného.
                        Závažná porušení budou nahlášena příslušným orgánům.
                    </p>
                </Section>

                <Section number={10} title="Dostupnost služby a odpovědnost">
                    <p>
                        Poskytovatel vynakládá přiměřené úsilí k zajištění dostupnosti Platformy, ale
                        <strong> nezaručuje nepřetržitou dostupnost</strong>. Platforma může být dočasně nedostupná
                        z důvodu plánované nebo neplánované údržby, výpadků třetích stran (Anthropic, BFL, Supabase,
                        Stripe) nebo jiných okolností mimo kontrolu Poskytovatele.
                    </p>
                    <p className="mt-4">
                        Poskytovatel <strong>neodpovídá</strong> za:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Nepřesnosti nebo nevhodnost AI generovaného obsahu — rodič/zákonný zástupce je povinen obsah zkontrolovat před předáním dítěti.</li>
                        <li>Ztrátu dat způsobenou okolnostmi mimo kontrolu Poskytovatele.</li>
                        <li>Přímé nebo nepřímé škody vzniklé z přerušení dostupnosti Služby, s výjimkou případů úmyslu nebo hrubé nedbalosti.</li>
                        <li>Obsah třetích stran dostupný prostřednictvím externích odkazů z Platformy.</li>
                    </ul>
                    <p className="mt-4">
                        Odpovědnost Poskytovatele je v maximální míře povolené platným právem omezena na výši
                        částky zaplacené Uživatelem za Službu v posledních 3 měsících před vznikem škody.
                    </p>
                </Section>

                <Section number={11} title="Mimosoudní řešení sporů">
                    <p>
                        V případě sporu mezi Uživatelem (spotřebitelem) a Poskytovatelem má Uživatel právo
                        na mimosoudní řešení sporu. Příslušným subjektem mimosoudního řešení spotřebitelských
                        sporů je:
                    </p>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 my-4 text-sm text-stone-700 leading-loose">
                        <strong>Česká obchodní inspekce (ČOI)</strong><br />
                        Ústřední inspektorát — oddělení ADR<br />
                        Štěpánská 796/44, 110 00 Praha 1<br />
                        Web: <a href="https://www.coi.cz" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.coi.cz</a> &bull;
                        E-mail: <a href="mailto:adr@coi.cz" className="text-blue-600 hover:underline">adr@coi.cz</a>
                    </div>
                    <p>
                        Uživatelé z EU mohou rovněž využít platformu pro online řešení sporů (ODR) provozovanou
                        Evropskou komisí:{' '}
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ec.europa.eu/consumers/odr
                        </a>
                    </p>
                </Section>

                <Section number={12} title="Změny podmínek">
                    <p>
                        Poskytovatel si vyhrazuje právo tyto Podmínky měnit. O podstatných změnách budete
                        informováni <strong>nejméně 30 dní předem</strong> e-mailem a oznámením v rozhraní Platformy.
                    </p>
                    <p className="mt-3">
                        Pokud se změnami nesouhlasíte, máte právo svůj účet zrušit před nabytím jejich účinnosti.
                        Pokračováním v používání Platformy po datu účinnosti změn vyjadřujete souhlas s novým zněním Podmínek.
                    </p>
                    <p className="mt-3">
                        Datum poslední aktualizace je vždy uvedeno v záhlaví tohoto dokumentu. Archivní verze
                        Podmínek jsou dostupné na vyžádání na <a href="mailto:support@skywhale.art" className="text-blue-600 hover:underline">support@skywhale.art</a>.
                    </p>
                </Section>

                <Section number={13} title="Závěrečná ustanovení">
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Rozhodné právo:</strong> Tyto Podmínky se řídí právem České republiky. Spory budou řešeny příslušnými soudy v ČR.</li>
                        <li><strong>Oddělitelnost:</strong> Pokud bude některé ustanovení těchto Podmínek shledáno neplatným nebo nevymahatelným, ostatní ustanovení zůstávají v plné platnosti.</li>
                        <li><strong>Celá dohoda:</strong> Tyto Podmínky spolu se Zásadami ochrany osobních údajů a Zásadami cookies tvoří úplnou dohodu mezi Poskytovatelem a Uživatelem.</li>
                        <li><strong>Postoupení:</strong> Uživatel není oprávněn postoupit svá práva a povinnosti z těchto Podmínek na třetí osobu bez předchozího písemného souhlasu Poskytovatele.</li>
                        <li><strong>Jazyková verze:</strong> Tyto Podmínky jsou primárně vyhotoveny v českém jazyce. Případný anglický překlad slouží pouze pro informaci — v případě rozporu má přednost česká verze.</li>
                    </ul>
                </Section>

                {/* Contact box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-8">
                    <h3 className="font-bold text-blue-800 mb-3 text-lg">Kontakt</h3>
                    <p className="text-sm text-blue-900 leading-loose">
                        Máte dotazy k těmto Podmínkám? Napište nám:<br />
                        E-mail: <a href="mailto:support@skywhale.art" className="text-blue-600 hover:underline font-medium">support@skywhale.art</a><br /><br />
                        <strong>[CELÉ JMÉNO]</strong><br />
                        [ADRESA]
                    </p>
                </div>

                <p className="text-xs text-stone-400 mt-8 text-center">
                    Verze 1.0 &bull; Platnost od 1. 5. 2025 &bull; Tyto Podmínky se řídí právem České republiky (zákon č. 89/2012 Sb., zákon č. 634/1992 Sb.) a relevantními předpisy EU.
                </p>

            </div>
        </motion.div>
    );
};
