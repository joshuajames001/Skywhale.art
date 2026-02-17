import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generateStoryIdea } from '../../../../lib/storyteller'; // Calculated path
import { StoryBook } from '../../../../types';
import { MagicLoading } from '../effects/MagicLoading';

interface MagicWandModeProps {
    onTransitionToCustom: (data: any) => void; // CHANGED: Handoff data instead of completing
    onCancel: () => void;
    currentLanguage: string;
}

export const MagicWandMode: React.FC<MagicWandModeProps> = ({ onTransitionToCustom, onCancel, currentLanguage }) => {
    const { t } = useTranslation();
    const [creationStatus, setCreationStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const runMagic = async () => {
            setCreationStatus(t('setup.status.calling_muses'));

            try {
                // 1. Generate Idea
                const idea = await generateStoryIdea({ language: currentLanguage } as any);

                setCreationStatus(t('setup.status.dreaming'));

                // 2. DO NOT GENERATE. Handoff to Custom Mode for Review.
                // This restores the "intermediate step" user requested.
                // We pass the idea data, but let the user confirm Length/Style/Audio in CustomMode.

                setTimeout(() => {
                    onTransitionToCustom({
                        title: idea.title,
                        author: "AI Muse",
                        main_character: idea.main_character,
                        visual_dna: idea.visual_dna || '',
                        setting: idea.setting,
                        target_audience: idea.target_audience || '4-7',
                        visual_style: idea.visual_style || 'Watercolor',
                        length: 5, // Default suggestion, but user can change it
                        voice_id: null // Let user pick
                    });
                }, 1000); // Small delay for visual effect

            } catch (err) {
                console.error("Magic Mode Failed:", err);
                setError((err as Error).message);
                setTimeout(onCancel, 4000);
            }
        };

        runMagic();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-white text-center">
                <h3 className="text-xl font-bold bg-red-500/20 p-4 rounded-xl border border-red-500/50">
                    {t('setup.status.failed')}: {error}
                </h3>
                <p className="mt-4 text-slate-400">Returning to selection...</p>
            </div>
        );
    }

    return <MagicLoading status={creationStatus} style="Magical" />;
};
