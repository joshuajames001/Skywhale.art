import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DiscoveryCategory } from '../../../types/discovery';

interface CategoryGridProps {
    categories: DiscoveryCategory[];
    onSelect: (category: DiscoveryCategory) => void;
    loading: boolean;
}

export const CategoryGrid = ({ categories, onSelect, loading }: CategoryGridProps) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key="categories"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mt-10 p-4"
        >
            {/* Loading State for Categories */}
            {categories.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500">
                    <Loader2 size={48} className="mx-auto mb-4 animate-spin opacity-50" />
                    <p>{t('discovery.loading_categories')}</p>
                </div>
            )}

            {categories.map(cat => {
                const isDino = cat.title.toLowerCase().includes('dino') || cat.slug?.includes('dino');
                const isSpace = cat.title.toLowerCase().includes('vesmír') || cat.title.toLowerCase().includes('space') || cat.slug?.includes('space');

                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat)}
                        className={`
                            w-full h-64 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4
                            bg-[#1c1917] border border-white/10 hover:border-white/30 transition-all
                            group relative overflow-hidden shadow-xl hover:scale-[1.02]
                            ${isDino || isSpace ? 'md:col-span-2' : ''}
                        `}
                    >
                        {/* Background: Custom Image for Dinos, Color for others */}
                        {isDino ? (
                            <>
                                <img
                                    src="/discovery/dino-card-bg.png"
                                    alt="Category Background"
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 -translate-y-5 scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </>
                        ) : isSpace ? (
                            <>
                                <img
                                    src="/discovery/space-card-bg.png"
                                    alt="Space Background"
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-blue-900/20 to-transparent" />
                            </>
                        ) : (
                            <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-colors bg-[${cat.theme_color_hex}]`} style={{ backgroundColor: cat.theme_color_hex }} />
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center">
                            {/* Hide icon for Space category */}
                            {!isSpace && cat.icon_url && <span className="text-6xl group-hover:scale-110 transition-transform duration-500 mb-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{cat.icon_url}</span>}
                            <h3 className="text-3xl font-black font-title uppercase tracking-wide text-white drop-shadow-md">{cat.title}</h3>
                            <p className="text-stone-300 text-sm text-center max-w-[80%] font-medium">{cat.description}</p>
                        </div>
                    </button>
                );
            })}
        </motion.div>
    );
};
