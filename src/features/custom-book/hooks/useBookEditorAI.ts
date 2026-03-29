import { useState } from 'react';
import { useGemini } from '../../../hooks/useGemini';
import { generateImage } from '../../../lib/ai';
import { BookPage } from '../types';

export interface GenerateSceneParams {
    page: BookPage;
    pageIndex: number;
    isExpertMode: boolean;
    selectedStyle: string;
    bookSeed: number;
    magicMirrorUrl: string | null;
    magicMirrorDna: string | null;
    continuityImageUrl: string | null;
}

export const useBookEditorAI = (_bookId: string) => {
    const {
        generateSuggestion: geminiSuggest,
        generateImagePrompt: geminiPrompt,
        generateInitialIdeas,
        searchDictionary,
        loading,
        error,
    } = useGemini();
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const generateSuggestion = (pageContent: string, context: string, pageIndex: number, totalPages: number) =>
        geminiSuggest(context, pageContent, pageIndex, totalPages);

    const generateImagePrompt = (pageContent: string) => geminiPrompt(pageContent);

    const generateIdeas = () => generateInitialIdeas();

    const lookupWord = (word: string) => searchDictionary(word);

    const generateScene = async (params: GenerateSceneParams) => {
        const { page, pageIndex, isExpertMode, selectedStyle, bookSeed,
            magicMirrorUrl, magicMirrorDna, continuityImageUrl } = params;

        if (!page.text.trim() && !page.prompt?.trim()) return null;

        setIsGeneratingImage(true);
        try {
            let prompt = page.prompt;

            if (!prompt || !isExpertMode) {
                const generated = await geminiPrompt(page.text);
                if (generated) prompt = generated;
            }

            if (!prompt) throw new Error('Failed to create prompt');

            // In expert mode, first call only generates the prompt for user editing
            if (isExpertMode && !page.prompt) {
                return { url: '', prompt };
            }

            let finalPrompt = prompt;
            if (page.isCover) {
                finalPrompt = `WIDE CINEMATIC BOOK COVER, centered composition, epic lighting, masterwork: ${prompt} `;
            }

            const activeReference = magicMirrorUrl || continuityImageUrl;
            const effectiveDescription = magicMirrorDna
                || (activeReference ? 'The main character of this story' : undefined);

            console.log('🔗 Reference Chain:', {
                magicMirror: !!magicMirrorUrl,
                continuity: !!continuityImageUrl,
                activeRef: activeReference || 'NONE',
                tier: magicMirrorUrl ? 'premium (40⚡)' : 'basic (25⚡)',
            });

            const result = await generateImage({
                prompt: finalPrompt,
                style: selectedStyle,
                tier: magicMirrorUrl ? 'premium' : 'basic',
                characterReference: activeReference || undefined,
                characterDescription: effectiveDescription,
                baseSeed: bookSeed,
                pageIndex,
            });

            return result.url ? { url: result.url, prompt } : null;
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return {
        generateSuggestion,
        generateImagePrompt,
        generateIdeas,
        lookupWord,
        generateScene,
        isAiLoading: loading,
        isGeneratingImage,
        aiError: error,
    };
};
