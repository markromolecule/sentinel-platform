import type { ExamCreateFormValues } from '../../../schema/proctor/exams/exam-create-schema';

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

export const EXAM_CREATE_FORM_DEFAULTS: ExamCreateFormValues = {
    title: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    passing_score: 75,
    shuffle_questions: true,
    show_correct_answers: false,
    allow_review: true,
    randomize_choices: true,
};
