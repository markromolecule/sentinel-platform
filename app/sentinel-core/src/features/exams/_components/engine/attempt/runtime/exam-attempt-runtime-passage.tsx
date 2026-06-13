'use client';
import type { ExamQuestion } from '@sentinel/shared/types';

type ExamAttemptRuntimePassageProps = {
    showPassagePanel: boolean;
    currentQuestion: ExamQuestion | null;
    currentContext: {
        title: string;
        description: string;
        body: string;
    };
};

export function ExamAttemptRuntimePassage({
    showPassagePanel,
    currentQuestion,
    currentContext,
}: ExamAttemptRuntimePassageProps) {
    if (!showPassagePanel || !currentQuestion) {
        return null;
    }

    return (
        <div className="flex h-full flex-col">
            <div className="space-y-3">
                <div>
                    <h2 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
                        {currentContext.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {currentContext.description}
                    </p>
                </div>
            </div>

            <div className="border-border/60 mt-4 flex-1 border-y py-4 sm:mt-6 sm:py-6">
                {currentContext.body ? (
                    <div className="text-foreground text-sm leading-7 whitespace-pre-line sm:text-[15px] sm:leading-8">
                        {currentContext.body}
                    </div>
                ) : (
                    <div className="border-border/70 text-muted-foreground border-l-2 border-dashed pl-4 text-sm leading-7">
                        This question currently renders without a separate passage. The right panel
                        stays fully interactive, and the passage panel can be collapsed whenever you
                        want a wider question area.
                    </div>
                )}
            </div>

            <div className="border-border/60 grid gap-0 border-b xl:grid-cols-2">
                <div className="border-border/60 border-r px-0 py-4 xl:pr-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                        Source
                    </p>
                    <p className="text-foreground mt-2 text-sm font-medium">
                        {currentQuestion.sourceFileName ?? 'No linked document'}
                    </p>
                </div>
                <div className="px-0 py-4 xl:pl-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                        Notes
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {currentQuestion.sourcePageNumber !== null &&
                        currentQuestion.sourcePageNumber !== undefined
                            ? `Referenced page ${currentQuestion.sourcePageNumber}.`
                            : 'No page reference was attached for this exam item.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
