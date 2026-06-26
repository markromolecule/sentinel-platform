import type {
    ExamAttemptAnswerValue,
    ExamAttemptAnswers,
    ExamAttemptScoreSummary,
    ExamQuestion,
} from '../types';
import type { EssayQuestionEvaluation } from '../schema/exams/assessment-schema';

export type ExamAttemptItemOverride = {
    awardedScore: number;
    reason?: string | null;
    overriddenBy?: string | null;
    overriddenAt?: string | null;
};

export type ExamAttemptGradingMetadata = {
    finalizedAt?: string | null;
    finalizedBy?: string | null;
};

export type ExamQuestionReportCorrectAnswer =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Record<string, string>
    | null;

export type ExamAttemptQuestionReport = {
    questionId: string;
    questionType: ExamQuestion['type'];
    prompt: string;
    answer: ExamAttemptAnswerValue;
    correctAnswer: ExamQuestionReportCorrectAnswer;
    isCorrect: boolean | null;
    awardedScore: number | null;
    maxScore: number;
    evaluation: EssayQuestionEvaluation | null;
    override: ExamAttemptItemOverride | null;
};

export type ScoreExamAttemptArgs = {
    questions: ExamQuestion[];
    answers: ExamAttemptAnswers;
};

export type BuildExamAttemptQuestionReportsArgs = {
    questions: ExamQuestion[];
    answers: ExamAttemptAnswers;
    evaluations?: Record<string, EssayQuestionEvaluation>;
    itemOverrides?: Record<string, ExamAttemptItemOverride>;
};

export type ScoreExamAttemptResult = ExamAttemptScoreSummary;
