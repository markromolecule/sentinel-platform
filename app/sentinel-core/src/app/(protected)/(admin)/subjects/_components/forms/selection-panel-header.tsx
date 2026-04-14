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
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <p className="text-foreground text-[14px] font-semibold">{title}</p>
                    <span className="bg-[#323d8f]/10 text-[#323d8f] rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {selectedCount} Selected
                    </span>
                </div>
                {headerActionSlot}
            </div>

            {(helperText || selectionSummary) && (
                <div className="flex flex-col gap-0.5">
                    {helperText && (
                        <p className="text-muted-foreground text-[11px] leading-relaxed italic">{helperText}</p>
                    )}
                    {selectionSummary && (
                        <p className="text-foreground/70 text-[11px] font-medium leading-relaxed">
                            {selectionSummary}
                        </p>
                    )}
                </div>
            )}

            {actionSlot && <div className="pt-1">{actionSlot}</div>}
        </div>
    );
}
