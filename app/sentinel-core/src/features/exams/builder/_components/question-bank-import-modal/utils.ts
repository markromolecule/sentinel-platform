'use client';

import type { QuestionRecord } from '@sentinel/services';
import type { ExamQuestion } from '@sentinel/shared/types';

export interface SelectedImportQuestionRecord {
    question: QuestionRecord;
    sourceCollectionId?: string;
}

export function getQuestionPrompt(question: QuestionRecord) {
    return question.prompt ?? question.content.prompt;
}

export function filterQuestionsByCollection(questions: QuestionRecord[], questionIds?: string[]) {
    if (!questionIds?.length) {
        return questions;
    }

    const questionIdSet = new Set(questionIds);
    return questions.filter((question) => questionIdSet.has(question.id));
}

export function filterQuestionsBySearch(questions: QuestionRecord[], searchQuery: string) {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    if (!normalizedSearchQuery) {
        return questions;
    }

    return questions.filter((question) => {
        const prompt = getQuestionPrompt(question).toLowerCase();

        return (
            prompt.includes(normalizedSearchQuery) ||
            question.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearchQuery)) ||
            false
        );
    });
}

export function toggleSelectionId(currentSelectedIds: string[], id: string) {
    return currentSelectedIds.includes(id)
        ? currentSelectedIds.filter((selectedId) => selectedId !== id)
        : [...currentSelectedIds, id];
}

export function toggleAllSelectionIds(
    currentSelectedIds: string[],
    visibleQuestionIds: string[],
    allVisibleSelected: boolean,
) {
    if (allVisibleSelected) {
        const visibleIdSet = new Set(visibleQuestionIds);
        return currentSelectedIds.filter((selectedId) => !visibleIdSet.has(selectedId));
    }

    return [...new Set([...currentSelectedIds, ...visibleQuestionIds])];
}

export function buildImportedExamQuestions(selectedQuestions: SelectedImportQuestionRecord[]) {
    return selectedQuestions.map(
        ({ question, sourceCollectionId }) =>
            ({
                id: crypto.randomUUID(),
                examId: 'temp',
                sourceQuestionBankQuestionId: question.id,
                sourceCollectionId,
                sourceOrigin: question.sourceOrigin,
                sourceFileName: question.sourceFileName,
                sourcePageNumber: question.sourcePageNumber,
                sourceEvidence: question.sourceEvidence,
                passageContent: question.passageContent,
                passageType: question.passageType,
                type: question.type,
                difficulty: question.difficulty,
                points: question.points,
                orderIndex: 0,
                tags: question.tags ?? [],
                content: question.content,
            }) satisfies ExamQuestion,
    );
}

/**
 * Generates an array of page items to display in pagination controls.
 * Shows first, last, current, adjacent pages, and ellipses for gaps.
 *
 * @param currentPage - The active 1-indexed page number
 * @param totalPages - The total count of pages
 * @returns Array containing page numbers and 'ellipsis' placeholders.
 */
export function getPaginationItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
    if (totalPages <= 1) {
        return [];
    }

    const items: (number | 'ellipsis')[] = [];
    const maxVisibleAdjacent = 1;

    items.push(1);

    const startPage = Math.max(2, currentPage - maxVisibleAdjacent);
    const endPage = Math.min(totalPages - 1, currentPage + maxVisibleAdjacent);

    if (startPage > 2) {
        items.push('ellipsis');
    }

    for (let i = startPage; i <= endPage; i++) {
        items.push(i);
    }

    if (endPage < totalPages - 1) {
        items.push('ellipsis');
    }

    if (totalPages > 1) {
        items.push(totalPages);
    }

    return items;
}

