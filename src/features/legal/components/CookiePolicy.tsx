import React, { useState } from 'react';
import { ArrowLeft, Cookie, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <section className="mb-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
            <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                {number}
            </span>
            {title}
        </h2>
        {children}
    </section>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 my-4 text-sm text-amber-900 leading-relaxed">
        {children}
    </div>
);

type CookieTableRow = {
    name: string;
    provider: string;
    purpose: string;
    type: string;
    expiry: string;
};

const CookieTable = ({ rows }: { rows: CookieTableRow[] }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-stone-200">
        <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-700">
                <tr>
                    {['Název cookie', 'Poskytovatel', 'Účel', 'Typ', 'Platnost'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
                {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-stone-700 align-top whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3 text-stone-600 align-top">{row.provider}</td>
                        <td className="px-4 py-3 text-stone-600 align-top">{row.purpose}</td>
                        <td className="px-4 py-3 text-stone-500 align-top whitespace-nowrap">{row.type}</td>
                        <td className="px-4 py-3 text-stone-500 align-top whitespace-nowrap">{row.expiry}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

type BrowserGuideProps = {
    browser: string;
    url: string;
};

const BrowserGuide = ({ browser, url }: BrowserGuideProps) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-3 border border-stone-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors text-sm text-stone-700 font-medium"
    >
        {browser} →
    </a>
);

export const CookiePolicy = ({ onBack }: { onBack?: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 text-amber-100 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Zpět
                        </button>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Cookie size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Zásady cookies</h1>
                            <p className="text-amber-100 mt-1">Platnost od: 1. 5. 2025 &bull; Verze 1.0</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-20 w-20 h-20 bg-amber-300/20 rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 prose prose-amber max-w-none text-stone-600 leading-relaxed">

                <InfoBox>
                    <strong>Stručně:</strong> Bez vašeho souhlasu aktivujeme pouze nezbytné cookies nutné pro přihlášení
                    a bezpečnost. Analytické a funkční cookies jsou volitelné — vždy se vás ptáme předem.
                    Svou volbu můžete kdykoliv změnit v nastavení účtu.
                </InfoBox>

                <Section number={1} title="Co jsou cookies a proč je používáme">
                    <p>
                        Cookies jsou malé textové soubory, které webové stránky ukládají ve vašem prohlížeči.
                        Slouží k různým účelům — od základního fungování přihlášení až po analýzu využívání
                        platformy. Cookies samy o sobě neobsahují viry ani škodlivý kód.
                    </p>
                    <p className="mt-3">
                        Na Skywhale používáme cookies výhradně k provozním a technickým účelům — <strong>nikdy
                        k reklamním účelům ani k prodeji dat třetím stranám.</strong>
                    </p>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Právní základ</h3>
                    <p>
                        Používání cookies na Skywhale se řídí:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Zákonem č. 127/2005 Sb. (zákon o elektronických komunikacích), § 89 odst. 3 — ve znění od 1. 1. 2022 vyžaduje <strong>předchozí souhlas</strong> s nezbytně nutnými cookies s výjimkou</li>
                        <li>Nařízením GDPR (EU) 2016/679 — čl. 6 odst. 1 písm. a) (souhlas) nebo písm. f) (oprávněný zájem pro nezbytné cookies)</li>
                        <li>Pokyny Úřadu pro ochranu osobních údajů (ÚOOÚ) a EDPB Guidelines 05/2020</li>
                    </ul>
                </Section>

                <Section number={2} title="Kategorie cookies, které používáme">

                    <h3 className="text-lg font-bold text-stone-700 mb-3">
                        🟢 Nezbytně nutné cookies
                        <span className="ml-2 text-sm font-normal text-stone-500">(vždy aktivní, souhlas není vyžadován)</span>
                    </h3>
                    <p>
                        Tyto cookies jsou nezbytné pro základní fungování Platformy. Bez nich nelze používat
                        přihlášení, udržet bezpečnou relaci ani zajistit ochranu před útoky. Jejich používání
                        je oprávněným zájmem provozovatele dle čl. 6 odst. 1 písm. f) GDPR.
                    </p>
                    <CookieTable
                        rows={[
                            {
                                name: 'sb-[ref]-auth-token',
                                provider: 'Supabase',
                                purpose: 'Udržení přihlašovací session uživatele',
                                type: 'Session / Persistent',
                                expiry: '1 hodina (obnovuje se)',
                            },
                            {
                                name: 'sb-[ref]-auth-token-code-verifier',
                                provider: 'Supabase',
                                purpose: 'PKCE bezpečnostní token pro OAuth flow',
                                type: 'Session',
                                expiry: 'Do ukončení relace',
                            },
                            {
                                name: 'skywhale-cookie-consent-v1',
                                provider: 'Skywhale',
                                purpose: 'Uložení vašeho výběru cookie preferencí',
                                type: 'Persistent (localStorage)',
                                expiry: '12 měsíců',
                            },
                        ]}
                    />

                    <h3 className="text-lg font-bold text-stone-700 mb-3 mt-8">
                        🟡 Analytické cookies
                        <span className="ml-2 text-sm font-normal text-stone-500">(pouze s vaším souhlasem)</span>
                    </h3>
                    <p>
                        Analytické cookies nám pomáhají porozumět tomu, jak uživatelé Platformu využívají.
                        Data jsou sbírána anonymně a slouží výhradně ke zlepšování Skywhale. Bez vašeho
                        souhlasu tyto cookies <strong>neaktivujeme</strong>.
                    </p>
                    <CookieTable
                        rows={[
                            {
                                name: '_ph_[id]',
                                provider: 'PostHog (EU region)',
                                purpose: 'Anonymní analýza využívání funkcí, počtu relací a chybových stavů',
                                type: 'Persistent',
                                expiry: '1 rok',
                            },
                            {
                                name: 'ph_[id]_posthog',
                                provider: 'PostHog (EU region)',
                                purpose: 'Identifikátor anonymní analytické relace',
                                type: 'Persistent',
                                expiry: '1 rok',
                            },
                        ]}
                    />
                    <p className="text-xs text-stone-400 mt-2">
                        PostHog je provozován na EU serverech (Frankfurt). Data neopouštějí EHP.
                    </p>

                    <h3 className="text-lg font-bold text-stone-700 mb-3 mt-8">
                        🔵 Funkční cookies
                        <span className="ml-2 text-sm font-normal text-stone-500">(pouze s vaším souhlasem)</span>
                    </h3>
                    <p>
                        Funkční cookies si pamatují vaše preference a nastavení pro pohodlnější používání Platformy.
                        Bez vašeho souhlasu tyto cookies <strong>neaktivujeme</strong>.
                    </p>
                    <CookieTable
                        rows={[
                            {
                                name: 'skywhale-editor-prefs',
                                provider: 'Skywhale',
                                purpose: 'Uložení preferencí editoru (zobrazení, poslední nastavení)',
                                type: 'Persistent (localStorage)',
                                expiry: '6 měsíců',
                            },
                            {
                                name: 'skywhale-theme',
                                provider: 'Skywhale',
                                purpose: 'Uložení preference barevného motivu (světlý/tmavý)',
                                type: 'Persistent (localStorage)',
                                expiry: '12 měsíců',
                            },
                        ]}
                    />

                    <h3 className="text-lg font-bold text-stone-700 mb-3 mt-8">
                        🔴 Marketingové / reklamní cookies
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                        <strong>✓ Na Skywhale nepoužíváme žádné marketingové ani reklamní cookies.</strong>{' '}
                        Platforma je zcela bez reklam. Žádná data nesdílíme s reklamními sítěmi.
                    </div>

                </Section>

                <Section number={3} title="Jak udělujete a odvoláváte souhlas">
                    <p>
                        Při první návštěvě Skywhale se zobrazí cookie banner, kde si můžete vybrat,
                        které kategorie cookies povolujete. Výběr se uloží a banner se znovu nezobrazí.
                    </p>
                    <h3 className="text-lg font-bold text-stone-700 mt-6 mb-3">Změna nebo odvolání souhlasu</h3>
                    <p>
                        Svůj souhlas s analytickými a funkčními cookies můžete kdykoliv změnit nebo
                        odvolat:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>V <strong>nastavení účtu → Soukromí → Správa cookies</strong></li>
                        <li>Smazáním cookies v nastavení vašeho prohlížeče (viz sekce 4)</li>
                    </ul>
                    <p className="mt-3 text-sm text-stone-500">
                        Odvolání souhlasu nemá vliv na zákonnost zpracování provedeného před odvoláním.
                        Odvolání souhlasu s analytickými nebo funkčními cookies neovlivní funkčnost přihlášení
                        ani jiné základní funkce Platformy.
                    </p>
                </Section>

                <Section number={4} title="Správa cookies v prohlížeči">
                    <p>
                        Kromě nastavení na Skywhale můžete cookies spravovat přímo v nastavení svého prohlížeče.
                        Mějte na paměti, že <strong>smazání všech cookies způsobí odhlášení</strong> ze Skywhale
                        a ztrátu uložených preferencí.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                        <BrowserGuide browser="Google Chrome" url="https://support.google.com/chrome/answer/95647" />
                        <BrowserGuide browser="Mozilla Firefox" url="https://support.mozilla.org/cs/kb/vymaz-cookies-webova-data" />
                        <BrowserGuide browser="Safari (Mac)" url="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac" />
                        <BrowserGuide browser="Safari (iPhone)" url="https://support.apple.com/cs-cz/HT201265" />
                        <BrowserGuide browser="Microsoft Edge" url="https://support.microsoft.com/cs-cz/microsoft-edge/smazat-soubory-cookie-v-microsoft-edge" />
                        <BrowserGuide browser="Opera" url="https://help.opera.com/cs/latest/web-preferences/#cookies" />
                    </div>
                </Section>

                <Section number={5} title="Cookies třetích stran">
                    <p>
                        Platforma Skywhale sama nenastavuje žádné cookies třetích stran pro reklamní účely.
                        Stripe (platební brána) může při platebním procesu nastavit vlastní nezbytné cookies
                        pro zajištění bezpečnosti transakce — tyto cookies se řídí{' '}
                        <a
                            href="https://stripe.com/en-cz/legal/cookies-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:underline"
                        >
                            zásadami cookies Stripe
                        </a>.
                    </p>
                </Section>

                <Section number={6} title="Změny těchto zásad">
                    <p>
                        Tyto zásady cookies můžeme aktualizovat, například při přidání nových funkcí nebo
                        změně technologií. O podstatných změnách vás budeme informovat oznámením na Platformě.
                        Datum poslední aktualizace je vždy uvedeno v záhlaví tohoto dokumentu.
                    </p>
                    <p className="mt-3">
                        Při podstatné změně kategorií cookies (přidání nové kategorie) vás požádáme
                        o obnovení souhlasu prostřednictvím cookie banneru.
                    </p>
                </Section>

                {/* Contact */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mt-8">
                    <h3 className="font-bold text-amber-800 mb-3 text-lg">Dotazy k cookies</h3>
                    <p className="text-sm text-amber-900 leading-loose">
                        Máte otázky k tomu, jak používáme cookies? Napište nám:<br />
                        E-mail: <a href="mailto:privacy@skywhale.art" className="text-amber-700 hover:underline font-medium">privacy@skywhale.art</a><br /><br />
                        Stížnost můžete podat také u dozorového úřadu:<br />
                        <strong>ÚOOÚ</strong> — <a href="https://www.uoou.cz" className="text-amber-700 hover:underline" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>
                    </p>
                </div>

                <p className="text-xs text-stone-400 mt-8 text-center">
                    Verze 1.0 &bull; Platnost od 1. 5. 2025 &bull; Řídí se zákonem č. 127/2005 Sb. a nařízením GDPR (EU) 2016/679.
                </p>

            </div>
        </motion.div>
    );
};
