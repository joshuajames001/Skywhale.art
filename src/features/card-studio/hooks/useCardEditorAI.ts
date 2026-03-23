import { useState } from 'react';
import { useCardStudio } from '../CardStudioContext';

export const useCardEditorAI = (_cardId: string) => {
    const { onGenerateImage, onModerateContent } = useCardStudio();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const generate = async (prompt: string, mode: 'sticker' | 'background', referenceUrl?: string | null) => {
        setIsGenerating(true);
        setGenerationError(null);
        try {
            await onModerateContent(prompt);
            const { imageUrl } = await onGenerateImage(prompt, mode, referenceUrl);
            return imageUrl;
        } catch (e: any) {
            const msg = e.message || JSON.stringify(e);
            setGenerationError(msg);
            throw e;
        } finally {
            setIsGenerating(false);
        }
    };

    const generateBackground = (style: string, prompt: string) =>
        generate(`${style} ${prompt}`.trim(), 'background');

    const generateSticker = (prompt: string) =>
        generate(prompt, 'sticker');

    const generateSmartQuote = async (occasion: string, recipient: string) => {
        // Smart quote generation via the same AI pipeline
        const prompt = `greeting card quote for ${occasion}, recipient: ${recipient}`;
        return generate(prompt, 'sticker');
    };

    return {
        generateBackground,
        generateSticker,
        generateSmartQuote,
        generate,
        isGenerating,
        generationError,
    };
};
