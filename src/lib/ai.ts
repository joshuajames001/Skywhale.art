import { supabase } from './supabase';
import { invokeEdgeFunction } from './edge-functions';

export interface GenerateImageParams {
    prompt: string;
    style?: string;
    characterDescription?: string;
    setting?: string;
    isCover?: boolean;
    // Flux 2.0 Identity Slot (Reference Image)
    identityImageId?: string | null; 
    // Flux 2.0 Dual Reference Protocol (Explicit)
    characterReference?: string | null;
    characterReferences?: string[]; // MULTI-REFERENCE
    styleReference?: string | null;
    styleReferences?: string[]; // MULTI-REFERENCE
    artPrompt?: string;
    tier?: 'basic' | 'premium' | 'pro';
    seed?: number | null; // Fallback for specific override
    baseSeed?: number;    // Flux 2.0: Kinetic Seeding Base
    pageIndex?: number;   // Flux 2.0: Kinetic Seeding Vector
    steps?: number;       // Flux 2.0: Inference Steps (Target: 28 for Dev)
    aspectRatio?: string;
}

export interface ImageGenerationResult {
    url: string | null;
    seed?: number; 
    error?: string;
}

export const STYLE_PROMPTS: Record<string, string> = {
    "watercolor": "soft watercolor aesthetic, bleeding pigment edges, wet-on-wet technique, visible paper grain, ethereal translucent layers",
    "pixar_3d": "modern 3D animation style, subsurface scattering on skin, soft rim lighting, expressive big-eyed features, cinematic depth of field",
    "futuristic": "high-tech industrial design, glowing neon accents, clean streamlined surfaces, metallic and carbon fiber textures, ultra-modern sleekness",
    "sketch": "traditional graphite pencil sketch, visible cross-hatching, charcoal smudges, raw hand-drawn lines on textured paper",
    "ghibli_anime": "classic hand-painted anime aesthetic, lush gouache landscapes, soft natural sunlight, nostalgic hand-drawn character outlines",
    "cyberpunk": "neon-noir aesthetic, high-contrast cyan and magenta lighting, rain-slicked surfaces, volumetric fog, gritty urban futuristic vibe",
    "felted_wool": "stop-motion needle felted wool texture, fuzzy organic fibers, soft tactile surfaces, handmade craft aesthetic",
    "paper_cutout": "layered papercraft art, 3D depth between paper sheets, subtle drop shadows, vibrant cardstock textures, diorama style",
    "claymation": "plasticine claymation style, visible fingerprint textures, slightly irregular organic modeling, stop-motion animation aesthetic",
    "pop_art": "1960s pop art aesthetic, Ben-Day dots, halftone patterns, bold primary colors, thick black outlines, screen-printed look",
    "dark_oil": "dramatic oil on canvas, heavy impasto brushstrokes, chiaroscuro lighting, deep moody shadows, classical fine art texture",
    "vintage_parchment": "ancient manuscript style, sepia ink drawings on yellowed weathered parchment, burnt edges, historical cartography aesthetic",
    "pixel_art": "nostalgic 16-bit pixel art, crisp square pixels, limited color palette, retro video game aesthetic, stylized dithered shading",
    "frozen_crystal": "crystalline ice textures, refracted sub-zero lighting, glowing frost patterns, iridescent winter sparkle, translucent blue tones",
    "happy_cloud": "ultra-soft kawaii pastel aesthetic, puffy rounded shapes, dreamy gradients, joyful and innocent atmosphere, minimal soft outlines",
    "Watercolor": "soft watercolor aesthetic, bleeding pigment edges, wet-on-wet technique, visible paper grain, ethereal translucent layers", // Compatibility
    "Pixar 3D": "modern 3D animation style, subsurface scattering on skin, soft rim lighting, expressive big-eyed features, cinematic depth of field" // Compatibility
};

const DEFAULT_STYLE = STYLE_PROMPTS["pixar_3d"];

const normalizeStyleKey = (style: string): string =>
    style.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

const sanitizePrompt = (p: string) => p.replace(/(blood|kill|death|weapon|gun)/gi, "mystery");
const reframePrompt = (p: string) => (p.toLowerCase().includes("shadow") ? `${p}, illuminated by gentle fireflies` : p);

