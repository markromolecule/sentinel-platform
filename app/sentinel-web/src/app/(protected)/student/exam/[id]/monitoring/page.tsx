'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApi, useExamQuery } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { MOCK_EXAMS, MOCK_QUESTIONS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { ExamHeader } from './_components/exam-header';
import { MobileNavigation } from './_components/mobile-navigation';
import { NavigationFooter } from './_components/navigation-footer';
import { QuestionDisplay } from './_components/question-display';
import { QuestionNavigator } from './_components/question-navigator';
import { useExamMonitoring } from './_hooks/use-exam-monitoring';
import { useExamState } from './_hooks/use-exam-state';
import { useExamTimer } from './_hooks/use-exam-timer';
import {
    readStoredExamSession,
    writeStoredExamSession,
    type StoredExamSession,
} from './_lib/exam-session-storage';

export default function ExamMonitoringPage() {
    const params = useParams();
    const apiClient = useApi();
    const examId = params.id as string;
    const { data: examDetail } = useExamQuery(examId);
    const [examSession, setExamSession] = useState<StoredExamSession | null>(() =>
        readStoredExamSession(examId),
    );

    // Core Exam Data
    const [fallbackExam] = useState(() => MOCK_EXAMS.find((e) => e.id === examId) || MOCK_EXAMS[0]);
    const exam = examDetail ?? fallbackExam;
    const effectiveConfiguration =
        examSession?.configSnapshot?.configuration ?? examDetail?.configuration;

    // Custom Hooks
    const { timeLeft, formatTime, isLowTime } = useExamTimer(exam.duration * 60);
    useExamMonitoring({
        configuration: effectiveConfiguration,
        examSessionId: examSession?.sessionId,
    });
    const {
        currentQuestionIndex,
        currentQuestion,
        answers,
        flaggedQuestions,
        progress,
        totalQuestions,
        handleAnswer,
        toggleFlag,
        goToQuestion,
        goNext,
        goPrevious,
        handleSubmit,
    } = useExamState({ questions: MOCK_QUESTIONS });

    useEffect(() => {
        if (examSession) {
            return;
        }

        let isActive = true;

        const initializeExamSession = async () => {
            try {
                const session = await startExamSession(apiClient, { examId });
                const storedSession = writeStoredExamSession(examId, session);

                if (isActive && storedSession) {
                    setExamSession(storedSession);
                }
            } catch (error) {
                if (!isActive) {
                    return;
                }

                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Failed to initialize the exam session.',
                );
            }
        };

        void initializeExamSession();

        return () => {
            isActive = false;
        };
    }, [apiClient, examId, examSession]);

    return (
        <div className="bg-background flex min-h-screen flex-col">
            {/* Header */}
            <ExamHeader
                exam={exam}
                timeLeft={timeLeft}
                isLowTime={isLowTime}
                progress={progress}
                formatTime={formatTime}
                onSubmit={handleSubmit}
            />

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <div className="container grid max-w-[1920px] flex-1 gap-0 overflow-hidden px-0 lg:grid-cols-12">
                    {/* Question Area */}
                    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto p-4 sm:p-6 lg:col-span-9 lg:p-10 xl:col-span-9">
                        <QuestionDisplay
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={totalQuestions}
                            selectedAnswer={answers[currentQuestion.id]}
                            isFlagged={flaggedQuestions.has(currentQuestionIndex)}
                            onAnswer={handleAnswer}
                            onToggleFlag={() => toggleFlag(currentQuestionIndex)}
                        />

                        <NavigationFooter
                            currentIndex={currentQuestionIndex}
                            totalQuestions={totalQuestions}
                            answers={answers}
                            questions={MOCK_QUESTIONS}
                            onPrevious={goPrevious}
                            onNext={goNext}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* Sidebar Navigator */}
                    <QuestionNavigator
                        questions={MOCK_QUESTIONS}
                        currentIndex={currentQuestionIndex}
                        answers={answers}
                        flaggedQuestions={flaggedQuestions}
                        onQuestionSelect={goToQuestion}
                    />
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNavigation
                currentIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                onPrevious={goPrevious}
                onNext={goNext}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
