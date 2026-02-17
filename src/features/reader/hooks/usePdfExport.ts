import { useState } from 'react';
import { StoryBook } from '../../../types';

export const usePdfExport = (story: StoryBook, t: any) => {
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

    const handleExportPdf = async () => {
        if (!story || !story.pages) return;

        setIsExportingPdf(true);
        setPdfProgress({ current: 0, total: story.pages.length });

        try {
            const pageIds = ['book-page-0', ...story.pages.map((p) => `book-page-${p.page_number}`)];
            // Small delay to ensure render
            await new Promise(r => setTimeout(r, 500));

            const success = await import('../../../utils/pdfGenerator').then(m =>
                m.generatePdf(pageIds, `${story.title || 'story'}.pdf`, (current, total) => {
                    setPdfProgress({ current, total });
                })
            );

            if (success) alert(t('app.status.pdf_success'));
            else throw new Error("PDF generation failed");

        } catch (e) {
            console.error("PDF Error:", e);
            alert("Nepodařilo se vytvořit PDF. Zkuste to prosím znovu.");
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
