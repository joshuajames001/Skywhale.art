import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

// --- LANGUAGE UTILS ---
const getLanguageName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'English';
        case 'cs': return 'Czech (čeština)';
        default: return 'Czech (čeština)';
    }
}

const getTextFieldName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'text_en';
        case 'cs': return 'text_cz';
        default: return 'text_cz';
    }
}

const getTitleFieldName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'title_en';
        case 'cs': return 'title_cz';
        default: return 'title_cz';
    }
}

// --- PROMPTS ---

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
    </task>

    <storytelling_rules>
        1. SHOW, DON'T TELL: Do not strictly say emotions ("He was happy"). Show them ("He jumped and clapped").
        2. LOGICAL FLOW: Every action must follow from the previous one. A -> Therefore B -> Therefore C. No random jumps.
        3. CHARACTER AGENCY: The Hero must solve the problem, not a random event or magic.
        4. NO "WHITE ROOM": Interact with the environment. Describe the texture, light, and sound of the world.
        5. CONSISTENCY: Keep the character's appearance and the world's rules consistent (e.g. if it's night, it stays night).
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
           
           EXAMPLES:
           - "Pixar 3D style. Low-angle shot, the small robot is rolling cautiously into a dark crystal cave, bioluminescent mushrooms casting blue light on wet stone walls."
           - "Watercolor style. Wide establishing shot, the young fox is standing at the edge of a golden wheat field at sunset, warm amber light painting long shadows."
           - "Anime style. Close-up, the tiny fairy is peering through a rain-covered window, reflections of city lights sparkling in droplets."
           
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
                "${textField}": "[${langName} Story Text - 40-60 words]",
                "art_prompt_en": "[STYLE]. [Camera angle], the [species/class] is [action] in [detailed setting]. [Lighting/mood]."
              }
            ]
          }
        }
        ${"```"}
    </output_format>

    <dual_language_rules>
    1. THINK IN ENGLISH: Generate story content in English first (text_en).
    2. TRANSLATE TO ${langName.toUpperCase()}: Then translate to '${textField}'.
    3. VISUALS FROM ENGLISH: 'art_prompt_en' derived from 'text_en' to preserve detail.
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
        4. LOGIC LAW: Environments must have visual gravity.
        5. ENVIRONMENTAL DIVERSITY: Avoid defaulting to "Enchanted Forest".
        6. Technical DNA: You must output a JSON with a technical_dna field.
        7. Color Palette: Always include a color_palette field in the DNA.
        8. Language: You MUST provide 'concept' fields in BOTH English (suffix _en) and Czech (suffix _cz). 'technical_dna' fields are in ENGLISH only.
        9. DUAL LANGUAGE RULES (ABSOLUTE):
           - THINK IN ENGLISH: Generate the story concept in English first.
           - TRANSLATE TO CZECH: Then translate it to Czech.
           - NO CZECH IN ENGLISH FIELDS: Fields with _en suffix MUST be purely English.
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

