import React from 'react';
import { StoryBook, StoryPage } from '../../../types';
import { BookCover } from './BookCover';
import { StorySpread } from './StorySpread';

interface HiddenPdfTemplateProps {
    story: StoryBook;
    isExportingPdf: boolean;
}

export const HiddenPdfTemplate: React.FC<HiddenPdfTemplateProps> = ({ story, isExportingPdf }) => {
    if (!isExportingPdf) return null;

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', height: '1123px' }}>
            {/* Cover */}
            <div id="book-page-0" style={{ width: '794px', height: '1123px' }}>
                <BookCover
                    book={story}
                    onOpen={() => { }}
                    onUpdateCover={() => { }}
                    onUploadImage={async () => null}
                    tier={story.tier}
                    referenceImageUrl={story.character_sheet_url}
                />
            </div>

            {/* Pages */}
            {story.pages.map((page) => (
                <div key={page.page_number} id={`book-page-${page.page_number}`} style={{ width: '794px', height: '1123px' }}>
                    <StorySpread
                        page={page}
                        bookId={story.book_id}
                        onUpdatePage={() => { }}
                        onUploadImage={async () => null}
                        visualDna={story.visual_dna || story.main_character}
                        mainCharacter={story.main_character}
                        setting={story.setting}
                        visualStyle={story.visual_style}
                        tier={story.tier}
                        referenceImageUrl={story.character_sheet_url || story.identity_image_slot || (story as any).visual_dna_image}
                        characterSeed={story.character_seed}
                    />
                </div>
            ))}
        </div>
    );
};
