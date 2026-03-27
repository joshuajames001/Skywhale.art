import { useState } from 'react';
import { invokeEdgeFunction } from '../../../lib/edge-functions';

export const useAudioGeneration = (bookId: string) => {
    const [generating, setGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateAudio = async (text: string, voiceId?: string): Promise<{ audioUrl: string; energyCost: number } | null> => {
        setGenerating(true);
        setError(null);

        const { data, error: fnError } = await invokeEdgeFunction<{ audioUrl: string; energyCost: number }>('generate-audio', {
            bookId,
            text,
            voiceId,
        });

        setGenerating(false);

        if (fnError || !data?.audioUrl) {
            console.error('Audio generation failed:', fnError);
            setError(typeof fnError === 'string' ? fnError : 'Audio generation failed');
            return null;
        }

        setAudioUrl(data.audioUrl);
        return data;
    };

    return { generateAudio, generating, audioUrl, setAudioUrl, error };
};
