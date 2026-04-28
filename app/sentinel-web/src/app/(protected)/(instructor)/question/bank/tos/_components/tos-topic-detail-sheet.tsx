import {
    Badge,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@sentinel/ui';
import type { TosMatrixRow } from '@sentinel/services';
import type { BloomLevel } from '@sentinel/services';
import {
    BLOOM_LEVELS,
    BLOOM_LEVEL_LABELS,
    BLOOM_LEVEL_COLORS,
} from '../_constants';

export type TosTopicDetailSheetProps = {
    row: TosMatrixRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TosTopicDetailSheet({ row, open, onOpenChange }: TosTopicDetailSheetProps) {
    if (!row) return null;

    const entries = BLOOM_LEVELS.map((level) => ({
        level,
        label: BLOOM_LEVEL_LABELS[level],
        count: row.counts[level as BloomLevel] ?? 0,
    }));

    const maxCount = Math.max(...entries.map((e) => e.count), 1);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="text-lg font-bold">{row.topic}</SheetTitle>
                    <SheetDescription>
                        Bloom&apos;s Taxonomy distribution for this topic
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 px-4 py-4">
                    {/* Summary badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Total questions:</span>
                        <Badge className="bg-[#323d8f] text-white">{row.total}</Badge>
                    </div>

                    {/* Bar chart-style breakdown */}
                    <div className="space-y-3">
                        {entries.map(({ level, label, count }) => (
                            <div key={level} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BLOOM_LEVEL_COLORS[level as BloomLevel]}`}
                                    >
                                        {label}
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums">
                                        {count}
                                    </span>
                                </div>
                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                    <div
                                        className="h-full rounded-full bg-[#323d8f] transition-all duration-500"
                                        style={{
                                            width: `${Math.round((count / maxCount) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Higher-order vs lower-order summary */}
                    <div className="bg-muted/50 mt-2 rounded-lg p-3 text-sm">
                        <p className="mb-2 font-medium">Cognitive Distribution</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-muted-foreground text-xs">Lower Order</p>
                                <p className="font-semibold">
                                    {(row.counts['REMEMBERING'] ?? 0) +
                                        (row.counts['UNDERSTANDING'] ?? 0) +
                                        (row.counts['APPLYING'] ?? 0)}{' '}
                                    <span className="text-muted-foreground font-normal">
                                        (R + U + Ap)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Higher Order</p>
                                <p className="font-semibold">
                                    {(row.counts['ANALYZING'] ?? 0) +
                                        (row.counts['EVALUATING'] ?? 0) +
                                        (row.counts['CREATING'] ?? 0)}{' '}
                                    <span className="text-muted-foreground font-normal">
                                        (An + E + C)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
