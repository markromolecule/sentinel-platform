'use client';

interface GenerationSummaryProps {
    filesCount: number;
    questionCount: number;
}

export function GenerationSummary({ filesCount, questionCount }: GenerationSummaryProps) {
    return (
        <div className="bg-muted/20 rounded-xl border px-4 py-3">
            <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-medium">Generation summary</p>
                    <p className="text-muted-foreground text-xs">
                        {filesCount} source file{filesCount === 1 ? '' : 's'} selected
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-xl font-semibold">{questionCount}</p>
                    <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                        total questions
                    </p>
                </div>
            </div>
        </div>
    );
}
