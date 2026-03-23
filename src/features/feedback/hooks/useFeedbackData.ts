import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface FeedbackItem {
    id: string;
    content: string;
    category: 'feature' | 'bug' | 'general';
    created_at: string;
    is_public: boolean;
    profiles?: {
        username: string;
        avatar_url: string;
    };
}

interface SubmitFeedbackPayload {
    content: string;
    category: 'feature' | 'bug' | 'general';
    isPublic: boolean;
}

export const useFeedbackData = () => {
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedback = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('feedback')
            .select('*, profiles(username, avatar_url)')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            setFeedbackList(data as any);
        }
        setLoading(false);
    };

    const submitFeedback = async (payload: SubmitFeedbackPayload): Promise<{ success: boolean; error?: string }> => {
        if (!payload.content.trim()) return { success: false, error: 'Empty content' };

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'Musíš být přihlášen!' };
            }

            const { error } = await supabase.from('feedback').insert({
                user_id: user.id,
                content: payload.content,
                category: payload.category,
                is_public: payload.isPublic,
            });

            if (error) {
                console.error('Error submitting feedback:', error);
                return { success: false, error: 'Něco se pokazilo. Zkus to později.' };
            }

            return { success: true };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { feedbackList, loading, isSubmitting, fetchFeedback, submitFeedback };
};
