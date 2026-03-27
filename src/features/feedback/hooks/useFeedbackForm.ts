import { useState } from 'react';
import { invokeEdgeFunction } from '../../../lib/edge-functions';

export const useFeedbackForm = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const trimmed = message.trim();
        if (trimmed.length < 3) {
            setError('Zpráva musí mít alespoň 3 znaky.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error: fnError } = await invokeEdgeFunction('send-feedback', { message: trimmed });

        setIsLoading(false);

        if (fnError) {
            setError('Něco se pokazilo. Zkus to později.');
        } else {
            setIsSuccess(true);
        }
    };

    return { message, setMessage, isLoading, isSuccess, error, handleSubmit };
};
