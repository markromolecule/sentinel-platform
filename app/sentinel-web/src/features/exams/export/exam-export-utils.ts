import type { ProctorExam, ExamQuestion, QuestionType } from '@sentinel/shared/types';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'Multiple Choice',
    MULTIPLE_RESPONSE: 'Multiple Response',
    TRUE_FALSE: 'True or False',
    IDENTIFICATION: 'Identification',
    MATCHING: 'Matching',
    ESSAY: 'Essay',
    FILL_BLANK: 'Fill in the Blank',
    ENUMERATION: 'Enumeration',
};

export type ExamExportSection = {
    id: string;
    title: string;
    description?: string | null;
    orderIndex: number;
    questions: ExamQuestion[];
};

export function getQuestionTypeLabel(type: QuestionType) {
    return QUESTION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getExamTotalPoints(exam: Pick<ProctorExam, 'questions' | 'questionCount'>) {
    return (exam.questions ?? []).reduce((total, question) => total + (question.points ?? 0), 0);
}

export function buildExamExportSections(exam: ProctorExam): ExamExportSection[] {
    const questions = [...(exam.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const sections = [...(exam.questionSections ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const sectionMap = new Map<string, ExamExportSection>();

    sections.forEach((section) => {
        sectionMap.set(section.id, {
            id: section.id,
            title: section.title,
            description: section.description,
            orderIndex: section.orderIndex,
            questions: [],
        });
    });

    questions.forEach((question) => {
        const sectionId = question.sectionId ?? 'unsectioned';
        let section = sectionMap.get(sectionId);

        if (!section) {
            section = {
                id: sectionId,
                title: 'Unsectioned Questions',
                description: null,
                orderIndex: Number.MAX_SAFE_INTEGER,
                questions: [],
            };
            sectionMap.set(sectionId, section);
        }

        section.questions.push(question);
    });

    return [...sectionMap.values()]
        .filter((section) => section.questions.length > 0)
        .map((section) => ({
            ...section,
            questions: section.questions.sort((a, b) => a.orderIndex - b.orderIndex),
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function buildMatchingChoices(question: ExamQuestion) {
    return [...(question.content.pairs ?? [])]
        .map((pair) => pair.right)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
}

export function getExpectedAnswerCount(question: ExamQuestion) {
    if (question.type === 'ENUMERATION') {
        return Math.max(1, question.content.acceptedAnswers?.length ?? 3);
    }

    if (question.type === 'FILL_BLANK') {
        return Math.max(1, question.content.blanks?.length ?? 1);
    }

    return 1;
}
