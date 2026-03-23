import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface SubmitReportPayload {
    type: 'book' | 'user';
    targetId: string;
    reason: string;
    details: string | null;
}

export const useReportData = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submitReport = async (payload: SubmitReportPayload): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'Pro hlášení musíš být přihlášen/a.' };
            }

            await supabase.from('reports').insert({
                reporter_id: user.id,
                book_id: payload.type === 'book' ? payload.targetId : null,
                reported_user_id: payload.type === 'user' ? payload.targetId : null,
                reason: payload.reason,
                details: payload.details,
            });

            setSent(true);
            return { success: true };
        } catch (err) {
            console.error('Report failed:', err);
            return { success: false, error: 'Hlášení se nepodařilo odeslat. Zkuste to prosím znovu.' };
        } finally {
            setLoading(false);
        }
    };

    return { loading, sent, submitReport };
};
