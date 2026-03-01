import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
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
                            <p className="text-emerald-100 mt-1">Vaše soukromí a bezpečnost vašich dětí jsou pro nás prioritou.</p>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-20 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl" />
            </div>

            <div className="p-8 md:p-12 prose prose-emerald max-w-none text-stone-600 leading-relaxed">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Úvodní ustanovení
                    </h2>
                    <p>
                        Tyto zásady ochrany osobních údajů vysvětlují, jak Skywhale ("my", "nás") shromažďuje, používá a chrání informace při používání naší aplikace pro generování dětských příběhů. Respektujeme soukromí všech uživatelů, zejména dětí.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        Jaké údaje shromažďujeme?
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Údaje o účtu:</strong> E-mailová adresa rodiče, zašifrované heslo, platební historie.</li>
                        <li><strong>Obsah příběhů:</strong> Vstupy pro generování příběhů (jména postav, témata), vygenerované texty a obrázky.</li>
                        <li><strong>Technická data:</strong> IP adresa, typ zařízení, verze prohlížeče (pro zajištění bezpečnosti a funkčnosti).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        Ochrana dětí
                    </h2>
                    <p>
                        Naše aplikace je navržena tak, aby byla bezpečná pro rodiny.
                        <strong> Nikdy nesdílíme osobní údaje dětí s třetími stranami pro marketingové účely.</strong>
                        Veškerý obsah generovaný AI je filtrován pro zajištění bezpečnosti a vhodnosti.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                        AI a Zpracování dat
                    </h2>
                    <p>
                        Pro generování příběhů využíváme technologie umělé inteligence (OpenAI, Black Forest Labs). Textové vstupy jsou těmto službám odesílány pouze za účelem vygenerování obsahu a nejsou jimi použity k trénování modelů.
                    </p>
                </section>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mt-8">
                    <h3 className="font-bold text-emerald-800 mb-2">Máte dotazy?</h3>
                    <p className="text-sm">
                        Pokud máte jakékoli otázky ohledně ochrany vašich údajů, kontaktujte nás na <a href="mailto:privacy@skywhale.art" className="text-emerald-600 hover:underline font-medium">privacy@skywhale.art</a>.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
