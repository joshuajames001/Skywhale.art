import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                {number}
            </span>
            {title}
        </h2>
        {children}
    </section>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 my-4 text-sm text-emerald-900 leading-relaxed">
        {children}
    </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-4 text-sm text-amber-900 leading-relaxed">
        {children}
    </div>
);

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-stone-200">
        <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-700">
                <tr>
                    {headers.map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
                {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                        {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-stone-600 align-top">{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-emerald-100 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Zpět na hlavní menu
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Zásady ochrany osobních údajů</h1>
                            <p className="text-emerald-100 mt-1">Platnost od: 1. 5. 2025 &bull; Verze 1.0</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-20 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 prose prose-emerald max-w-none text-stone-600 leading-relaxed">

                <InfoBox>
                    <strong>Stručné shrnutí pro rodiče:</strong> Skywhale je platforma určená pro rodiny. Registraci provádí rodič, 
                    který spravuje přístup svých dětí. Nikdy neprodáváme vaše data, nepoužíváme je k trénování AI modelů 
                    a fotografie nahrané do platformy jsou automaticky smazány do 24 hodin.
                </InfoBox>

                <Section number={1} title="Správce osobních údajů">
                    <p>Správcem vašich osobních údajů ve smyslu čl. 4 odst. 7 nařízení GDPR je:</p>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 my-4 text-sm font-mono text-stone-700 leading-loose">
                        <strong>[CELÉ JMÉNO]</strong><br />
                        IČO: [IČO]<br />
                        Místo podnikání: [ADRESA]<br />
                        Zapsán/a v Živnostenském rejstříku<br />
                        E-mail: <a href="mailto:privacy@skywhale.art" className="text-emerald-600 hover:underline">privacy@skywhale.art</a><br />
                        Web: <a href="https://skywhale.art" className="text-emerald-600 hover:underline">skywhale.art</a>
                    </div>
                    <p className="text-sm">
                        Nejsme povinni jmenovat pověřence pro ochranu osobních údajů (DPO). V případě dotazů k ochraně 
                        osobních údajů nás kontaktujte na výše uvedeném e-mailu.
                    </p>
                </Section>

                <Section number={2} title="Jaké osobní údaje zpracováváme a proč">
                    <p>Zpracováváme pouze údaje nezbytně nutné pro provoz služby. Níže je přehled kategorií, účelů, právního základu a doby uchovávání:</p>
                    <Table
                        headers={['Kategorie údajů', 'Účel', 'Právní základ (GDPR)', 'Doba uchování']}
                        rows={[
                            ['E-mail rodiče/zákonného zástupce', 'Registrace, přihlášení, komunikace', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu + 3 roky'],
                            ['Zašifrované heslo', 'Ověření identity při přihlášení', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu'],
                            ['Jméno (nebo přezdívka) dítěte', 'Personalizace prostředí, pojmenování profilu', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu'],
                            ['Vstupy pro generování příběhů (témata, postavy)', 'Generování obsahu pomocí AI', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu; dílčí smazání na požádání'],
                            ['Vygenerované příběhy a obrázky', 'Zobrazení uživateli, uložení v účtu', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu; dílčí smazání na požádání'],
                            ['Nahrané fotografie (volitelné)', 'Reference pro AI generování (sheet consistency)', 'Čl. 6 odst. 1 písm. a) — souhlas', 'Max. 24 hodin od nahrání, poté automatické smazání'],
                            ['IP adresa', 'Bezpečnost, ochrana před zneužitím', 'Čl. 6 odst. 1 písm. f) — oprávněný zájem', '30 dní v systémových logách'],
                            ['Typ zařízení, prohlížeč, OS', 'Zajištění funkčnosti, ladění chyb', 'Čl. 6 odst. 1 písm. f) — oprávněný zájem', '30 dní'],
                            ['Platební záznamy (přes Stripe)', 'Vedení účetní evidence', 'Čl. 6 odst. 1 písm. c) — zákonná povinnost', '10 let (zákon o účetnictví)'],
                            ['Stav předplatného a kreditů', 'Poskytování zakoupených služeb', 'Čl. 6 odst. 1 písm. b) — plnění smlouvy', 'Po dobu trvání účtu + 3 roky'],
                        ]}
                    />
                </Section>

                <Section number={3} title="Ochrana dětí — zvláštní ustanovení">
                    <WarningBox>
                        <strong>Tato sekce je nejdůležitější část těchto zásad.</strong> Pokud si přečtete jen jednu část, 
                        přečtěte si tuto.
                    </WarningBox>
                    <p>
                        Skywhale je platforma určená pro děti, avšak <strong>účet vždy zakládá a spravuje rodič nebo zákonný zástupce</strong>.
                        Děti nemají samostatný přístup k registraci.
                    </p>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Věk digitálního souhlasu</h3>
                    <p>
                        V souladu s § 7 zákona č. 110/2019 Sb. (česká adaptace GDPR) je věk, od kterého může osoba 
                        samostatně udělit souhlas se zpracováním osobních údajů v kontextu informační společnosti, 
                        stanoven na <strong>15 let v České republice</strong> a <strong>16 let ve Slovenské republice</strong>.
                        Pro mladší děti je vyžadován souhlas rodiče nebo zákonného zástupce, který registrací účtu tento 
                        souhlas uděluje.
                    </p>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Zásady ochrany dětských dat</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Sbíráme o dětech <strong>pouze nezbytně nutné údaje</strong> (jméno nebo přezdívka pro profil).</li>
                        <li><strong>Neprofilujeme děti</strong> ani nevytváříme automatizované profily pro marketingové účely.</li>
                        <li><strong>Neprovádíme behaviorální reklamu</strong> cílenou na děti.</li>
                        <li>Veškerý obsah generovaný AI je <strong>automaticky filtrován</strong> pro zajištění věkové přiměřenosti.</li>
                        <li>Rodič má právo kdykoliv <strong>zkontrolovat, upravit nebo smazat</strong> veškerý obsah spojený s profilem dítěte.</li>
                        <li>Data dítěte jsou <strong>smazána okamžitě</strong> po zrušení účtu rodiče.</li>
                    </ul>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Nahrané fotografie</h3>
                    <p>
                        Funkce nahrání fotografie je volitelná a slouží výhradně jako vizuální reference pro AI generování 
                        (tzv. sheet consistency). Doporučujeme <strong>nenahrávat fotografie osob</strong> — funkce funguje 
                        stejně dobře s fotografií hračky, kreslené postavičky nebo zvířete.
                    </p>
                    <p>
                        Pokud se rozhodnete nahrát fotografii, berte prosím na vědomí, že:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fotografie je <strong>automaticky smazána do 24 hodin</strong> od nahrání.</li>
                        <li>Fotografie je <strong>odeslána do API Black Forest Labs</strong> (BFL) za účelem generování obrázků — viz sekce 5.</li>
                        <li>Nahráním fotografie udělujete souhlas s tímto zpracováním. Souhlas lze odvolat smazáním fotografie v nastavení účtu (fotografie je pak smazána okamžitě, nikoliv až po 24 hodinách).</li>
                        <li><strong>Nenahrávejte fotografie jiných osob bez jejich souhlasu</strong>, zejména fotografií dětí bez souhlasu jejich zákonných zástupců.</li>
                    </ul>
                </Section>

                <Section number={4} title="Sdílení dat se třetími stranami (sub-processoři)">
                    <p>
                        Vaše data <strong>nikdy neprodáváme</strong> třetím stranám. Sdílíme je pouze s poskytovateli 
                        technických služeb nezbytných pro provoz platformy, a to vždy v minimálním rozsahu nutném pro 
                        daný účel. Všichni níže uvedení zpracovatelé jsou smluvně vázáni k ochraně dat.
                    </p>
                    <Table
                        headers={['Zpracovatel', 'Účel', 'Sídlo / Přenos dat', 'Co sdílíme']}
                        rows={[
                            ['Supabase Inc.', 'Autentizace, databáze, úložiště souborů', 'USA — SCCs, možnost EU hosting', 'Účetní data, obsah příběhů, nahrané fotografie'],
                            ['Anthropic PBC', 'Generování příběhů (Claude AI)', 'USA — DPA + SCCs k dispozici', 'Pouze textové vstupy (témata, postavy) — bez PII'],
                            ['Black Forest Labs GmbH', 'Generování obrázků (Flux AI)', 'Německo — EU entita, GDPR se vztahuje přímo', 'Textové prompty + nahrané fotografie (je-li nahráno)'],
                            ['Stripe Inc.', 'Zpracování plateb, správa předplatného', 'USA — DPA + SCCs, certifikace PCI-DSS', 'E-mail, platební údaje (karta není předávána nám)'],
                        ]}
                    />
                    <p className="text-sm text-stone-500 mt-2">
                        SCCs = Standardní smluvní doložky EU pro přenos dat do třetích zemí dle čl. 46 GDPR.
                        DPA = Data Processing Agreement (Smlouva o zpracování osobních údajů).
                    </p>
                    <InfoBox>
                        <strong>Důležité o Anthropic (Claude):</strong> Textové vstupy pro generování příběhů 
                        (témata, jména postav, zadání) jsou odesílány do API Anthropic. Nepředáváme žádné 
                        identifikační údaje (e-mail, jméno rodiče). Anthropic má s námi uzavřenu DPA a 
                        zavazuje se data nepoužívat k trénování modelů bez souhlasu.
                    </InfoBox>
                </Section>

                <Section number={5} title="Mezinárodní přenosy osobních údajů">
                    <p>
                        Někteří naši zpracovatelé (Supabase, Anthropic, Stripe) sídlí v USA — třetí zemi mimo EHP. 
                        Přenosy dat do těchto zemí jsou zabezpečeny pomocí <strong>Standardních smluvních doložek EU</strong> 
                        (Standard Contractual Clauses, SCCs) schválených Evropskou komisí dle čl. 46 odst. 2 písm. c) GDPR.
                    </p>
                    <p>
                        Black Forest Labs GmbH sídlí v Německu a zpracování dat probíhá v rámci EU — přenos dat 
                        do třetí země se neuskutečňuje.
                    </p>
                </Section>

                <Section number={6} title="Vaše práva jako subjektu údajů">
                    <p>Jako subjekt údajů (resp. rodič spravující data svého dítěte) máte následující práva:</p>
                    <Table
                        headers={['Právo', 'Co znamená', 'Jak uplatnit']}
                        rows={[
                            ['Právo na přístup (čl. 15)', 'Získat kopii všech vašich osobních údajů', 'E-mail na privacy@skywhale.art'],
                            ['Právo na opravu (čl. 16)', 'Opravit nepřesné nebo neúplné údaje', 'Nastavení účtu nebo e-mail'],
                            ['Právo na výmaz (čl. 17)', 'Smazat váš účet a veškerá data', 'Nastavení účtu → Smazat účet'],
                            ['Právo na omezení zpracování (čl. 18)', 'Omezit způsob, jakým data používáme', 'E-mail na privacy@skywhale.art'],
                            ['Právo na přenositelnost (čl. 20)', 'Získat data ve strojově čitelném formátu (JSON)', 'E-mail na privacy@skywhale.art'],
                            ['Právo vznést námitku (čl. 21)', 'Namítat zpracování na základě oprávněného zájmu', 'E-mail na privacy@skywhale.art'],
                            ['Právo odvolat souhlas', 'Odvolat souhlas se zpracováním (nahrané fotografie)', 'Smazání fotografie v nastavení účtu'],
                            ['Právo podat stížnost', 'Podat stížnost u dozorového úřadu', 'Viz níže'],
                        ]}
                    />
                    <p className="text-sm mt-4">
                        Na vaše žádosti reagujeme <strong>do 30 dnů</strong> od obdržení. V složitých případech lze lhůtu 
                        prodloužit o dalších 60 dní, o čemž vás budeme informovat.
                    </p>
                    <InfoBox>
                        <strong>Dozorový úřad pro ochranu osobních údajů v ČR:</strong><br />
                        Úřad pro ochranu osobních údajů (ÚOOÚ)<br />
                        Pplk. Sochora 27, 170 00 Praha 7<br />
                        Web: <a href="https://www.uoou.cz" className="text-emerald-700 underline" target="_blank" rel="noopener noreferrer">www.uoou.cz</a> &bull; Tel.: +420 234 514 111
                    </InfoBox>
                </Section>

                <Section number={7} title="Zabezpečení dat">
                    <p>K ochraně vašich dat přijímáme následující technická a organizační opatření:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Přenos dat je šifrován pomocí <strong>TLS/HTTPS</strong>.</li>
                        <li>Hesla jsou ukládána výhradně v <strong>hashované podobě</strong> (bcrypt) — přímý přístup k heslu není možný.</li>
                        <li>Přístup k databázi je řízen pomocí <strong>Row Level Security (RLS)</strong> v Supabase — každý uživatel vidí pouze svá vlastní data.</li>
                        <li>Platební údaje (číslo karty) <strong>nikdy neprojdou naším serverem</strong> — zpracovává je výhradně Stripe s certifikací PCI-DSS Level 1.</li>
                        <li>Nahrané fotografie jsou uloženy v izolovaném Supabase storage bucketu s omezeným přístupem.</li>
                        <li>V případě narušení bezpečnosti dat vás budeme informovat <strong>do 72 hodin</strong> v souladu s čl. 33 a 34 GDPR.</li>
                    </ul>
                </Section>

                <Section number={8} title="Automatizované rozhodování a profilování">
                    <p>
                        Skywhale <strong>neprovádí automatizované rozhodování</strong> s právními nebo jinak závažnými dopady 
                        na uživatele ve smyslu čl. 22 GDPR. AI generuje obsah (příběhy, obrázky) na základě vašich vstupů — 
                        nejde o rozhodování o uživatelích, ale o tvorbu kreativního obsahu pro ně.
                    </p>
                    <p>
                        Filtrování obsahu (bezpečnostní filtr nevhodného obsahu) je automatizovaný proces, který 
                        <strong> neovlivňuje práva uživatelů</strong> — pouze zajišťuje věkovou přiměřenost generovaného obsahu.
                    </p>
                </Section>

                <Section number={9} title="Soubory cookie">
                    <p>
                        Informace o používání cookies na platformě Skywhale najdete v samostatném dokumentu{' '}
                        <strong>Zásady cookies</strong>, dostupném na <a href="/cookies" className="text-emerald-600 hover:underline">skywhale.art/cookies</a>.
                    </p>
                </Section>

                <Section number={10} title="Změny těchto zásad">
                    <p>
                        Tyto zásady můžeme aktualizovat. O změnách vás budeme informovat:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>E-mailem na adresu spojenou s vaším účtem (u podstatných změn).</li>
                        <li>Oznámením v rozhraní aplikace.</li>
                    </ul>
                    <p>
                        Datum poslední aktualizace je vždy uvedeno v záhlaví tohoto dokumentu. Pokračováním v používání 
                        platformy po oznámení změn vyjadřujete souhlas s aktualizovaným zněním. Pokud se změnami 
                        nesouhlasíte, máte právo svůj účet smazat.
                    </p>
                </Section>

                {/* Contact box */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mt-8">
                    <h3 className="font-bold text-emerald-800 mb-3 text-lg">Kontakt ve věci ochrany osobních údajů</h3>
                    <p className="text-sm text-emerald-900 leading-loose">
                        E-mail: <a href="mailto:privacy@skywhale.art" className="text-emerald-600 hover:underline font-medium">privacy@skywhale.art</a><br />
                        Odpovídáme do 5 pracovních dnů.<br /><br />
                        <strong>Poštovní adresa:</strong><br />
                        [CELÉ JMÉNO]<br />
                        [ADRESA]
                    </p>
                </div>

                <p className="text-xs text-stone-400 mt-8 text-center">
                    Verze 1.0 &bull; Platnost od 1. 5. 2025 &bull; Tyto zásady se řídí právem České republiky a nařízením GDPR (EU) 2016/679.
                </p>

            </div>
        </motion.div>
    );
};
