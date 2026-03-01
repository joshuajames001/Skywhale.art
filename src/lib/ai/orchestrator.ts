import { StoryParams, generateStoryStructure } from '../storyteller';
import { generateImage, GenerateImageParams } from '../ai';
import { StoryBook, StoryPage } from '../../types';

/**
 * ORCHESTRATOR: The Central Nervous System of Story Generation.
 * 
 * Flows:
 * 1. STRUCTURE: Text & Metadata (Edge Function)
 * 2. VISUAL DNA: Hero Portrait (Flux Dev/Pro)
 * 3. ILLUSTRATION: Pages & Cover (Flux Pro, Single-Ref)
 */
export async function generateCompleteStory(
    params: StoryParams, 
    onProgress?: (status: string) => void
): Promise<StoryBook> {
    
    // --- PHASE 1: THE ARCHITECT (Structure & Text) ---
    if (onProgress) onProgress("✨ Dreaming up the story...");
    
    const structure = await generateStoryStructure(params);
    const { pages, coverPrompt, identityPrompt, visualDna } = structure;
    const pagesList = pages; // We will mutate this with image URLs locally before returning

    // --- PHASE 2: THE VISION NODE (Visual DNA) ---
    // We MUST generate the character sheet first to correct the "Hallucination Drift".
    
    let characterSheetUrl: string | undefined = undefined;

    if (identityPrompt) {
        if (onProgress) onProgress("🧬 Sequencing Visual DNA (Hero Portrait)...");
        
        try {
            // STRICT PROTOCOL: Clean DNA of layout instructions
            const cleanDna = visualDna.replace(/blueprint|schematic|turnaround|front view|side view|back view|character sheet|reference sheet|technical drawing|no shading|flat color/gi, "").trim();

            const heroPortraitPrompt = `A stunning, high-quality cinematic portrait of ${cleanDna}, single character focus, dynamic lighting, plain neutral background, masterpiece, 8k`.trim();

            // PHASE 2 now generates a HERO PORTRAIT, not a technical sheet.
            const { url } = await generateImage({
                prompt: heroPortraitPrompt,
                style: params.visual_style || "Watercolor",
                characterDescription: cleanDna, // Use the sanitized DNA
                setting: "Plain neutral background", 
                tier: 'basic', // Flux Dev is sufficient for the base reference, or upgrade to 'pro' if budget allows
                steps: 28, 
                isCover: true 
            });
            
            if (url) {
                characterSheetUrl = url;
                console.log("✅ Visual DNA Sequenced:", url);
            }
        } catch (e) {
            console.error("⚠️ Visual DNA Generation Failed (Non-Fatal):", e);
            // We continue without a reference, falling back to text descriptions
        }
    }

    // --- PHASE 3: THE ILLUSTRATOR (Pages & Cover) ---
    // Note: In a real "streaming" app, we might return here and generate pages async.
    // For now, the prompt implies "generateCompleteStory" might be eager or we just return the structure
    // and let the user generate pages one by one. 
    //
    // WAIT - The user request said: "Iterate over `story.pages`... loop".
    // Does the user want ALL pages generated now? Or just the structure with the visual DNA ready?
    // "Fix the parameter mapping in the image generation loop... ensure `visualDna`... is injected into EVERY single page's payload."
    //
    // Interpreting "generateCompleteStory" as generating the *Object* with the DNA ready. 
    // The actual page generation usually happens in the Reader or explicitly.
    // However, the Task Definition says: "Phase 3 (Pages & Cover): Iterate... call generateImage".
    // This implies EAGER generation of all images? Or is it describing the loop that *will* happen?
    // 
    // Re-reading user request: "The user provided console logs proving that the Visual DNA is completely dropped between the cover and the first page."
    // This implies the previous implementation WAS trying to generate pages.
    //
    // OPTION A: Generate ALL images now (Expensive, slow).
    // OPTION B: Return the Book Object with the proper DNA/ReferenceURL, and let `BookReader` / `StorySpread` handle the generation on view.
    //
    // The previous `StorySetup` code had a loop for pages.
    // "FIX 2: Inject the referenceImageUrl into the payload... Fix the parameter mapping in the image generation loop"
    //
    // DECISION: I will return the StoryBook with the `character_sheet_url` populated. 
    // The ACTUAL `generateImage` for pages happens in `StorySpread` (lazy loading) OR if the user wants pre-generation.
    //
    // ACTUALLY, checking `StorySetup` again... it was just creating the OBJECT. 
    // The `StorySetup` code I removed in step 1673 was just `generateStructure` + `generateImage` (DNA) -> `onComplete`.
    // The pages were NOT generated in `StorySetup`. They are generated in `BookReader` -> `StorySpread` -> `ImageGenerator` (on mount).
    //
    // WAIT. The User says: "Locate the frontend orchestration loop that iterates over the story pages... The previous agent failed... implemented a hacky UI-based trigger".
    // And "Loop ... likely in `src/lib/storyteller.ts`, `useStory.ts` or...".
    //
    // IF the pages are generated in `StorySpread` (lazy), then `StorySetup` determines the *initial state* of the book.
    // The "Loop" the user talks about might be the *potential* loop if we want to pre-generate. 
    //
    // BUT, the `StorySpread` component has `<ImageGenerator autoStart={!hasImage} ... />`? 
    // Let's look at `StorySpread` again. Yes, it has `ImageGenerator`.
    //
    // So the "Loop" is actually the *user navigating through the book* effectively? 
    // OR did the user WANT a pre-generation loop?
    //
    // User Quote: "The user provided console logs... Visual DNA is completely dropped between the cover and the first page."
    // This happens because `BookReader` didn't pass the props. I FIXED THAT in Step 1608/1649.
    //
    // The CURRENT user request (Step 1687) says:
    // "Phase 3 (Pages & Cover): Iterate over `story.pages` ... For each, call `generateImage`."
    // AND "Revert StorySetup.tsx to... only invokes the orchestrator."
    //
    // This implies the Orchestrator SHOULD generate the images? 
    // If I generate all images for a 10 page book, that's 2-3 minutes of waiting. 
    // Is that what is desired? 
    // "Phase 3 (Pages & Cover): Iterate... For each, call generateImage."
    //
    // Okay, I will implement the loop. If it's too slow, the user can request lazy loading later. 
    // But importantly, I must implement the *logic* for the loop correctly so I can expose it even if I don't await it all.
    //
    // Actually, looking at `StorySetup` typically... it just sets up the story.
    // I will implement the loop but perhaps strictly for the COVER first, and let the pages be lazy?
    // NO, the prompt says "Iterate over `story.pages`... For each, call `generateImage`."
    // I MUST FOLLOW THE PROMPT. I will implement the loop.
    
    // BUT, I will make the page generation *async* and not block the return of the story object if possible?
    // No, `Promise<StoryBook>` implies we return the finished book.
    // 
    // Wait, usually `StorySetup` -> `onComplete` -> Redirect to Book.
    // If we wait for 10 images, the user waits 3 minutes.
    // Maybe the user *wants* pre-generation. 
    
    // Let's implement the generation for the COVER (Phase 3a) strictly. 
    // And for the PAGES (Phase 3b), I will implement the logic but maybe we should rely on `StorySpread` for lazy load?
    // "Fix the parameter mapping in the image generation loop... ensure `visualDna`... is injected"
    //
    // IF I move the logic to `orchestrator.ts`, I can return a StoryBook that has `pages` with `image_url` populated?
    // Yes.
    
    // Let's ask: Did the previous code iterate pages?
    // `StorySetup.tsx` (Step 1657) had `pages: pages,` - it did NOT iterate images.
    // The user's compliant is "Visual DNA... is dropped... between Cover and First Page".
    // The previous fix (Step 1673) injected `character_sheet_url` into the Story Object.
    // This allows `StorySpread` (which calls `generateImage`) to work.
    
    // The user request Step 1687 says: "Iterate over `story.pages`... For each, call `generateImage`."
    // This suggests they WANT backend pre-generation (or orchestrator pre-generation).
    // OR they are describing the *conceptual* loop that happens (even if distributed).
    //
    // "Locate the frontend orchestration loop that iterates over the story pages" 
    // There WAS NO LOOP in `StorySetup` before. That was the "bug" (or feature). 
    // The pages were generated lazily.
    //
    // If the user WANTS a loop, I will build a loop.
    // I will generate the **Cover** and **Page 1** at minimum to ensure immediate engagement.
    // The others... well, strict compliance says "Iterate over `story.pages`".
    // I will generate ALL if asked.
    
    // HOWEVER, to be safe and efficient: I will generate the CHARACTER SHEET and the COVER.
    // Reference: "Phase 3 (Pages & Cover): Iterate over `story.pages` and `story.cover`."
    // I will assume this means PRE-GENERATING the entire book.
    
    const filledPages: StoryPage[] = [];
    
    // We'll process sequentially to avoid rate limits? Or parallel?
    // Flux Pro is fast. Parallel is allowed? 
    // Let's do sequential for safety with the Orchestrator loop.
    
    // NOTE: Generating 10 images might take time. I will confirm if we should return early.
    // User Constraint: "Revert StorySetup.tsx to... only invokes the orchestrator."
    
    // "Fix the parameter mapping... verify complete generation flow"
    // I'll implement the loop.
    
    // WAIT. If I generate the images here, I need to upload them. 
    // `generateImage` in `ai.ts` returns a URL (Supabase Storage). 
    // So yes, I can populate `page.image_url`.
    
    // Let's assume we WANT to generate everything.
     
    // --- PHASE 3: THE ILLUSTRATOR ---
    
    // PHASE 3.1: THE COVER (High Priority)
    // CRITICAL FIX: DO NOT use characterSheetUrl as reference for the cover.
    // It causes "Sheet Syndrome" (cover looks like a grid).
    // Flux 2 Pro is smart enough to generate the character from 'visualDna' text description alone.
    
    let coverUrl = null;
    if (coverPrompt) {
        if (onProgress) onProgress("🎨 Painting the Cover...");
        try {
            const { url } = await generateImage({
                prompt: coverPrompt,
                style: params.visual_style || "Watercolor",
                characterDescription: visualDna.replace(/blueprint|schematic|turnaround/gi, ""), // Sanitize again just in case
                characterReference: characterSheetUrl, // <--- RE-ENABLED: Hero Portrait is now a valid reference!
                setting: params.setting,
                tier: 'pro', // Ultra
                steps: 28, // High Quality
                isCover: true,
                aspectRatio: 'vertical'
            });
            coverUrl = url;
        } catch (e) {
            console.error("Cover Generation Failed:", e);
        }
    }
    // User Requirement: "chci aby to pokracovalo jako predtim... pak otocim stranu, kliknu na generovat obrazek"
    // We do NOT generate page images here anymore. 
    // We only prepare the container with the correct prompts and reference URLs.
    
    // PIPELINE SWAP: The User wants the COVER to be the reference for the PAGES.
    // "Pak se z coveru ma udelat predloha pro obrazek na stranku 1"
    // So we promote coverUrl to be the effective character_sheet_url for the book's continuity.
    const pagesReferenceUrl = coverUrl || characterSheetUrl;

    // Safety Brake: Slicing to requested length to avoid over-fetching
    const targetLength = params.length || pages.length;
    const finalPages = pages.slice(0, targetLength).map(p => ({
        ...p,
        image_url: null, // User triggers this manually
        is_generated: false,
        character_sheet_url: pagesReferenceUrl // Use Cover (if exists) or Sheet as fallback
    }));

    return {
        book_id: crypto.randomUUID(),
        title: params.title || "New Story",
        author: params.author,
        theme_style: params.visual_style,
        cover_image: coverUrl,
        cover_prompt: coverPrompt,
        identity_prompt: identityPrompt,
        visual_dna: visualDna,
        main_character: params.main_character,
        setting: params.setting,
        target_audience: params.target_audience,
        visual_style: params.visual_style,
        // CRITICAL: Return the REFERENCE that pages should use.
        // If we have a cinematic cover, that becomes the "Bible" for the visual style.
        character_sheet_url: pagesReferenceUrl, 
        pages: finalPages,
        tier: 'premium',
        length: targetLength
    } as any as StoryBook;
}
