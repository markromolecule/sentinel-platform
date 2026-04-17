'use client';

import { useState } from 'react';
import { Badge, Button, Progress, cn } from '@sentinel/ui';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { ExamQuestionRenderer } from '@/features/exams/_components/engine';
import {
    PreviewFooterNav,
    PreviewPageShell,
} from '../_components/preview-page-shell';
import { PreviewLoadingState } from '../_components/preview-loading-state';
import { usePreviewExamData } from '../_hooks/use-preview-exam-data';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export default function ExamPreviewAttemptPage() {
    const { examId, sessionId, exam, questions, isLoading } = usePreviewExamData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExamAnswerValue>>({});

    if (isLoading) {
        return <PreviewLoadingState />;
    }

    const safeQuestionIndex = questions.length
        ? Math.min(currentQuestionIndex, questions.length - 1)
        : 0;
    const currentQuestion = questions[safeQuestionIndex] ?? null;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

    const handleAnswerChange = (questionId: string, value: ExamAnswerValue) => {
        setSelectedAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
    };

    return (
        <PreviewPageShell
            examId={examId}
            sessionId={sessionId}
            examTitle={exam?.title ?? 'Exam preview'}
            step="attempt"
            title="Attempt Page"
            description="This route is a dedicated attempt screen preview. It uses the shared question renderer but keeps the overall page as its own student-facing layout."
            footer={
                <PreviewFooterNav
                    examId={examId}
                    sessionId={sessionId}
                    previousStep="lobby"
                />
            }
        >
            <div className="flex min-h-[70vh] flex-col">
                <div className="border-border/60 border-b px-6 py-5 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-amber-700"
                                >
                                    Preview attempt shell
                                </Badge>
                                <Badge variant="secondary">
                                    {answeredCount}/{questions.length} answered
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm leading-6">
                                Final visual fidelity is still blocked by the reference image, but
                                this page is now a standalone attempt screen instead of a nested
                                stage component.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full border border-border/60 bg-muted/20 px-4 py-2 text-sm font-medium">
                                <Clock3 className="mr-2 inline h-4 w-4" />
                                {exam?.duration ?? 0} min
                            </div>
                            <div className="rounded-full border border-border/60 bg-muted/20 px-4 py-2 text-sm font-medium">
                                Q{questions.length ? safeQuestionIndex + 1 : 0}/{questions.length}
                            </div>
                        </div>
                    </div>

                    <Progress value={progress} className="mt-4 h-2" />
                </div>

                <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="px-6 py-8 sm:px-8">
                        {currentQuestion ? (
                            <ExamQuestionRenderer
                                mode="preview"
                                question={currentQuestion}
                                value={selectedAnswers[currentQuestion.id]}
                                onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                showCorrectAnswer
                            />
                        ) : (
                            <div className="rounded-[28px] border border-border/60 border-dashed px-6 py-8 text-sm leading-7">
                                Add questions to the exam builder to preview the attempt page.
                            </div>
                        )}

                        {currentQuestion ? (
                            <div className="mt-8 flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
                                    }
                                    disabled={safeQuestionIndex === 0}
                                >
                                    Previous question
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setCurrentQuestionIndex((current) =>
                                            Math.min(current + 1, questions.length - 1),
                                        )
                                    }
                                    disabled={safeQuestionIndex === questions.length - 1}
                                >
                                    Next question
                                </Button>
                            </div>
                        ) : null}
                    </section>

                    <aside className="border-border/60 border-t bg-muted/20 lg:border-t-0 lg:border-l">
                        <div className="px-5 py-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
                                    Question list
                                </h3>
                                <Badge variant="secondary">{questions.length} items</Badge>
                            </div>

                            <div className="grid gap-2">
                                {questions.map((question, index) => {
                                    const isActive = safeQuestionIndex === index;
                                    const isAnswered = selectedAnswers[question.id] !== undefined;

                                    return (
                                        <button
                                            key={question.id}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={cn(
                                                'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                                                isActive
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border/60 bg-background hover:bg-muted/40',
                                            )}
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Question {index + 1}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xs',
                                                        isActive
                                                            ? 'text-primary-foreground/80'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {question.type.replaceAll('_', ' ')}
                                                </p>
                                            </div>

                                            {isAnswered ? (
                                                <CheckCircle2
                                                    className={cn(
                                                        'h-4 w-4',
                                                        isActive
                                                            ? 'text-primary-foreground'
                                                            : 'text-emerald-600',
                                                    )}
                                                />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </PreviewPageShell>
    );
}