const getChatSystemPrompt = (langCode: string = 'cs') => {
    const langName = getLanguageName(langCode);
    return `
<role>
    You are 'Múza' (Muse), a magical AI co-author helping a user (child or parent) define a new story.
    Your goal is to have a friendly conversation in ${langName} to extract 5 key Story Parameters:
    1. Title
    2. Main Character
    3. Setting
    4. Target Audience
    5. Visual Style
</role>

<rules>
    1. LANGUAGE: Speak only in ${langName}. Be friendly, encouraging, and magical.
    2. FLOW: Ask one question at a time.
    3. SUGGESTIONS: If the user doesn't know, offer 3 creative options (A, B, C).
    4. COMPLETION: When ready, present a "Story Summary" to the user and ask if you can start writing.
</rules>

<output_format>
    Return a STRICT JSON object:
    {
        "reply": "Your message to the user in ${langName}...",
        "extracted_params": { ... },
        "missing_params": [...],
        "is_ready": boolean
    }
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
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const lang = (payload?.language || 'cs').substring(0, 2).toLowerCase();

    // DEFENSIVE: Check for missing API key
    if (!apiKey) {
        console.error("FATAL: GEMINI_API_KEY is not set in Supabase secrets!");
        return new Response(JSON.stringify({ error: "Server configuration error: AI key is missing." }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
    // - generate-structure (Expensive): MUST be logged in.
    // - generate-idea / chat-turn (Discovery): Allowed for guests to prevent conversion friction.
    if (!user && action === 'generate-structure') {
        return new Response(JSON.stringify({ error: "Unauthorized: Please log in to generate full stories." }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    if (action === 'generate-structure') {
        const userPrompt = `Title: ${payload.title}\nAuthor: ${payload.author}\nMain Character: ${payload.main_character}\nSetting: ${payload.setting}\nVisual DNA: ${payload.visual_dna || payload.main_character}\nTarget Audience: ${payload.target_audience}\nVisual Style: ${payload.visual_style}`;

        const data = await callGemini(
            [{ role: "user", content: userPrompt }],
            getStorySystemPrompt(payload.length || 10, lang),
            true,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }] }), { headers: corsHeaders });
    }

    if (action === 'generate-idea') {
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
            apiKey!,
            "gemini-2.0-flash"
        );
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }] }), { headers: corsHeaders });
    }

    if (action === 'chat-turn') {
        const geminiMessages = payload.messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
        }));

        const result = await callGemini(
            geminiMessages,
            getChatSystemPrompt(lang) + `\n\nCURRENT KNOWN PARAMS: ${JSON.stringify(payload.currentParams)}`,
            true,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }), { headers: corsHeaders });
    }

    // --- CUSTOM BOOK EDITOR ACTIONS ---

    if (action === 'generate-suggestion') {
        const { storySoFar, currentText, pageIndex, totalPages } = payload;
        const systemPrompt = `You are a helpful children's story writing assistant. You help continue stories in a creative, age-appropriate way. Write in ${lang === 'cs' ? 'Czech' : 'English'}. Return ONLY the suggested continuation text (1-3 sentences), no JSON, no formatting.`;
        const userPrompt = `Story so far:\n${storySoFar}\n\nCurrent page text:\n${currentText}\n\nThis is page ${pageIndex} of ${totalPages}. Suggest a natural continuation.`;

        const result = await callGemini(
            [{ role: "user", content: userPrompt }],
            systemPrompt,
            false,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: result } }] }), { headers: corsHeaders });
    }

    if (action === 'generate-image-prompt') {
        const { storyText } = payload;
        const systemPrompt = `You are an expert at creating visual art prompts for children's book illustrations. Given a story text in any language, create a detailed English image generation prompt. Focus on: scene composition, lighting, mood, characters, and setting. Return ONLY the English prompt text, no JSON, no formatting.`;

        const result = await callGemini(
            [{ role: "user", content: `Create an illustration prompt for this story text:\n${storyText}` }],
            systemPrompt,
            false,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: result } }] }), { headers: corsHeaders });
    }

    if (action === 'generate-initial-ideas') {
        const systemPrompt = `You are a creative children's story idea generator. Generate exactly 5 short, fun story ideas for children aged 4-10. Write in ${lang === 'cs' ? 'Czech' : 'English'}. Return the ideas separated by semicolons (;). No numbering, no formatting, just the ideas.`;

        const result = await callGemini(
            [{ role: "user", content: "Generate 5 creative children's story ideas." }],
            systemPrompt,
            false,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: result } }] }), { headers: corsHeaders });
    }

    if (action === 'dictionary-lookup') {
        const { term } = payload;
        const systemPrompt = `You are a creative bilingual dictionary for children's story writers. Given a Czech word, return a JSON object with: "emoji" (relevant emoji), "primary_en" (English translation), "synonyms" (array of 3-5 creative English synonyms useful for art prompts), "related_adjectives" (array of 3-5 English adjectives that pair well with this word for visual descriptions). Return ONLY valid JSON.`;

        const result = await callGemini(
            [{ role: "user", content: `Translate and expand this Czech word: "${term}"` }],
            systemPrompt,
            true,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }), { headers: corsHeaders });
    }

    if (action === 'moderate-text') {
        const { text } = payload;
        
        const systemPrompt = `You are a Content Safety Moderator. Analyze the following text for violation of safety policies (Sexual, Hate, Harassment, Self-Harm, Violence). 
        Return a JSON object matching this EXACT structure:
        {
            "results": [
                {
                    "flagged": boolean,
                    "categories": {
                        "sexual": boolean,
                        "hate": boolean,
                        "harassment": boolean,
                        "self-harm": boolean,
                        "sexual/minors": boolean,
                        "hate/threatening": boolean,
                        "violence/graphic": boolean,
                        "violence": boolean
                    }
                }
            ]
        }
        
        Strictness: HIGH for sexual/hate/self-harm. MEDIUM for violence (fantasy violence is allowed if not graphic).`;

        const result = await callGemini(
            [{ role: "user", content: `Analyze this text for safety: "${text}"` }],
            systemPrompt,
            true,
            apiKey!,
            "gemini-2.0-flash"
        );

        return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    if (action === 'extract-visual-dna') {
        const { imageUrl } = payload;
        
        // VISUAL DNA EXTRACTION PROMPT
        const systemPrompt = `You are an expert Visual Character Analyst for AI Art generation. 
        Analyze the provided image and extract a precise 'Visual DNA' description.
        Focus on:
        1. Species/Type (e.g. Human Boy, Robot, Fox)
        2. Age Group / Scale
        3. Detailed Appearance (Hair, Eyes, Skin/Material)
        4. Clothing/Equipment (distinctive colors/items)
        5. Vibe/Style

        Return a JSON object:
        {
          "species": "...",
          "age_group": "...",
          "hair_fur": "...",
          "outfit_top": "...",
          "outfit_bottom": "...",
          "distinctive_marks": "...",
          "visual_summary": "A full sentence description..."
        }`;

        console.log(`👁️ Fetching image for analysis: ${imageUrl}`);
        const imgResp = await fetch(imageUrl);
        const imgBlob = await imgResp.blob();
        const arrayBuffer = await imgBlob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const mimeType = imgBlob.type || 'image/jpeg';

        const result = await callGemini(
            [{ 
                role: "user", 
                content: [
                    { text: "Analyze this image and extract Visual DNA JSON." },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ] 
            }],
            systemPrompt,
            true,
            apiKey!,
            "gemini-2.0-flash" // Verified & Multimodal
        );

        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }), { headers: corsHeaders });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
})

