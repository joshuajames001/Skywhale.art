import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Achievement } from '../../types';

export const useUrlHandlers = (
    setCurrentAchievement: (ach: Achievement | null) => void
) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Capture Referral Code & Payment Status
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // 1. Referral Code
        const refCode = params.get('ref');
        if (refCode) {
            localStorage.setItem('referral_code', refCode);
        }

        // 2. Payment Success
        const success = params.get('success');
        if (success === 'true') {
            navigate('/store');
            // Small delay to ensure view is mounted before showing toast/messasge
            setTimeout(() => {
                setCurrentAchievement({
                    title: t('app.notifications.payment_success_title'),
                    description: t('app.notifications.payment_success_desc'),
                    icon: "⚡",
                    xp: 0,
                    id: "payment-success"
                });
            }, 1000);
        }

        if (success === 'false' || params.get('canceled')) {
            navigate('/store');
        }

    }, []);

    // Legacy Link Redirector
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        const id = params.get('id');

        if (view === 'book' && id) {
            navigate(`/book/${id}`, { replace: true });
        } else if (view === 'card_studio') {
            navigate('/studio', { replace: true });
        } else if (view === 'library') {
            navigate('/library', { replace: true });
        } else if (view === 'arcade') {
            navigate('/arcade', { replace: true });
        } else if (view === 'discovery') {
            navigate('/encyclopedia', { replace: true });
        } else if (view === 'setup') {
            navigate('/create', { replace: true });
        } else if (view === 'create_custom') {
            navigate('/custom', { replace: true });
        } else if (view === 'profile') {
            navigate('/profile', { replace: true });
        } else if (view === 'energy_store') {
            navigate('/store', { replace: true });
        }
    }, [location.search, navigate]);
};
