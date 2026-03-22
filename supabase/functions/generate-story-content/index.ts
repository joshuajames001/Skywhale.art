import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { callGemini, callAnthropic } from "../_shared/ai-clients.ts"
import { getLanguageName, getTextFieldName, getTitleFieldName } from "../_shared/lang-utils.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// --- PROMPTS ---

const CREATIVE_TWISTS: string[] = [
    "UNEXPECTED PERSPECTIVE: Begin in the middle of the action (IN MEDIAS RES). Show the world from an unusual vantage point or moment — not from the beginning.",
    "ROLE REVERSAL: The apparent antagonist has a sympathetic motivation the hero discovers mid-story. The true conflict is a misunderstanding, not pure evil.",
    "TINY HERO: The solution comes from the smallest, most overlooked character, creature, or object in the story — not from the strongest.",
    "INNER JOURNEY: The external quest mirrors a personal emotional struggle. The hero must overcome an internal fear or flaw to unlock the physical solution.",
    "UNEXPECTED ALLIANCE: The hero must form an alliance with someone or something completely unexpected — an enemy, a rival, or a feared creature.",
    "FALSE VICTORY: The hero achieves their apparent goal by page 7–8 but discovers it was the wrong goal. A deeper, more meaningful quest emerges.",
    "FORCE OF NATURE: The primary antagonist is not a creature or villain but an environmental challenge — a storm, a flood, a drought, a labyrinth.",
    "THE GIFT OF FAILURE: The hero fails spectacularly at the midpoint. This failure is the key — it teaches the exact insight needed to truly succeed.",
];

