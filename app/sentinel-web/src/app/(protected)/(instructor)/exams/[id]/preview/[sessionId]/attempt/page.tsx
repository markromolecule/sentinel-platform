'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Badge,
    Button,
    Separator,
    Switch,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    cn,
} from '@sentinel/ui';
import {
    Bookmark,
    BookmarkCheck,
    CircleOff,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Flag,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import {
    ExamAttemptShell,
    ExamQuestionRenderer,
    getExamContextDetails,
} from '@/features/exams/_components/engine';
import { PreviewHeader } from '../_components/common/preview-header';
import { buildPreviewHref } from '../_components/preview-page-shell';
import { PreviewLoadingState } from '../_components/preview-loading-state';
import { usePreviewExamData } from '../_hooks/use-preview-exam-data';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

type CrossedOutOptionsState = Record<string, number[]>;

function hasAnswer(value: ExamAnswerValue) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some((item) =>
            typeof item === 'string' ? item.trim().length > 0 : item !== null && item !== undefined,
        );
    }

    return Object.values(value).some((item) => item.trim().length > 0);
}

function formatTimer(totalSeconds: number) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
    }

    return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export default function ExamPreviewAttemptPage() {
    const { examId, sessionId, exam, questions, isLoading } = usePreviewExamData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExamAnswerValue>>({});
    const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(true);
    const [showPassagePanel, setShowPassagePanel] = useState(true);
    const [crossOutEnabled, setCrossOutEnabled] = useState(false);
    const [crossedOutOptions, setCrossedOutOptions] = useState<CrossedOutOptionsState>({});
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!exam?.duration) {
            return;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [exam?.duration]);

    const safeQuestionIndex = questions.length
        ? Math.min(currentQuestionIndex, questions.length - 1)
        : 0;
    const currentQuestion = questions[safeQuestionIndex] ?? null;
    const answeredQuestionIds = Object.entries(selectedAnswers)
        .filter(([, value]) => hasAnswer(value))
        .map(([questionId]) => questionId);
    const answeredCount = answeredQuestionIds.length;
    const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
    const secondsRemaining = Math.max((exam?.duration ?? 0) * 60 - elapsedSeconds, 0);
    const reviewSet = new Set(reviewQuestionIds);
    const isCurrentQuestionFlagged = currentQuestion ? reviewSet.has(currentQuestion.id) : false;
    const currentContext = getExamContextDetails({
        questionBody: currentQuestion?.sourceEvidence,
        questionPassageContent: currentQuestion?.passageContent,
        questionPassageType: currentQuestion?.passageType,
        questionSourceFileName: currentQuestion?.sourceFileName,
        questionSourcePageNumber: currentQuestion?.sourcePageNumber,
        examDescription: exam?.description,
    });
    const currentCrossedOutOptions = currentQuestion
        ? (crossedOutOptions[currentQuestion.id] ?? [])
        : [];

    if (isLoading) {
        return <PreviewLoadingState />;
    }

    const handleAnswerChange = (questionId: string, value: ExamAnswerValue) => {
        setSelectedAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
    };

    const handleToggleReview = (questionId: string) => {
        setReviewQuestionIds((current) =>
            current.includes(questionId)
                ? current.filter((existingId) => existingId !== questionId)
                : [...current, questionId],
        );
    };

    const handleToggleCrossOutOption = (questionId: string, optionIndex: number) => {
        setCrossedOutOptions((current) => {
            const existingIndexes = current[questionId] ?? [];
            const nextIndexes = existingIndexes.includes(optionIndex)
                ? existingIndexes.filter((existingIndex) => existingIndex !== optionIndex)
                : [...existingIndexes, optionIndex].sort((left, right) => left - right);

            return {
                ...current,
                [questionId]: nextIndexes,
            };
        });
    };

    const moveQuestionIndex = (direction: 'previous' | 'next') => {
        setCurrentQuestionIndex((current) => {
            if (direction === 'previous') {
                return Math.max(current - 1, 0);
            }

            return Math.min(current + 1, questions.length - 1);
        });
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden">
            <PreviewHeader examId={examId} badgeLabel="Attempt preview" />

            <div className="bg-background flex min-h-0 flex-1 overflow-hidden">
                <ExamAttemptShell
                    mode="preview"
                    title={exam?.title ?? 'Exam preview'}
                    timerLabel={formatTimer(secondsRemaining)}
                    status={
                        <Badge variant="outline" className="rounded-md px-3 py-1">
                            Question {questions.length ? safeQuestionIndex + 1 : 0} of{' '}
                            {questions.length}
                        </Badge>
                    }
                    toolbar={
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Badge variant="secondary" className="rounded-md px-3 py-1">
                                {answeredCount}/{questions.length} answered
                            </Badge>
                            <Badge variant="secondary" className="rounded-md px-3 py-1">
                                {reviewQuestionIds.length} flagged
                            </Badge>
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="rounded-md"
                                            onClick={() =>
                                                setShowPassagePanel((current) => !current)
                                            }
                                        >
                                            {showPassagePanel ? (
                                                <PanelLeftClose className="h-4 w-4" />
                                            ) : (
                                                <PanelLeftOpen className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {showPassagePanel
                                            ? 'Hide passage panel'
                                            : 'Show passage panel'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="rounded-md px-4"
                            >
                                <Link href={buildPreviewHref(examId, sessionId, 'lobby')}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Exit
                                </Link>
                            </Button>
                        </div>
                    }
                    questionRail={questions.map((question, index) => {
                        const isActive = safeQuestionIndex === index;
                        const isAnswered = answeredQuestionIds.includes(question.id);
                        const isFlagged = reviewSet.has(question.id);

                        return (
                            <button
                                key={question.id}
                                type="button"
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={cn(
                                    'relative flex h-14 w-14 shrink-0 items-center justify-center border-l-2 px-3 text-sm font-semibold transition lg:h-12 lg:w-full',
                                    isActive
                                        ? 'border-primary bg-primary/5 text-foreground'
                                        : 'text-muted-foreground hover:border-border hover:bg-muted/20 hover:text-foreground border-transparent bg-transparent',
                                )}
                                aria-current={isActive ? 'step' : undefined}
                                aria-label={`Question ${index + 1}`}
                            >
                                {index + 1}
                                {isAnswered ? (
                                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-emerald-500" />
                                ) : null}
                                {isFlagged ? (
                                    <Flag className="absolute right-2 bottom-2 h-3 w-3 text-amber-600" />
                                ) : null}
                            </button>
                        );
                    })}
                    passagePanel={
                        showPassagePanel && currentQuestion ? (
                            <div className="flex h-full flex-col">
                                <div className="space-y-3">
                                    <div>
                                        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                                            {currentContext.title}
                                        </h2>
                                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                                            {currentContext.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-border/60 mt-6 flex-1 border-y py-6">
                                    {currentContext.body ? (
                                        <div
                                            className="text-foreground text-[15px] leading-8"
                                            dangerouslySetInnerHTML={{
                                                __html: currentContext.body,
                                            }}
                                        />
                                    ) : (
                                        <div className="border-border/70 text-muted-foreground border-l-2 border-dashed pl-4 text-sm leading-7">
                                            This question currently renders without a separate
                                            passage. The right panel stays fully interactive, and
                                            the passage panel can be collapsed whenever you want a
                                            wider question area.
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
                                                : 'No page reference was attached for this preview item.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : undefined
                    }
                    footer={
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="rounded-md px-3 py-1">
                                    {progress}% complete
                                </Badge>
                                {isCurrentQuestionFlagged ? (
                                    <Badge
                                        variant="outline"
                                        className="rounded-md border-amber-300 bg-amber-50 px-3 py-1 text-amber-700"
                                    >
                                        Flagged for review
                                    </Badge>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => moveQuestionIndex('previous')}
                                    disabled={!questions.length || safeQuestionIndex === 0}
                                    className="rounded-md"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                                <div className="border-border/60 bg-muted/20 border px-4 py-2 text-sm font-medium">
                                    Question {questions.length ? safeQuestionIndex + 1 : 0} of{' '}
                                    {questions.length}
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => moveQuestionIndex('next')}
                                    disabled={
                                        !questions.length ||
                                        safeQuestionIndex === questions.length - 1
                                    }
                                    className="rounded-md"
                                >
                                    {safeQuestionIndex === questions.length - 1
                                        ? 'End of preview'
                                        : 'Next'}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    }
                >
                    {currentQuestion ? (
                        <div className="space-y-6">
                            <div className="space-y-5">
                                <div className="border-border/60 flex flex-col gap-4 border-t border-b py-4">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <label className="flex items-center gap-3 text-sm font-medium">
                                                <Switch
                                                    checked={showCorrectAnswer}
                                                    onCheckedChange={setShowCorrectAnswer}
                                                />
                                                <span className="flex items-center gap-2">
                                                    {showCorrectAnswer ? (
                                                        <Eye className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <EyeOff className="text-muted-foreground h-4 w-4" />
                                                    )}
                                                    Show correct answer
                                                </span>
                                            </label>
                                            <Separator
                                                orientation="vertical"
                                                className="hidden h-6 xl:block"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className={cn(
                                                    'rounded-md px-3',
                                                    isCurrentQuestionFlagged
                                                        ? 'text-amber-700 hover:text-amber-800'
                                                        : '',
                                                )}
                                                onClick={() =>
                                                    handleToggleReview(currentQuestion.id)
                                                }
                                            >
                                                {isCurrentQuestionFlagged ? (
                                                    <BookmarkCheck className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Bookmark className="mr-2 h-4 w-4" />
                                                )}
                                                {isCurrentQuestionFlagged
                                                    ? 'Flagged'
                                                    : 'Mark for review'}
                                            </Button>
                                            <Separator
                                                orientation="vertical"
                                                className="hidden h-6 xl:block"
                                            />
                                            <Button
                                                type="button"
                                                variant={crossOutEnabled ? 'default' : 'ghost'}
                                                className="rounded-md px-3"
                                                onClick={() =>
                                                    setCrossOutEnabled((current) => !current)
                                                }
                                            >
                                                <CircleOff className="mr-2 h-4 w-4" />
                                                {crossOutEnabled
                                                    ? 'Cross-out enabled'
                                                    : 'Enable cross-out'}
                                            </Button>
                                        </div>
                                    </div>
                                    <ExamQuestionRenderer
                                        mode="preview"
                                        question={currentQuestion}
                                        value={selectedAnswers[currentQuestion.id]}
                                        onChange={(value) =>
                                            handleAnswerChange(currentQuestion.id, value)
                                        }
                                        showCorrectAnswer={showCorrectAnswer}
                                        crossOutEnabled={crossOutEnabled}
                                        crossedOutOptions={currentCrossedOutOptions}
                                        onToggleOptionCrossOut={(optionIndex) =>
                                            handleToggleCrossOutOption(
                                                currentQuestion.id,
                                                optionIndex,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-border/60 text-muted-foreground border border-dashed px-6 py-8 text-sm leading-7">
                            Add questions to the exam builder to preview the attempt page.
                        </div>
                    )}
                </ExamAttemptShell>
            </div>
        </div>
    );
}
