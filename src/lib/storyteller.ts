import { StoryPage } from '../types';
import { invokeEdgeFunction } from './edge-functions';

export interface StoryParams {
    title: string;
    author: string;
    main_character: string;
    setting: string;
    target_audience: string;
    visual_style: string;
    visual_dna?: string; 
    user_identity_image?: string; 
    length?: number;
    language?: string;
}

export const generateStoryStructure = async (params: StoryParams): Promise<{ pages: StoryPage[], coverPrompt: string, identityPrompt: string, visualDna: string }> => {
    // console.log("📖 Storyteller: Calling Edge Function (generate-structure)...");

    try {
        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'generate-structure',
            payload: { ...params, language: params.language || 'cs' }
        });

        if (error) throw error;
        if (!data) throw new Error("No data received from Edge Function.");
        
        // FIX: Parse OpenAI Response Wrapper
        let parsed;
        if (data.choices && data.choices[0]?.message?.content) {
            try {
                parsed = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                console.error("Failed to parse JSON content from AI:", e);
                throw new Error("Invalid JSON in AI response");
            }
        } else {
            // Fallback: assume it might be the data itself (unlikely but safe)
            parsed = data;
        } 
        const storyContent = parsed.story_content || parsed;
        const rawPages = storyContent.pages || parsed.pages;

        if (!rawPages || !Array.isArray(rawPages)) {
            console.error("Invalid AI Response:", parsed);
            throw new Error("Invalid format: 'pages' array missing in AI response.");
        }

        const metadata = parsed.metadata || {};
        // console.log("🧠 RCI Criticism Log:", metadata.criticism || "No internal critique provided.");

        const titleCz = storyContent.title_cz || parsed.title_cz || storyContent.title || parsed.title;
        // console.log(`🇨🇿 Czech Title: "${titleCz}"`);

        const pages: StoryPage[] = rawPages.map((p: any) => ({
            page_number: p.page_number,
            text: p.text_cz || p.text_en || p.text, 
            art_prompt: p.art_prompt_en || p.art_prompt || p.image_prompt,
            image_url: null,
            is_generated: false
        }));

        return {
            pages,
            coverPrompt: `[STRICT VISUAL DNA: ${metadata.visual_dna || params.visual_dna}] ` + (storyContent.cover?.cover_prompt || storyContent.cover?.image_prompt || `Create a single-frame, high-quality storybook cover. MANDATORY ART STYLE: ${params.visual_style}. VISUAL REFERENCE: Use the character sheet. Environment: ${params.setting} rendered in ${params.visual_style}.`),
            identityPrompt: params.user_identity_image || storyContent.cover?.identity_prompt || `Create a character reference sheet for ${params.visual_dna || params.main_character}. Plain white background.`,
            visualDna: metadata.visual_dna || params.visual_dna || params.main_character
        };

    } catch (error) {
        console.error("Storyteller Error:", error);
        console.warn("⚠️ Story generation failed. Engaging Emergency Protocol.");
        
        // Return STATIC Fallback to prevent crash
        return {
            coverPrompt: "Fallback Cover Prompt",
            identityPrompt: "Fallback Identity Prompt",
            visualDna: params.main_character,
            pages: [
                {
                    page_number: 1,
                    text: "Omlouváme se, Múza je unavená. Zkuste to prosím za chvíli znovu.",
                    art_prompt: "A sleeping muse robot.",
                    image_url: null,
                    is_generated: false
                }
            ]
        };
    }
};

