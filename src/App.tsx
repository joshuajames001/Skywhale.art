import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { sampleStory } from './data';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Auth } from './components/Auth';
import { useStory } from './hooks/useStory';
import { useNavigate, useLocation, Navigate, Routes, Route } from 'react-router-dom';
import { CardStudioWrapper } from './features/card-studio/CardStudioWrapper';
import { BookRouteWrapper } from './features/reader/BookRouteWrapper';
import { StoryBook, StoryPage, UserProfile as UserProfileType, Achievement, CardProject } from './types';
import { Save, AlertTriangle, X, Loader2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StorySetup } from './features/story-builder/components/StorySetup';
import { AppLayout } from './components/layout/AppLayout';
import { CardStudioProvider } from './features/card-studio/CardStudioContext';
import { useGemini } from './hooks/useGemini';
import { GameHub } from './features/game-hub/GameHub';
import { GameHubProvider } from './features/game-hub/GameHubContext';
import { DiscoveryHub } from './components/discovery/DiscoveryHub';
import { LandingPage } from './components/LandingPage';
import { CinematicLanding } from './components/CinematicLanding';
import { LegalAgreements } from './components/legal/LegalAgreements';
import { FeedbackBoard } from './components/community/FeedbackBoard';
import { PricingPage } from './components/PricingPage';
import { useDailyReward } from './hooks/useDailyReward';
import CustomBookEditor from './components/custom-book/CustomBookEditor';
import { EnergyStore } from './components/store/EnergyStore';
import { UserProfile } from './components/profile/UserProfile';
import { CardViewer } from './features/card-studio/CardViewer';

import { useCardStudioAdapter } from './providers/useCardStudioAdapter';
import { useGameHubAdapter } from './providers/useGameHubAdapter';
import { useLibraryAdapter } from './providers/useLibraryAdapter';
import { LibraryProvider } from './features/library/LibraryContext';
import { Library } from './features/library/Library';

import { CreateStoryWrapper } from './features/story-builder/CreateStoryWrapper';

