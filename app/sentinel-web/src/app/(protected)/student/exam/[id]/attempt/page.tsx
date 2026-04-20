'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scoreExamAttempt } from '@sentinel/shared';
import type { ExamAttemptAnswers } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import {
    ExamAttemptShell,
    type ExamAnswerValue,
    hasAnswer,
    formatTimer,
    getExamContextDetails,
    ExamAttemptRuntimeHeader,
    ExamAttemptRuntimeFooter,
    ExamAttemptRuntimeNavigation,
    ExamAttemptRuntimePassage,
    ExamAttemptRuntimeSecurity,
    ExamAttemptRuntimeQuestion,
} from '@/features/exams/_components/engine';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { useExamMonitoring } from '../_hooks/use-exam-monitoring';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useExamSession } from '../_hooks/use-exam-session';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { writeStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';

export default function StudentExamAttemptPage() {
    const router = useRouter();
    const { examId, exam, configuration, questions, isLoading } = useStudentExamData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExamAnswerValue>>({});
    const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
    const [showPassagePanel, setShowPassagePanel] = useState(true);
    const [crossOutEnabled, setCrossOutEnabled] = useState(false);
    const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, number[]>>({});
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [isRedirectingToTurnIn, setIsRedirectingToTurnIn] = useState(false);

    const { examSession, isInitializingSession, elapsedSeconds, secondsRemaining } = useExamSession(
        {
            examId,
            examDurationMinutes: exam?.duration,
            runtimeAccess: exam?.runtimeAccess,
            isLoadingData: isLoading,
            isSessionStartBlocked:
                exam?.status === 'turned_in' ||
                (Boolean(exam?.runtimeAccess) &&
                    !exam?.runtimeAccess?.canStart &&
                    !exam?.runtimeAccess?.canResume),
            onInitializeAnswers: setSelectedAnswers,
        },
    );
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    const effectiveConfiguration = examSession?.configSnapshot?.configuration ?? configuration;
    const { securityLockReason, isResumingExam, resumeSecuredExam, fullScreenContainerRef } =
        useExamMonitoring({
            examId,
            configuration: effectiveConfiguration,
            examSessionId: examSession?.sessionId,
        });

    if (isLoading || isInitializingSession || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const safeQuestionIndex = questions.length
        ? Math.min(currentQuestionIndex, questions.length - 1)
        : 0;
    const currentQuestion = questions[safeQuestionIndex] ?? null;
    const answeredQuestionIds = Object.entries(selectedAnswers)
        .filter(([, value]) => hasAnswer(value))
        .map(([questionId]) => questionId);
    const answeredCount = answeredQuestionIds.length;
    const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
    const unansweredQuestions = questions.filter(
        (question) => !hasAnswer(selectedAnswers[question.id] ?? null),
    );
    const unansweredCount = unansweredQuestions.length;
    const unansweredQuestionLabels = unansweredQuestions.slice(0, 8).map((question, index) => {
        const qIndex = questions.findIndex((q) => q.id === question.id);
        return `Q${qIndex >= 0 ? qIndex + 1 : index + 1}`;
    });

    const isCurrentQuestionFlagged = currentQuestion
        ? reviewQuestionIds.includes(currentQuestion.id)
        : false;
    const currentContext = getExamContextDetails({
        questionBody: currentQuestion?.sourceEvidence,
        questionSourceFileName: currentQuestion?.sourceFileName,
        questionSourcePageNumber: currentQuestion?.sourcePageNumber,
        examDescription: exam?.description,
    });

    const handleAnswerChange = (questionId: string, value: ExamAnswerValue) => {
        setSelectedAnswers((current) => ({ ...current, [questionId]: value }));
    };

    const handleToggleReview = (questionId: string) => {
        setReviewQuestionIds((current) =>
            current.includes(questionId)
                ? current.filter((id) => id !== questionId)
                : [...current, questionId],
        );
    };

    const handleToggleCrossOutOption = (questionId: string, optionIndex: number) => {
        setCrossedOutOptions((current) => {
            const existing = current[questionId] ?? [];
            const next = existing.includes(optionIndex)
                ? existing.filter((i) => i !== optionIndex)
                : [...existing, optionIndex].sort((a, b) => a - b);
            return { ...current, [questionId]: next };
        });
    };

    const moveQuestionIndex = (direction: 'previous' | 'next') => {
        setCurrentQuestionIndex((current) =>
            direction === 'previous'
                ? Math.max(current - 1, 0)
                : Math.min(current + 1, questions.length - 1),
        );
    };

    const proceedToTurnInReview = () => {
        if (isRedirectingToTurnIn || !examSession?.sessionId) return;
        setIsRedirectingToTurnIn(true);

        const summary = scoreExamAttempt({
            questions,
            answers: selectedAnswers as ExamAttemptAnswers,
        });

        writeStoredExamTurnInPreview({
            examId,
            sessionId: examSession.sessionId,
            answers: selectedAnswers as ExamAttemptAnswers,
            elapsedSeconds,
            summary,
            storedAt: new Date().toISOString(),
        });

        router.push(`/student/exam/${examId}/result`);
    };

    const handleSubmit = () => {
        if (questions.length === 0) return;
        if (unansweredCount > 0) {
            setIsSubmitDialogOpen(true);
            return;
        }
        proceedToTurnInReview();
    };

    return (
        <div
            ref={(node) => {
                if (fullScreenContainerRef) {
                    fullScreenContainerRef.current = node;
                }
            }}
            className="bg-background flex h-screen flex-col overflow-hidden"
        >
            <ExamAttemptRuntimeSecurity
                isSubmitDialogOpen={isSubmitDialogOpen}
                onOpenChangeSubmitDialog={setIsSubmitDialogOpen}
                unansweredCount={unansweredCount}
                unansweredQuestionLabels={unansweredQuestionLabels}
                isRedirectingToTurnIn={isRedirectingToTurnIn}
                onProceedToTurnIn={proceedToTurnInReview}
                securityLockReason={securityLockReason}
                isResumingExam={isResumingExam}
                onResumeExam={resumeSecuredExam}
            />

            <div className="bg-background flex min-h-0 flex-1 overflow-hidden">
                <ExamAttemptShell
                    mode="runtime"
                    title={exam?.title ?? 'Exam attempt'}
                    timerLabel={formatTimer(secondsRemaining)}
                    status={
                        <Badge
                            variant="outline"
                            className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                        >
                            Question {questions.length ? safeQuestionIndex + 1 : 0} of{' '}
                            {questions.length}
                        </Badge>
                    }
                    toolbar={
                        <ExamAttemptRuntimeHeader
                            answeredCount={answeredCount}
                            totalQuestions={questions.length}
                            flaggedCount={reviewQuestionIds.length}
                            showPassagePanel={showPassagePanel}
                            onTogglePassagePanel={() => setShowPassagePanel((c) => !c)}
                            onSubmit={handleSubmit}
                            isSubmitting={isRedirectingToTurnIn}
                        />
                    }
                    questionRail={
                        <ExamAttemptRuntimeNavigation
                            questions={questions}
                            currentQuestionIndex={safeQuestionIndex}
                            onQuestionSelect={setCurrentQuestionIndex}
                            answeredQuestionIds={answeredQuestionIds}
                            reviewQuestionIds={reviewQuestionIds}
                        />
                    }
                    passagePanel={
                        <ExamAttemptRuntimePassage
                            showPassagePanel={showPassagePanel}
                            currentQuestion={currentQuestion}
                            currentContext={currentContext}
                        />
                    }
                    footer={
                        <ExamAttemptRuntimeFooter
                            progress={progress}
                            isFlagged={isCurrentQuestionFlagged}
                            onMove={moveQuestionIndex}
                            currentQuestionIndex={safeQuestionIndex}
                            totalQuestions={questions.length}
                            isLastQuestion={safeQuestionIndex === questions.length - 1}
                            onSubmit={handleSubmit}
                            isSubmitting={isRedirectingToTurnIn}
                        />
                    }
                >
                    {currentQuestion ? (
                        <ExamAttemptRuntimeQuestion
                            currentQuestion={currentQuestion}
                            selectedAnswer={selectedAnswers[currentQuestion.id]}
                            onAnswerChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                            isFlagged={isCurrentQuestionFlagged}
                            onToggleFlag={() => handleToggleReview(currentQuestion.id)}
                            crossOutEnabled={crossOutEnabled}
                            onToggleCrossOutMode={() => setCrossOutEnabled((c) => !c)}
                            crossedOutOptions={crossedOutOptions[currentQuestion.id] ?? []}
                            onToggleOptionCrossOut={(idx) =>
                                handleToggleCrossOutOption(currentQuestion.id, idx)
                            }
                        />
                    ) : (
                        <div className="border-border/60 text-muted-foreground border border-dashed px-6 py-8 text-sm leading-7">
                            This exam does not have any questions assigned yet.
                        </div>
                    )}
                </ExamAttemptShell>
            </div>
        </div>
    );
}
