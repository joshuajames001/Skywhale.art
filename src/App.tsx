import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { sampleStory } from './data';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { BookCover } from './components/BookCover';
import { StorySpread } from './components/StorySpread';
import { Controls } from './components/Controls';
import { Auth } from './components/Auth';
import { useStory } from './hooks/useStory';
import { StoryBook, StoryPage, UserProfile as UserProfileType, Achievement, CardProject } from './types';
import { Save, AlertTriangle, X, Loader2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StorySetup } from './components/StorySetup';
import { Library } from './components/Library';
import { NavigationHub } from './components/NavigationHub';
import { GreetingCardEditor } from './components/card-studio/GreetingCardEditor';
import { CardViewer } from './components/card-studio/CardViewer';
import { GameHub } from './components/games/GameHub';
import { DiscoveryHub } from './components/discovery/DiscoveryHub';
import CustomBookEditor from './components/custom-book/CustomBookEditor';
import { EnergyStore } from './components/store/EnergyStore';
import { LandingPage } from './components/LandingPage';
import { CinematicLanding } from './components/CinematicLanding';
import { MagicFairy } from './components/MagicFairy';
import { MagicFlash } from './components/MagicFlash';
import { StarryBackground } from './components/StarryBackground';
import { CookieConsent } from './components/legal/CookieConsent';
import { LegalAgreements } from './components/legal/LegalAgreements';
import { FeedbackBoard } from './components/community/FeedbackBoard';
import { UserProfile } from './components/profile/UserProfile';
import { AchievementToast } from './components/profile/AchievementToast';
import { PricingPage } from './components/PricingPage';
import { PublishDialog } from './components/PublishDialog';
import { MiniPlayer } from './components/audio/MiniPlayer';
import { GuideOverlay } from './components/guide/GuideOverlay';
import { DailyRewardModal } from './components/gamification/DailyRewardModal';
import { ElevenLabsProfile } from './components/layout/ElevenLabsProfile';
import { useDailyReward } from './hooks/useDailyReward';
import { usePdfExport } from './hooks/usePdfExport';

