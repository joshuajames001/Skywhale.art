import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Achievement, StoryBook } from '../../types';
import { useStory } from '../useStory';

export const useAppNavigation = (
    triggerMagicTransition: (view: string) => void,
    isTransitioning: boolean,
    setCurrentAchievement: (ach: Achievement | null) => void
) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { saveStory } = useStory();

    // PUBLISH DIALOG STATE
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [publishBookId, setPublishBookId] = useState<string | null>(null);

    const handleStoryCreated = async (newStory: StoryBook) => {
        // 1. Save to Database first and GET THE REAL ID
        const result = await saveStory(newStory);

        if (result) {
            const { bookId: savedId, achievements } = result;
            
            // 3. Show achievement toasts
            if (achievements && achievements.length > 0) {
                setCurrentAchievement(achievements[0]);
                achievements.slice(1).forEach((ach, index) => {
                    setTimeout(() => setCurrentAchievement(ach), (index + 1) * 6000);
                });
            }

            // 4. Navigate to the new book route
            navigate(`/book/${savedId}`);

            // 5. Show publish dialog after a short delay
            setTimeout(() => {
                setPublishBookId(savedId);
                setShowPublishDialog(true);
            }, 2000);
        } else {
            console.error("❌ Failed to save story structure. Cannot proceed.");
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
            }
        }

        navigate(`/book/${book.book_id}`);
    };

    const handleHubNavigate = (view: 'intro' | 'landing' | 'library' | 'setup' | 'card_studio' | 'arcade' | 'discovery' | 'create_custom' | 'energy_store' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'feedback_board' | 'profile' | 'pricing') => {
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
        if (view === 'cookies') {
            navigate('/cookies');
            return;
        }
        if (view === 'refund') {
            navigate('/refund');
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

    const handleBookFromLanding = async (bookId?: string) => {
        if (!bookId) {
            navigate('/library');
            return;
        }
        navigate(`/book/${bookId}`);
    };

    return {
        handleStoryCreated,
        handleNewStoryClick,
        handleOpenBook,
        handleHubNavigate,
        handleBookFromLanding,
        showPublishDialog,
        setShowPublishDialog,
        publishBookId,
        setPublishBookId
    };
};
