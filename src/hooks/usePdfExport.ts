import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StoryBook } from '../types';

export const usePdfExport = (story: StoryBook) => {
    const { t } = useTranslation();
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

    const handleExportPdf = async () => {
        if (!story.pages || story.pages.length === 0) return;

        setIsExportingPdf(true);
        setPdfProgress({ current: 0, total: story.pages.length + 1 }); // +1 for cover

        try {
            // Wait for React to render the hidden container & images to load
            await new Promise(r => setTimeout(r, 1500));

            // Collect IDs
            const pageIds = ['pdf-cover', ...story.pages.map(p => `pdf-page-${p.page_number}`)];

            // Dynamically import generator to save bundle size
            const success = await import('../utils/pdfGenerator').then(m =>
                m.generatePdf(pageIds, `${story.title?.replace(/[^a-z0-9]/gi, '_') || 'pribeh'}.pdf`, (current, total) => {
                    setPdfProgress({ current, total });
                })
            );

            if (success) {
                // Check if we should prompt to share
                const referralCode = localStorage.getItem('referral_code') || '';
                const shareUrl = `${window.location.origin}/?ref=${referralCode || 'friend'}`;

                if (confirm(t('common.notifications.pdf_downloaded_title') + "\n\n" + t('common.notifications.pdf_downloaded_desc'))) {
                    navigator.clipboard.writeText(shareUrl);
                    alert(t('common.notifications.link_copied'));
                }
            } else {
                throw new Error("PDF generation failed");
            }

        } catch (e) {
            console.error("PDF Export Error:", e);
            alert(t('common.errors.pdf_failed'));
        } finally {
            setIsExportingPdf(false);
            setPdfProgress(null);
        }
    };

    return {
        isExportingPdf,
        pdfProgress,
        handleExportPdf
    };
};
