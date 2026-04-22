'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
} from '@sentinel/ui';
import { scoreExamAttempt } from '@sentinel/shared';
import type { ExamAttemptAnswers } from '@sentinel/shared/types';
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
import {
    useAttemptMediaPipeMonitoring,
    type MediaPipeAttemptIncident,
} from '../_hooks/use-attempt-mediapipe-monitoring';
import { useExamMonitoring } from '../_hooks/use-exam-monitoring';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useExamSession } from '../_hooks/use-exam-session';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { writeStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';
import { resolveStudentExamMediaPipeSandbox } from '../_lib/student-exam-flow';

function getMediaPipeIncidentDialogContent(incident: MediaPipeAttemptIncident) {
    if (incident.eventType === 'NO_FACE_DETECTED') {
        return {
            title: 'Face not detected',
            description:
                'Your face is no longer visible to the exam camera. Return to the camera frame and keep your face centered to continue.',
            actionLabel: 'I am back in frame',
        };
    }

    if (incident.eventType === 'MULTIPLE_FACES') {
        return {
            title: 'Multiple faces detected',
            description:
                'The camera detected more than one person in view. Make sure only you are visible before continuing the exam.',
            actionLabel: 'Only I am visible',
        };
    }

    return {
        title: 'Eyes off screen detected',
        description:
            'MediaPipe detected that your face or gaze moved away from the centered exam posture. Keep your face visible and your eyes oriented toward the screen.',
        actionLabel: 'Continue exam',
    };
}

export default function StudentExamAttemptPage() {
    const router = useRouter();
    const { examId, exam, configuration, mediaPipeSandbox, questions, isLoading } =
        useStudentExamData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExamAnswerValue>>({});
    const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
    const [showPassagePanel, setShowPassagePanel] = useState(true);
    const [crossOutEnabled, setCrossOutEnabled] = useState(false);
    const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, number[]>>({});
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [isRedirectingToTurnIn, setIsRedirectingToTurnIn] = useState(false);

    const { examSession, isInitializingSession, elapsedSeconds, secondsRemaining, syncProgress } =
        useExamSession({
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
        });
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    const effectiveConfiguration = useMemo(
        () => examSession?.configSnapshot?.configuration ?? configuration,
        [configuration, examSession?.configSnapshot?.configuration],
    );
    const effectiveMediaPipeSandbox = useMemo(
        () =>
            resolveStudentExamMediaPipeSandbox({
                configuration: effectiveConfiguration,
                mediaPipeSandbox,
            }),
        [effectiveConfiguration, mediaPipeSandbox],
    );
    const { securityLockReason, isResumingExam, resumeSecuredExam, fullScreenContainerRef } =
        useExamMonitoring({
            examId,
            configuration: effectiveConfiguration,
            examSessionId: examSession?.sessionId,
        });
    const {
        videoRef: mediaPipeVideoRef,
        analysis: mediaPipeAnalysis,
        phase: mediaPipePhase,
        errorMessage: mediaPipeErrorMessage,
        activeIncident: mediaPipeIncident,
        dismissIncident: dismissMediaPipeIncident,
        isEnabled: isMediaPipeEnabled,
    } = useAttemptMediaPipeMonitoring({
        examId,
        configuration: effectiveConfiguration,
        mediaPipeSandbox: effectiveMediaPipeSandbox,
        examSessionId: examSession?.sessionId,
        runtimeAccess: exam?.runtimeAccess,
    });

    useEffect(() => {
        const answeredCount = Object.keys(selectedAnswers).length;
        if (!isInitializingSession && answeredCount > 0) {
            const timer = setTimeout(() => {
                syncProgress(answeredCount);
            }, 2000); // Debounce sync by 2 seconds
            return () => clearTimeout(timer);
        }
    }, [selectedAnswers, isInitializingSession, syncProgress]);

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
    const mediaPipeIncidentDialog = mediaPipeIncident
        ? getMediaPipeIncidentDialogContent(mediaPipeIncident)
        : null;

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

        // Exit full screen mode before redirecting to result/history
        if (typeof document !== 'undefined' && document.fullscreenElement) {
            document.exitFullscreen().catch((err) => {
                console.error('Error attempting to exit full-screen mode:', err);
            });
        }

        router.replace(`/student/exam/${examId}/result`);
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
            <video ref={mediaPipeVideoRef} autoPlay muted playsInline className="hidden" />
            <AlertDialog
                open={Boolean(mediaPipeIncidentDialog)}
                onOpenChange={(open) => {
                    if (!open) {
                        dismissMediaPipeIncident();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{mediaPipeIncidentDialog?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {mediaPipeIncidentDialog?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={dismissMediaPipeIncident}>
                            {mediaPipeIncidentDialog?.actionLabel ?? 'Continue exam'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
            {mediaPipeErrorMessage ? (
                <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {mediaPipeErrorMessage}
                </div>
            ) : null}

            <div className="bg-background flex min-h-0 flex-1 overflow-hidden">
                <ExamAttemptShell
                    mode="runtime"
                    title={exam?.title ?? 'Exam attempt'}
                    timerLabel={formatTimer(secondsRemaining)}
                    status={
                        <>
                            <Badge
                                variant="outline"
                                className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                            >
                                Question {questions.length ? safeQuestionIndex + 1 : 0} of{' '}
                                {questions.length}
                            </Badge>
                            {isMediaPipeEnabled ? (
                                <Badge
                                    variant={mediaPipePhase === 'running' ? 'default' : 'outline'}
                                    className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                                >
                                    MediaPipe {mediaPipeAnalysis?.status ?? mediaPipePhase}
                                </Badge>
                            ) : null}
                        </>
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
