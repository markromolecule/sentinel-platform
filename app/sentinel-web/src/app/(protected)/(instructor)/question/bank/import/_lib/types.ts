import type { ExamQuestionContent, QuestionType } from "@sentinel/shared/types";

export type ImportPreviewDifficulty = "Easy" | "Medium" | "Hard";
export type ImportDraftSourceMode = "upload" | "ai";

export interface ImportPreviewQuestion {
    id: string;
    prompt: string;
    type: QuestionType;
    difficulty: ImportPreviewDifficulty;
    points: number;
    tags: string[];
    content: ExamQuestionContent;
}

export interface QuestionImportDraftWarning {
    rowNumber: number;
    reason: string;
}

export interface QuestionImportDraft {
    id: string;
    batchLabel: string;
    sourceMode: ImportDraftSourceMode;
    sourceLabel: string;
    createdAt: string;
    questions: ImportPreviewQuestion[];
    warnings: QuestionImportDraftWarning[];
}
