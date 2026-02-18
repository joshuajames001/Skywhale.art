import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';

// Types & Libs
import { Achievement } from './types';
import { supabase } from './lib/supabase';

// Core Hooks (FSD)
import { useAppAuth } from './hooks/core/useAppAuth';
import { useMagicTransition } from './hooks/core/useMagicTransition';
import { useUrlHandlers } from './hooks/core/useUrlHandlers';
import { useAppNavigation } from './hooks/core/useAppNavigation';

// Feature Hooks
import { useStory } from './hooks/useStory';
import { useDailyReward } from './hooks/useDailyReward';

// Adapters
import { useCardStudioAdapter } from './providers/useCardStudioAdapter';
import { useGameHubAdapter } from './providers/useGameHubAdapter';
import { useLibraryAdapter } from './providers/useLibraryAdapter';

// Context Providers
import { CardStudioProvider } from './features/card-studio/CardStudioContext';
import { GameHubProvider } from './features/game-hub/GameHubContext';
import { GameHub } from './features/game-hub/GameHub';
import { LibraryProvider } from './features/library/LibraryContext';

// Components / Features
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './features/landing/components/LandingPage';
import { CinematicLanding } from './features/landing/components/CinematicLanding';
import { Auth } from './features/auth/components/Auth';
import { LegalAgreements } from './features/legal/components/LegalAgreements';
import { FeedbackBoard } from './features/feedback/components/FeedbackBoard';
import { PricingPage } from './features/store/components/PricingPage';
import { PublishDialog } from './features/custom-book/components/PublishDialog';
import { DailyRewardModal } from './features/gamification/components/DailyRewardModal';
import { EnergyStore } from './features/store/components/EnergyStore';
import { UserProfile } from './features/profile/UserProfile';
import { CardViewer } from './features/card-studio/CardViewer';
import { DiscoveryHub } from './features/discovery/components/DiscoveryHub';
import { Library } from './features/library/Library';
import { CreateStoryWrapper } from './features/story-builder/CreateStoryWrapper';
import { CardStudioWrapper } from './features/card-studio/CardStudioWrapper';
import { BookRouteWrapper } from './features/reader/BookRouteWrapper';
import CustomBookEditor from './features/custom-book/components/CustomBookEditor';

