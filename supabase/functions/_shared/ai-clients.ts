export async function callGemini(
    messages: { role: string; content?: any; parts?: any[] }[],
    systemInstruction: string,
    jsonMode: boolean,
    apiKey: string,
    model: string = 'gemini-2.5-flash'
): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const normalizedContents = messages.map(m => {
        if (m.parts) return { role: m.role, parts: m.parts };
        if (typeof m.content === 'string') return { role: m.role, parts: [{ text: m.content }] };
        if (Array.isArray(m.content)) return { role: m.role, parts: m.content };
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

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Gemini returned no content');

    if (jsonMode) {
        content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(content);
    }
    return content;
}

export async function callAnthropic(
    userPrompt: string,
    systemPrompt: string,
    apiKey: string,
    model: string = 'claude-sonnet-4-6',
    temperature: number = 1.0
): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model,
            max_tokens: 16384,
            temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let content = data.content?.[0]?.text;
    if (!content) throw new Error('Anthropic returned no content');

    content = content
        .replace(/^```json\s*/m, '')
        .replace(/^```\s*/m, '')
        .replace(/\s*```$/m, '')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')  // strip control characters
        .replace(/,(\s*[}\]])/g, '$1')            // trailing commas
        .trim();
    return JSON.parse(content);
}
