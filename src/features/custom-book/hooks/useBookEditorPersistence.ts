import { useState, useEffect } from 'react';
import { useStory } from '../../../hooks/useStory';
import { StoryBook, StoryPage } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { validateImageFile } from '../../../lib/content-policy';
import { extractVisualIdentity } from '../../../lib/storyteller';

export const useBookEditorPersistence = (bookId: string, _userId: string) => {
    const { saveStory, saving } = useStory();
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingMirror, setIsUploadingMirror] = useState(false);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('energy_balance').eq('id', user.id).single();
                if (data) setUserBalance(data.energy_balance);
            }
        };
        fetchBalance();
    }, []);

    const savePages = async (story: StoryBook) => {
        setSaveError(null);
        try {
            return await saveStory(story);
        } catch (err: any) {
            setSaveError(err.message);
            return null;
        }
    };

    const savePage = async (storyBookId: string, page: StoryPage) => {
        setSaveError(null);
        try {
            const { error } = await supabase.from('pages').upsert({
                book_id: storyBookId,
                page_number: page.page_number,
                text: page.text,
                image_url: page.image_url,
                art_prompt: page.art_prompt,
            });
            if (error) throw error;
        } catch (err: any) {
            setSaveError(err.message);
        }
    };

    const saveCover = async (storyBookId: string, coverUrl: string) => {
        setSaveError(null);
        try {
            const { error } = await supabase.from('books').update({ cover_image: coverUrl }).eq('id', storyBookId);
            if (error) throw error;
        } catch (err: any) {
            setSaveError(err.message);
        }
    };

    const publishBook = async (storyBookId: string, isPublic: boolean) => {
        setSaveError(null);
        try {
            const { error } = await supabase.from('books').update({ is_public: isPublic }).eq('id', storyBookId);
            if (error) throw error;
        } catch (err: any) {
            setSaveError(err.message);
        }
    };

    const uploadPhoto = async (file: File | undefined) => {
        if (!file) return null;
        const fileCheck = validateImageFile(file);
        if (fileCheck.blocked) { alert(fileCheck.reason); return null; }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${bookId}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('story-assets').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('story-assets').getPublicUrl(filePath);
            return publicUrl;
        } catch (err) {
            console.error('Upload failed', err);
            alert('Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const uploadMagicMirror = async (file: File | undefined): Promise<{ url: string; dna: string | null } | null> => {
        if (!file) return null;
        const fileCheck = validateImageFile(file);
        if (fileCheck.blocked) { alert(fileCheck.reason); return null; }

        console.log('📸 Magic Mirror Upload Started:', { fileName: file.name, fileSize: file.size, fileType: file.type });
        setIsUploadingMirror(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `mirror_${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${bookId}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('story-assets').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('story-assets').getPublicUrl(filePath);
            console.log('✅ Magic Mirror URL:', publicUrl);

            let dna: string | null = null;
            try {
                const loadingToast = document.createElement('div');
                loadingToast.innerText = '🧬 Analyzuji postavu...';
                loadingToast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:black;color:white;padding:10px 20px;border-radius:20px;z-index:9999';
                document.body.appendChild(loadingToast);

                console.log('🧬 Extracting Visual DNA from image...');
                const extracted = await extractVisualIdentity(publicUrl, 'Main Character');

                if (extracted && (extracted.includes('{') || extracted.length > 20)) {
                    console.log('🧬 DNA Extracted:', extracted);
                    dna = extracted;
                } else {
                    console.warn('⚠️ DNA Extraction vague, using fallback.');
                    dna = 'A cheerful ' + (extracted || 'character');
                }

                document.body.removeChild(loadingToast);
            } catch (dnaErr) {
                console.error('❌ DNA Extraction failed:', dnaErr);
            }

            return { url: publicUrl, dna };
        } catch (err) {
            console.error('❌ Kouzelné zrcadlo: Nahrávání selhalo', err);
            alert('Nahrávání fotky selhalo. Zkus to prosím znovu.');
            return null;
        } finally {
            setIsUploadingMirror(false);
        }
    };

    const exportPdf = async (pageIds: string[], title: string) => {
        setIsUploading(true);
        setPdfProgress({ current: 0, total: pageIds.length });
        try {
            await new Promise(r => setTimeout(r, 500));
            const success = await import('../../../utils/pdfGenerator').then(m =>
                m.generatePdf(pageIds, `${title || 'custom-book'}.pdf`, (current: number, total: number) => {
                    setPdfProgress({ current, total });
                })
            );
            if (success) alert('PDF staženo! 📄');
            else throw new Error('PDF generation failed');
        } catch (e) {
            console.error('PDF Error:', e);
            alert('Nepodařilo se vytvořit PDF. Zkuste to prosím znovu.');
        } finally {
            setIsUploading(false);
            setPdfProgress(null);
        }
    };

    return {
        savePage,
        savePages,
        saveCover,
        publishBook,
        uploadPhoto,
        uploadMagicMirror,
        exportPdf,
        isSaving: saving,
        isUploading,
        isUploadingMirror,
        userBalance,
        pdfProgress,
        saveError,
    };
};