function App() {
    // 1. Core Utils
    // const { t } = useTranslation(); // Unused in render? AppLayout uses it internally maybe? No, passed as child content or used in logic.
    const navigate = useNavigate();
    const location = useLocation();

    // 2. Local UI State (Orchestration)
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    // 3. Custom Hooks (Logic Injection)
    const { user, profile, showAuth, setShowAuth } = useAppAuth();

    const {
        isTransitioning, showFairy, showFlash,
        triggerMagicTransition, handleFairyTrigger
    } = useMagicTransition();

    const { showDailyReward, setShowDailyReward, rewardStreak, handleClaimReward } = useDailyReward();

    const { notification } = useStory(); // For Layout notifications

    // 4. Navigation & Handlers
    const {
        handleStoryCreated, handleNewStoryClick, handleOpenBook,
        handleHubNavigate, handleBookFromLanding,
        showPublishDialog, setShowPublishDialog, publishBookId, setPublishBookId
    } = useAppNavigation(triggerMagicTransition, isTransitioning, setCurrentAchievement);

    useUrlHandlers(setCurrentAchievement);

    // 5. Adapters
    const cardStudioAdapter = useCardStudioAdapter(user);
    const gameHubAdapter = useGameHubAdapter(() => handleHubNavigate('library'));

    return (
        <AppLayout
            user={user}
            profile={profile}
            location={location}
            showAuth={showAuth}
            setShowAuth={setShowAuth}
            showFairy={showFairy}
            showFlash={showFlash}
            handleFairyTrigger={handleFairyTrigger}
            onNavigate={handleHubNavigate}
            onLogout={() => {
                supabase.auth.signOut();
                navigate('/home');
            }}
            onOpenProfile={() => handleHubNavigate('profile')}
            onOpenStore={() => handleHubNavigate('energy_store')}
            showDailyReward={showDailyReward}
            setShowDailyReward={setShowDailyReward}
            rewardStreak={rewardStreak}
            handleClaimReward={handleClaimReward}
            currentAchievement={currentAchievement}
            setCurrentAchievement={setCurrentAchievement}
            showPublishDialog={showPublishDialog}
            setShowPublishDialog={setShowPublishDialog}
            publishBookId={publishBookId}
            setPublishBookId={setPublishBookId}
            notification={notification}
        >
            <Routes>
                {/* SIMPLE ROUTES */}
                <Route path="/terms" element={
                    <div className="fixed inset-0 z-[200]">
                        <LegalAgreements
                            onBack={() => navigate('/')}
                            defaultTab="terms"
                        />
                    </div>
                } />
                <Route path="/privacy" element={
                    <div className="fixed inset-0 z-[200]">
                        <LegalAgreements
                            onBack={() => navigate('/')}
                            defaultTab="privacy"
                        />
                    </div>
                } />
                <Route path="/pricing" element={
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <PricingPage
                            onBack={() => navigate('/')}
                            onOpenStore={() => handleHubNavigate('energy_store')}
                        />
                    </div>
                } />
                <Route path="/feedback" element={
                    <div className="w-full h-full relative z-50">
                        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                            <LandingPage
                                onEnter={handleBookFromLanding}
                                onNavigate={handleHubNavigate}
                                user={user}
                                onLogin={() => setShowAuth(true)}
                                hideUI={true}
                            />
                        </div>
                        <FeedbackBoard onClose={() => navigate('/')} />
                    </div>
                } />
                <Route path="/library" element={
                    <div className="w-full h-[100svh] overflow-y-auto relative">
                        <LibraryProvider adapter={useLibraryAdapter({
                            onOpenBook: handleOpenBook,
                            onOpenMagic: handleNewStoryClick,
                            onCreateCustom: () => {
                                handleHubNavigate('create_custom');
                            },
                            onCreateCard: () => {
                                handleHubNavigate('card_studio');
                            }
                        })}>
                            <Library
                                user={user}
                                onOpenBook={handleOpenBook}
                                onOpenMagic={handleNewStoryClick}
                                onCreateCustom={() => {
                                    handleHubNavigate('create_custom');
                                }}
                                onCreateCard={() => {
                                    handleHubNavigate('card_studio');
                                }}
                            />
                        </LibraryProvider>
                    </div>
                } />
                <Route path="/arcade" element={
                    <GameHubProvider adapter={gameHubAdapter}>
                        <GameHub imageUrl={null} onClose={() => handleHubNavigate('library')} />
                    </GameHubProvider>
                } />
                <Route path="/encyclopedia" element={
                    <div className="w-full h-screen overflow-hidden relative">
                        <DiscoveryHub onClose={() => navigate('/')} />
                    </div>
                } />

                <Route path="/create" element={
                    <CreateStoryWrapper
                        onComplete={handleStoryCreated}
                        onOpenStore={() => handleHubNavigate('energy_store')}
                    />
                } />
                <Route path="/custom" element={
                    <div className="w-full h-[100svh] overflow-y-auto relative">
                        <CustomBookEditor
                            onBack={() => {
                                handleHubNavigate('library');
                            }}
                            onOpenStore={() => {
                                handleHubNavigate('energy_store');
                            }}
                        />
                    </div>
                } />
                <Route path="/store" element={<EnergyStore onClose={() => navigate('/')} />} />
                <Route path="/profile" element={
                    <UserProfile
                        user={user}
                        onBack={() => navigate('/')}
                    />
                } />
                <Route path="/card-viewer" element={
                    <CardViewer
                        cardId={null}
                        onClose={() => handleHubNavigate('library')}
                    />
                } />

                <Route path="/studio" element={
                    <CardStudioProvider adapter={cardStudioAdapter}>
                        <CardStudioWrapper />
                    </CardStudioProvider>
                } />
                <Route path="/book/:id" element={
                    <BookRouteWrapper />
                } />

                <Route path="/magic" element={
                    <Navigate to="/" replace />
                } />

                <Route path="/" element={
                    <CinematicLanding
                        onEnter={() => handleHubNavigate('landing')}
                        onNavigate={handleHubNavigate}
                    />
                } />

                <Route path="/home" element={
                    <LandingPage
                        onEnter={handleBookFromLanding}
                        onNavigate={handleHubNavigate}
                        user={user}
                        onLogin={() => setShowAuth(true)}
                    />
                } />

                <Route path="/*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
    );
}

export default App;
