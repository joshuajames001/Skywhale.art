interface StickerToolsSectionProps {
    onAddSticker: (sticker: any) => void;
    stickerList: any[];
}

export const StickerToolsSection = ({ onAddSticker, stickerList }: StickerToolsSectionProps) => (
    <div className="flex flex-col gap-4 pb-8">
        <div className="grid grid-cols-4 gap-2">
            {stickerList.map((sticker: any) => (
                <button key={sticker.id} onClick={() => onAddSticker(sticker)}
                    className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl transition-transform hover:scale-110">
                    {sticker.content}
                </button>
            ))}
        </div>
    </div>
);