function App() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [showAuth, setShowAuth] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileType | null>(null);

    // MAGIC TRANSITION STATE
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showFairy, setShowFairy] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // ACHIEVEMENT TOAST STATE
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    // PUBLISH DIALOG STATE
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [publishBookId, setPublishBookId] = useState<string | null>(null);


    const { saveStory, saveCardProject, uploadImage, updateIdentity, saving, notification } = useStory();
    const { searchDictionary, generateImagePrompt } = useGemini();


    // ADAPTERS
    const cardStudioAdapter = useCardStudioAdapter(user);
    const gameHubAdapter = useGameHubAdapter(() => navigate('/library'));


    // Check auth on mount
    useEffect(() => {
        // CLEAN UP URL FRAGMENTS (Fix for "Page Unavailable" / Loops)
        if (window.location.hash.includes('error=')) {
            console.warn("Clearing Auth Error Fragment:", window.location.hash);
            window.location.hash = ''; // Reset URL
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch user profile from database
    const fetchUserProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('nickname, avatar_emoji, energy_balance, username')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile({ ...data, id: userId });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    // Capture Referral Code & Payment Status
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // 1. Referral Code
        const refCode = params.get('ref');
        if (refCode) {
            // console.log("🔗 Caught Referral Code:", refCode);
            localStorage.setItem('referral_code', refCode);
        }

        // 2. Payment Success
        const success = params.get('success');
        if (success === 'true') {
            navigate('/store');
            // Small delay to ensure view is mounted before showing toast/messasge or just let the store handle it?
            setTimeout(() => {
                setCurrentAchievement({
                    title: t('app.notifications.payment_success_title'),
                    description: t('app.notifications.payment_success_desc'),
                    icon: "⚡",
                    xp: 0,
                    id: "payment-success"
                });
            }, 1000);
        }

        if (success === 'false' || params.get('canceled')) {
            navigate('/store');
        }

    }, []);

    // Legacy Link Redirector
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        const id = params.get('id');

        if (view === 'book' && id) {
            navigate(`/book/${id}`, { replace: true });
        } else if (view === 'card_studio') {
            navigate('/studio', { replace: true });
        } else if (view === 'library') {
            navigate('/library', { replace: true });
        } else if (view === 'arcade') {
            navigate('/arcade', { replace: true });
        } else if (view === 'discovery') {
            navigate('/encyclopedia', { replace: true });
        } else if (view === 'setup') {
            navigate('/create', { replace: true });
        } else if (view === 'create_custom') {
            navigate('/custom', { replace: true });
        } else if (view === 'profile') {
            navigate('/profile', { replace: true });
        } else if (view === 'energy_store') {
            navigate('/store', { replace: true });
        }
    }, [location.search, navigate]);

    const handleStoryCreated = async (newStory: StoryBook) => {
        // 1. Save to Database first and GET THE REAL ID
        const result = await saveStory(newStory);

        if (result) {
            const { bookId: savedId, achievements } = result;
            // console.log(`✨ Story Created & Saved. ID: ${savedId}`);
            // 2. Update Local State with the CONFIRMED ID
            // const confirmedStory = { ...newStory, book_id: savedId };

            // 3. Show achievement toasts
            if (achievements && achievements.length > 0) {
                setCurrentAchievement(achievements[0]);
                achievements.slice(1).forEach((ach, index) => {
                    setTimeout(() => setCurrentAchievement(ach), (index + 1) * 6000);
                });
            }

            // 4. Navigate to the new book route
            // Delay slightly to let the setup animation finish if needed? 
            // Actually, we can just go.
            navigate(`/book/${savedId}`);

            // 5. Show publish dialog after a short delay (let user see the book first)
            // Note: PublishDialog logic needs to be reachable.
            // Since we are navigating away, the App.tsx state for `showPublishDialog` might be lost if we unmount?
            // `BookRouteWrapper` is a child of App? No, it's a Route.
            // If `showPublishDialog` is in App.tsx, and we navigate to `/book/:id`, App.tsx is still the parent?
            // Yes, <Routes> is inside App. But `viewMode` logic (where the legacy fallback was) is separate.
            // Wait, `showPublishDialog` is rendered *outside* the Routes?
            // Looking at App.tsx structure...

            setTimeout(() => {
                setPublishBookId(savedId);
                setShowPublishDialog(true);
            }, 2000);
        } else {
            console.error("❌ Failed to save story structure. Cannot proceed.");
            // Optional: Show error toast here
        }
    };

    const handleNewStoryClick = () => {
        navigate('/create');
    };

    const handleOpenBook = (book: StoryBook) => {
        // Special Handling for Greeting Cards
        if (book.visual_style === 'card_project_v1' && book.style_manifest) {
            try {
                const pages = JSON.parse(book.style_manifest);
                const initialProject = {
                    id: book.book_id,
                    title: book.title,
                    pages: pages
                };

                // Navigate to Studio with STATE
                navigate('/studio', { state: { initialProject } });
                return;
            } catch (e) {
                console.error("Failed to parse card project manifest:", e);
                // Fallback to normal book viewer but it might look broken
            }
        }

        navigate(`/book/${book.book_id}`);
    };

    // NAVIGATION HUB HANDLER
    const handleHubNavigate = (view: 'intro' | 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'feedback_board' | 'profile' | 'pricing') => {
        // ROUTE MIGRATION: Simple Views
        if (view === 'terms') {
            navigate('/terms');
            return;
        }
        if (view === 'intro') {
            navigate('/');
            return;
        }
        if (view === 'privacy') {
            navigate('/privacy');
            return;
        }
        if (view === 'pricing') {
            navigate('/pricing');
            return;
        }
        if (view === 'feedback_board') {
            navigate('/feedback');
            return;
        }

        // Intercept Setup for Magic Transition
        if (view === 'setup') {
            if (!isTransitioning) {
                // navigate('/'); // Don't need to go to root first, overlay handles it
                triggerMagicTransition('setup');
            }
            return;
        }

        if (view === 'library') {
            navigate('/library');
            return;
        } else if (view === 'landing') {
            navigate('/home');
        } else if (view === 'card_studio') {
            navigate('/studio');
        } else if (view === 'arcade') {
            navigate('/arcade');
            return;
        } else if (view === 'discovery') {
            navigate('/encyclopedia');
            return;
        } else if (view === 'create_custom') {
            navigate('/custom');
        } else if (view === 'energy_store') {
            navigate('/store');
        } else if (view === 'profile') {
            navigate('/profile');
        }
    };

    // MAGIC TRANSITION ORCHESTRATOR
    const triggerMagicTransition = (_targetView: string) => {
        setIsTransitioning(true);
        setShowFairy(true);
    };

    const handleFairyTrigger = () => {
        // Wand Waved! Start Flash
        setShowFlash(true);

        // Wait for flash to cover screen (approx 200-300ms depending on animation)
        setTimeout(() => {
            // CHANGE VIEW BEHIND THE CURTAIN
            navigate('/create?magic=' + Date.now()); // Force navigation/reset

            // Start cleanup
            setShowFairy(false);

            // Fade out flash
            setTimeout(() => {
                setShowFlash(false);
                setIsTransitioning(false);
            }, 500);
        }, 600);
    };

    const handleBookFromLanding = async (bookId?: string) => {
        if (!bookId) {
            navigate('/library');
            return;
        }
        navigate(`/book/${bookId}`);
    };

    // Daily Reward Logic
    const { showDailyReward, setShowDailyReward, rewardStreak, handleClaimReward } = useDailyReward();

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
    const hideGlobalUI = location.pathname === '/' || location.pathname === '/magic' || location.pathname === '/terms' || location.pathname === '/privacy' || location.pathname === '/profile';

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
                navigate('/home'); // Or to / (Cinematic)
            }}
            onOpenProfile={() => navigate('/profile')}
            onOpenStore={() => navigate('/store')}
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
                            onOpenStore={() => navigate('/store')}
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
                                navigate('/custom');
                            },
                            onCreateCard: () => {
                                navigate('/studio');
                            }
                        })}>
                            <Library
                                user={user}
                                onOpenBook={handleOpenBook}
                                onOpenMagic={handleNewStoryClick}
                                onCreateCustom={() => {
                                    navigate('/custom');
                                }}
                                onCreateCard={() => {
                                    navigate('/studio');
                                }}
                            />
                        </LibraryProvider>
                    </div>
                } />
                <Route path="/arcade" element={
                    <GameHubProvider adapter={gameHubAdapter}>
                        <GameHub imageUrl={null} onClose={() => navigate('/library')} />
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
                        onOpenStore={() => navigate('/store')}
                    />
                } />
                <Route path="/custom" element={
                    <div className="w-full h-[100svh] overflow-y-auto relative">
                        <CustomBookEditor
                            onBack={() => {
                                navigate('/library');
                            }}
                            onOpenStore={() => {
                                navigate('/store');
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
                        onClose={() => navigate('/library')}
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
                        onEnter={() => navigate('/home')}
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
