'use client';

interface GenerationSummaryProps {
    filesCount: number;
    questionCount: number;
}

export function GenerationSummary({ filesCount, questionCount }: GenerationSummaryProps) {
    return (
        <div className="rounded-xl border bg-muted/20 px-4 py-3">
            <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-medium">Generation summary</p>
                    <p className="text-xs text-muted-foreground">
                        {filesCount} source file{filesCount === 1 ? '' : 's'} selected
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-xl font-semibold">{questionCount}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        total questions
                    </p>
                </div>
            </div>
        </div>
    );
}
