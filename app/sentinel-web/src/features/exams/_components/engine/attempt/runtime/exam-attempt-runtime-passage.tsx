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
        <div className="flex h-full min-h-0 min-w-0 flex-col">
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

            <div className="border-border/60 mt-4 min-h-0 flex-1 border-y py-4 sm:mt-6 sm:py-6">
                {currentContext.body ? (
                    <div
                        data-testid="runtime-passage-body"
                        className="text-foreground [&_blockquote]:border-border/60 [&_code]:bg-muted [&_img]:border-border/60 [&_pre]:bg-muted min-w-0 text-sm leading-7 break-words sm:text-[15px] sm:leading-8 [&_a]:break-all [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:px-1.5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:object-contain [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:pl-5"
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
