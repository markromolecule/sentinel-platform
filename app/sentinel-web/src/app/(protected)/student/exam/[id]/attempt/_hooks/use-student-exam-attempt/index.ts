'use client';

import { useMemo } from 'react';
import { getExamContextDetails, hasAnswer } from '@/features/exams/_components/engine';
import { useStudentExamData } from '@/app/(protected)/student/exam/[id]/_hooks/use-student-exam-data';
import { useExamSession } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-session';
import { useTurnedInExamRedirect } from '@/app/(protected)/student/exam/[id]/_hooks/use-turned-in-exam-redirect';
import { resolveStudentExamMediaPipeSandbox } from '@/app/(protected)/student/exam/[id]/_lib/student-exam-flow';
import { useAttemptNavigation } from './use-attempt-navigation';
import { useAttemptAnswers } from './use-attempt-answers';
import { useAttemptSync } from './use-attempt-sync';
import { useAttemptUIState } from './use-attempt-ui-state';
import { useAttemptMonitoring } from './use-attempt-monitoring';
import { useAttemptSubmission } from './use-attempt-submission';

export function useStudentExamAttempt() {
    const { examId, exam, configuration, mediaPipeSandbox, questions, isLoading } =
        useStudentExamData();

    const answersHook = useAttemptAnswers();
    const uiHook = useAttemptUIState();

    const {
        examSession,
        isInitializingSession,
        elapsedSeconds,
        secondsRemaining,
        saveAnswerDraft,
        syncProgress,
    } = useExamSession({
        examId,
        examDurationMinutes: exam?.duration,
        runtimeAccess: exam?.runtimeAccess,
        isLoadingData: isLoading,
        isSessionStartBlocked:
            exam?.status === 'turned_in' ||
            (Boolean(exam?.runtimeAccess) &&
                !exam?.runtimeAccess?.canStart &&
                !exam?.runtimeAccess?.canResume),
        onInitializeAnswers: (fn) => answersHook.setSelectedAnswers(fn),
    });

    useAttemptSync({
        isInitializingSession,
        sessionId: examSession?.sessionId,
        elapsedSeconds,
        selectedAnswers: answersHook.selectedAnswers,
        saveAnswerDraft,
        syncProgress,
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

    const navigationHook = useAttemptNavigation({
        totalQuestions: questions.length,
    });

    const monitoringHook = useAttemptMonitoring({
        examId,
        configuration: effectiveConfiguration,
        examSessionId: examSession?.sessionId,
        isRedirectingToTurnIn: uiHook.isRedirectingToTurnIn,
        mediaPipeSandbox: effectiveMediaPipeSandbox,
        runtimeAccess: exam?.runtimeAccess,
    });

    const unansweredQuestions = questions.filter(
        (question) => !hasAnswer(answersHook.selectedAnswers[question.id]),
    );
    const unansweredCount = unansweredQuestions.length;
    const unansweredQuestionLabels = unansweredQuestions.slice(0, 8).map((question, index) => {
        const qIndex = questions.findIndex((q) => q.id === question.id);
        return `Q${qIndex >= 0 ? qIndex + 1 : index + 1}`;
    });

    const submissionHook = useAttemptSubmission({
        examId,
        sessionId: examSession?.sessionId,
        questions,
        selectedAnswers: answersHook.selectedAnswers,
        elapsedSeconds,
        unansweredCount,
        isRedirectingToTurnIn: uiHook.isRedirectingToTurnIn,
        setIsRedirectingToTurnIn: uiHook.setIsRedirectingToTurnIn,
        setIsSubmitDialogOpen: uiHook.setIsSubmitDialogOpen,
        suspendSecurityMonitoring: monitoringHook.suspendSecurityMonitoring,
    });

    const safeQuestionIndex = navigationHook.currentQuestionIndex;
    const currentQuestion = questions[safeQuestionIndex] ?? null;
    const progress = questions.length
        ? Math.round((answersHook.answeredCount / questions.length) * 100)
        : 0;

    const isCurrentQuestionFlagged = currentQuestion
        ? uiHook.reviewQuestionIds.includes(currentQuestion.id)
        : false;

    const currentContext = getExamContextDetails({
        questionBody: currentQuestion?.sourceEvidence,
        questionSourceFileName: currentQuestion?.sourceFileName,
        questionSourcePageNumber: currentQuestion?.sourcePageNumber,
        examDescription: exam?.description,
    });

    return {
        // Data
        examId,
        exam,
        questions,
        isLoading,
        isInitializingSession,
        isRedirectingHistory: isRedirectingToHistory,
        currentQuestion,
        safeQuestionIndex,
        answeredCount: answersHook.answeredCount,
        answeredQuestionIds: answersHook.answeredQuestionIds,
        progress,
        unansweredCount,
        unansweredQuestionLabels,
        isCurrentQuestionFlagged,
        currentContext,
        secondsRemaining,
        // State
        selectedAnswers: answersHook.selectedAnswers,
        reviewQuestionIds: uiHook.reviewQuestionIds,
        showPassagePanel: uiHook.showPassagePanel,
        setShowPassagePanel: uiHook.setShowPassagePanel,
        crossOutEnabled: uiHook.crossOutEnabled,
        setCrossOutEnabled: uiHook.setCrossOutEnabled,
        crossedOutOptions: uiHook.crossedOutOptions,
        isSubmitDialogOpen: uiHook.isSubmitDialogOpen,
        setIsSubmitDialogOpen: uiHook.setIsSubmitDialogOpen,
        isRedirectingToTurnIn: uiHook.isRedirectingToTurnIn,
        // MediaPipe
        mediaPipeVideoRef: monitoringHook.mediaPipeVideoRef,
        mediaPipeAnalysis: monitoringHook.mediaPipeAnalysis,
        mediaPipePhase: monitoringHook.mediaPipePhase,
        mediaPipeErrorMessage: monitoringHook.mediaPipeErrorMessage,
        mediaPipeIncident: monitoringHook.mediaPipeIncident,
        dismissMediaPipeIncident: monitoringHook.dismissMediaPipeIncident,
        isMediaPipeEnabled: monitoringHook.isMediaPipeEnabled,
        // Security
        securityLockReason: monitoringHook.securityLockReason,
        isResumingExam: monitoringHook.isResumingExam,
        resumeSecuredExam: monitoringHook.resumeSecuredExam,
        fullScreenContainerRef: monitoringHook.fullScreenContainerRef,
        // Handlers
        handleAnswerChange: answersHook.handleAnswerChange,
        handleToggleReview: uiHook.handleToggleReview,
        handleToggleCrossOutOption: uiHook.handleToggleCrossOutOption,
        moveQuestionIndex: navigationHook.moveQuestionIndex,
        handleSubmit: submissionHook.handleSubmit,
        proceedToTurnInReview: submissionHook.proceedToTurnInReview,
        setCurrentQuestionIndex: navigationHook.setCurrentQuestionIndex,
    };
}