/**
 * HLAVNÍ FUNKCE: generateImage
 */
export const generateImage = async (params: GenerateImageParams): Promise<ImageGenerationResult> => {
    const { 
        prompt, 
        style, 
        characterDescription, 
        setting,
        isCover, 
        identityImageId,
        characterReference,
        characterReferences, 
        styleReference,
        styleReferences, 
        seed,
        baseSeed,
        pageIndex,
        tier
    } = params;

    // 1. Sestavení finálních instrukcí - STRICT CLEANUP
    console.log('🎯 [generateImage] style param received:', style);
    const normalizedStyle = style ? normalizeStyleKey(style) : undefined;
    let styleInstruction = (normalizedStyle && STYLE_PROMPTS[normalizedStyle])
        ? STYLE_PROMPTS[normalizedStyle]
        : (style && STYLE_PROMPTS[style])
            ? STYLE_PROMPTS[style]
            : DEFAULT_STYLE;
    
    // LUNAR CYBERPUNK OVERRIDE (Protocol 2026.Lunar)
    const isMoonEnvironment = (setting?.toLowerCase().includes("moon") || setting?.toLowerCase().includes("měsíc") || 
                               prompt?.toLowerCase().includes("moon") || prompt?.toLowerCase().includes("měsíc"));
    
    if (isMoonEnvironment && style?.toLowerCase() === "cyberpunk") {
        styleInstruction = "neon-noir aesthetic, high-contrast cyan and magenta lighting, lunar dust reflections, vacuum-clear depth of field, gritty urban lunar colony vibe";
    }

    const processedPrompt = sanitizePrompt(prompt) + ", pure visual illustration, absolutely no text, no words, no typography, no speech bubbles, no labels, no watermark, clean art";
    const isJsonPrompt = processedPrompt.trim().startsWith('{');
    let jsonPayload: any = null;
    if (isJsonPrompt) {
        try {
            jsonPayload = JSON.parse(processedPrompt);
        } catch (e) {
            console.warn("Failed to parse JSON prompt, falling back to string mode");
        }
    }

    const parseIdentity = (desc: string) => {
        if (!desc) return "The main character";
        if (!desc.trim().startsWith('{')) return desc;
        try {
            const dna = JSON.parse(desc);
            const traits = [];
            const species = (dna.species || "").toUpperCase();
            
            // AUDIT FIX: Non-humanoids don't use HUMAN age categories (Adult/Child)
            const isNonHumanoid = species.includes("DRONE") || species.includes("ROBOT") || species.includes("UNIT") || 
                                  species.includes("MACHINE") || species.includes("ANIMAL");
            
            // Order: Age (if human) + Scale + Species
            if (dna.age_group && !isNonHumanoid) traits.push(dna.age_group.toUpperCase());
            if (dna.scale && dna.scale !== 'human-sized') traits.push(dna.scale.toUpperCase());
            if (species) traits.push(species);
            
            if (dna.hair_fur) traits.push(dna.hair_fur);
            else if (dna.hair) traits.push(`${dna.hair} hair`);
            
            if (dna.outfit_top) traits.push(dna.outfit_top);
            if (dna.distinctive_marks) {
                const marks = Array.isArray(dna.distinctive_marks) ? dna.distinctive_marks.join(", ") : dna.distinctive_marks;
                traits.push(marks);
            }
            return traits.join(", ");
        } catch (e) {
            return desc; 
        }
    };

    const subjectAnchor = parseIdentity(characterDescription || "");
    const safePrompt = isJsonPrompt ? "" : reframePrompt(processedPrompt);
    
    const effectiveIdentity = characterReference || identityImageId;
    const hasMultipleRefs = characterReferences && characterReferences.length > 0;
    
    let finalPrompt = "";
    if (isJsonPrompt && jsonPayload) {
        if (jsonPayload.generation_command) {
            jsonPayload.generation_command.subject_anchor = subjectAnchor;
            jsonPayload.generation_command.style_override = styleInstruction;
        } else if (jsonPayload.cover_direction) {
            jsonPayload.cover_direction.subject_anchor = subjectAnchor;
            jsonPayload.cover_direction.style_override = styleInstruction;
            
            const originalThematic = jsonPayload.cover_direction.thematic_essence || "";
            // FORCE WIDE CINEMATIC SHOT
            jsonPayload.cover_direction.thematic_essence = `wide cinematic shot, full body visible, distant camera, ${originalThematic}`.trim();
        }
        finalPrompt = JSON.stringify(jsonPayload);
    } else {
        // DEFENSIVE: Ensure we have a scene description
        const scene = safePrompt || "A detailed cinematic shot of the character in action";
        // REMOVE "Reference Sheet" contamination if present in description
        const cleanAnchor = subjectAnchor.replace(/Create a technical reference sheet/gi, "Character").replace(/Reference Sheet/gi, "Character");
        
        finalPrompt = `${styleInstruction}. ${scene}. The character is: ${cleanAnchor}`.trim();
    }

    let kineticSeed = seed;
    if (baseSeed && pageIndex !== undefined) {
        kineticSeed = Number(baseSeed) + (Number(pageIndex) * 15485863);
    }

    try {

        const body: Record<string, any> = {
            seed: kineticSeed || undefined,
            model: tier === 'basic' ? 'dev' : 'pro',
            // OPTIMIZATION: Flux 2 Pro Sweet Spot is 28 steps
            num_inference_steps: params.steps || (tier === 'pro' ? 28 : undefined),
            // OPTIMIZATION: Maximize quality for Pro
            image_quality: tier === 'pro' ? 'ultra' : 'standard',
            safety_tolerance: '2' // Strict safety
        };

        // HI-FI INJECTION: Ensure Pro tier gets the best pixels
        if (tier === 'pro' && !finalPrompt.includes("8k resolution")) {
             finalPrompt += ", extremely high detail, 8k resolution, cinematic lighting, photorealistic textures, depth of field, masterpiece";
        }

        console.log('🎯 [generateImage] finalPrompt →', finalPrompt?.substring(0, 200));
        if (finalPrompt) body.prompt = finalPrompt;
        else body.prompt = processedPrompt;
    
        if (effectiveIdentity && !hasMultipleRefs) {
            body.character_reference = effectiveIdentity;
            body.image_prompt_url = effectiveIdentity;
        }
        if (styleReference) body.style_reference = styleReference;
        if (hasMultipleRefs) body.character_references = characterReferences;
        if (styleReferences) body.style_references = styleReferences;

        // --- NEW: USE CENTRALIZED EDGE INVOCATION ---
        const { data, error } = await invokeEdgeFunction('generate-story-image', body);


        if (error) {
            let serverError = "Unknown Server Error";
            if (error instanceof Error) serverError = error.message;
            throw new Error(`Edge Function: ${serverError}`);
        }

        return {
            url: data.imageUrl,
            seed: data.usedSeed,
        };

    } catch (err: any) {
        console.error("Chyba při volání AI funkce:", err);
        return { url: null, error: err.message || "Generování selhalo." };
    }
};

export interface GenerateCardAssetParams {
    type: 'sticker' | 'background';
    prompt: string; 
    themeStyle: string; 
    seed?: number | null;
}

export const generateCardAsset = async (params: GenerateCardAssetParams): Promise<ImageGenerationResult> => {
    const { type, prompt, themeStyle, seed } = params;

    let finalPrompt = prompt;
    if (!finalPrompt.includes("Art Style:") && themeStyle) {
        finalPrompt = `Art Style: ${themeStyle}. ${finalPrompt}`;
    }

    try {
        
        // --- NEW: USE CENTRALIZED EDGE INVOCATION ---
        const { data, error } = await invokeEdgeFunction('generate-story-image', {
            prompt: finalPrompt,
            seed: seed || undefined,
            model: 'dev'
        });

        if (error) throw error;

        return {
            url: data.imageUrl,
            seed: data.usedSeed
        };

    } catch (err: any) {
        console.error("Card Asset Gen Error:", err);
        return { url: null, error: err.message };
    }
};
