import { useState, useEffect, useRef } from 'react';
import { useStory } from '../../../hooks/useStory';
import { useGuide } from '../../../hooks/useGuide';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useGemini } from '../../../hooks/useGemini';
import { generateImage, STYLE_PROMPTS } from '../../../lib/ai';
import { extractVisualIdentity } from '../../../lib/storyteller';
import { StoryBook, StoryPage } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { VOICE_OPTIONS, DEFAULT_VOICE_ID } from '../../../lib/audio-constants';
import { useTranslation } from 'react-i18next';
import { BookPage, CustomBookEditorProps } from '../types';

export const useCustomBookEditor = ({ onBack, onOpenStore }: CustomBookEditorProps) => {
    const { t } = useTranslation();
    const [bookId, setBookId] = useState<string>(crypto.randomUUID());
    
    // CONSISTENCY: Stable seed per book for kinetic seeding across pages
    const [bookSeed, setBookSeed] = useLocalStorage('skywhale_draft_book_seed', Math.floor(Math.random() * 1000000000));

    // PERSISTENCE: Use local storage for drafts
    const [bookTitle, setBookTitle] = useLocalStorage('skywhale_draft_book_title', t('library.custom_book_editor.title_default'));

    const createInitialPages = (count: number): BookPage[] => [
        { id: 'cover', text: '', isCover: true },
        ...Array.from({ length: count }, (_, i) => ({ id: crypto.randomUUID(), text: '' }))
    ];

    const [pages, setPages] = useLocalStorage<BookPage[]>('skywhale_draft_book_pages', createInitialPages(10));

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [magicMirrorUrl, setMagicMirrorUrl] = useLocalStorage<string | null>('skywhale_draft_mirror_url', null);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [publishBookId, setPublishBookId] = useState<string | null>(null);
    const [magicMirrorDna, setMagicMirrorDna] = useLocalStorage<string | null>('skywhale_draft_mirror_dna', null);
    const [currentAchievement, setCurrentAchievement] = useState<any>(null);
    const [isUploadingMirror, setIsUploadingMirror] = useState(false);
    const [maxPages, setMaxPages] = useState(10);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE_ID);
    const [selectedStyle, setSelectedStyle] = useState('Pixar 3D'); // Default to Pixar 3D as requested

    // CONTINUITY CHAIN: Last generated image serves as visual reference for next pages
    const [continuityImageUrl, setContinuityImageUrl] = useState<string | null>(null);

    // EXPERT MODE & DICTIONARY STATE
    const [isExpertMode, setIsExpertMode] = useState(false);
    const [showDictionary, setShowDictionary] = useState(false);
    const [dictionaryQuery, setDictionaryQuery] = useState('');
    const [dictionaryResult, setDictionaryResult] = useState<any>(null);
    const [isSearchingDict, setIsSearchingDict] = useState(false);

    // Dynamic cost: 50 Energy if any reference exists (Mirror or continuity), 30 for no-reference
    const activeReference = magicMirrorUrl || continuityImageUrl;
    const costPerImage = activeReference ? 50 : 30;
    const hasEnoughEnergy = userBalance !== null && userBalance >= costPerImage;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const magicMirrorInputRef = useRef<HTMLInputElement>(null);

    // NEW HOOK FUNCTIONS
    const { generateSuggestion, generateImagePrompt, generateInitialIdeas, searchDictionary, loading: geminiLoading } = useGemini();
    const { saveStory, saving } = useStory();
    const { startGuide, hasSeenGroups } = useGuide();

    // Trigger Guide
    useEffect(() => {
        // Delay to allow enter animation
        const t = setTimeout(() => {
            if (!hasSeenGroups['custom_book_editor_welcome']) {
                startGuide('custom_book_editor_welcome');
            }
        }, 800);
        return () => clearTimeout(t);
    }, [hasSeenGroups, startGuide]);

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('energy_balance').eq('id', user.id).single();
                if (data) setUserBalance(data.energy_balance);
            }
        };
        fetchBalance();

        const fetchInitialIdeas = async () => {
            if (currentPageIndex === 1 && pages[1]?.text === '' && !suggestion) {
                const ideas = await generateInitialIdeas();
                if (ideas && ideas.length > 0) {
                    setSuggestion(ideas[Math.floor(Math.random() * ideas.length)]);
                }
            }
        };
        fetchInitialIdeas();
    }, [currentPageIndex]);

    useEffect(() => {
        const currentContentCount = pages.filter(p => !p.isCover).length;
        if (currentContentCount === maxPages) return;

        const isSignificantlyModified = pages.some(p => (p.text.length > 20) || !!p.imageUrl);

        if (!isSignificantlyModified) {
            setPages(createInitialPages(maxPages));
            setCurrentPageIndex(0);
        } else {
            const newPages = [...pages];

            if (currentContentCount < maxPages) {
                const diff = maxPages - currentContentCount;
                const extra = Array.from({ length: diff }, () => ({ id: crypto.randomUUID(), text: '' }));
                newPages.push(...extra);
                setPages(newPages);
            } else {
                setPages(newPages.filter((p, i) => {
                    if (p.isCover) return true;
                    const contentIdx = newPages.filter((_, j) => j < i && !_.isCover).length;
                    return contentIdx < maxPages;
                }));
            }
        }
    }, [maxPages]);

    const currentPage = pages[currentPageIndex];

    const handleTextChange = (text: string) => {
        const newPages = [...pages];
        newPages[currentPageIndex] = { ...newPages[currentPageIndex], text };
        setPages(newPages);

        if (currentPageIndex === 0) {
            const title = text.split('\n')[0].trim();
            if (title) setBookTitle(title);
        }
    };

    const handleNewBook = () => {
        if (window.confirm(t('library.custom_book_editor.confirm_new_book'))) {
            setBookTitle(t('library.custom_book_editor.title_default'));
            setPages(createInitialPages(maxPages));
            setMagicMirrorUrl(null);
            setMagicMirrorDna(null);
            setContinuityImageUrl(null); // Reset continuity chain
            setCurrentPageIndex(0);
            setBookSeed(Math.floor(Math.random() * 1000000000));
        }
    };

    const addNewPage = () => {
        const newPage: BookPage = { id: Date.now().toString(), text: '' };
        setPages([...pages, newPage]);
        setCurrentPageIndex(pages.length);
    };

    const handleSave = async (isPublic: boolean = false) => {
        let contentPagesData = pages.slice(1);
        const storyPages: StoryPage[] = contentPagesData.map((p, idx) => ({
            page_number: idx + 1,
            text: p.text,
            image_url: p.imageUrl || null,
            art_prompt: p.prompt || '', // Using standardized art_prompt
            is_generated: !!p.imageUrl,
            layout_type: 'standard'
        }));

        const story: StoryBook = {
            book_id: bookId,
            title: bookTitle,
            author: 'Já',
            theme_style: 'Watercolor',
            visual_style: 'watercolor',
            cover_image: pages[0]?.imageUrl || null,
            pages: storyPages,
            is_public: isPublic,
            magic_mirror_url: magicMirrorUrl || undefined,
            tier: magicMirrorUrl ? 'premium' : 'basic',
            voice_id: selectedVoice,
        };

        const result = await saveStory(story);
        if (result) {
            const { bookId: resultId, achievements } = result;
            setBookId(resultId);

            // Show achievement toasts
            if (achievements && achievements.length > 0) {
                setCurrentAchievement(achievements[0]);
                // Queue additional achievements
                achievements.slice(1).forEach((ach, index) => {
                    setTimeout(() => setCurrentAchievement(ach), (index + 1) * 6000);
                });
            }

            // Show publish dialog
            setPublishBookId(resultId);
            setShowPublishDialog(true);
        }
    };

    const handleGeminiAssist = async () => {
        // Collect context from previous pages
        const previousPages = pages.slice(0, currentPageIndex);
        const storySoFar = previousPages.map((p: BookPage) => p.text).join("\n");

        if (!currentPage.text.trim() && !storySoFar.trim()) return;

        setSuggestion(null);
        const result = await generateSuggestion(storySoFar, currentPage.text, currentPageIndex, maxPages);
        if (result) {
            setSuggestion(result);
        }
    };

    const acceptSuggestion = () => {
        if (suggestion) {
            handleTextChange(currentPage.text + " " + suggestion);
            setSuggestion(null);
        }
    };

    const dismissSuggestion = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSuggestion(null);
    }

    const handleGenerateScene = async (isMagicMirror: boolean = false) => {
        if (!currentPage.text.trim() && !currentPage.prompt?.trim()) return; // Allow generation if manual prompt exists

        setIsGeneratingImage(true);

        try {
            let prompt = currentPage.prompt;

            // STEP 1: Generate Prompt from Text (if missing or if user wants to refresh)
            // In EXPERT MODE, if we already have a prompt, we DON'T regenerate automatically unless empty.
            if (!prompt || !isExpertMode) {
                const generated = await generateImagePrompt(currentPage.text);
                if (generated) prompt = generated;
            }

            if (!prompt) throw new Error("Failed to create prompt");

            // Save the prompt immediately
            const newPagesWithPrompt = [...pages];
            newPagesWithPrompt[currentPageIndex] = {
                ...newPagesWithPrompt[currentPageIndex],
                prompt: prompt
            };
            setPages(newPagesWithPrompt);

            // STEP 2: IF EXPERT MODE -> STOP HERE (Let user edit)
            if (isExpertMode && !currentPage.prompt) { // Only stop if it was just generated
                setIsGeneratingImage(false);
                return;
            }

            // Optimized prompts for covers
            let finalPrompt = prompt;
            if (currentPage.isCover) {
                finalPrompt = `WIDE CINEMATIC BOOK COVER, centered composition, epic lighting, masterwork: ${prompt} `;
            }

            // Debug: Log reference chain status
            console.log("🔗 Reference Chain:", {
                magicMirror: !!magicMirrorUrl,
                continuity: !!continuityImageUrl,
                activeRef: magicMirrorUrl || continuityImageUrl || 'NONE',
                tier: activeReference ? 'premium (50⚡)' : 'basic (30⚡)'
            });

            // If Magic Mirror is active, we MUST use the extracted DNA because Flux Pro ignores image inputs.
            const effectiveDescription = magicMirrorDna || (activeReference ? "The main character of this story" : undefined);

            const result = await generateImage({
                prompt: finalPrompt,
                style: selectedStyle,
                tier: activeReference ? 'premium' : 'basic',
                characterReference: activeReference || undefined,
                characterDescription: effectiveDescription,
                baseSeed: bookSeed,
                pageIndex: currentPageIndex
            });

            if (result.url) {
                const newPages = [...pages];
                newPages[currentPageIndex] = {
                    ...newPages[currentPageIndex],
                    imageUrl: result.url,
                    prompt: prompt
                };
                setPages(newPages);

                // CONTINUITY CHAIN: Save this image as reference for future pages
                setContinuityImageUrl(result.url);
                console.log("🔗 Continuity Chain: Stored new reference from page", currentPageIndex);
            }
        } catch (err: any) {
            console.error("Scene Gen Failed", err);
            if (err.message && (err.message.includes("Insufficient Energy") || err.message.includes("INSUFFICIENT_ENERGY"))) {
                const requiredEnergy = magicMirrorUrl ? 50 : 30;
                alert(`⚠️ Nedostatek energie!\n\nPotřebuješ ${requiredEnergy} ⚡ pro ${magicMirrorUrl ? 'Premium generování s Magic Mirror' : 'základní generování'}.\n\nOtevřu obchod...`);
                onOpenStore?.();
            } else {
                alert(`❌ Generování selhalo: ${err.message || 'Neznámá chyba'}`);
            }
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleMagicMirrorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('📸 Magic Mirror Upload Started:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        setIsUploadingMirror(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `mirror_${crypto.randomUUID()}.${fileExt}`; // FIXED: Removed trailing space
            const filePath = `${bookId}/${fileName}`;

            console.log('📤 Uploading to:', filePath);

            const { error: uploadError } = await supabase.storage
                .from('story-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('❌ Upload Error:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('story-assets')
                .getPublicUrl(filePath);

            console.log('✅ Magic Mirror URL:', publicUrl);
            setMagicMirrorUrl(publicUrl);

            // EXTRACT VISUAL DNA for Flux Pro Consistency
            try {
                // Show a toast or log that we are analyzing
                const loadingToast = document.createElement('div');
                loadingToast.innerText = "🧬 Analyzuji postavu...";
                loadingToast.style.position = 'fixed';
                loadingToast.style.bottom = '20px';
                loadingToast.style.right = '20px';
                loadingToast.style.backgroundColor = 'black';
                loadingToast.style.color = 'white';
                loadingToast.style.padding = '10px 20px';
                loadingToast.style.borderRadius = '20px';
                loadingToast.style.zIndex = '9999';
                document.body.appendChild(loadingToast);

                console.log('🧬 Extracting Visual DNA from image...');
                const dna = await extractVisualIdentity(publicUrl, "Main Character");

                if (dna && (dna.includes('{') || dna.length > 20)) {
                    console.log('🧬 DNA Extracted:', dna);
                    setMagicMirrorDna(dna);
                } else {
                    console.warn('⚠️ DNA Extraction vague, using fallback.');
                    setMagicMirrorDna("A cheerful " + (dna || "character"));
                }

                document.body.removeChild(loadingToast);
            } catch (dnaErr) {
                console.error("❌ DNA Extraction failed:", dnaErr);
                // Fallback to null, user implies character
            }

        } catch (err) {
            console.error("❌ Kouzelné zrcadlo: Nahrávání selhalo", err);
            alert('Nahrávání fotky selhalo. Zkus to prosím znovu.');
        } finally {
            setIsUploadingMirror(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input immediately so same file can be selected again if needed
        e.target.value = '';

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${bookId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('story-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('story-assets')
                .getPublicUrl(filePath);

            const newPages = [...pages];
            newPages[currentPageIndex] = {
                ...newPages[currentPageIndex],
                imageUrl: publicUrl
            };
            setPages(newPages);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.");
        } finally {
            setIsUploading(false);
        }
    };

    // PDF Export Handler
    const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

    const handleExportPdf = async () => {
        if (!pages || pages.length === 0) return;

        setIsUploading(true); // Re-use loading state
        setPdfProgress({ current: 0, total: pages.length });

        try {
            const pageIds = pages.map((_, i) => `book-page-${i}`);

            // Wait a sec for any images to load if needed
            await new Promise(r => setTimeout(r, 500));

            const success = await import('../../../utils/pdfGenerator').then(m =>
                m.generatePdf(pageIds, `${bookTitle || 'custom-book'}.pdf`, (current, total) => {
                    setPdfProgress({ current, total });
                })
            );

            if (success) alert("PDF staženo! 📄");
            else throw new Error("PDF generation failed");

        } catch (e) {
            console.error("PDF Error:", e);
            alert("Nepodařilo se vytvořit PDF. Zkuste to prosím znovu.");
        } finally {
            setIsUploading(false);
            setPdfProgress(null);
        }
    };

    return {
        state: {
            bookId, bookTitle, pages, currentPageIndex, suggestion, isGeneratingImage, isUploading,
            magicMirrorUrl, showPublishDialog, publishBookId, currentAchievement, isUploadingMirror,
            maxPages, userBalance, selectedVoice, selectedStyle, continuityImageUrl, isExpertMode,
            showDictionary, dictionaryQuery, dictionaryResult, isSearchingDict, activeReference,
            costPerImage, hasEnoughEnergy, geminiLoading, saving, pdfProgress, currentPage
        },
        actions: {
            setBookTitle, setPages, setCurrentPageIndex, setSuggestion,
            setMagicMirrorUrl, setShowPublishDialog, setPublishBookId, setCurrentAchievement,
            setMaxPages, setSelectedVoice, setSelectedStyle, setIsExpertMode, setShowDictionary,
            setDictionaryQuery, setDictionaryResult, setIsSearchingDict,
            handleTextChange, handleNewBook, addNewPage, handleSave, handleGeminiAssist,
            acceptSuggestion, dismissSuggestion, handleGenerateScene, handleMagicMirrorUpload,
            handlePhotoUpload, handleExportPdf, searchDictionary, generateImagePrompt, startGuide
        },
        refs: {
            fileInputRef, magicMirrorInputRef
        }
    };
};
