import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Clapperboard, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getBookMediaUrl } from '../../../lib/supabase';

interface CinematicLandingProps {
    onEnter: (bookId?: string) => void;
    onNavigate?: (view: any) => void;
}

export const CinematicLanding = ({ onEnter, onNavigate }: CinematicLandingProps) => {
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-screen bg-[#050510] text-white selection:bg-purple-500/30 overflow-hidden">

            {/* 1. CINEMATIC VIDEO BACKGROUND (Fixed) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Fallback gradient if video fails to load */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050510] to-[#050510] z-0" />

                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={(e) => console.error('Video failed to load:', e)}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                >
                    <source src={getBookMediaUrl('LP-video/video/portal.webm')} type="video/webm" />
                </video>

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-black/20 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/30 z-10" />
            </div>

            {/* 2. TOP NAVIGATION */}
            <nav className="absolute top-0 left-0 w-full z-50 py-6 px-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate?.('intro')}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                        transition={{
                            duration: 0.8,
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                        <motion.svg
                            width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            className="text-white drop-shadow-md"
                        >
                            <motion.path
                                d="M2.00024 16.0001C2.50024 13.5001 4.50024 7.0001 11.0002 7.0001C11.0002 4.0001 12.5002 2.0001 14.5002 2.0001C15.0002 2.0001 15.1147 2.68656 14.8698 3.09477C14.0754 4.41872 13.0002 6.5001 13.0002 8.0001C13.0002 8.0001 19.0002 7.5001 21.0002 11.0001C22.6575 13.9004 20.5002 18.0001 16.0002 18.0001C11.5002 18.0001 9.00024 22.0001 2.00024 22.0001"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            <motion.circle
                                cx="15.5" cy="11.5" r="1.5" fill="currentColor" fillOpacity="0.8"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.5, duration: 0.3 }}
                            />
                        </motion.svg>
                    </motion.div>
                    <span className="font-title text-xl font-bold tracking-wide text-white drop-shadow-md group-hover:text-purple-200 transition-colors">Skywhale.</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-3 sm:gap-8 text-xs sm:text-sm font-medium tracking-widest uppercase text-white/80">
                    {/* Studio Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all py-2">
                            {t('landing.nav.studio')} <ChevronRight size={12} className="rotate-90 group-hover:-rotate-90 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 w-56 sm:w-64">
                            <div className="bg-[#0a0a16]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
                                <button onClick={() => onEnter()} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group/item">
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 group-hover/item:text-white transition-colors"><BookOpen size={16} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white tracking-widest">{t('landing.nav.stories')}</span>
                                        <span className="text-[10px] text-zinc-400 normal-case tracking-normal">{t('landing.nav.stories_desc')}</span>
                                    </div>
                                </button>
                                <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300"><Clapperboard size={16} /></div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white tracking-widest">{t('landing.nav.movies')}</span>
                                            <span className="text-[8px] bg-blue-500/20 text-blue-200 px-1.5 rounded border border-blue-500/30">SOON</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 normal-case tracking-normal">{t('landing.nav.movies_desc')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300"><Music size={16} /></div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white tracking-widest">{t('landing.nav.sounds')}</span>
                                            <span className="text-[8px] bg-emerald-500/20 text-emerald-200 px-1.5 rounded border border-emerald-500/30">SOON</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 normal-case tracking-normal">{t('landing.nav.sounds_desc')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onNavigate?.('terms')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        {t('landing.nav.rules')}
                    </button>
                    <button onClick={() => window.location.href = 'mailto:support@skywhale.art'} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        {t('landing.nav.contact')}
                    </button>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => onNavigate?.('landing')}
                    className="px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                    {t('landing.nav.enter_app')}
                </button>
            </nav>

            {/* 3. HERO SECTION */}
            <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
                <h1 className="font-title text-3xl sm:text-5xl md:text-8xl lg:text-9xl mb-6 text-white drop-shadow-2xl tracking-tighter">
                    Skywhale<span className="text-purple-400">.</span>
                </h1>

                <p className="font-sans text-lg md:text-xl text-zinc-300 max-w-xl mx-auto leading-relaxed mb-10 text-pretty">
                    {t('landing.hero.cinematic_subtitle')}
                </p>

                <div className="flex flex-col items-center mt-12">
                    <button
                        onClick={() => onNavigate?.('landing')}
                        className="group relative px-10 py-4 rounded-full border border-white/30 hover:border-white bg-transparent hover:bg-white/5 transition-all w-full sm:w-64 text-center overflow-hidden"
                    >
                        <span className="relative z-10 font-bold text-lg tracking-widest uppercase flex items-center justify-center gap-2 text-white">
                            {t('landing.hero.enter')} <ChevronRight size={16} />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
