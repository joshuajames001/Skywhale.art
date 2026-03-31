import { lazy, ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { LegalAgreements } from '../features/legal/components/LegalAgreements';
import { PricingPage } from '../features/store/components/PricingPage';
import { EnergyStore } from '../features/store/components/EnergyStore';
import { CardViewer } from '../features/card-studio/CardViewer';
import { CardStudioProvider } from '../features/card-studio/CardStudioContext';
import { GameHubProvider } from '../features/game-hub/GameHubContext';
import { LibraryProvider } from '../features/library/LibraryContext';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
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
const LazyFeedbackForm = lazy(() => import('../features/feedback/components/FeedbackForm').then(m => ({ default: m.FeedbackForm })));

export interface RouteConfig {
    path: string;
    element: ReactNode;
}

type HubView = 'intro' | 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'feedback_board' | 'profile' | 'pricing';

interface RouteContext {
    navigate: (path: string) => void;
    user: User | null;
    loading: boolean;
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

const CardViewerRoute = ({ onClose }: { onClose: () => void }) => {
    const { id } = useParams();
    return <CardViewer cardId={id || null} onClose={onClose} />;
};

const Protected = ({ ctx, children }: { ctx: RouteContext; children: ReactNode }) => (
    <ProtectedRoute user={ctx.user} loading={ctx.loading}>{children}</ProtectedRoute>
);

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
    { path: '/cookies', element: (
        <div className="fixed inset-0 z-[200]">
            <LegalAgreements onBack={() => ctx.navigate('/')} defaultTab="cookies" />
        </div>
    )},
    { path: '/refund', element: (
        <div className="fixed inset-0 z-[200]">
            <LegalAgreements onBack={() => ctx.navigate('/')} defaultTab="refund" />
        </div>
    )},
    { path: '/pricing', element: (
        <div className="w-full h-full flex items-center justify-center p-4">
            <PricingPage onBack={() => ctx.navigate('/')} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
        </div>
    )},
    { path: '/feedback', element: (
        <Protected ctx={ctx}>
        <div className="w-full h-full relative z-50">
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <LazyLandingPage onEnter={ctx.handleBookFromLanding} onNavigate={ctx.handleHubNavigate} user={ctx.user} onLogin={() => ctx.setShowAuth(true)} hideUI={true} />
            </div>
            <LazyFeedbackForm onClose={() => ctx.navigate('/')} />
        </div>
        </Protected>
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
        <Protected ctx={ctx}>
        <GameHubProvider adapter={ctx.gameHubAdapter}>
            <LazyGameHub imageUrl={null} onClose={() => ctx.handleHubNavigate('library')} />
        </GameHubProvider>
        </Protected>
    )},
    { path: '/encyclopedia', element: (
        <Protected ctx={ctx}>
        <div className="w-full h-screen overflow-hidden relative">
            <LazyDiscoveryHub onClose={() => ctx.navigate('/')} />
        </div>
        </Protected>
    )},
    { path: '/create', element: (
        <Protected ctx={ctx}>
        <LazyCreateStoryWrapper onComplete={ctx.handleStoryCreated} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
        </Protected>
    )},
    { path: '/custom', element: (
        <Protected ctx={ctx}>
        <div className="w-full h-[100svh] overflow-y-auto relative">
            <LazyCustomBookEditor onBack={() => ctx.handleHubNavigate('library')} onOpenStore={() => ctx.handleHubNavigate('energy_store')} />
        </div>
        </Protected>
    )},
    { path: '/store', element: <Protected ctx={ctx}><EnergyStore onClose={() => ctx.navigate('/')} /></Protected> },
    { path: '/profile', element: <Protected ctx={ctx}><LazyUserProfile user={ctx.user} onBack={() => ctx.navigate('/')} /></Protected> },
    { path: '/card/:id', element: <CardViewerRoute onClose={() => ctx.navigate('/')} /> },
    { path: '/studio', element: (
        <Protected ctx={ctx}>
        <CardStudioProvider adapter={ctx.cardStudioAdapter}>
            <LazyCardStudioWrapper />
        </CardStudioProvider>
        </Protected>
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
