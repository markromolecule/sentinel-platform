import { QUESTION_TYPE_OPTIONS } from '@sentinel/shared/constants';

export const QUESTION_TYPE_FACET = {
    columnKey: 'type',
    title: 'Type',
    options: QUESTION_TYPE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
    })),
};

export const DIFFICULTY_FACET = {
    columnKey: 'difficulty',
    title: 'Difficulty',
    options: [
        { label: 'Easy', value: 'EASY' },
        { label: 'Moderate', value: 'MODERATE' },
        { label: 'Hard', value: 'HARD' },
    ],
};

export const QUESTION_BANK_FACETS = [QUESTION_TYPE_FACET, DIFFICULTY_FACET];