export const generateStoryIdea = async (params?: { language?: string }): Promise<StoryParams> => {
    const language = (params?.language || 'cs').substring(0, 2).toLowerCase();
    // console.log(`💡 Muse Agent: Calling Edge Function (generate-idea) in ${language}...`);

    let attempts = 0;
    while (attempts < 2) { 
        try {
            const { data: ideaWrapper, error } = await invokeEdgeFunction('generate-story-content', {
                action: 'generate-idea',
                payload: { language }
            });

            if (error || !ideaWrapper) throw error || new Error("No data");

            // FIX: Handle both OpenAI-wrapped and raw JSON responses
            let idea;
            try {
                // console.log("📦 Raw Edge Function Response:", ideaWrapper);

                // DEFENSIVE: Parse if response is a string
                let wrapper = ideaWrapper as any;
                if (typeof wrapper === 'string') {
                    wrapper = JSON.parse(wrapper);
                }
                
                if (wrapper && wrapper.choices && wrapper.choices[0]) {
                    // OpenAI-wrapped format
                    const content = wrapper.choices[0].message.content;
                    idea = typeof content === 'string' ? JSON.parse(content) : content;
                } else if (wrapper && (wrapper.concept || wrapper.technical_dna)) {
                    // Raw Muse concept format (what we are seeing in the logs)
                    idea = wrapper;
                } else if (wrapper && typeof wrapper === 'object') {
                    // Last resort fallback
                    idea = wrapper;
                } else {
                     console.error("❌ Invalid Response Structure:", wrapper);
                     throw new Error("Invalid response structure from Edge Function");
                }

                // --- SCHEMA MAPPING (Safely extract nested data if present) ---
                let concept = idea.concept || {};
                let technical_dna = idea.technical_dna || {};

                // Map root fields to concept if concept is missing or fields are at root
                // RESILIENCE FIX: Check for both _cz and _cs suffixes
                const mapField = (fieldBase: string) => {
                    const obj = idea as any;
                    const conceptObj = idea.concept as any || {};
                    
                    const enKey = `${fieldBase}_en`;
                    const czKey = `${fieldBase}_cz`;
                    const csKey = `${fieldBase}_cs`;

                    // Check Root
                    if (!concept[enKey] && obj[enKey]) concept[enKey] = obj[enKey];
                    if (!concept[czKey] && obj[czKey]) concept[czKey] = obj[czKey];
                    if (!concept[czKey] && obj[csKey]) concept[czKey] = obj[csKey];

                    // Check Concept Object (for _cs fallback)
                    if (!concept[czKey] && conceptObj[csKey]) concept[czKey] = conceptObj[csKey];
                    
                    // Legacy 'main_character' -> 'character_desc' mapping
                    if (fieldBase === 'character_desc') {
                        if (!concept.character_desc_cz && obj.main_character) concept.character_desc_cz = obj.main_character;
                    }
                    if (fieldBase === 'short_blurb') {
                        if (!concept.short_blurb_cz && obj.setting) concept.short_blurb_cz = obj.setting;
                    }
                };

                mapField('title');
                mapField('character_desc');
                mapField('short_blurb');

                // Final safety: ensure title_cz always exists if title exists
                if (!concept.title_cz && concept.title_cs) concept.title_cz = concept.title_cs;
                if (!concept.title_cz && idea.title) concept.title_cz = idea.title;
                if (!technical_dna.recommended_style && idea.visual_style) technical_dna.recommended_style = idea.visual_style;

                // --- DNA STRING CONSTRUCTION ---
                const anchors = Array.isArray(technical_dna.visual_anchors_en) 
                    ? technical_dna.visual_anchors_en.join(", ") 
                    : (idea.visual_dna || "");
                
                const palette = technical_dna.color_palette || "";
                const species = (technical_dna.species_en || "character").toLowerCase();
                const isAnimal = ["unicorn", "dragon", "fox", "cat", "dog", "wolf", "bear", "rabbit", "horse", "lion", "tiger"].some(a => species.includes(a));
                const isRobot = species.includes("robot") || species.includes("android");

                let formFactor = "Humanoid Body"; 
                if (isAnimal) formFactor = "STRICTLY ANIMAL BODY, NON-HUMANOID, QUADRUPED, NO HUMAN FACE";
                if (isRobot) formFactor = "STRICTLY MECHANICAL ROBOT, METAL BODY, NON-HUMANOID, NO SKIN, NO CLOTHES";

                const technicalDnaString = `VISUAL SPECIES: ${species.toUpperCase()} [${formFactor}]. Gender: ${technical_dna.gender_en || 'Neutral'}. Scale: ${technical_dna.size_age_en || 'Small'}. IDENTITY LOCK: ${anchors}. Colors: ${palette}.`;

                // --- FINAL RETURN OBJECT (Flat format for StorySetup.tsx) ---
                const isEn = language === 'en';
                return {
                    title: (isEn ? concept.title_en : concept.title_cz) || concept.title_en || concept.title_cz || concept.title || "Nový Příběh",
                    author: concept.author_name || "Múza",
                    main_character: (isEn ? concept.character_desc_en : concept.character_desc_cz) || concept.character_desc_en || concept.character_desc_cz || concept.short_blurb_cz || "Hrdina", 
                    visual_dna: technicalDnaString,
                    setting: (isEn ? concept.short_blurb_en : concept.short_blurb_cz) || concept.short_blurb_en || concept.short_blurb_cz || idea.setting || "V kouzelném světě", 
                    target_audience: idea.target_audience || "4-7", 
                    visual_style: technical_dna.recommended_style || 'Watercolor',
                    language: language
                };
            } catch (e) {
                console.warn("Failed to parse Idea JSON", e);
                attempts++;
                continue;
            }

        } catch (e) {
            console.error("Muse Error:", e);
            attempts++;
        }
    }

    // Fallback
    return {
        title: "Tajemství",
        author: "Múza",
        main_character: "Robot",
        setting: "Les",
        target_audience: "Children",
        visual_style: "Watercolor"
    };
};

export const extractVisualIdentity = async (sheetUrl: string, characterName: string, fallbackDna?: string): Promise<string> => {
    // console.log("👁️ Visual DNA: Calling Edge Function (extract-visual-dna)...");

    try {
        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'extract-visual-dna',
            payload: { imageUrl: sheetUrl }
        });

        if (error) throw error;
        
        if (data.choices && data.choices[0]?.message?.content) {
             const content = data.choices[0].message.content;
             try {
                 JSON.parse(content); 
                 return content;
             } catch {
                 return JSON.stringify({ species: characterName });
             }
        }
        
        return JSON.stringify(data);

    } catch (error) {
        console.error("Visual Extraction Failed:", error);
        if (fallbackDna) return fallbackDna;
        return JSON.stringify({ species: characterName });
    }
};