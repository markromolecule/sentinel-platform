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
    const selectedCountLabel = selectedCount === 1 ? '1 selected' : `${selectedCount} selected`;

    return (
        <div className="flex min-h-[184px] flex-col">
            <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-[15px] font-semibold">{title}</p>
                <span className="bg-muted/30 text-muted-foreground rounded-full border px-2.5 py-1 text-[10px] font-medium whitespace-nowrap">
                    {selectedCountLabel}
                </span>
            </div>

            <div className="mt-1 min-h-[60px]">
                {helperText && (
                    <p className="text-muted-foreground text-[12px] leading-5">{helperText}</p>
                )}
                {headerActionSlot && <div className="mt-1.5">{headerActionSlot}</div>}
            </div>

            <div className="border-border/60 mt-2 min-h-[48px] border-t pt-2">
                <p className="text-foreground/80 text-[12px] leading-5">
                    {selectionSummary}
                </p>
            </div>

            <div className="mt-auto pt-3">
                {actionSlot ?? <div className="h-10" aria-hidden="true" />}
            </div>
        </div>
    );
}
