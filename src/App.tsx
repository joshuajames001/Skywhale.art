import { useState, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

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

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Routes
import { createRoutes } from './app/routes';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    const { user, profile, loading, showAuth, setShowAuth, isNewUser, clearNewUserFlag } = useAppAuth();
    const { isTransitioning, showFairy, showFlash, triggerMagicTransition, handleFairyTrigger } = useMagicTransition();
    const { showDailyReward, setShowDailyReward, rewardStreak, handleClaimReward } = useDailyReward();
    const { notification, updateBookPublicStatus } = useStory();

    const {
        handleStoryCreated, handleNewStoryClick, handleOpenBook,
        handleHubNavigate, handleBookFromLanding,
        showPublishDialog, setShowPublishDialog, publishBookId, setPublishBookId,
    } = useAppNavigation(triggerMagicTransition, isTransitioning, setCurrentAchievement);

    useUrlHandlers(setCurrentAchievement);

    const cardStudioAdapter = useCardStudioAdapter(user);
    const gameHubAdapter = useGameHubAdapter(() => handleHubNavigate('library'));
    const libraryAdapter = useLibraryAdapter({
        onOpenBook: handleOpenBook, onOpenMagic: handleNewStoryClick,
        onCreateCustom: () => handleHubNavigate('create_custom'),
        onCreateCard: () => handleHubNavigate('card_studio'),
    });

    const routes = createRoutes({
        navigate, user, loading, handleHubNavigate, handleStoryCreated, handleNewStoryClick,
        handleOpenBook, handleBookFromLanding, setShowAuth,
        cardStudioAdapter, gameHubAdapter, libraryAdapter,
    });

    return (
        <AppLayout
            user={user} profile={profile} location={location}
            showAuth={showAuth} setShowAuth={setShowAuth}
            isNewUser={isNewUser} clearNewUserFlag={clearNewUserFlag}
            showFairy={showFairy} showFlash={showFlash} handleFairyTrigger={handleFairyTrigger}
            onNavigate={handleHubNavigate}
            onLogout={() => { supabase.auth.signOut(); navigate('/home'); }}
            onOpenProfile={() => handleHubNavigate('profile')}
            onOpenStore={() => handleHubNavigate('energy_store')}
            showDailyReward={showDailyReward} setShowDailyReward={setShowDailyReward}
            rewardStreak={rewardStreak} handleClaimReward={handleClaimReward}
            currentAchievement={currentAchievement} setCurrentAchievement={setCurrentAchievement}
            showPublishDialog={showPublishDialog} setShowPublishDialog={setShowPublishDialog}
            publishBookId={publishBookId} setPublishBookId={setPublishBookId}
            notification={notification}
            onPublishBook={async (bookId, isPublic) => {
                if (user) await updateBookPublicStatus(bookId, isPublic, user.id);
            }}
        >
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Routes>
                    {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                </Routes>
            </Suspense>
        </AppLayout>
    );
}

export default App;
