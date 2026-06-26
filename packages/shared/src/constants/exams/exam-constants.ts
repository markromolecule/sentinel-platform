import type { ExamCreateFormValues } from '../../schema/exams/exam-create-schema';
import type { QuestionType } from '../../types';

export const EXAM_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Scheduled', value: 'scheduled' },
] as const;

export const EXAM_FILTER_TABS = [{ value: 'all', label: 'All' }, ...EXAM_STATUS_OPTIONS] as const;

export const EXAM_QUERY_KEYS = {
    all: ['exams'] as const,
    details: (id: string) => ['exams', id] as const,
    configuration: (id: string) => ['exams', id, 'configuration'] as const,
    lobbyCount: (id: string) => ['exams', id, 'lobby', 'count'] as const,
    report: (id: string) => ['exams', id, 'report'] as const,
    attemptReport: (attemptId: string) => ['exams', 'attempt-report', attemptId] as const,
    monitoring: (id: string) => ['exams', id, 'monitoring'] as const,
    monitoringStudent: (id: string, studentId: string) =>
        ['exams', id, 'monitoring', studentId] as const,
    history: (params?: object) => ['exams', 'history', params ?? {}] as const,
    historyDetail: (id: string) => ['exams', 'history', id] as const,
    sectionAssignments: (id: string) => ['exams', id, 'section-assignments'] as const,
};

export const BUILDER_QUERY_KEYS = {
    all: ['builder'] as const,
    workspace: (id: string) => ['builder', 'workspace', id] as const,
};

export const QUESTION_QUERY_KEYS = {
    all: ['questions'] as const,
    list: (params?: object) => ['questions', 'list', params ?? {}] as const,
    infinite: (params?: object) => ['questions', 'infinite', params ?? {}] as const,
    details: (id: string) => ['questions', id] as const,
};

export const QUESTION_TYPE_QUERY_KEYS = {
    all: ['question-types'] as const,
    details: (type: QuestionType) => ['question-types', type] as const,
};

export const QUESTION_BANK_COLLECTION_QUERY_KEYS = {
    all: ['question-bank', 'collections'] as const,
    details: (id: string) => ['question-bank', 'collections', id] as const,
};

export const QUESTION_COLLECTION_QUERY_KEYS = {
    all: ['question-collection', 'collections'] as const,
    details: (id: string) => ['question-collection', 'collections', id] as const,
};

export const EXAM_DIFFICULTY_OPTIONS = [
    { label: 'Easy', value: 'EASY' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Hard', value: 'HARD' },
] as const;

export const QUESTION_TYPE_OPTIONS = [
    { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
    { label: 'True / False', value: 'TRUE_FALSE' },
    { label: 'Multiple Response', value: 'MULTIPLE_RESPONSE' },
    { label: 'Identification', value: 'IDENTIFICATION' },
    { label: 'Essay / Short Answer', value: 'ESSAY' },
    { label: 'Enumeration', value: 'ENUMERATION' },
    { label: 'Matching', value: 'MATCHING' },
    { label: 'Fill in the Blank', value: 'FILL_BLANK' },
] as const;

const padDatePart = (value: number) => value.toString().padStart(2, '0');

const formatDateTimeLocal = (date: Date) =>
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(
        date.getHours(),
    )}:${padDatePart(date.getMinutes())}`;

const createSuggestedExamWindow = () => {
    const now = new Date();
    const startDateTime = new Date(now);

    startDateTime.setSeconds(0, 0);

    const currentMinutes = startDateTime.getMinutes();

    if (currentMinutes === 0) {
        startDateTime.setMinutes(30, 0, 0);
    } else if (currentMinutes < 30) {
        startDateTime.setMinutes(30, 0, 0);
    } else {
        startDateTime.setHours(startDateTime.getHours() + 1, 0, 0, 0);
    }

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 60);

    return {
        startDateTime: formatDateTimeLocal(startDateTime),
        endDateTime: formatDateTimeLocal(endDateTime),
        durationMinutes: 60,
    };
};

export const getExamCreateFormDefaults = (): ExamCreateFormValues => {
    const suggestedWindow = createSuggestedExamWindow();

    return {
        title: '',
        description: '',
        subjectId: '',
        classroomIds: [],
        roomId: undefined,
        startDateTime: suggestedWindow.startDateTime,
        endDateTime: suggestedWindow.endDateTime,
        durationMinutes: suggestedWindow.durationMinutes,
        passingScore: 75,
        shuffleQuestions: true,
        showCorrectAnswers: false,
        allowReview: true,
        randomizeChoices: true,
        instructorId: undefined,
        instructorIds: [],
        isPublic: false,
    };
};

export const EXAM_CREATE_FORM_DEFAULTS: ExamCreateFormValues = getExamCreateFormDefaults();
