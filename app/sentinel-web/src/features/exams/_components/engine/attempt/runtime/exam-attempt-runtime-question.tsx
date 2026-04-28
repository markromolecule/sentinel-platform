'use client';
import { Bookmark, BookmarkCheck, CircleOff } from 'lucide-react';
import { Button, cn } from '@sentinel/ui';
import type { ExamQuestion } from '@sentinel/shared/types';
import {
    ExamQuestionRenderer,
    type ExamAnswerValue,
} from '@/features/exams/_components/engine';

type ExamAttemptRuntimeQuestionProps = {
    currentQuestion: ExamQuestion;
    selectedAnswer: ExamAnswerValue;
    onAnswerChange: (value: ExamAnswerValue) => void;
    isFlagged: boolean;
    onToggleFlag: () => void;
    crossOutEnabled: boolean;
    onToggleCrossOutMode: () => void;
    crossedOutOptions: number[];
    onToggleOptionCrossOut: (index: number) => void;
};

export function ExamAttemptRuntimeQuestion({
    currentQuestion,
    selectedAnswer,
    onAnswerChange,
    isFlagged,
    onToggleFlag,
    crossOutEnabled,
    onToggleCrossOutMode,
    crossedOutOptions,
    onToggleOptionCrossOut,
}: ExamAttemptRuntimeQuestionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-5">
                <div className="border-border/60 flex flex-col gap-4 border-t border-b py-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className={cn(
                                    'justify-start rounded-md px-3 sm:justify-center',
                                    isFlagged ? 'text-amber-700 hover:text-amber-800' : '',
                                )}
                                onClick={onToggleFlag}
                            >
                                {isFlagged ? (
                                    <BookmarkCheck className="mr-2 h-4 w-4" />
                                ) : (
                                    <Bookmark className="mr-2 h-4 w-4" />
                                )}
                                {isFlagged ? 'Flagged' : 'Mark for review'}
                            </Button>
                            <Button
                                type="button"
                                variant={crossOutEnabled ? 'default' : 'ghost'}
                                className="justify-start rounded-md px-3 sm:justify-center"
                                onClick={onToggleCrossOutMode}
                            >
                                <CircleOff className="mr-2 h-4 w-4" />
                                {crossOutEnabled ? 'Cross-out enabled' : 'Enable cross-out'}
                            </Button>
                        </div>
                    </div>
                    <ExamQuestionRenderer
                        mode="runtime"
                        question={currentQuestion}
                        value={selectedAnswer}
                        onChange={onAnswerChange}
                        showCorrectAnswer={false}
                        crossOutEnabled={crossOutEnabled}
                        crossedOutOptions={crossedOutOptions}
                        onToggleOptionCrossOut={onToggleOptionCrossOut}
                    />
                </div>
            </div>
        </div>
    );
}
