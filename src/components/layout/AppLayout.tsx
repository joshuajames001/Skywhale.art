import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { UserProfile, Achievement } from '../../types';
import { AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

// Components
import { CookieConsent } from '../legal/CookieConsent';
import { StarryBackground } from '../StarryBackground';
import { MagicFairy } from '../MagicFairy';
import { MagicFlash } from '../MagicFlash';
import { ElevenLabsProfile } from './ElevenLabsProfile';
import { DailyRewardModal } from '../gamification/DailyRewardModal';
import { NavigationHub } from '../NavigationHub';
import { Auth } from '../../features/auth/components/Auth';
import { LegalAgreements } from '../legal/LegalAgreements';
import { AchievementToast } from '../profile/AchievementToast';
import { PublishDialog } from '../PublishDialog';
import { GuideOverlay } from '../guide/GuideOverlay';

interface AppLayoutProps {
    children: React.ReactNode;
    user: User | null;
    profile: UserProfile | null;
    location: { pathname: string, search: string }; // Minimal location interface

    // UI State
    showAuth: boolean;
    setShowAuth: (show: boolean) => void;

    // Magic Transition
    showFairy: boolean;
    showFlash: boolean;
    handleFairyTrigger: () => void;

    // Nav Handlers
    onNavigate: (view: any) => void;
    onLogout: () => void;
    onOpenProfile: () => void;
    onOpenStore: () => void;

    // Daily Reward
    showDailyReward: boolean;
    setShowDailyReward: (show: boolean) => void;
    rewardStreak: number;
    handleClaimReward: () => void;

    // Overlays
    currentAchievement: Achievement | null;
    setCurrentAchievement: (ach: Achievement | null) => void;

    showPublishDialog: boolean;
    setShowPublishDialog: (show: boolean) => void;
    publishBookId: string | null;
    setPublishBookId: (id: string | null) => void;

    notification: string | null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    user,
    profile,
    location,
    showAuth,
    setShowAuth,
    showFairy,
    showFlash,
    handleFairyTrigger,
    onNavigate,
    onLogout,
    onOpenProfile,
    onOpenStore,
    showDailyReward,
    setShowDailyReward,
    rewardStreak,
    handleClaimReward,
    currentAchievement,
    setCurrentAchievement,
    showPublishDialog,
    setShowPublishDialog,
    publishBookId,
    setPublishBookId,
    notification
}) => {
    const { t } = useTranslation();

    // Immersive Check: Paths that should be full-screen / immersive
    const isImmersive = location.pathname.includes('/editor') ||
        location.pathname.includes('/story') ||
        location.pathname.includes('/card-studio') ||
        location.pathname.includes('/book/') ||
        location.pathname.includes('/studio') ||
        location.pathname.includes('/create') ||
        location.pathname.includes('/custom') ||
        location.pathname.includes('/card-viewer') ||
        location.pathname.includes('/magic');

    const isLanding = location.pathname === '/' || location.pathname === '/magic';

    // Hide UI on certain pages
    // Hide UI on certain pages
    const hideGlobalUI = location.pathname === '/magic' || location.pathname === '/terms' || location.pathname === '/privacy' || location.pathname === '/profile';

    return (
        <div className={`min-h-[100svh] w-full max-w-[100vw] relative pb-24 md:pb-0 ${!hideGlobalUI && !isImmersive
            ? 'flex flex-col sm:flex-row sm:items-center sm:justify-center perspective-1000'
            : ''
            }`}>

            {/* LEGAL: Cookie Consent Banner (Global) */}
            <CookieConsent />

            {/* z-[-2]: GLOBAL BACKGROUND (Stars everywhere) */}
            <div className={`fixed inset-0 z-[-2] ${location.pathname.includes('/studio') ? 'hidden' : ''}`}> {/* Hide global stars in studio, it has its own */}
                <StarryBackground />
            </div>

            {/* MAGIC TRANSITION ELEMENTS */}
            <AnimatePresence>
                {
                    showFairy && (
                        <MagicFairy onTrigger={handleFairyTrigger} />
                    )
                }
            </AnimatePresence >
            <MagicFlash isActive={showFlash} />

            {/* Global Profile & Energy (Hidden in Immersive Modes & Cinematic Landing) */}
            {!isImmersive && !isLanding && profile && (
                <ElevenLabsProfile
                    user={user}
                    profile={profile}
                    onOpenProfile={onOpenProfile}
                    onOpenStore={onOpenStore}
                    className={(location.pathname.includes('/studio') || location.pathname.includes('/custom')) ? 'top-20' : 'top-6'}
                />
            )}

            {/* Daily Reward Modal (Hidden in Cinematic Mode) */}
            {!isLanding && (
                <DailyRewardModal
                    isOpen={showDailyReward}
                    onClose={() => setShowDailyReward(false)}
                    streak={rewardStreak}
                    onClaim={handleClaimReward}
                />
            )}

            {/* MAGIC NAVIGATION HUB (Smart Dock) - z-[9999] ensuring it is on top */}
            {!isLanding && (
                <div className="relative z-[9999] pointer-events-none">
                    {/* UI LAYER - GLOBAL */}
                    <NavigationHub
                        onNavigate={onNavigate}
                        currentView={(() => {
                            // Sync Router location to NavigationHub state
                            const p = location.pathname;
                            if (p === '/terms') return 'terms';
                            if (p === '/privacy') return 'privacy';
                            if (p === '/pricing') return 'pricing';
                            if (p === '/feedback') return 'feedback_board';
                            if (p === '/library') return 'library';
                            if (p === '/arcade') return 'arcade';
                            if (p === '/encyclopedia') return 'discovery';
                            if (p === '/create') return 'setup';
                            if (p === '/custom') return 'create_custom';
                            if (p === '/store') return 'energy_store';
                            if (p === '/profile') return 'profile';
                            if (p === '/' || p === '/magic') return 'landing';
                            if (p.includes('/book')) return 'library';
                            if (p.includes('/studio')) return 'card_studio';
                            return 'library';
                        })()}
                        user={user}
                        onLogin={() => setShowAuth(true)}
                        onLogout={onLogout}
                    />
                </div>
            )}

            {/* Notification Toast */}
            {
                notification && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-xl z-[100] font-bold animate-pulse">
                        {notification}
                    </div>
                )
            }

            {/* GLOBAL AUTH MODAL */}
            {showAuth && <Auth onLogin={() => setShowAuth(false)} />}

            {/* Config Warning */}
            {
                !isSupabaseConfigured && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-500 text-ink-900 px-4 py-2 text-center text-sm font-bold z-[100] flex items-center justify-center gap-2">
                        <AlertTriangle size={16} />
                        <span>{t('app.demo_mode')}</span>
                    </div>
                )
            }

            {/* VIEW CONTENT RENDERER */}
            {children}


            {/* Achievement Toast */}
            < AchievementToast
                achievement={currentAchievement}
                onDismiss={() => setCurrentAchievement(null)}
            />

            {/* Publish Dialog */}
            {
                showPublishDialog && publishBookId && (
                    <PublishDialog
                        bookId={publishBookId}
                        onPublish={async (isPublic) => {
                            // Update book's is_public status
                            await supabase
                                .from('books')
                                .update({ is_public: isPublic })
                                .eq('id', publishBookId)
                                .eq('owner_id', user?.id);

                            console.log(`📚 Book ${publishBookId} ${isPublic ? 'published' : 'kept private'}`);
                        }}
                        onClose={() => {
                            setShowPublishDialog(false);
                            setPublishBookId(null);
                        }}
                    />
                )
            }

            {/* GUIDE OVERLAY SYSTEM */}
            <GuideOverlay />

        </div >
    );
};
