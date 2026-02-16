import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookReader } from './BookReader';
import { useBookReaderAdapter } from '../../providers/useBookReaderAdapter';
import { StoryBook } from '../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Note: We might need to pass `onUpdatePage` and `onUpdateCover` handlers.
// Since we are extracting these from App.tsx/useStory, we should ideally have a `useStoryAdapter` here too
// or move that logic to `BookRouteWrapper`.
// For now, I will use `useBookReaderAdapter` for reading, but updates are tricky if we don't have the update logic here.
// I will reuse `useStory` hook logic locally or import it if it's detachable.
// Actually `useStory` is a hook. We can use it here!

import { useStory } from '../../hooks/useStory';

export const BookRouteWrapper: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchStoryById, loading, error } = useBookReaderAdapter();
    const { saveStory, uploadImage, saving } = useStory(); // Use original hook for actions, expose uploadImage

    // Local state for the ACTIVE story being viewed/edited
    const [story, setStory] = useState<StoryBook | null>(null);

    useEffect(() => {
        if (id) {
            fetchStoryById(id).then(fetchedStory => {
                if (fetchedStory) setStory(fetchedStory);
            });
        }
    }, [id, fetchStoryById]);

    const handleClose = () => {
        navigate('/');
    };

    // Re-implement update handlers locally for the specific story state
    const handleUpdatePage = (pageNumber: number, updates: any) => {
        if (!story) return;
        setStory(prev => {
            if (!prev) return null;
            return {
                ...prev,
                pages: prev.pages.map(p =>
                    p.page_number === pageNumber ? { ...p, ...updates } : p
                )
            };
        });
    };

    const handleUpdateCover = (coverUrl: string | null, seed?: number, identityUrl?: string, identityLock?: string) => {
        if (!story) return;
        setStory(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cover_image: coverUrl || prev.cover_image,
                character_seed: seed ?? prev.character_seed,
                character_sheet_url: identityUrl || prev.character_sheet_url,
                visual_dna: identityLock || prev.visual_dna,
                main_character: identityLock || prev.main_character
            };
        });
    };

    const handleSave = async () => {
        if (!story) return;
        await saveStory(story);
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin text-purple-400" />
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center text-white">
                <p className="text-xl mb-4">Příběh nebyl nalezen.</p>
                <button onClick={() => navigate('/')} className="bg-white/20 px-6 py-2 rounded-full hover:bg-white/30 transition-all">
                    Zpět domů
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex items-center justify-center relative bg-gradient-to-br from-[#1a1c2e] to-[#2d1b4e]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393798-3828fb4090bb?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 pointer-events-none" />

            <BookReader
                story={story}
                onClose={handleClose}
                onUpdatePage={handleUpdatePage}
                onUpdateCover={handleUpdateCover}
                onSave={handleSave}
                isSaving={saving}
                onUploadImage={uploadImage}
            />
        </div>
    );
};
