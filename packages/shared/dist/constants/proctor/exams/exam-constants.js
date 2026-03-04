"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXAM_CREATE_FORM_DEFAULTS = exports.QUESTION_TYPE_OPTIONS = exports.EXAM_DIFFICULTY_OPTIONS = exports.EXAM_FILTER_TABS = exports.EXAM_STATUS_OPTIONS = void 0;
exports.EXAM_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Scheduled', value: 'scheduled' },
];
exports.EXAM_FILTER_TABS = [{ value: 'all', label: 'All' }, ...exports.EXAM_STATUS_OPTIONS];
exports.EXAM_DIFFICULTY_OPTIONS = [
    { label: 'Easy', value: 'EASY' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Hard', value: 'HARD' },
];
exports.QUESTION_TYPE_OPTIONS = [
    { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
    { label: 'True/False', value: 'TRUE_FALSE' },
    { label: 'Identification', value: 'IDENTIFICATION' },
    { label: 'Essay', value: 'ESSAY' },
    { label: 'Enumeration', value: 'ENUMERATION' },
];
exports.EXAM_CREATE_FORM_DEFAULTS = {
    title: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    passing_score: 60,
    difficulty: 'MEDIUM',
    scheduled_date: new Date(),
    scheduled_time: '08:00',
};
//# sourceMappingURL=exam-constants.js.map