const getStorySystemPrompt = (targetLength: number = 10, langCode: string = 'cs') => {
    const langName = getLanguageName(langCode);
    const textField = getTextFieldName(langCode);
    const titleField = getTitleFieldName(langCode);

    return `
    <role>
    You are the Master Storyteller for ANELA Digital's AI Storybook Engine. Your goal is to create a children's book (${targetLength} pages) with rich, engaging text and vivid visual descriptions.
    </role>

    <task>
        Generate the complete book schema in JSON format.

        CRITICAL RULE: The story MUST have EXACTLY ${targetLength} PAGES (plus Cover). Do not generate less or more.

        RULES:
        0. **LANGUAGE RULE (ABSOLUTE PRIORITY)**: ALL story text (${textField} fields) MUST be in ${langName} language. Only art prompts (art_prompt_en) use English.
        1. TEXT: 40-60 words per page. Short, punchy, and engaging. Two to three clear sentences per page. USE "SHOW, DON'T TELL" PRINCIPLE. FOLLOW <storytelling_rules>.
        2. ART PROMPTS: Each page needs an 'art_prompt_en' – a vivid ENGLISH scene description for image generation.
        3. STRICT LANGUAGE SEPARATION:
           - Story Text = ${langName.toUpperCase()}
           - Image Prompts = ENGLISH
           - Visual DNA = ENGLISH
           - Cover Prompt = ENGLISH
           - NEVER mix languages in the prompts. Flux 2 Pro only understands English.
    </task>

    <storytelling_rules>
        1. SHOW, DON'T TELL: Do not strictly say emotions ("He was happy"). Show them ("He jumped and clapped").
        2. LOGICAL FLOW: Every action must follow from the previous one. A -> Therefore B -> Therefore C. No random jumps.
        3. CHARACTER AGENCY: The Hero must solve the problem, not a random event or magic.
        4. NO "WHITE ROOM": Interact with the environment. Describe the texture, light, and sound of the world.
        5. CONSISTENCY: Keep the character's appearance and the world's rules consistent (e.g. if it's night, it stays night).
        6. IN MEDIAS RES (ABSOLUTE): Page 1 MUST begin in the middle of action — a discovery, a movement, a question, a sound. FORBIDDEN opening words: "Once upon a time", "There was once", "One day", "Long ago". Drop the reader directly into the scene.
        7. NO CLICHÉS: BANNED resolutions: magic saves the day without consequence, hero wakes up and it was a dream, villain is evil for no reason, magical item appears from nowhere, happy ending via random luck. The resolution MUST follow logically from the hero's own choices and actions.
    </storytelling_rules>

    <art_prompt_rules>
        A) CHARACTER SHEET (DNA):
           - TEMPLATE: "Create a technical reference sheet for [Character Visual DNA]. The character on a purely white background, shown from front, side, and back. Focus on consistent clothing. Simple lighting, no shading. Technical blueprint style."

        B) CINEMATIC COVER:
           - TEMPLATE: "Wide cinematic storybook cover. [Art Style]. The character's full body visible in environment. Extreme depth of field, significant negative space for title. Environment: [Setting] in [Style] aesthetic."

        C) PAGE PROMPTS (THIS IS THE MOST IMPORTANT PART):
           - Write a vivid ENGLISH scene description focusing on: Action, Environment, Camera Angle, Lighting, Mood.
           - DO NOT describe the character's physical features (hair, clothes, face) – the AI image system handles identity separately.
           - Focus ONLY on: What the character is DOING, WHERE they are, the ATMOSPHERE, and the CAMERA ANGLE.

            FORMAT: "[Art Style]. [Camera angle], the [species/class] is [active verb] in [detailed setting]. [Lighting/mood description]."

           EXAMPLES (STRICTLY IN ENGLISH):
           - "Pixar 3D style. Low-angle shot, the small robot is rolling cautiously into a dark crystal cave, bioluminescent mushrooms casting blue light on wet stone walls."
           - "Watercolor style. Wide establishing shot, the young fox is standing at the edge of a golden wheat field at sunset, warm amber light painting long shadows."
           - "Anime style. A small green frog with a red vest sitting on a mossy log next to a shimmering, rainbow-colored river in a sunlit forest. Wide angle landscape."

        DYNAMIC CAMERA (MANDATORY – vary every page):
           - Page 1: Wide Shot (Establish setting)
           - Page 2: Close-Up (Emotion/Face)
           - Page 3: Low Angle (Heroic/Action) or High Angle (Scale)
           - Page 4: Mid Shot (Interaction)
           - Page 5: Wide Shot (New location)
           - Continue alternating.

        ENVIRONMENT VARIATION (CRITICAL):
           - Do NOT stay in the same collection of pixels for 10 pages.
           - Move the character through the world. FROM -> TO.
           - Example: Forest -> Cave -> Mountain -> Castle.


        ANONYMOUS PROTOCOL:
           - DO NOT use the character's proper name in art_prompt_en. Names confuse image AI.
           - Replace names with "The [Adjective] [Species/Class]" (e.g., "The small blue dragon" instead of "Azur").

        NO TEXT RULE (ABSOLUTE):
           - The image must be completely text-free.
           - Do NOT describe signposts, books with titles, speech bubbles, or labels.
           - If a book is present, it must be "a book with arcane symbols" or "a blank cover", NOT "a book that says Magic".
    </art_prompt_rules>

    <constraints>
        1. VISUAL GRAVITY: All environments must follow logical physics. No flying trees or floating islands unless explicitly in the setting.
        2. "TALKING OBJECT" BAN: Inanimate objects MUST NOT have faces or speak. Only living creatures can be characters.
        3. THE TRAVEL RULE: The story MUST be a journey with environment changes. Start (Home) → Journey (Road/Forest) → Destination (Cave/Mountain) → Return.
        4. SOLITARY HERO: Only ONE main character. A secondary character may appear on 1-2 pages max to prevent identity bleeding.
        5. SPECIES vs AGE: Animal → "Young", "Small", "Cub". Human → "Boy", "Girl", "Child".
        6. FORMAT: Output must be pure JSON only.
        7. DUAL LANGUAGE: '${textField}' in ${langName.toUpperCase()}, 'art_prompt_en' in ENGLISH, 'visual_dna' in ENGLISH.
        8. ANATOMY RULE: NO ANTHROPOMORPHISM. Animals must look exactly like real animals. NO human hands, NO human feet, NO human body proportions, NO human faces. A dog must look like a dog, a bug like a bug. Do not mix human and animal traits.
    </constraints>

    <output_format>
        Return a single JSON object.
        ${"```json"}
        {
          "metadata": {
            "target_age_group": "[Target Age]",
            "visual_style": "[Art Style]",
            "visual_dna": "[COMPLETE CHARACTER DESCRIPTION IN ENGLISH ONLY]",
            "criticism": "..."
          },
          "story_content": {
            "title_en": "[English Title]",
            "${titleField}": "[${langName} Title]",
             "cover": {
                "identity_prompt": "Create a technical reference sheet for [CHARACTER VISUAL DNA]. Character on purely white background, shown from front, side, and back. Focus on consistent clothing. Simple lighting. Technical blueprint.",
                "cover_prompt": "Wide cinematic storybook cover. [STYLE]. [CHARACTER DESCRIPTION] standing in [EPIC SETTING]. Extreme depth of field, significant negative space for title."
             },
            "pages": [
              {
                "page_number": 1,
                "text_en": "[English Story Text - 40-60 words]",
                "${textField}": "Byla jednou jedna malá žabička Kvák, která bydlela u kouzelné řeky.",
                "art_prompt_en": "A small green frog with a red vest sitting on a mossy log next to a shimmering, rainbow-colored river in a sunlit forest. Wide angle landscape. (MUST BE ENGLISH)"
              }
            ]
          }
        }
        ${"```"}
    </output_format>

    <dual_language_rules>
    1. THINK IN ENGLISH: Generate story content in English first (text_en).
    2. TRANSLATE TO ${langName.toUpperCase()}: Then translate to '${textField}'.
    3. VISUALS MUST BE ENGLISH: 'art_prompt_en' must be in English. Do NOT translate it to ${langName}.
    </dual_language_rules>
    `};

const getIdeaSystemPrompt = (langCode: string = 'cs') => {
    const langName = getLanguageName(langCode);
    return `
    <role>
        Act as the StoryCloud Muse. Your goal is to generate a magical children's book concept.
    </role>

    <context>
        You are the architect of a new story concept. You must output a JSON object defining the semantic concept and the technical visual DNA.
    </context>

    <rules>
        1. THEMATIC LAW: Universal Scope. (History, Sci-Fi, Fairytale, Modern, Nature).
        2. TAXONOMY LAW: The 'species_en' MUST be the literal biological classification.
        3. COLOR & ADJECTIVE LAW: If the Title or Blurb mentions a specific color or state, these MUST be explicitly included in both the concept descriptions and 'technical_dna.visual_anchors_en'.
        4. ANIMAL PURITY LAW (CRITICAL): If 'species_en' is an animal (even magical like dragon/unicorn), it must have NATURAL ANATOMY.
           - NO HUMAN HANDS.
           - NO STANDING ON TWO LEGS (unless natural behavior).
           - CLOTHING/ACCESSORIES ALLOWED (vests, hats, capes) BUT MUST FIT NATURAL BODY.
           - The 'visual_anchors_en' MUST describe biological features AND accessories, but anatomy must remain 100% animal.
        5. LOGIC LAW: Environments must have visual gravity.
        5. ENVIRONMENTAL DIVERSITY: Avoid defaulting to "Enchanted Forest".
        6. Technical DNA: You must output a JSON with a technical_dna field.
        7. Color Palette: Always include a color_palette field in the DNA.
        8. Language: You MUST provide 'concept' fields in BOTH English (suffix _en) and Czech (suffix _cz). 'technical_dna' fields are in ENGLISH only.
        9. DUAL LANGUAGE RULES (ABSOLUTE):
           - THINK IN ENGLISH: Generate the story concept in English first.
           - TRANSLATE TO CZECH: Then translate it to Czech.
           - NO CZECH IN ENGLISH FIELDS: Fields with _en suffix and 'technical_dna' MUST be purely English.
           - NO CZECH IN VISUAL DNA: The 'visual_anchors_en' and 'color_palette' must be English words only.
        10. CHILD SAFETY & MODESTY (CRITICAL).
        11. SINGLE HERO RULE (ABSOLUTE).
        12. NAMING CONVENTION (SIMPLE).
        13. CREATIVE VARIETY: Explore diverse themes (e.g. Ocean, Space, History, Mystery, Nature, Daily Life).
        14. FRESHNESS: Try to avoid repeating the most common tropes (like generic magic forests) to keep stories unique.
    </rules>

    <output_format>
        Return ONLY valid JSON:
        ${"```json"}
        {
          "concept": {
            "title_en": "...",
            "title_cz": "...",
            "author_name": "...",
            "short_blurb_en": "...",
            "short_blurb_cz": "...",
            "character_desc_en": "...",
            "character_desc_cz": "..."
          },
          "technical_dna": {
            "species_en": "...",
            "gender_en": "...",
            "size_age_en": "...",
            "visual_anchors_en": ["Specific Feature 1", "Specific Feature 2", "Specific Feature 3"],
            "color_palette": "color1, color2, color3",
            "recommended_style": "...",
            "lighting_vibe": "..."
          }
        }
        ${"```"}
    </output_format>
    `};

// --- HANDLER ---

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        const { action, payload } = await req.json();
        const lang = (payload?.language || 'cs').substring(0, 2).toLowerCase();

        if (action === 'generate-structure') {
            if (!user) {
                return new Response(JSON.stringify({ error: "Unauthorized: Please log in to generate full stories." }), {
                    status: 401, headers: corsHeaders
                });
            }

            const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
            if (!anthropicKey) {
                return new Response(JSON.stringify({ error: "Server configuration error: Anthropic key is missing." }), {
                    status: 500, headers: corsHeaders
                });
            }

            const randomTwist = CREATIVE_TWISTS[Math.floor(Math.random() * CREATIVE_TWISTS.length)];
            const userPrompt = `Title: ${payload.title}
Author: ${payload.author}
Main Character: ${payload.main_character}
Setting: ${payload.setting}
Visual DNA: ${payload.visual_dna || payload.main_character}
Target Audience: ${payload.target_audience}
Visual Style: ${payload.visual_style}

NARRATIVE DIRECTIVE (apply this creative constraint throughout the story): ${randomTwist}`;

            const data = await callAnthropic(
                userPrompt,
                getStorySystemPrompt(payload.length || 10, lang),
                anthropicKey,
                "claude-sonnet-4-6",
                0.95
            );

            return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }] }), { headers: corsHeaders });
        }

        if (action === 'generate-idea') {
            const apiKey = Deno.env.get('GEMINI_API_KEY');
            if (!apiKey) {
                return new Response(JSON.stringify({ error: "Server configuration error: AI key is missing." }), {
                    status: 500, headers: corsHeaders
                });
            }

            const themes = [
                "Space Exploration", "Deep Ocean Mystery", "Ancient History", "Futuristic City",
                "Microscopic World", "Dinosaur Era", "Magical School", "Detective Mystery",
                "Sports Competition", "Culinary Adventure", "Music & Rhythm", "Construction & Building",
                "Farm Life", "Jungle Expedition", "Polar Adventure", "Robot Factory"
            ];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];

            const data = await callGemini(
                [{ role: "user", content: `Generate a new story idea concept in English and Czech. REQUIRED THEME: ${randomTheme}. Current priority language: ${lang}` }],
                getIdeaSystemPrompt(lang),
                true,
                apiKey,
                "gemini-2.5-flash"
            );

            return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }] }), { headers: corsHeaders });
        }

        throw new Error(`Unknown action: ${action}`);

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
    }
})
