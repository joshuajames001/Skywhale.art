import React, { useState } from 'react';
import { ArrowLeft, CreditCard, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
            <span className="bg-violet-100 text-violet-700 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                {number}
            </span>
            {title}
        </h2>
        {children}
    </section>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-violet-50 border border-violet-100 rounded-xl p-5 my-4 text-sm text-violet-900 leading-relaxed">
        {children}
    </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-4 text-sm text-amber-900 leading-relaxed">
        {children}
    </div>
);

type ScenarioCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    outcome: string;
    positive: boolean;
};

const ScenarioCard = ({ icon, title, description, outcome, positive }: ScenarioCardProps) => (
    <div className={`rounded-xl border p-5 ${positive ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
        <div className="flex items-start gap-3">
            <div className={`mt-0.5 shrink-0 ${positive ? 'text-green-600' : 'text-red-400'}`}>{icon}</div>
            <div>
                <p className="font-semibold text-stone-800 text-sm">{title}</p>
                <p className="text-stone-600 text-sm mt-1">{description}</p>
                <p className={`text-sm font-medium mt-2 ${positive ? 'text-green-700' : 'text-red-600'}`}>
                    → {outcome}
                </p>
            </div>
        </div>
    </div>
);

export const RefundPolicy = ({ onBack }: { onBack?: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-500 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 text-violet-100 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Zpět
                        </button>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Zásady předplatného a vrácení peněz</h1>
                            <p className="text-violet-100 mt-1">Platnost od: 1. 5. 2025 &bull; Verze 1.0</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-20 w-20 h-20 bg-violet-400/20 rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 prose prose-violet max-w-none text-stone-600 leading-relaxed">

                <InfoBox>
                    <strong>Stručně:</strong> Máte zákonné právo odstoupit od smlouvy do 14 dní. U předplatného
                    vrátíme plnou částku pokud jste nečerpali Energii. U balíčků Energie vrátíme poměrnou část
                    za nevyčerpanou Energii pokud jste nám dali souhlas k okamžitému dodání. Platby zpracovává
                    Stripe — vrácení přijde stejnou cestou jako platba, obvykle do 5–10 pracovních dní.
                </InfoBox>

                <Section number={1} title="Platební podmínky a zpracovatel plateb">
                    <p>
                        Veškeré platby na Skywhale jsou zpracovávány prostřednictvím{' '}
                        <strong>Stripe Inc.</strong> — globální platební brány s certifikací PCI-DSS Level 1.
                        Provozovatel Skywhale <strong>nemá přístup k číslu vaší platební karty</strong> ani
                        k jiným citlivým platebním údajům — tyto informace zpracovává výhradně Stripe.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Ceny jsou uvedeny v <strong>českých korunách (CZK)</strong>.</li>
                        <li>Provozovatel <strong>není plátcem DPH</strong> — zobrazená cena je konečná bez dalších poplatků.</li>
                        <li>Potvrzení každé platby obdržíte e-mailem od Stripe na adresu spojenou s vaším účtem.</li>
                        <li>Stripe uchovává záznamy o platbách v souladu s PCI-DSS a GDPR.</li>
                    </ul>
                </Section>

                <Section number={2} title="Přehled produktů a jejich podmínek">

                    <h3 className="text-lg font-bold text-stone-700 mt-2 mb-4">Předplatné (měsíční / roční)</h3>
                    <div className="overflow-x-auto rounded-xl border border-stone-200 my-4">
                        <table className="w-full text-sm">
                            <thead className="bg-stone-100 text-stone-700">
                                <tr>
                                    {['Vlastnost', 'Měsíční', 'Roční'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {[
                                    ['Fakturační cyklus', 'Každý měsíc', 'Jednou ročně'],
                                    ['Automatické obnovení', 'Ano — 24 h před koncem', 'Ano — 24 h před koncem'],
                                    ['Upozornění před obnovením', 'E-mail 3 dny předem', 'E-mail 14 dní předem'],
                                    ['Zrušení', 'Kdykoliv, účinné ke konci období', 'Kdykoliv, účinné ke konci roku'],
                                    ['Energie — přidělení', 'Měsíčně', 'Měsíčně (po celý rok)'],
                                    ['Nevyčerpaná Energie', 'Převádí se dál (při aktivním předplatném)', 'Převádí se dál'],
                                ].map(([prop, monthly, yearly], i) => (
                                    <tr key={i} className="hover:bg-stone-50">
                                        <td className="px-4 py-3 font-medium text-stone-700">{prop}</td>
                                        <td className="px-4 py-3 text-stone-600">{monthly}</td>
                                        <td className="px-4 py-3 text-stone-600">{yearly}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-bold text-stone-700 mt-8 mb-3">Jednorázové balíčky Energie</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Jednorázový nákup — platí se jednou, Energie se přičte k zůstatku okamžitě.</li>
                        <li>Energie z balíčků <strong>nevyprší</strong> po dobu existence účtu.</li>
                        <li>Energie z balíčků <strong>nelze převést</strong> na jiný účet ani vyplatit v penězích.</li>
                        <li>Po zrušení účtu jsou nevyčerpané kredity anulovány bez náhrady.</li>
                    </ul>
                </Section>

                <Section number={3} title="Právo na odstoupení od smlouvy — zákonná 14denní lhůta">
                    <InfoBox>
                        <strong>Toto je vaše zákonné právo</strong> dle § 1829 odst. 1 občanského zákoníku
                        a směrnice EU 2011/83/EU o právech spotřebitelů. Nelze ho smluvně omezit nad rámec
                        zákonem povolených výjimek.
                    </InfoBox>

                    <p>
                        Jako spotřebitel máte právo odstoupit od smlouvy uzavřené na dálku <strong>bez udání
                        důvodu ve lhůtě 14 dnů</strong> od uzavření smlouvy (dokončení platby).
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-4">Jak to funguje v praxi — příklady</h3>

                    <div className="grid gap-3">
                        <ScenarioCard
                            icon={<CheckCircle2 size={20} />}
                            title="Předplatné, Energie nečerpána"
                            description="Zaplatili jste předplatné včera a Energii jste ještě nepoužili."
                            outcome="Plné vrácení celé zaplacené částky."
                            positive={true}
                        />
                        <ScenarioCard
                            icon={<CheckCircle2 size={20} />}
                            title="Předplatné, část Energie čerpána"
                            description="Zaplatili jste předplatné před 5 dny a spotřebovali jste 30 % přidělené Energie."
                            outcome="Poměrné vrácení — odpočítáme hodnotu spotřebované Energie a zbývající doby."
                            positive={true}
                        />
                        <ScenarioCard
                            icon={<CheckCircle2 size={20} />}
                            title="Balíček Energie, nečerpáno"
                            description="Koupili jste balíček Energie před 3 dny, ale ještě jste ji nezačali čerpat."
                            outcome="Plné vrácení — právo na odstoupení nebylo konzumováno."
                            positive={true}
                        />
                        <ScenarioCard
                            icon={<XCircle size={20} />}
                            title="Balíček Energie, čerpáno s předchozím souhlasem"
                            description="Při nákupu balíčku jste souhlasili s okamžitým dodáním a Energii jste začali čerpat."
                            outcome="Právo na odstoupení zaniklo okamžikem čerpání Energie (§ 1837 písm. l) OZ). Vrácení není možné."
                            positive={false}
                        />
                        <ScenarioCard
                            icon={<XCircle size={20} />}
                            title="Po uplynutí 14denní lhůty"
                            description="Od zakoupení předplatného nebo balíčku uplynulo více než 14 dní."
                            outcome="Zákonná lhůta pro odstoupení uplynula. Vrácení je možné jen dle sekce 4 (mimořádné důvody)."
                            positive={false}
                        />
                    </div>

                    <h3 className="text-lg font-bold text-stone-700 mt-8 mb-3">Jak odstoupit od smlouvy</h3>
                    <p>Zašlete e-mail na{' '}
                        <a href="mailto:support@skywhale.art" className="text-violet-600 hover:underline font-medium">
                            support@skywhale.art
                        </a>{' '}
                        s předmětem <strong>„Odstoupení od smlouvy"</strong> a uveďte:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>E-mail spojený s vaším Skywhale účtem</li>
                        <li>Datum a typ nákupu (předplatné / balíček Energie / konkrétní tarif)</li>
                        <li>Sdělení, že odstupujete od smlouvy</li>
                    </ul>

                    <div className="bg-stone-100 border border-stone-300 rounded-xl p-5 mt-4 text-sm font-mono text-stone-700 leading-loose">
                        <strong>Vzorový text e-mailu:</strong><br /><br />
                        Komu: support@skywhale.art<br />
                        Předmět: Odstoupení od smlouvy<br /><br />
                        Oznamuji, že odstupuji od smlouvy o [předplatném / nákupu balíčku Energie]<br />
                        uzavřené dne: _______________<br />
                        E-mail účtu: _______________<br />
                        Jméno: _______________<br />
                        Datum: _______________
                    </div>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Zpracování vrácení platby</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Na vaši žádost odpovíme <strong>do 3 pracovních dnů</strong> s potvrzením přijetí.</li>
                        <li>Vrácení platby provedeme <strong>do 14 dnů</strong> od obdržení žádosti o odstoupení.</li>
                        <li>Platba bude vrácena <strong>stejnou platební metodou</strong>, jakou jste použili při nákupu (na kartu přes Stripe).</li>
                        <li>Stripe standardně zpracuje vrácení <strong>do 5–10 pracovních dnů</strong> od iniciace — tato lhůta závisí na vaší bance a je mimo kontrolu Skywhale.</li>
                    </ul>
                </Section>

                <Section number={4} title="Vrácení peněz mimo zákonnou lhůtu">
                    <p>
                        Po uplynutí 14denní zákonné lhůty posuzujeme žádosti o vrácení peněz individuálně.
                        Vrácení platby mimo zákonnou lhůtu je <strong>výjimečné a není právně vymahatelné</strong>,
                        avšak chceme jednat férově.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Kdy vrácení zvážíme</h3>
                    <div className="grid gap-3 mt-2">
                        <ScenarioCard
                            icon={<CheckCircle2 size={20} />}
                            title="Technická chyba na naší straně"
                            description="Platforma nebyla dostupná nebo nefungovala správně po dobu výrazně delší než je obvyklé, a přitom jste zakoupili předplatné s vědomím plné funkčnosti."
                            outcome="Vrácení poměrné části nebo prodloužení předplatného — posuzujeme případ od případu."
                            positive={true}
                        />
                        <ScenarioCard
                            icon={<CheckCircle2 size={20} />}
                            title="Duplicitní platba"
                            description="Omylem jste zaplatili dvakrát za stejný produkt (např. technická chyba při platbě)."
                            outcome="Plné vrácení duplicitní platby bez výjimky."
                            positive={true}
                        />
                        <ScenarioCard
                            icon={<XCircle size={20} />}
                            title="Zapomenuté předplatné"
                            description="Zapomněli jste zrušit předplatné před obnovením."
                            outcome="Vrácení po obnovení předplatného standardně neposkytujeme — doporučujeme nastavit si připomínku."
                            positive={false}
                        />
                        <ScenarioCard
                            icon={<XCircle size={20} />}
                            title="Nespokojenost s AI výstupem"
                            description="Vygenerovaný příběh nebo obrázek neodpovídal vašim očekáváním."
                            outcome="AI výstupy jsou ze své povahy variabilní — toto není důvod k vrácení. Doporučujeme upravit zadání nebo nás kontaktovat pro tipy."
                            positive={false}
                        />
                    </div>

                    <p className="mt-4 text-sm text-stone-500">
                        Pro uplatnění žádosti nás kontaktujte na{' '}
                        <a href="mailto:support@skywhale.art" className="text-violet-600 hover:underline">
                            support@skywhale.art
                        </a>{' '}
                        s popisem situace. Na každou žádost odpovíme do 5 pracovních dní.
                    </p>
                </Section>

                <Section number={5} title="Zrušení předplatného — podrobný postup">
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>Přihlaste se do Skywhale a otevřete <strong>Nastavení účtu</strong>.</li>
                        <li>Přejděte do sekce <strong>Předplatné</strong>.</li>
                        <li>Klikněte na <strong>„Zrušit předplatné"</strong> a potvrďte svůj záměr.</li>
                        <li>Obdržíte potvrzovací e-mail o zrušení.</li>
                        <li>Přístup k prémiovým funkcím zůstane aktivní <strong>do konce aktuálního předplaceného období</strong>.</li>
                        <li>Po skončení období bude váš účet převeden na bezplatný tarif — vaše příběhy a nastavení zůstanou zachovány.</li>
                    </ol>
                    <WarningBox>
                        <strong>Pozor:</strong> Zrušení předplatného <strong>nemaže váš účet</strong> ani
                        vygenerovaný obsah. Pokud chcete účet a veškerá data trvale smazat, použijte
                        funkci <strong>Nastavení → Smazat účet</strong> nebo nás kontaktujte na{' '}
                        <a href="mailto:support@skywhale.art" className="text-amber-700 hover:underline">
                            support@skywhale.art
                        </a>.
                    </WarningBox>
                </Section>

                <Section number={6} title="Změny cen předplatného">
                    <p>
                        O jakékoli změně ceny předplatného vás budeme informovat <strong>nejméně 30 dní předem</strong>{' '}
                        e-mailem na adresu spojenou s vaším účtem.
                    </p>
                    <p className="mt-3">
                        Pokud se změnou ceny nesouhlasíte, máte právo předplatné zrušit před datem účinnosti
                        nové ceny — vaše stávající cena zůstane platná do konce aktuálního předplaceného období.
                        Pokud předplatné nezrušíte, bude po obnovení účtována nová cena.
                    </p>
                </Section>

                <Section number={7} title="Mimosoudní řešení sporů">
                    <p>
                        V případě sporu ohledně platby nebo vrácení peněz, který se nám nepodaří vyřešit
                        přímo, máte jako spotřebitel právo obrátit se na:
                    </p>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 my-4 text-sm text-stone-700 leading-loose">
                        <strong>Česká obchodní inspekce (ČOI)</strong> — ADR<br />
                        Štěpánská 796/44, 110 00 Praha 1<br />
                        Web:{' '}
                        <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                            www.coi.cz
                        </a>{' '}
                        &bull; E-mail:{' '}
                        <a href="mailto:adr@coi.cz" className="text-violet-600 hover:underline">
                            adr@coi.cz
                        </a>
                    </div>
                    <p>
                        Uživatelé z EU mohou využít také platformu ODR Evropské komise:{' '}
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline"
                        >
                            ec.europa.eu/consumers/odr
                        </a>
                    </p>
                    <p className="mt-3 text-sm text-stone-500">
                        Před podáním stížnosti u ČOI nebo ODR nás prosím nejprve kontaktujte —
                        většinu situací vyřešíme přímo a rychleji.
                    </p>
                </Section>

                {/* Contact */}
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-6 mt-8">
                    <h3 className="font-bold text-violet-800 mb-3 text-lg">Kontakt pro platební záležitosti</h3>
                    <p className="text-sm text-violet-900 leading-loose">
                        E-mail:{' '}
                        <a href="mailto:support@skywhale.art" className="text-violet-600 hover:underline font-medium">
                            support@skywhale.art
                        </a><br />
                        Odpovídáme do <strong>3 pracovních dní</strong>. Do předmětu uveďte{' '}
                        <strong>„Platba"</strong> nebo <strong>„Vrácení"</strong> pro rychlejší zpracování.<br /><br />
                        <strong>[CELÉ JMÉNO]</strong><br />
                        IČO: [IČO]<br />
                        [ADRESA]
                    </p>
                </div>

                <p className="text-xs text-stone-400 mt-8 text-center">
                    Verze 1.0 &bull; Platnost od 1. 5. 2025 &bull; Řídí se zákonem č. 89/2012 Sb. (OZ),
                    zákonem č. 634/1992 Sb. a směrnicí EU 2011/83/EU.
                </p>

            </div>
        </motion.div>
    );
};
