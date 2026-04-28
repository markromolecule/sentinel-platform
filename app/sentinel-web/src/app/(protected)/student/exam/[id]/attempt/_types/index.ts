import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export type ExamAttemptState = {
    currentQuestionIndex: number;
    selectedAnswers: Record<string, ExamAnswerValue>;
    reviewQuestionIds: string[];
    showPassagePanel: boolean;
    crossOutEnabled: boolean;
    crossedOutOptions: Record<string, number[]>;
    isSubmitDialogOpen: boolean;
    isRedirectingToTurnIn: boolean;
};

export type MediaPipeIncidentDialogContent = {
    title: string;
    description: string;
    actionLabel: string;
};
