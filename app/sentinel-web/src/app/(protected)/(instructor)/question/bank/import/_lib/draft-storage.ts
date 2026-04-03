import type { QuestionImportDraft } from "./types";

const QUESTION_IMPORT_DRAFT_STORAGE_KEY = "sentinel-question-bank-import-draft";

export function getQuestionImportDraft(): QuestionImportDraft | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawDraft = window.sessionStorage.getItem(QUESTION_IMPORT_DRAFT_STORAGE_KEY);

    if (!rawDraft) {
        return null;
    }

    try {
        return JSON.parse(rawDraft) as QuestionImportDraft;
    } catch {
        window.sessionStorage.removeItem(QUESTION_IMPORT_DRAFT_STORAGE_KEY);
        return null;
    }
}

export function saveQuestionImportDraft(draft: QuestionImportDraft) {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.setItem(
        QUESTION_IMPORT_DRAFT_STORAGE_KEY,
        JSON.stringify(draft),
    );
}

export function clearQuestionImportDraft() {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.removeItem(QUESTION_IMPORT_DRAFT_STORAGE_KEY);
}