// --- GEMINI HELPER ---

async function callGemini(
    messages: { role: string; content?: any; parts?: any[] }[],
    systemInstruction: string,
    jsonMode: boolean,
    apiKey: string,
    model: string = 'gemini-1.5-pro'
) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // Normalize messages to Gemini 'parts' format for robustness
    const normalizedContents = messages.map(m => {
        // If already has parts (multimodal), use them
        if (m.parts) return { role: m.role, parts: m.parts };
        // If content is string (legacy), wrap in parts
        if (typeof m.content === 'string') return { role: m.role, parts: [{ text: m.content }] };
        // If content is array (legacy but structured?), try to use it if parts missing
        if (Array.isArray(m.content)) return { role: m.role, parts: m.content };
        // Fallback
        return { role: m.role, parts: [{ text: JSON.stringify(m.content || "") }] };
    });

    const payload = {
        contents: normalizedContents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
            temperature: 0.7,
            responseMimeType: jsonMode ? 'application/json' : 'text/plain'
        }
    };

    console.log(`🤖 Gemini Call [${model}]:`, JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Gemini Error:', errText);
        throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    console.log('✅ Gemini Response OK');
    
    // Extract text content safely
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Gemini returned no content');
    
    // CLEANUP: Strip Markdown Code Blocks if present (Gemini 2.0 Flash loves to add them)
    if (jsonMode) {
        content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return jsonMode ? JSON.parse(content) : content;
}