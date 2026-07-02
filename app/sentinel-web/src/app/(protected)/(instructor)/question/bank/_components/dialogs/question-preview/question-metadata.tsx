'use client';

interface QuestionMetadataProps {
    difficulty: string;
    points: number;
    sourceLabel: string;
    sourceEvidence?: string | null;
}

/*
 * Renders the metadata section (difficulty and points) of the question preview.
 */
export function QuestionMetadataSection({
    difficulty,
    points,
    sourceLabel,
    sourceEvidence,
}: QuestionMetadataProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Metadata
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Difficulty</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">{difficulty}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Points</p>
                    <span className="text-sm font-medium">{points} pts</span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Source</p>
                    <span className="text-sm font-medium">{sourceLabel}</span>
                    {sourceEvidence ? (
                        <p className="text-muted-foreground text-xs">
                            Evidence: &quot;{sourceEvidence}&quot;
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
