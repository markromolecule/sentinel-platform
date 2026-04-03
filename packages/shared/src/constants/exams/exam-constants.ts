import type { ExamCreateFormValues } from '../../schema/exams/exam-create-schema';

export const EXAM_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Scheduled', value: 'scheduled' },
] as const;

export const EXAM_FILTER_TABS = [{ value: 'all', label: 'All' }, ...EXAM_STATUS_OPTIONS] as const;

export const EXAM_DIFFICULTY_OPTIONS = [
    { label: 'Easy', value: 'EASY' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Hard', value: 'HARD' },
] as const;

export const QUESTION_TYPE_OPTIONS = [
    { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
    { label: 'True/False', value: 'TRUE_FALSE' },
    { label: 'Identification', value: 'IDENTIFICATION' },
    { label: 'Essay', value: 'ESSAY' },
    { label: 'Enumeration', value: 'ENUMERATION' },
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
        section: '',
        startDateTime: suggestedWindow.startDateTime,
        endDateTime: suggestedWindow.endDateTime,
        durationMinutes: suggestedWindow.durationMinutes,
        passingScore: 75,
        shuffleQuestions: true,
        showCorrectAnswers: false,
        allowReview: true,
        randomizeChoices: true,
    };
};

export const EXAM_CREATE_FORM_DEFAULTS: ExamCreateFormValues = getExamCreateFormDefaults();
