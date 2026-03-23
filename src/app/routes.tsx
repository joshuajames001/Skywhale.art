import { lazy, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LegalAgreements } from '../features/legal/components/LegalAgreements';
import { PricingPage } from '../features/store/components/PricingPage';
import { FeedbackBoard } from '../features/feedback/components/FeedbackBoard';
import { EnergyStore } from '../features/store/components/EnergyStore';
import { CardViewer } from '../features/card-studio/CardViewer';
import { CardStudioProvider } from '../features/card-studio/CardStudioContext';
import { GameHubProvider } from '../features/game-hub/GameHubContext';
import { LibraryProvider } from '../features/library/LibraryContext';
import type { CardStudioAdapter } from '../features/card-studio/CardStudioContext';
import type { GameHubAdapter } from '../features/game-hub/GameHubContext';
import type { LibraryAdapter } from '../features/library/LibraryContext';
import type { User } from '@supabase/supabase-js';
import type { StoryBook } from '../types';

// Lazy-loaded components (named exports → .then remapping)
const LazyGameHub = lazy(() => import('../features/game-hub/GameHub').then(m => ({ default: m.GameHub })));
const LazyDiscoveryHub = lazy(() => import('../features/discovery/components/DiscoveryHub').then(m => ({ default: m.DiscoveryHub })));
const LazyCreateStoryWrapper = lazy(() => import('../features/story-builder/CreateStoryWrapper').then(m => ({ default: m.CreateStoryWrapper })));
const LazyCustomBookEditor = lazy(() => import('../features/custom-book/components/CustomBookEditor'));
const LazyCardStudioWrapper = lazy(() => import('../features/card-studio/CardStudioWrapper').then(m => ({ default: m.CardStudioWrapper })));
const LazyUserProfile = lazy(() => import('../features/profile/UserProfile').then(m => ({ default: m.UserProfile })));
const LazyLibrary = lazy(() => import('../features/library/Library').then(m => ({ default: m.Library })));
const LazyBookRouteWrapper = lazy(() => import('../features/reader/BookRouteWrapper').then(m => ({ default: m.BookRouteWrapper })));
const LazyCinematicLanding = lazy(() => import('../features/landing/components/CinematicLanding').then(m => ({ default: m.CinematicLanding })));
const LazyLandingPage = lazy(() => import('../features/landing/components/LandingPage').then(m => ({ default: m.LandingPage })));

export interface RouteConfig {
    path: string;
    element: ReactNode;
}

type HubView = 'intro' | 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'feedback_board' | 'profile' | 'pricing';

interface RouteContext {
    navigate: (path: string) => void;
    user: User | null;
    handleHubNavigate: (target: HubView) => void;
    handleStoryCreated: (story: StoryBook) => Promise<void>;
    handleNewStoryClick: () => void;
    handleOpenBook: (book: StoryBook) => void;
    handleBookFromLanding: (bookId?: string) => void;
    setShowAuth: (show: boolean) => void;
    cardStudioAdapter: CardStudioAdapter;
    gameHubAdapter: GameHubAdapter;
    libraryAdapter: LibraryAdapter;
}

export const createRoutes = (ctx: RouteContext): RouteConfig[] => [
    { path: '/terms', element: (
        <div className="fixed inset-0 z-[200]">
            <LegalAgreements onBack={() => ctx.navigate('/')} defaultTab="terms" />
        </div>
    )},
    { path: '/privacy', element: (
        <div className="fixed inset-0 z-[200]">
            <LegalAgreements onBack={() => ctx.navigate('/')} defaultTab="privacy" />
        </div>
    )},
    { path: '/pricing', element: (
        <div className="w-full h-full flex items-center justify-center p-4">
            <PricingPage onBack={() => ctx.navigate('/')} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
        </div>
    )},
    { path: '/feedback', element: (
        <div className="w-full h-full relative z-50">
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <LazyLandingPage onEnter={ctx.handleBookFromLanding} onNavigate={ctx.handleHubNavigate} user={ctx.user} onLogin={() => ctx.setShowAuth(true)} hideUI={true} />
            </div>
            <FeedbackBoard onClose={() => ctx.navigate('/')} />
        </div>
    )},
    { path: '/library', element: (
        <div className="w-full h-[100svh] overflow-y-auto relative">
            <LibraryProvider adapter={ctx.libraryAdapter}>
                <LazyLibrary user={ctx.user} onOpenBook={ctx.handleOpenBook} onOpenMagic={ctx.handleNewStoryClick}
                    onCreateCustom={() => ctx.handleHubNavigate('create_custom')} onCreateCard={() => ctx.handleHubNavigate('card_studio')} />
            </LibraryProvider>
        </div>
    )},
    { path: '/arcade', element: (
        <GameHubProvider adapter={ctx.gameHubAdapter}>
            <LazyGameHub imageUrl={null} onClose={() => ctx.handleHubNavigate('library')} />
        </GameHubProvider>
    )},
    { path: '/encyclopedia', element: (
        <div className="w-full h-screen overflow-hidden relative">
            <LazyDiscoveryHub onClose={() => ctx.navigate('/')} />
        </div>
    )},
    { path: '/create', element: (
        <LazyCreateStoryWrapper onComplete={ctx.handleStoryCreated} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
    )},
    { path: '/custom', element: (
        <div className="w-full h-[100svh] overflow-y-auto relative">
            <LazyCustomBookEditor onBack={() => ctx.handleHubNavigate('library')} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
        </div>
    )},
    { path: '/store', element: <EnergyStore onClose={() => ctx.navigate('/')} /> },
    { path: '/profile', element: <LazyUserProfile user={ctx.user} onBack={() => ctx.navigate('/')} /> },
    { path: '/card-viewer', element: <CardViewer cardId={null} onClose={() => ctx.handleHubNavigate('library')} /> },
    { path: '/studio', element: (
        <CardStudioProvider adapter={ctx.cardStudioAdapter}>
            <LazyCardStudioWrapper />
        </CardStudioProvider>
    )},
    { path: '/book/:id', element: <LazyBookRouteWrapper /> },
    { path: '/magic', element: <Navigate to="/" replace /> },
    { path: '/', element: (
        <LazyCinematicLanding onEnter={() => ctx.handleHubNavigate('landing')} onNavigate={ctx.handleHubNavigate} />
    )},
    { path: '/home', element: (
        <LazyLandingPage onEnter={ctx.handleBookFromLanding} onNavigate={ctx.handleHubNavigate} user={ctx.user} onLogin={() => ctx.setShowAuth(true)} />
    )},
    { path: '/*', element: <Navigate to="/" replace /> },
];
