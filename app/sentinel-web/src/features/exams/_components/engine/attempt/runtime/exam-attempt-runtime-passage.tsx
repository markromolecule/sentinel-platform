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
                    {currentContext.description ? (
                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                            {currentContext.description}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="border-border/60 mt-4 flex-1 border-y py-4 sm:mt-6 sm:py-6">
                {currentContext.body ? (
                    <div
                        className="text-foreground text-sm leading-7 sm:text-[15px] sm:leading-8"
                        dangerouslySetInnerHTML={{ __html: currentContext.body }}
                    />
                ) : (
                    <div className="border-border/70 text-muted-foreground border-l-2 border-dashed pl-4 text-sm leading-7">
                        No passage is attached to this question yet. The question panel remains
                        fully interactive, and you can collapse this panel for a wider layout.
                    </div>
                )}
            </div>
        </div>
    );
}
