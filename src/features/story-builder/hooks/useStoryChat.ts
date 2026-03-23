import { invokeEdgeFunction } from '../../../lib/edge-functions';

interface ChatTurnResult {
    reply: string;
    extractedParams?: Record<string, any>;
    isReady?: boolean;
}

export const useStoryChatApi = () => {

    const sendMuseMessage = async (
        messages: Array<{ role: string; content: string }>,
        currentParams: Record<string, any>,
        language: string
    ): Promise<ChatTurnResult> => {
        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'chat-turn',
            payload: { messages, currentParams, language },
        });

        if (error) throw new Error(error instanceof Error ? error.message : 'Edge function error');

        try {
            const jsonContent = JSON.parse(data.choices[0].message.content);
            return {
                reply: jsonContent.reply,
                extractedParams: jsonContent.extracted_params,
                isReady: jsonContent.is_ready,
            };
        } catch {
            return { reply: data.choices?.[0]?.message?.content || 'Error' };
        }
    };

    const sendArchitectMessage = async (
        question: string,
        language: string
    ): Promise<string> => {
        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'ask-architect',
            payload: { question, language },
        });

        if (error) throw new Error(error instanceof Error ? error.message : 'Edge function error');

        if (data?.choices?.[0]?.message?.content) {
            return data.choices[0].message.content;
        } else if (typeof data === 'string') {
            return data;
        }
        return JSON.stringify(data);
    };

    return { sendMuseMessage, sendArchitectMessage };
};
