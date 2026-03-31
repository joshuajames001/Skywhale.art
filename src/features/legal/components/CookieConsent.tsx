import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ChevronDown, ChevronUp, X, Check, Shield } from 'lucide-react';

export type CookiePreferences = {
    necessary: true; // vždy true, nelze změnit
    analytics: boolean;
    functional: boolean;
};

const STORAGE_KEY = 'skywhale-cookie-consent-v1';

const loadSavedPreferences = (): CookiePreferences | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Validate shape
        if (typeof parsed.analytics !== 'boolean' || typeof parsed.functional !== 'boolean') return null;
        return { necessary: true, analytics: parsed.analytics, functional: parsed.functional };
    } catch {
        return null;
    }
};

const savePreferences = (prefs: CookiePreferences): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, savedAt: new Date().toISOString() }));
};

type CategoryRowProps = {
    title: string;
    description: string;
    examples: string;
    required?: boolean;
    value: boolean;
    onChange?: (val: boolean) => void;
};

const CategoryRow = ({ title, description, examples, required = false, value, onChange }: CategoryRowProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-stone-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0 group"
                        aria-expanded={open}
                    >
                        <span className="font-semibold text-stone-800 text-sm">{title}</span>
                        {required && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                                Vždy aktivní
                            </span>
                        )}
                        {open
                            ? <ChevronUp size={16} className="text-stone-400 shrink-0 ml-auto" />
                            : <ChevronDown size={16} className="text-stone-400 shrink-0 ml-auto" />
                        }
                    </button>
                </div>
                {/* Toggle */}
                <div className="ml-4 shrink-0">
                    {required ? (
                        <div className="w-11 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-70">
                            <div className="w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                    ) : (
                        <button
                            role="switch"
                            aria-checked={value}
                            onClick={() => onChange?.(!value)}
                            className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                                value ? 'bg-emerald-500 justify-end' : 'bg-stone-300 justify-start'
                            }`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                        </button>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-t border-stone-200 bg-white text-sm text-stone-600 space-y-2">
                            <p>{description}</p>
                            <p className="text-xs text-stone-400"><strong>Příklady:</strong> {examples}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

type CookieConsentProps = {
    onPreferencesChange?: (prefs: CookiePreferences) => void;
};

export const CookieConsent = ({ onPreferencesChange }: CookieConsentProps) => {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        functional: false,
    });

    useEffect(() => {
        const saved = loadSavedPreferences();
        if (saved) {
            setPreferences(saved);
            onPreferencesChange?.(saved);
        } else {
            setVisible(true);
        }
    }, []);

    const handleSave = (prefs: CookiePreferences) => {
        savePreferences(prefs);
        onPreferencesChange?.(prefs);
        setVisible(false);
    };

    const handleAcceptAll = () => {
        const all: CookiePreferences = { necessary: true, analytics: true, functional: true };
        handleSave(all);
    };

    const handleRejectAll = () => {
        const minimal: CookiePreferences = { necessary: true, analytics: false, functional: false };
        handleSave(minimal);
    };

    const handleSaveCustom = () => {
        handleSave(preferences);
    };

    const updatePref = (key: keyof Omit<CookiePreferences, 'necessary'>, val: boolean) => {
        setPreferences((p) => ({ ...p, [key]: val }));
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6 flex justify-center pointer-events-none"
                >
                    <div className="bg-stone-900/97 backdrop-blur-md text-white rounded-2xl shadow-2xl max-w-2xl w-full border border-white/10 pointer-events-auto overflow-hidden">

                        {/* Compact banner */}
                        {!showDetails && (
                            <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="p-2.5 bg-stone-800 rounded-full shrink-0">
                                    <Cookie className="text-amber-400" size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold mb-1 text-sm md:text-base">Cookies na Skywhale</h4>
                                    <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
                                        Používáme nezbytné cookies pro fungování platformy. Volitelné cookies
                                        (analytické, funkční) aktivujeme pouze s vaším souhlasem.{' '}
                                        <button
                                            onClick={() => setShowDetails(true)}
                                            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                                        >
                                            Nastavit předvolby
                                        </button>
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                                    <button
                                        onClick={handleRejectAll}
                                        className="flex-1 md:flex-none border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                    >
                                        Odmítnout
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="flex-1 md:flex-none bg-white text-stone-900 hover:bg-stone-200 px-4 py-2 rounded-full text-sm font-bold transition-colors"
                                    >
                                        Přijmout vše
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Detailed settings */}
                        {showDetails && (
                            <div className="p-5 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} className="text-emerald-400" />
                                        <h4 className="font-bold text-base">Nastavení cookies</h4>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-stone-500 hover:text-stone-300 transition-colors"
                                        aria-label="Zavřít detail"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                                    Vyberte, které cookies chcete povolit. Volbu můžete kdykoliv změnit
                                    v nastavení účtu. Více informací v{' '}
                                    <a href="/cookies" className="text-emerald-400 hover:underline">
                                        Zásadách cookies
                                    </a>.
                                </p>

                                {/* Categories */}
                                <div className="space-y-2 mb-5">
                                    <CategoryRow
                                        title="Nezbytně nutné"
                                        description="Tyto cookies jsou nezbytné pro správné fungování platformy. Bez nich nelze přihlásit se k účtu, udržet relaci nebo zajistit bezpečnost."
                                        examples="Přihlašovací session (Supabase auth), CSRF ochrana, preference jazyka"
                                        required
                                        value={true}
                                    />
                                    <CategoryRow
                                        title="Analytické"
                                        description="Pomáhají nám pochopit, jak uživatelé Platformu využívají, aby jsme ji mohli zlepšovat. Data jsou anonymizována a neidentifikují vás osobně."
                                        examples="Počet návštěv stránek, nejpoužívanější funkce, chybová hlášení"
                                        value={preferences.analytics}
                                        onChange={(v) => updatePref('analytics', v)}
                                    />
                                    <CategoryRow
                                        title="Funkční"
                                        description="Umožňují zapamatovat si vaše preference a přizpůsobit Platformu vašim potřebám."
                                        examples="Uložené předvolby editoru, preference zobrazení, naposledy použitá témata"
                                        value={preferences.functional}
                                        onChange={(v) => updatePref('functional', v)}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleRejectAll}
                                        className="flex-1 border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                                    >
                                        Odmítnout vše
                                    </button>
                                    <button
                                        onClick={handleSaveCustom}
                                        className="flex-1 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} />
                                        Uložit výběr
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="flex-1 bg-white text-stone-900 hover:bg-stone-200 px-4 py-2.5 rounded-full text-sm font-bold transition-colors"
                                    >
                                        Přijmout vše
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Hook pro čtení uložených cookie preferencí kdekoliv v aplikaci.
 * Použití: const prefs = useCookiePreferences();
 */
export const useCookiePreferences = (): CookiePreferences => {
    const [prefs, setPrefs] = useState<CookiePreferences>(() => {
        return loadSavedPreferences() ?? { necessary: true, analytics: false, functional: false };
    });

    useEffect(() => {
        const handleStorage = () => {
            const saved = loadSavedPreferences();
            if (saved) setPrefs(saved);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return prefs;
};
