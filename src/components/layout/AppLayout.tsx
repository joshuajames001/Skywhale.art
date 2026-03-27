import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { UserProfile, Achievement } from '../../types';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { getRouteFlags, getNavigationView } from './routeHelpers';

// Components
import { CookieConsent } from '../../features/legal/components/CookieConsent';
import { StarryBackground } from '../StarryBackground';
import { MagicFairy } from '../../features/story-builder/components/effects/MagicFairy';
import { MagicFlash } from '../../features/story-builder/components/effects/MagicFlash';
import { ElevenLabsProfile } from '../../features/profile/components/ElevenLabsProfile';
import { DailyRewardModal } from '../../features/gamification/components/DailyRewardModal';
import { NavigationHub } from '../../features/navigation/NavigationHub';
import { Auth } from '../../features/auth/components/Auth';
import { LegalAgreements } from '../../features/legal/components/LegalAgreements';
import { AchievementToast } from '../../features/profile/components/AchievementToast';
import { PublishDialog } from '../../features/custom-book/components/PublishDialog';
import { GuideOverlay } from '../../features/onboarding/components/GuideOverlay';

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
    onPublishBook: (bookId: string, isPublic: boolean) => Promise<void>;
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
    notification,
    onPublishBook
}) => {
    const { t } = useTranslation();
    const { isImmersive, isLanding, hideGlobalUI } = getRouteFlags(location.pathname);

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
                        currentView={getNavigationView(location.pathname)}
                        user={user}
                        onLogin={() => setShowAuth(true)}
                        onLogout={onLogout}
                    />
                </div>
            )}

            {/* Notification Toast */}
            {
                notification && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-xl z-[100] font-bold animate-pulse">
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
                            await onPublishBook(publishBookId, isPublic);
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
