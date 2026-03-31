interface SelectionPreviewProps {
    title: string;
    items: string[];
    emptyLabel: string;
    accent?: boolean;
    visibleLimit?: number;
}

export function SelectionPreview({
    title,
    items,
    emptyLabel,
    accent = false,
    visibleLimit = 6,
}: SelectionPreviewProps) {
    return (
        <div
            className={`rounded-xl border px-3 py-3 ${
                accent ? 'border-[#323d8f]/20 bg-[#323d8f]/5' : 'bg-background'
            }`}
        >
            <p className="text-foreground text-sm font-semibold">{title}</p>

            {items.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {items.slice(0, visibleLimit).map((item) => (
                        <span
                            key={item}
                            className="bg-background/80 text-foreground rounded-full border px-2.5 py-1 text-xs font-medium"
                        >
                            {item}
                        </span>
                    ))}
                    {items.length > visibleLimit && (
                        <span className="text-muted-foreground rounded-full border px-2.5 py-1 text-xs">
                            +{items.length - visibleLimit}
                        </span>
                    )}
                </div>
            ) : (
                <p className="text-muted-foreground mt-2 text-sm leading-5">{emptyLabel}</p>
            )}
        </div>
    );
}
