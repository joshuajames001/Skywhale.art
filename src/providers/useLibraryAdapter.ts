import { supabase } from '../lib/supabase';
import { LibraryAdapter, LibraryTab } from '../features/library/LibraryContext';
import { StoryBook } from '../types';

interface UseLibraryAdapterProps {
    onOpenBook: (book: StoryBook) => void;
    onOpenMagic: () => void;
    onCreateCustom: () => void;
    onCreateCard?: () => void;
}

export const useLibraryAdapter = ({
    onOpenBook,
    onOpenMagic,
    onCreateCustom,
    onCreateCard
}: UseLibraryAdapterProps): LibraryAdapter => {

    const fetchBooks = async (tab: LibraryTab, userId?: string): Promise<StoryBook[]> => {
        let data: any[] | null = null;
        let error = null;

        if (tab === 'cards') {
            if (!userId) return [];
            // Fetch Greeting Cards (User's own only)
            const result = await supabase
                .from('books')
                .select('*, pages(*)')
                .eq('owner_id', userId)
                .eq('visual_style', 'card_project_v1')
                .order('created_at', { ascending: false });

            data = result.data;
            error = result.error;

        } else if (tab === 'private') {
            if (!userId) return [];
            // Private: user's own books (Excluding Cards)
            const result = await supabase
                .from('books')
                .select('*, pages(*)')
                .eq('owner_id', userId)
                .neq('visual_style', 'card_project_v1')
                .order('created_at', { ascending: false });

            data = result.data;
            error = result.error;

        } else if (tab === 'favorites') {
            if (!userId) return [];
            // 1. Get favorite book IDs
            const favResult = await supabase
                .from('user_favorites')
                .select('book_id')
                .eq('user_id', userId);

            if (favResult.error) throw favResult.error;

            const favBookIds = favResult.data.map((f: any) => f.book_id);

            if (favBookIds.length === 0) {
                data = [];
            } else {
                // 2. Fetch books
                const booksResult = await supabase
                    .from('books')
                    .select('*, pages(*)')
                    .in('id', favBookIds)
                    .order('created_at', { ascending: false });

                if (booksResult.error) {
                    error = booksResult.error;
                } else {
                    // 3. Fetch authors
                    const ownerIds = [...new Set(booksResult.data.map((b: any) => b.owner_id))];
                    const profilesResult = await supabase
                        .from('profiles')
                        .select('id, nickname, avatar_emoji')
                        .in('id', ownerIds);

                    const profilesMap = new Map((profilesResult.data || []).map((p: any) => [p.id, p]));
                    data = booksResult.data.map((book: any) => ({
                        ...book,
                        profiles: profilesMap.get(book.owner_id)
                    }));
                }
            }

        } else {
            // Public: all public books (excluding cards)
            const booksResult = await supabase
                .from('books')
                .select('*, pages(*)')
                .eq('is_public', true)
                .neq('visual_style', 'card_project_v1')
                .order('created_at', { ascending: false });

            if (booksResult.error) {
                error = booksResult.error;
            } else {
                const ownerIds = [...new Set(booksResult.data.map((b: any) => b.owner_id))];
                const profilesResult = await supabase
                    .from('profiles')
                    .select('id, nickname, avatar_emoji')
                    .in('id', ownerIds);

                const profilesMap = new Map(
                    (profilesResult.data || []).map((p: any) => [p.id, p])
                );

                data = booksResult.data.map((book: any) => ({
                    ...book,
                    profiles: profilesMap.get(book.owner_id)
                }));
            }
        }

        if (error) throw error;

        // Data Mapper: Normalize DB columns to Application Domain Model
        return (data || []).map((book: any) => ({
            ...book,
            book_id: book.id,
            cover_image: book.cover_image_url,
            author_id: book.owner_id,
            author_profile: book.profiles,
            author: book.profiles?.nickname || 'Unknown',
            pages: (book.pages || [])
                .sort((a: any, b: any) => (a.page_number ?? a.page_index) - (b.page_number ?? b.page_index))
                .map((p: any) => ({
                    ...p,
                    page_number: p.page_number || p.page_index,
                    text: p.content,
                    is_generated: !!p.image_url,
                    layout_type: p.layout_type || 'standard'
                }))
        }));
    };

    const togglePublicStatus = async (bookId: string, currentStatus: boolean, userId: string): Promise<boolean> => {
        const newStatus = !currentStatus;
        const { error } = await supabase
            .from('books')
            .update({ is_public: newStatus })
            .eq('id', bookId)
            .eq('owner_id', userId);

        return !error;
    };

    const deleteBook = async (bookId: string, userId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', bookId)
            .eq('owner_id', userId);

        return !error;
    };

    const getFavoriteIds = async (userId: string): Promise<string[]> => {
        const { data, error } = await supabase
            .from('user_favorites')
            .select('book_id')
            .eq('user_id', userId);
        if (error || !data) return [];
        return data.map((row: any) => row.book_id);
    };

    const toggleFavorite = async (bookId: string, isFavorite: boolean, userId: string): Promise<void> => {
        if (isFavorite) {
            await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', userId)
                .eq('book_id', bookId);
        } else {
            await supabase
                .from('user_favorites')
                .insert({ user_id: userId, book_id: bookId });
        }
    };

    return {
        fetchBooks,
        togglePublicStatus,
        deleteBook,
        toggleFavorite,
        getFavoriteIds,
        onOpenBook,
        onOpenMagic,
        onCreateCustom,
        onCreateCard
    };
};
