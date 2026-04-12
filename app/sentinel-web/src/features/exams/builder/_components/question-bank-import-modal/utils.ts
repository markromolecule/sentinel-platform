'use client';

import type { QuestionRecord } from '@sentinel/services';
import type { ExamQuestion } from '@sentinel/shared/types';

export function getQuestionPrompt(question: QuestionRecord) {
    return question.prompt ?? question.content.prompt;
}

export function filterQuestionsByCollection(
    questions: QuestionRecord[],
    questionIds?: string[],
) {
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

export function buildImportedExamQuestions(
    questions: QuestionRecord[],
    selectedIdSet: Set<string>,
    sourceCollectionId?: string,
) {
    return questions
        .filter((question) => selectedIdSet.has(question.id))
        .map(
            (question) =>
                ({
                    id: crypto.randomUUID(),
                    examId: 'temp',
                    sourceQuestionBankQuestionId: question.id,
                    sourceCollectionId,
                    sourceOrigin: question.sourceOrigin,
                    sourceFileName: question.sourceFileName,
                    sourcePageNumber: question.sourcePageNumber,
                    sourceEvidence: question.sourceEvidence,
                    type: question.type,
                    difficulty: question.difficulty,
                    points: question.points,
                    orderIndex: 0,
                    tags: question.tags ?? [],
                    content: question.content,
                }) satisfies ExamQuestion,
        );
}