function App() {
    const { t } = useTranslation();
    const [story, setStory] = useState<StoryBook>(sampleStory);
    const [cardProject, setCardProject] = useState<CardProject | null>(null);

    // Include 'library', 'landing', 'profile', 'pricing' in viewMode
    const [viewMode, setViewMode] = useState<'landing' | 'cinematic' | 'book' | 'setup' | 'library' | 'card_studio' | 'arcade' | 'discovery' | 'card_viewer' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'feedback_board' | 'profile' | 'pricing'>(() => {
        const params = new URLSearchParams(window.location.search);
        const savedView = params.get('view');
        const validViews = ['landing', 'cinematic', 'book', 'setup', 'library', 'card_studio', 'arcade', 'discovery', 'card_viewer', 'create_custom', 'energy_store', 'terms', 'privacy', 'feedback_board', 'profile', 'pricing'];
        return (validViews.includes(savedView || '') ? savedView : 'cinematic') as any;
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [showAuth, setShowAuth] = useState(false);

    // WIZARD RESET STATE
    const [storySetupKey, setStorySetupKey] = useState(0);

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

    // PDF EXPORT STATE


    const { saveStory, uploadImage, updateIdentity, saving, notification } = useStory();

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
            setViewMode('energy_store');
            // Small delay to ensure view is mounted before showing toast/messasge or just let the store handle it?
            // For now, let's just clear the URL so we don't loop
            // Ideally, we'd pass a prop to EnergyStore to say "show congrats"
            setTimeout(() => {
                // Use existing AchievementToast logic or a new state for generic notifications?
                // For now, let's abuse currentAchievement to show a nice message
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
            setViewMode('energy_store');
        }

    }, []);

    // Update URL when top-level view changes
    useEffect(() => {
        // console.log("App.tsx: viewMode changed to:", viewMode);
        const url = new URL(window.location.href);

        // Always sync the current view to URL
        if (viewMode === 'cinematic') {
            url.searchParams.delete('view');
        } else {
            url.searchParams.set('view', viewMode);
        }

        // Discovery-specific cleanup (if leaving discovery)
        if (viewMode !== 'discovery') {
            // Clean up discovery params if they exist
            if (url.searchParams.has('category') || url.searchParams.has('book') || url.searchParams.has('page')) {
                url.searchParams.delete('category');
                url.searchParams.delete('book');
                url.searchParams.delete('page');
            }
        }

        window.history.replaceState({}, '', url);
    }, [viewMode]);

    const handleUpdatePage = (pageNumber: number, updates: Partial<StoryPage>) => {
        setStory(prev => ({
            ...prev,
            pages: prev.pages.map(p =>
                p.page_number === pageNumber ? { ...p, ...updates } : p
            )
        }));
    };

    const handleUpdateCover = (coverUrl: string | null, seed?: number, identityUrl?: string, identityLock?: string) => {
        setStory(prev => {
            const newStory = {
                ...prev,
                cover_image: coverUrl || prev.cover_image,
                character_seed: seed ?? prev.character_seed,
                // FLUX 2.0 UPDATE: Allow updating Identity Reference if provided
                character_sheet_url: identityUrl || prev.character_sheet_url,
                // VISUAL DNA UPGRADE: If Vision Node provided a lock, we overwrite the text description to match the image!
                visual_dna: identityLock || prev.visual_dna,
                // Also update main_character for consistency (Backend English Force)
                main_character: identityLock || prev.main_character
            };

            // PERSISTENCE FIX: Save the English DNA to DB immediately!
            if (identityLock && identityUrl) {
                updateIdentity(prev.book_id, identityUrl, identityLock);
            }

            return newStory;
        });
    };

    const handleStoryCreated = async (newStory: StoryBook) => {
        // 1. Save to Database first and GET THE REAL ID
        const result = await saveStory(newStory);

        if (result) {
            const { bookId: savedId, achievements } = result;
            // console.log(`✨ Story Created & Saved. ID: ${savedId}`);
            // 2. Update Local State with the CONFIRMED ID
            const confirmedStory = { ...newStory, book_id: savedId };
            setStory(confirmedStory);
            setViewMode('book');
            setCurrentIndex(0); // Go to cover

            // 3. Show achievement toasts
            if (achievements && achievements.length > 0) {
                // Show first achievement immediately
                setCurrentAchievement(achievements[0]);
                // If multiple, queue them with delays
                achievements.slice(1).forEach((ach, index) => {
                    setTimeout(() => setCurrentAchievement(ach), (index + 1) * 6000);
                });
            }

            // 4. Show publish dialog after a short delay (let user see the book first)
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
        setViewMode('setup');
    };

    const handleOpenBook = (book: StoryBook) => {
        // Special Handling for Greeting Cards
        if (book.visual_style === 'card_project_v1' && book.style_manifest) {
            try {
                const pages = JSON.parse(book.style_manifest);
                setCardProject({
                    id: book.book_id,
                    title: book.title,
                    pages: pages
                });
                setViewMode('card_studio');
                return;
            } catch (e) {
                console.error("Failed to parse card project manifest:", e);
                // Fallback to normal book viewer but it might look broken
            }
        }

        setStory(book);
        setViewMode('book');
        setCurrentIndex(0);
    };

    const handleSave = () => {
        if (!user) {
            setShowAuth(true);
        } else {
            saveStory(story);
        }
    };

    // Page 0 is Cover, Pages 1..N are Story
    const totalPages = story.pages.length + 1;
    const isCover = currentIndex === 0;

    const handleNext = () => {
        if (currentIndex < totalPages - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Variants for page flip animation
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            rotateY: direction > 0 ? 90 : -90,
            scale: 0.8
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            rotateY: direction < 0 ? 90 : -90,
            scale: 0.8
        })
    };

    // --- PDF EXPORT HANDLER ---
    const { isExportingPdf, pdfProgress, handleExportPdf } = usePdfExport(story);

    // NAVIGATION HUB HANDLER
    const handleHubNavigate = (view: 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'feedback_board' | 'profile' | 'pricing') => {
        if (view === 'terms') {
            setViewMode('terms');
            return;
        }
        if (view === 'privacy') {
            setViewMode('privacy');
            return;
        }
        if (view === 'pricing') {
            setViewMode('pricing');
            return;
        }
        if (view === 'feedback_board') {
            setViewMode('feedback_board');
            return;
        }
        if (view === 'profile') {
            setViewMode('profile');
            return;
        }
        // Intercept Setup for Magic Transition
        if (view === 'setup') {
            if (!isTransitioning) {
                triggerMagicTransition('setup');
            }
            return;
        }

        if (view === 'library') {
            setViewMode('library');
        } else if (view === 'landing') {
            setViewMode('landing');
        } else if (view === 'card_studio') {
            setViewMode('card_studio');
        } else if (view === 'arcade') {
            setViewMode('arcade');
        } else if (view === 'discovery') {
            setViewMode('discovery');
        } else if (view === 'create_custom') {
            setViewMode('create_custom');
        } else if (view === 'energy_store') {
            setViewMode('energy_store');
        }
    };

    // MAGIC TRANSITION ORCHESTRATOR
    const triggerMagicTransition = (_targetView: typeof viewMode) => {
        setIsTransitioning(true);
        setShowFairy(true);

        // Sequence handled via callbacks from MagicFairy, but as a fail-safe we can use timeouts here too.
        // But let's rely on MagicFairy to call onTrigger.
    };

    const handleFairyTrigger = () => {
        // Wand Waved! Start Flash
        setShowFlash(true);

        // Wait for flash to cover screen (approx 200-300ms depending on animation)
        setTimeout(() => {
            // CHANGE VIEW BEHIND THE CURTAIN
            setStorySetupKey(prev => prev + 1);
            setViewMode('setup'); // 'generator' -> 'setup'

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
            setViewMode('library');
            return;
        }

        // console.log("🚀 Loading Book from Landing:", bookId);
        try {
            const { data: bookData, error } = await supabase
                .from('books')
                .select('*, pages(*)')
                .eq('id', bookId)
                .single();

            if (error || !bookData) {
                console.error("Failed to load book:", error);
                setViewMode('library'); // Fallback
                return;
            }

            // Mapper (Simplified version of Library Mapper)
            const mappedBook: StoryBook = {
                ...bookData,
                book_id: bookData.id,
                cover_image: bookData.cover_image_url,
                // Flux 2.0: Load Character Sheet as Master Reference
                character_sheet_url: bookData.character_sheet_url,
                identity_image_slot: bookData.identity_image_slot, // Legacy / Backup
                tier: bookData.tier, // Load model assignment
                pages: (bookData.pages || [])
                    .filter((p: any) => (p.page_number ?? p.page_index) > 0) // Fix: Exclude duplicate cover
                    .sort((a: any, b: any) => (a.page_number ?? a.page_index) - (b.page_number ?? b.page_index))
                    .map((p: any) => ({
                        ...p,
                        page_number: p.page_number || p.page_index,
                        text: p.content,
                        is_generated: !!p.image_url,
                        layout_type: p.layout_type || 'standard'
                    }))
            };

            setStory(mappedBook);
            setViewMode('book');
            setCurrentIndex(0);

        } catch (err) {
            console.error("Error loading book:", err);
            setViewMode('library');
        }
    };

    // Daily Reward Logic
    const { showDailyReward, setShowDailyReward, rewardStreak, handleClaimReward } = useDailyReward();

    const isImmersive = location.pathname.includes('/editor') ||
        location.pathname.includes('/story') ||
        location.pathname.includes('/card-studio');

    return (
        <div className={`min-h-[100svh] w-full max-w-[100vw] relative pb-24 md:pb-0 ${viewMode !== 'landing' && viewMode !== 'cinematic' && viewMode !== 'terms' && viewMode !== 'privacy' && viewMode !== 'profile' && viewMode !== 'card_studio'
            ? 'flex flex-col sm:flex-row sm:items-center sm:justify-center perspective-1000'
            : ''
            }`}>

            {/* LEGAL: Cookie Consent Banner (Global) */}
            <CookieConsent />

            {/* z-[-2]: GLOBAL BACKGROUND (Stars everywhere) */}
            <div className={`fixed inset-0 z-[-2] ${viewMode === 'card_studio' ? 'hidden' : ''}`}> {/* Hide global stars in studio, it has its own */}
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
            {!isImmersive && viewMode !== 'cinematic' && profile && (
                <ElevenLabsProfile
                    user={user}
                    profile={profile}
                    onOpenProfile={() => setViewMode('profile')}
                    onOpenStore={() => setViewMode('energy_store')}
                    className={(viewMode === 'card_studio' || viewMode === 'create_custom') ? 'top-20' : 'top-6'}
                />
            )}

            {/* Daily Reward Modal (Hidden in Cinematic Mode) */}
            {viewMode !== 'cinematic' && (
                <DailyRewardModal
                    isOpen={showDailyReward}
                    onClose={() => setShowDailyReward(false)}
                    streak={rewardStreak}
                    onClaim={handleClaimReward}
                />
            )}

            {/* MAGIC NAVIGATION HUB (Smart Dock) - z-[9999] ensuring it is on top */}
            {viewMode !== 'cinematic' && (
                <div className="relative z-[9999] pointer-events-none">
                    <NavigationHub
                        onNavigate={handleHubNavigate as any}
                        currentView={viewMode}
                        user={user}
                        onLogin={() => setShowAuth(true)}
                        onLogout={() => supabase.auth.signOut()}
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
            {
                viewMode === 'landing' ? (
                    <LandingPage
                        onEnter={handleBookFromLanding}
                        onNavigate={setViewMode}
                        user={user}
                        onLogin={() => setShowAuth(true)}
                    />
                ) : viewMode === 'cinematic' ? (
                    <CinematicLanding onEnter={handleBookFromLanding} onNavigate={setViewMode} />
                ) : viewMode === 'library' ? (
                    <div className="w-full h-[100svh] overflow-y-auto relative">
                        <Library
                            onOpenBook={handleOpenBook}
                            onOpenMagic={handleNewStoryClick}
                            onCreateCustom={() => setViewMode('create_custom')}
                            onCreateCard={() => {
                                setCardProject(null); // Reset for new card
                                setViewMode('card_studio');
                            }}
                        />
                    </div>
                ) : viewMode === 'profile' ? (
                    <UserProfile
                        user={user}
                        onBack={() => setViewMode('landing')}
                        onLogin={() => {
                            setViewMode('landing');
                            setShowAuth(true);
                        }}
                        onLogout={() => {
                            supabase.auth.signOut();
                            setViewMode('landing');
                        }}
                        onNavigate={setViewMode}
                    />
                ) : viewMode === 'setup' ? (
                    <div className="z-10 w-full h-[100svh] md:h-full overflow-y-auto flex flex-col items-center py-10 relative">
                        <StorySetup
                            key={storySetupKey}
                            onComplete={handleStoryCreated}
                            onOpenStore={() => setViewMode('energy_store')}
                        />
                    </div>
                ) : viewMode === 'card_studio' ? (
                    <GreetingCardEditor initialProject={cardProject} />
                ) : viewMode === 'arcade' ? (
                    <GameHub imageUrl={null} onClose={() => setViewMode('library')} />
                ) : viewMode === 'discovery' ? (
                    <div className="w-full h-screen overflow-hidden relative">
                        <DiscoveryHub onClose={() => setViewMode('landing')} />
                    </div>
                ) : viewMode === 'card_viewer' ? (
                    <div className="w-full h-screen overflow-y-auto flex items-center justify-center relative">
                        <CardViewer
                            cardId={new URLSearchParams(window.location.search).get('id')}
                            onClose={() => setViewMode('landing')}
                        />
                    </div>
                ) : viewMode === 'create_custom' ? (
                    <div className="w-full h-[100svh] overflow-y-auto relative">
                        <CustomBookEditor
                            onBack={() => setViewMode('library')}
                            onOpenStore={() => setViewMode('energy_store')}
                        />
                    </div>
                ) : viewMode === 'pricing' ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <PricingPage
                            onBack={() => setViewMode('landing')}
                            onOpenStore={() => setViewMode('energy_store')}
                        />
                    </div>
                ) : viewMode === 'energy_store' ? (
                    <EnergyStore onClose={() => setViewMode('landing')} />
                ) : viewMode === 'feedback_board' ? (
                    <div className="w-full h-full relative z-50">
                        {/* Overlay on top of Landing Context */}
                        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                            <LandingPage onEnter={() => { }} hideUI={true} />
                        </div>
                        <FeedbackBoard onClose={() => setViewMode('landing')} />
                    </div>
                ) : (viewMode === 'terms' || viewMode === 'privacy') ? (
                    <div className="fixed inset-0 z-[200]">
                        <LegalAgreements
                            onBack={() => setViewMode('landing')}
                            defaultTab={viewMode === 'terms' ? 'terms' : 'privacy'}
                        />
                    </div>
                ) : (
                    /* BOOK MODE */
                    (!story || !story.pages) ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                                mass: 1.2,
                                delay: 0.2 // Small delay to let magic flash clear
                            }}
                            className="relative w-full max-w-5xl h-[85vh] md:h-auto md:aspect-[3/2] perspective-2000 p-2 md:p-8"
                        >
                            {/* Mobile Close Button (Top Left) */}
                            <div className="absolute top-4 left-4 z-[1000] pointer-events-auto md:hidden">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewMode('library');
                                    }}
                                    className="flex items-center justify-center min-w-[56px] min-h-[56px] bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/20 shadow-2xl active:scale-95 transition-all"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Book Toolbar (Top Right) */}
                            <div className="absolute top-4 right-4 z-50 flex gap-4 pointer-events-auto items-center">
                                {/* Audio Player (Author Mode) */}
                                {story.audio_url && (
                                    <div className="mr-2">
                                        <MiniPlayer audioUrl={story.audio_url} />
                                    </div>
                                )}

                                {/* PDF EXPORT BUTTON */}
                                <button
                                    onClick={handleExportPdf}
                                    disabled={isExportingPdf}
                                    className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white/80 p-2.5 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-110 active:scale-95 disabled:opacity-50"
                                    title={t('app.tooltips.download_pdf')}
                                >
                                    {isExportingPdf ? (
                                        <div className="flex items-center gap-2 px-2 text-xs font-bold text-white">
                                            <Loader2 size={14} className="animate-spin" />
                                            {pdfProgress && <span>{Math.round((pdfProgress.current / pdfProgress.total) * 100)}%</span>}
                                        </div>
                                    ) : (
                                        <Download size={18} />
                                    )}
                                </button>

                                {/* Identity Status Badge hidden per user request */}

                                <button onClick={handleSave} disabled={saving} title={t('app.tooltips.save')} className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white/80 p-2.5 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-110 active:scale-95 disabled:opacity-50">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                </button>
                            </div>

                            <AnimatePresence initial={false} custom={direction} mode='wait'>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.4 },
                                        rotateY: { duration: 0.5 },
                                        scale: { duration: 0.5 }
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = offset.x;
                                        if (swipe < -50) {
                                            handleNext();
                                        } else if (swipe > 50) {
                                            handlePrev();
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full touch-pan-y"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {isCover ? (
                                        <BookCover
                                            book={story}
                                            onOpen={handleNext}
                                            onUpdateCover={handleUpdateCover}
                                            onUploadImage={uploadImage}
                                            tier={story.tier}
                                            // Flux 2.0: Character Sheet is Source of Truth for Cover
                                            referenceImageUrl={story.character_sheet_url}
                                        />
                                    ) : (
                                        <StorySpread
                                            page={story.pages[currentIndex - 1]}
                                            bookId={story.book_id}
                                            onUpdatePage={handleUpdatePage}
                                            onUploadImage={uploadImage}
                                            visualStyle={story.visual_style}
                                            mainCharacter={story.main_character}
                                            setting={story.setting}
                                            visualDna={story.visual_dna}
                                            tier={story.tier}
                                            // Flux 2.0: 10-Slot Multi-Reference Assembly
                                            referenceImageUrl={story.character_sheet_url}
                                            styleReferenceImageUrl={story.cover_image}
                                            characterReferences={[
                                                story.character_sheet_url,      // Slots 1-5 (Identity) - Mapped in Edge
                                                story.cover_image,              // Slot 6 (Style)
                                                null,                           // Slot 9 (Prop - Future dev)
                                                story.cover_image               // Slot 10 (Lighting Fallback)
                                            ].filter((img, idx) => img !== null || idx < 1) as string[]} // Keep DNA always, filter others
                                            characterSeed={story.character_seed}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Controls */}
                            {(totalPages > 1 || isCover) && (
                                <Controls
                                    onNext={handleNext}
                                    onPrev={handlePrev}
                                    canNext={currentIndex < totalPages - 1}
                                    canPrev={currentIndex > 0}
                                />
                            )}
                        </motion.div>
                    )
                )
            }
            {/* HIDDEN PDF EXPORT CONTAINER - Positioned off-screen but visible for html2canvas */}
            {isExportingPdf && (
                <div style={{ position: 'fixed', left: '-10000px', top: 0, zIndex: -1000 }}>
                    {/* Cover */}
                    <div id="pdf-cover" style={{ width: '794px', height: '1123px', position: 'relative', overflow: 'hidden', background: '#1c1917' }}>
                        <div className="w-full h-full relative">
                            {story.cover_image && <img src={story.cover_image} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Cover" />}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                            <div className="absolute top-20 w-full text-center px-10">
                                <h1 className="text-6xl font-black text-white drop-shadow-xl mb-6 font-serif">{story.title}</h1>
                                <p className="text-3xl text-white/80 font-serif italic">{t('app.pdf.by_author', { author: story.author })}</p>
                            </div>
                        </div>
                    </div>
                    {/* Pages */}
                    {story.pages.map(p => (
                        <div key={p.page_number} id={`pdf-page-${p.page_number}`} style={{ width: '794px', height: '1123px', position: 'relative', overflow: 'hidden', background: '#f5f5f4' }}>
                            {/* Image Info */}
                            <div className="h-[55%] w-full relative bg-stone-200">
                                {p.image_url && <img src={p.image_url} crossOrigin="anonymous" className="w-full h-full object-cover" alt={`Page ${p.page_number}`} />}
                            </div>
                            {/* Text Info */}
                            <div className="h-[45%] w-full p-12 flex flex-col justify-center bg-white text-stone-800">
                                <p className="text-2xl leading-relaxed font-serif text-justify">{p.text}</p>
                                <span className="mt-8 text-center text-stone-400 font-bold text-sm tracking-widest">{p.page_number}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Achievement Toast */}
            <AchievementToast
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
}

export default App;
