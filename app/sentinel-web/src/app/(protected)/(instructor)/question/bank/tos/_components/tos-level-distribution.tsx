'use client';

import { Card } from '@sentinel/ui';
import type { TosMatrixData } from '@sentinel/services';
import { BLOOM_LEVELS, BLOOM_LEVEL_LABELS, BLOOM_LEVEL_COLORS } from '../_constants';
import type { BloomLevel } from '@sentinel/services';
import { Skeleton } from '@sentinel/ui';

export type TosLevelDistributionProps = {
    data?: TosMatrixData;
    isLoading: boolean;
};

export function TosLevelDistribution({ data, isLoading }: TosLevelDistributionProps) {
    const grandTotal = data?.grandTotal ?? 0;

    return (
        <Card className="p-4">
            <p className="mb-3 text-sm font-semibold">Bloom&apos;s Taxonomy Distribution</p>

            {isLoading ? (
                <div className="space-y-2">
                    {BLOOM_LEVELS.map((l) => (
                        <Skeleton key={l} className="h-8 w-full" />
                    ))}
                </div>
            ) : grandTotal === 0 ? (
                <p className="text-muted-foreground text-sm">No data available yet.</p>
            ) : (
                <div className="space-y-2">
                    {BLOOM_LEVELS.map((level) => {
                        const count = data?.columnTotals[level as BloomLevel] ?? 0;
                        const pct = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;

                        return (
                            <div key={level} className="flex items-center gap-3">
                                <span
                                    className={`w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium ${BLOOM_LEVEL_COLORS[level as BloomLevel]}`}
                                >
                                    {BLOOM_LEVEL_LABELS[level as BloomLevel]}
                                </span>
                                <div className="bg-muted flex-1 overflow-hidden rounded-full">
                                    <div
                                        className="h-5 rounded-full bg-[#323d8f]/80 transition-all duration-700"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums">
                                    {count} ({pct}%)
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
