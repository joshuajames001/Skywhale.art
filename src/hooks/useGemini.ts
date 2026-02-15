import { useState } from 'react';
import { invokeEdgeFunction } from '../lib/edge-functions';

export const useGemini = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSuggestion = async (storySoFar: string, currentText: string, pageIndex: number, totalPages: number) => {
        setLoading(true);
        setError(null);

        try {
            console.log("🤖 Gemini Hook: Calling Edge Function (generate-suggestion)...");
            
            const { data, error } = await invokeEdgeFunction('generate-story-content', {
                action: 'generate-suggestion',
                payload: { storySoFar, currentText, pageIndex, totalPages }
            });

            if (error) throw error;
            if (!data) throw new Error("No data received from AI.");

            console.log("🤖 Gemini Raw Response:", JSON.stringify(data));

            // Handle multiple response formats
            let parsed = data;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch { return parsed.trim(); }
            }
            
            // Format: { choices: [{ message: { content: "..." } }] }
            if (parsed?.choices?.[0]?.message?.content) {
                return parsed.choices[0].message.content.trim();
            }
            // Direct content string
            if (typeof parsed === 'string') return parsed.trim();
            
            throw new Error("Unexpected AI response format.");

        } catch (err: any) {
            console.error("Gemini Hook Error:", err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generates a Visual Prompt from the story text.
     * Used by the "Magic Wand" to tell Flux what to paint.
     */
    const generateImagePrompt = async (storyText: string) => {
        setLoading(true);
        try {
            console.log("🎨 Gemini Hook: Calling Edge Function (generate-image-prompt)...");

            const { data, error } = await invokeEdgeFunction('generate-story-content', {
                action: 'generate-image-prompt',
                payload: { storyText }
            });

            if (error) throw error;
            if (!data) throw new Error("Prompt generation failed.");

            let parsed = data;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch { return parsed.trim(); }
            }
            if (parsed?.choices?.[0]?.message?.content) {
                return parsed.choices[0].message.content.trim();
            }
            if (typeof parsed === 'string') return parsed.trim();
            throw new Error("Unexpected AI response format.");

        } catch (err) {
            console.error("Prompt Gen Error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generates a list of initial story ideas to help a user start their book.
     */
    const generateInitialIdeas = async () => {
        setLoading(true);
        try {
            console.log("💡 Gemini Hook: Calling Edge Function (generate-initial-ideas)...");

            const { data, error } = await invokeEdgeFunction('generate-story-content', {
                action: 'generate-initial-ideas',
                payload: {}
            });

            if (error) throw error;
            if (!data) throw new Error("Idea generation failed.");

            let parsed = data;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch { /* use as-is */ }
            }
            let text = '';
            if (parsed?.choices?.[0]?.message?.content) {
                text = parsed.choices[0].message.content.trim();
            } else if (typeof parsed === 'string') {
                text = parsed.trim();
            }
            return text.split(';').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));

        } catch (err) {
            console.error("Initial Ideas Error:", err);
            return ["Dobrodružství v hlubokém lese", "Cesta na Měsíc v papírové krabici", "Tajemství mluvícího kocoura"];
        } finally {
            setLoading(false);
        }
    };

    /**
     * MAGICKÝ SLOVNÍK (MAGIC DICTIONARY)
     * Translates Czech terms to English creative synonyms for prompt crafting.
     */
    const searchDictionary = async (term: string) => {
        setLoading(true);
        try {
            console.log("📖 Gemini Hook: Calling Edge Function (dictionary-lookup)...");

            const { data, error } = await invokeEdgeFunction('generate-story-content', {
                action: 'dictionary-lookup',
                payload: { term }
            });

            if (error) throw error;
            if (!data) throw new Error("Dictionary lookup failed.");

            let parsed = data;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch { return null; }
            }
            if (parsed?.choices?.[0]?.message?.content) {
                const content = parsed.choices[0].message.content;
                return typeof content === 'string' ? JSON.parse(content) : content;
            }
            return parsed;

        } catch (err) {
            console.error("Dictionary Error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        generateSuggestion,
        generateImagePrompt,
        generateInitialIdeas,
        searchDictionary,
        loading,
        error
    };
};
