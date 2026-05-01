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

const QUESTION_TYPE_ORDER: QuestionType[] = [
    'MULTIPLE_CHOICE',
    'MULTIPLE_RESPONSE',
    'TRUE_FALSE',
    'IDENTIFICATION',
    'MATCHING',
    'FILL_BLANK',
    'ENUMERATION',
    'ESSAY',
];

export type ExamExportQuestionGroup = {
    type: QuestionType;
    label: string;
    questions: ExamQuestion[];
};

export type ExamExportSection = {
    id: string;
    title: string;
    orderIndex: number;
    groups: ExamExportQuestionGroup[];
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
            orderIndex: section.orderIndex,
            groups: [],
        });
    });

    questions.forEach((question) => {
        const sectionId = question.sectionId ?? 'unsectioned';
        const existingSection = sectionMap.get(sectionId);
        const section =
            existingSection ??
            ({
                id: sectionId,
                title: 'Unsectioned Questions',
                orderIndex: Number.MAX_SAFE_INTEGER,
                groups: [],
            } satisfies ExamExportSection);

        if (!existingSection) {
            sectionMap.set(sectionId, section);
        }

        let group = section.groups.find((item) => item.type === question.type);

        if (!group) {
            group = {
                type: question.type,
                label: getQuestionTypeLabel(question.type),
                questions: [],
            };
            section.groups.push(group);
        }

        group.questions.push(question);
    });

    return [...sectionMap.values()]
        .map((section) => ({
            ...section,
            groups: section.groups
                .map((group) => ({
                    ...group,
                    questions: [...group.questions].sort((a, b) => a.orderIndex - b.orderIndex),
                }))
                .sort(
                    (a, b) =>
                        QUESTION_TYPE_ORDER.indexOf(a.type) - QUESTION_TYPE_ORDER.indexOf(b.type),
                ),
        }))
        .filter((section) => section.groups.some((group) => group.questions.length > 0))
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
