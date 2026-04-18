import type {
    ExamAttemptAnswerValue,
    ExamAttemptAnswers,
    ExamAttemptScoreSummary,
    ExamQuestion,
} from '../types';

function normalizeText(value: string, caseSensitive = false) {
    const trimmedValue = value.trim();
    return caseSensitive ? trimmedValue : trimmedValue.toLowerCase();
}

function hasAnswerValue(value: ExamAttemptAnswerValue) {
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

function computePercentage(score: number, totalScore: number) {
    if (totalScore <= 0) {
        return null;
    }

    return Math.round((score / totalScore) * 100);
}

function resolveSingleChoiceAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    const options = question.content.options ?? [];
    const answerKey = question.content.correctAnswer;

    if (typeof answerKey === 'number') {
        if (typeof value === 'number') {
            return value === answerKey;
        }

        if (typeof value === 'string') {
            return normalizeText(value) === normalizeText(options[answerKey] ?? '');
        }

        return false;
    }

    if (typeof answerKey === 'string') {
        if (typeof value === 'number') {
            return normalizeText(options[value] ?? '') === normalizeText(answerKey);
        }

        if (typeof value === 'string') {
            return normalizeText(value) === normalizeText(answerKey);
        }
    }

    return false;
}

function resolveMultiChoiceAnswers(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    if (!Array.isArray(value)) {
        return false;
    }

    const options = question.content.options ?? [];
    const answerKey = Array.isArray(question.content.correctAnswer)
        ? question.content.correctAnswer
        : [];

    if (answerKey.every((item) => typeof item === 'number')) {
        const expected = new Set(answerKey.filter((item): item is number => typeof item === 'number'));
        const received = new Set(value.filter((item): item is number => typeof item === 'number'));

        if (expected.size !== received.size) {
            return false;
        }

        return Array.from(expected).every((item) => received.has(item));
    }

    const expected = new Set(
        answerKey
            .map((item) =>
                typeof item === 'string'
                    ? normalizeText(item)
                    : typeof item === 'number'
                      ? normalizeText(options[item] ?? '')
                      : '',
            )
            .filter((item) => item.length > 0),
    );
    const received = new Set(
        value
            .map((item) =>
                typeof item === 'string'
                    ? normalizeText(item)
                    : typeof item === 'number'
                      ? normalizeText(options[item] ?? '')
                      : '',
            )
            .filter((item) => item.length > 0),
    );

    if (expected.size !== received.size) {
        return false;
    }

    return Array.from(expected).every((item) => received.has(item));
}

function resolveIdentificationAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    if (typeof value !== 'string') {
        return false;
    }

    const caseSensitive = question.content.caseSensitive ?? false;
    const acceptedAnswers =
        question.content.acceptedAnswers?.length
            ? question.content.acceptedAnswers
            : typeof question.content.correctAnswer === 'string'
              ? [question.content.correctAnswer]
              : [];

    const normalizedValue = normalizeText(value, caseSensitive);

    return acceptedAnswers.some(
        (answer) => normalizeText(answer, caseSensitive) === normalizedValue,
    );
}

function resolveFillBlankAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    if (!Array.isArray(value)) {
        return false;
    }

    const caseSensitive = question.content.caseSensitive ?? false;
    const expectedBlanks = question.content.blanks ?? [];

    if (expectedBlanks.length === 0) {
        return false;
    }

    if (value.length < expectedBlanks.length) {
        return false;
    }

    return expectedBlanks.every((blank, index) => {
        const submittedValue = value[index];
        return (
            typeof submittedValue === 'string' &&
            normalizeText(submittedValue, caseSensitive) ===
                normalizeText(blank, caseSensitive)
        );
    });
}

function resolveMatchingAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const pairs = question.content.pairs ?? [];

    if (pairs.length === 0) {
        return false;
    }

    return pairs.every((pair) => {
        const submittedValue = value[pair.left];
        return (
            typeof submittedValue === 'string' &&
            normalizeText(submittedValue) === normalizeText(pair.right)
        );
    });
}

function resolveEnumerationAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    if (!Array.isArray(value)) {
        return false;
    }

    const acceptedAnswers = question.content.acceptedAnswers ?? question.content.blanks ?? [];

    if (acceptedAnswers.length === 0) {
        return false;
    }

    const expected = acceptedAnswers.map((answer) => normalizeText(answer)).sort();
    const received = value
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => normalizeText(item))
        .sort();

    if (expected.length !== received.length) {
        return false;
    }

    return expected.every((item, index) => item === received[index]);
}

function isCorrectAnswer(question: ExamQuestion, value: ExamAttemptAnswerValue) {
    switch (question.type) {
        case 'MULTIPLE_CHOICE':
            return resolveSingleChoiceAnswer(question, value);
        case 'MULTIPLE_RESPONSE':
            return resolveMultiChoiceAnswers(question, value);
        case 'TRUE_FALSE':
            return typeof value === 'boolean' && value === question.content.correctAnswer;
        case 'IDENTIFICATION':
            return resolveIdentificationAnswer(question, value);
        case 'FILL_BLANK':
            return resolveFillBlankAnswer(question, value);
        case 'MATCHING':
            return resolveMatchingAnswer(question, value);
        case 'ENUMERATION':
            return resolveEnumerationAnswer(question, value);
        case 'ESSAY':
            return null;
        default:
            return false;
    }
}

export function scoreExamAttempt(args: {
    questions: ExamQuestion[];
    answers: ExamAttemptAnswers;
}): ExamAttemptScoreSummary {
    const { questions, answers } = args;
    let score = 0;
    let answeredCount = 0;
    let autoGradableQuestionCount = 0;
    let manualReviewQuestionCount = 0;

    for (const question of questions) {
        const answerValue = answers[question.id];

        if (hasAnswerValue(answerValue)) {
            answeredCount += 1;
        }

        const correctness = isCorrectAnswer(question, answerValue);

        if (correctness === null) {
            manualReviewQuestionCount += 1;
            continue;
        }

        autoGradableQuestionCount += 1;

        if (correctness) {
            score += question.points;
        }
    }

    const totalScore = questions.reduce((sum, question) => sum + question.points, 0);

    return {
        score,
        totalScore,
        percentage: computePercentage(score, totalScore),
        answeredCount,
        autoGradableQuestionCount,
        manualReviewQuestionCount,
        requiresManualReview: manualReviewQuestionCount > 0,
    };
}
