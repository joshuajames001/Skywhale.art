import { useState, useEffect } from 'react';
import { useStory } from '../../../hooks/useStory';
import { StoryBook, StoryPage } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { validateImageFile } from '../../../lib/content-policy';
import { extractVisualIdentity } from '../../../lib/storyteller';
import { generateImage } from '../../../lib/ai';
import { storageService } from '../../../lib/storage-service';

export const useBookEditorPersistence = (bookId: string, _userId: string) => {
    const { saveStory, saving } = useStory();
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingMirror, setIsUploadingMirror] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
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

            // Generate character sheet from DNA for consistent references
            const dnaToText = (raw: string): string => {
                try {
                    const parsed = JSON.parse(raw) as Record<string, unknown>;
                    return Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                } catch {
                    return raw;
                }
            };

            let sheetUrl: string | null = null;
            if (dna) {
                try {
                    console.log('🎨 Generating character sheet from DNA...');
                    const sheetPrompt = `${dnaToText(dna)}, full body character sheet, consistent outfit, white background, clean reference, front view`;
                    const sheetResult = await generateImage({
                        prompt: sheetPrompt,
                        style: 'pixar_3d',
                        tier: 'basic',
                        characterReference: publicUrl,
                    });
                    if (sheetResult.url) {
                        const { data: { user: currentUser } } = await supabase.auth.getUser();
                        const userId = currentUser?.id ?? 'anonymous';
                        const sheetPath = `magic-mirror/${userId}/sheet_${Date.now()}.webp`;
                        sheetUrl = await storageService.uploadImageFromUrl(sheetResult.url, sheetPath);
                        console.log('✅ Character sheet stored:', sheetUrl);
                    }
                } catch (sheetErr) {
                    console.error('⚠️ Character sheet generation failed, using original photo:', sheetErr);
                }
            }

            return { url: sheetUrl || publicUrl, dna };
        } catch (err) {
            console.error('❌ Kouzelné zrcadlo: Nahrávání selhalo', err);
            alert('Nahrávání fotky selhalo. Zkus to prosím znovu.');
            return null;
        } finally {
            setIsUploadingMirror(false);
        }
    };

    const exportPdf = async (pageIds: string[], title: string) => {
        setIsExportingPdf(true);
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
            setIsExportingPdf(false);
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
        isExportingPdf,
        userBalance,
        pdfProgress,
        saveError,
    };
};
