import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Wand2, PenTool } from 'lucide-react';
import { StoryBook } from '../../../types';
import { useTranslation } from 'react-i18next';
import { useGuide } from '../../../hooks/useGuide';
import { useAppAuth } from '../../../hooks/core/useAppAuth';

// MODES
import { MagicWandMode } from './modes/MagicWandMode';
import { HeroMode } from './modes/HeroMode';
import { CustomMode } from './modes/CustomMode';

interface StorySetupProps {
    onComplete: (story: StoryBook) => Promise<void>;
    onOpenStore?: () => void;
}

export const StorySetup: React.FC<StorySetupProps> = ({ onComplete, onOpenStore }) => {
    const { t, i18n } = useTranslation();
    const [mode, setMode] = useState<'select' | 'custom' | 'auto' | 'hero'>('select');
    const [chatInitialData, setChatInitialData] = useState<any>(null);
    const { profile } = useAppAuth();
    const userBalance = profile?.energy_balance ?? null;

    // Guide Hook
    const { startGuide, hasSeenGroups } = useGuide();
    useEffect(() => {
        if (!hasSeenGroups['story_studio_welcome']) {
            startGuide('story_studio_welcome');
        }
    }, [hasSeenGroups, startGuide]);

    // --- MODE RENDERING ---

    if (mode === 'auto') {
        return (
            <MagicWandMode
                onTransitionToCustom={(data) => {
                    setChatInitialData(data);
                    setMode('custom');
                }}
                onCancel={() => setMode('select')}
                currentLanguage={i18n.language}
            />
        );
    }

    if (mode === 'custom') {
        return (
            <CustomMode
                initialData={chatInitialData}
                userBalance={userBalance}
                onComplete={onComplete}
                onCancel={() => {
                    setMode('select');
                    setChatInitialData(null);
                }}
                onOpenStore={onOpenStore}
                currentLanguage={i18n.language}
            />
        );
    }

    if (mode === 'hero') {
        return (
            <HeroMode
                userBalance={userBalance}
                onComplete={onComplete}
                onCancel={() => setMode('select')}
                onOpenStore={onOpenStore}
                currentLanguage={i18n.language}
            />
        );
    }

    // --- HUB SELECTION ---

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl px-4 animate-in fade-in zoom-in duration-500 py-10">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-black mb-2 text-white drop-shadow-lg text-center" style={{ fontFamily: 'Fredoka' }}>
                    {t('setup.title')}
                </h1>
                <p className="text-slate-400 text-lg text-center max-w-lg mx-auto" style={{ fontFamily: 'Quicksand' }}>
                    {t('setup.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-10">
                {/* OPTION 1: MAGIC GENERATOR */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('auto')}
                    className="group relative h-[280px] overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md border-2 border-white/10 hover:border-white/30 transition-all text-left flex flex-col justify-end p-8 shadow-2xl shadow-indigo-900/40 hover:shadow-indigo-500/40"
                >
                    <div className="absolute top-6 right-6 z-20">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-pink-500/40 animate-pulse">
                            {t('setup.modes.magic_badge')}
                        </div>
                    </div>
                    <div className="absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                        <Wand2 size={80} className="text-indigo-500/10 group-hover:text-indigo-400/20" />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                            <Wand2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{t('setup.modes.magic_title')}</h3>
                            <p className="text-indigo-200/60 group-hover:text-indigo-100/80 leading-relaxed text-sm">
                                {t('setup.modes.magic_desc')}
                            </p>
                        </div>
                    </div>
                </motion.button>

                {/* OPTION 2: HERO STORY */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('hero')}
                    className="group relative h-[280px] overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 to-teal-900 border-2 border-emerald-500/30 hover:border-emerald-400/50 transition-all text-left flex flex-col justify-end p-8 shadow-2xl shadow-emerald-900/40"
                >
                    <div className="absolute top-6 right-6 z-20">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40">
                            {t('setup.modes.hero_badge')}
                        </div>
                    </div>
                    <div className="absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">
                        <User size={80} className="text-white/10 group-hover:text-emerald-200/20" />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                            <User size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-200 transition-colors">{t('setup.modes.hero_title')}</h3>
                            <p className="text-emerald-200/60 group-hover:text-emerald-100/80 leading-relaxed text-sm">
                                {t('setup.modes.hero_desc')}
                            </p>
                        </div>
                    </div>
                </motion.button>

                {/* OPTION 3: CUSTOM EDITOR */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('custom')}
                    className="group relative h-[280px] overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md border-2 border-white/10 hover:border-white/30 transition-all text-left flex flex-col justify-end p-8 shadow-2xl hover:shadow-indigo-500/10"
                >
                    <div className="absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">
                        <PenTool size={80} className="text-white/5 group-hover:text-white/10" />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-indigo-900 transition-colors duration-300">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{t('setup.modes.custom_title')}</h3>
                            <p className="text-indigo-200/60 group-hover:text-indigo-100/80 leading-relaxed text-sm">
                                {t('setup.modes.custom_desc')}
                            </p>
                        </div>
                    </div>
                </motion.button>

            </div>
        </div >
    );
};
