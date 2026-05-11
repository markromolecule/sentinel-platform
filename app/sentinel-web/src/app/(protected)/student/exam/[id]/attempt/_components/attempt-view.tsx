'use client';

import { Badge } from '@sentinel/ui';
import {
    ExamAttemptShell,
    formatTimer,
    ExamAttemptRuntimeHeader,
    ExamAttemptRuntimeFooter,
    ExamAttemptRuntimeNavigation,
    ExamAttemptRuntimePassage,
    ExamAttemptRuntimeSecurity,
    ExamAttemptRuntimeQuestion,
} from '@/features/exams/_components/engine';
import config from '@/lib/config';
import { useStudentExamAttempt } from '@/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt';
import { MediaPipeIncidentDialog } from './mediapipe-incident-dialog';

export function AttemptView() {
    const {
        exam,
        questions,
        currentQuestion,
        safeQuestionIndex,
        answeredCount,
        answeredQuestionIds,
        progress,
        unansweredCount,
        unansweredQuestionLabels,
        isCurrentQuestionFlagged,
        currentContext,
        secondsRemaining,
        selectedAnswers,
        reviewQuestionIds,
        showPassagePanel,
        setShowPassagePanel,
        crossOutEnabled,
        setCrossOutEnabled,
        crossedOutOptions,
        isSubmitDialogOpen,
        setIsSubmitDialogOpen,
        isRedirectingToTurnIn,
        mediaPipeVideoRef,
        mediaPipeAnalysis,
        mediaPipePhase,
        mediaPipeErrorMessage,
        mediaPipeIncident,
        dismissMediaPipeIncident,
        isMediaPipeEnabled,
        audioErrorMessage,
        audioMonitoringPhase,
        isAudioMonitoringEnabled,
        securityLockReason,
        isResumingExam,
        resumeSecuredExam,
        fullScreenContainerRef,
        handleAnswerChange,
        handleToggleReview,
        handleToggleCrossOutOption,
        moveQuestionIndex,
        handleSubmit,
        proceedToTurnInReview,
        setCurrentQuestionIndex,
    } = useStudentExamAttempt();

    return (
        <div
            ref={(node) => {
                if (fullScreenContainerRef) {
                    fullScreenContainerRef.current = node;
                }
            }}
            className="bg-background flex h-screen flex-col overflow-hidden"
        >
            <video
                ref={mediaPipeVideoRef}
                autoPlay
                muted
                playsInline
                aria-hidden="true"
                data-testid="attempt-mediapipe-video"
                className="pointer-events-none fixed right-0 bottom-0 h-px w-px opacity-0"
            />

            <MediaPipeIncidentDialog
                incident={mediaPipeIncident}
                onDismiss={dismissMediaPipeIncident}
            />

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

            {audioErrorMessage ? (
                <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {audioErrorMessage}
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
                            {isMediaPipeEnabled && !config.isProduction ? (
                                <Badge
                                    variant={mediaPipePhase === 'running' ? 'default' : 'outline'}
                                    className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                                >
                                    MediaPipe {mediaPipeAnalysis?.status ?? mediaPipePhase}
                                </Badge>
                            ) : null}
                            {isAudioMonitoringEnabled && !config.isProduction ? (
                                <Badge
                                    variant={
                                        audioMonitoringPhase === 'running' ? 'default' : 'outline'
                                    }
                                    className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                                >
                                    Audio {audioMonitoringPhase}
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
                        showPassagePanel ? (
                            <ExamAttemptRuntimePassage
                                showPassagePanel={showPassagePanel}
                                currentQuestion={currentQuestion}
                                currentContext={currentContext}
                            />
                        ) : undefined
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
