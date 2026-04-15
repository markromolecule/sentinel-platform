import { type ReactNode } from 'react';

interface SelectionPanelHeaderProps {
    title: string;
    selectedCount: number;
    helperText?: string;
    selectionSummary?: string;
    headerActionSlot?: ReactNode;
    actionSlot?: ReactNode;
}

export function SelectionPanelHeader({
    title,
    selectedCount,
    helperText,
    selectionSummary,
    headerActionSlot,
    actionSlot,
}: SelectionPanelHeaderProps) {
    return (
        <div className="flex flex-col gap-3">
            {/* Header Top & Mid: Title and Descriptions */}
            <div className="min-h-[96px] space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-foreground text-[14px] font-bold uppercase tracking-tight">
                            {title}
                        </p>
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                            {selectedCount} selected
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    {helperText && (
                        <p className="text-muted-foreground text-[11px] leading-relaxed italic">
                            {helperText}
                        </p>
                    )}
                    {selectionSummary && (
                        <p className="text-muted-foreground line-clamp-1 text-[11px] font-medium leading-tight">
                            {selectionSummary}
                        </p>
                    )}
                </div>
            </div>

            {/* Header Bottom: Action Bar (Search & Select All) */}
            <div className="flex min-h-[44px] items-center gap-2">
                <div className="flex-1">{actionSlot}</div>
                {headerActionSlot}
            </div>
        </div>
    );
}
