import type { ExamAttemptAnswerValue } from '../types';

export function normalizeText(value: string, caseSensitive = false) {
    const trimmedValue = value.trim();
    return caseSensitive ? trimmedValue : trimmedValue.toLowerCase();
}

export function hasAnswerValue(value: ExamAttemptAnswerValue) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some((item) =>
            typeof item === 'string' ? item.trim().length > 0 : item !== null && item !== undefined,
        );
    }

    return Object.values(value).some((item) => item.trim().length > 0);
}

export function computePercentage(score: number, totalScore: number) {
    if (totalScore <= 0) {
        return null;
    }

    return Math.round((score / totalScore) * 100);
}
