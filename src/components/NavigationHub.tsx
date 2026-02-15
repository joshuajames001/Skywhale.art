import { motion, AnimatePresence } from 'framer-motion';
import { Book, Home, Sparkles, Palette, Gamepad2, Compass, PenTool, Zap, MessageSquare, LogIn, User, LogOut, Shield, Languages } from 'lucide-react';
import { ScrollableRow } from './ui/ScrollableRow';
import { useState, useEffect } from 'react';
import { useEnergy } from '../hooks/useEnergy';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface NavigationHubProps {
    onNavigate: (view: 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'feedback_board' | 'profile' | 'pricing') => void;
    currentView: string;
    user: any;
    onLogin: () => void;
    onLogout: () => void;
}

export const NavigationHub = ({ onNavigate, currentView, user, onLogin, onLogout }: NavigationHubProps) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { balance } = useEnergy();
    const [nickname, setNickname] = useState<string>('');

    // Fetch nickname when user changes
    useEffect(() => {
        const fetchNickname = async () => {
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('nickname')
                    .eq('id', user.id)
                    .single();

                if (data?.nickname) {
                    setNickname(data.nickname);
                } else {
                    setNickname('');
                }
            }
        };

        fetchNickname();
    }, [user]);

    const navItems = [
        { id: 'landing', icon: Home, label: t('nav.home') },
        { id: 'discovery', icon: Compass, label: t('nav.encyclopedia') },
        { id: 'library', icon: Book, label: t('nav.library') },
        { id: 'create_custom', icon: PenTool, label: t('nav.custom_book') },
        { id: 'card_studio', icon: Palette, label: t('nav.atelier') },
        { id: 'arcade', icon: Gamepad2, label: t('nav.arcade') },
        { id: 'feedback_board', icon: MessageSquare, label: t('nav.feedback') },
        { id: 'setup', icon: Sparkles, label: t('nav.story'), badge: t('nav.badge_new') },
    ];

    const homeItem = navItems.find(i => i.id === 'landing')!;
    const mainItems = navItems.filter(i => i.id !== 'landing');

    const mobileNavItems = [
        homeItem,
        { id: 'profile', icon: User, label: t('nav.profile') } as any,
        navItems.find(i => i.id === 'library')!,
        navItems.find(i => i.id === 'create_custom')!,
        navItems.find(i => i.id === 'setup')!,
        navItems.find(i => i.id === 'card_studio')!,
        navItems.find(i => i.id === 'energy_store') || { id: 'energy_store', icon: Zap, label: t('nav.store') } as any,
        navItems.find(i => i.id === 'discovery')!,
        { id: 'terms', icon: MessageSquare, label: t('nav.terms') } as any,
        { id: 'privacy', icon: Shield, label: t('nav.privacy') } as any
    ];

    return (
        <>
            {/* DESKTOP LEFT DOCK */}
            <div
                className={`hidden sm:flex fixed z-[100] flex-col gap-4 items-start pointer-events-auto transition-all duration-500
                    ${(currentView === 'landing' || currentView === 'library' || currentView === 'setup' || currentView === 'book' || currentView === 'arcade' || currentView === 'energy_store') ? 'top-6 left-6' :
                        ((currentView === 'card_studio' || currentView === 'create_custom') ? 'top-20 left-6' :
                            (currentView === 'discovery' ? 'top-24 left-6' : 'top-28 left-6'))}
                `}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* HOME BUTTON */}
                <motion.div
                    layout
                    className={`relative flex items-center gap-3 cursor-pointer group ${currentView === 'landing' ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                    onClick={() => onNavigate('landing')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 border shadow-lg ${currentView === 'landing'
                        ? 'bg-black/50 text-white border-white/20 shadow-purple-500/10'
                        : 'bg-black/40 text-white/80 border-white/10 hover:bg-black/60'
                        }`}>
                        <homeItem.icon size={24} strokeWidth={2.5} />
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap border border-white/10"
                            >
                                {homeItem.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* EXPANDABLE MENU ITEMS */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-3 items-start overflow-hidden"
                        >
                            {mainItems.map((item, index) => {
                                const isActive = currentView === item.id;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20, y: -10 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        exit={{ opacity: 0, x: -20, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative flex items-center gap-3 cursor-pointer group"
                                        onClick={() => onNavigate(item.id as any)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className={`relative p-3 rounded-full backdrop-blur-md transition-all duration-300 border shadow-lg ${isActive
                                            ? 'bg-white text-purple-600 border-white shadow-purple-500/30'
                                            : 'bg-black/40 text-white/80 border-white/10 hover:bg-black/60'
                                            }`}>
                                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                            {(item as any).badge && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                                </span>
                                            )}
                                        </div>

                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap border border-white/10"
                                        >
                                            <span className="flex items-center gap-2">
                                                {item.label}
                                                {(item as any).badge && (
                                                    <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-lg shadow-sky-500/40">
                                                        {(item as any).badge}
                                                    </span>
                                                )}
                                            </span>
                                        </motion.span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LEGAL LINKS & LANGUAGE SWITCHER */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 flex flex-col items-start gap-4 ml-2"
                        >
                            <div className="flex flex-col gap-1">
                                <button onClick={() => onNavigate('terms' as any)} className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest font-bold">{t('nav.terms')}</button>
                                <button onClick={() => onNavigate('privacy' as any)} className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest font-bold">{t('nav.privacy')}</button>
                            </div>

                            {/* LANGUAGE SWITCHER */}
                            <motion.div
                                layout
                                className="relative flex items-center gap-3 cursor-pointer group"
                                onClick={() => i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="p-2 rounded-full backdrop-blur-md transition-all duration-300 border shadow-lg bg-black/40 text-sky-400 border-sky-500/20 hover:bg-black/60">
                                    <Languages size={18} strokeWidth={2.5} />
                                </div>
                                <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md whitespace-nowrap border border-white/10">
                                    {i18n.language === 'cs' ? 'CZ' : 'EN'}
                                </span>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >

            {/* UNIVERSAL BACK BUTTON (Mobile) */}
            {currentView !== 'landing' && currentView !== 'card_studio' && currentView !== 'discovery' && currentView !== 'create_custom' && currentView !== 'book' && (
                <div className="sm:hidden fixed top-4 left-4 z-[9990] pointer-events-auto">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                    >
                        {t('common.back')}
                    </button>
                </div>
            )}

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            {currentView !== 'card_studio' && currentView !== 'create_custom' && currentView !== 'game-hub' && (
                <div className="sm:hidden fixed bottom-0 left-0 w-full z-[9999] pb-safe bg-black/90 backdrop-blur-xl border-t border-white/10 pointer-events-auto">
                    <ScrollableRow className="px-2 py-3" itemClassName="gap-6 px-2 justify-between min-w-full">
                        {mobileNavItems.map((item) => {
                            const isActive = currentView === item.id;

                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === ('login_action' as any)) {
                                            if (user) onNavigate('profile');
                                            else onLogin();
                                        } else {
                                            onNavigate(item.id as any);
                                        }
                                    }}
                                    className={`relative flex flex-col items-center gap-1 shrink-0 ${isActive ? 'text-purple-400' : 'text-white/50'}`}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div className="p-1">
                                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
                                </motion.button>
                            )
                        })}
                    </ScrollableRow>
                </div>
            )}
        </>
    );
};
