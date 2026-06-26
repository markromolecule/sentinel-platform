import type {
    ExamAttemptAnswerValue,
    ExamAttemptAnswers,
    ExamAttemptScoreSummary,
    ExamQuestion,
} from '../types';
import type { EssayQuestionEvaluation } from '../schema/exams/assessment-schema';

export type ExamAttemptItemOverride = {
    awardedScore: number;
    reason?: string | null;
    overriddenBy?: string | null;
    overriddenAt?: string | null;
};

export type ExamAttemptGradingMetadata = {
    finalizedAt?: string | null;
    finalizedBy?: string | null;
};

export type ExamQuestionReportCorrectAnswer =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Record<string, string>
    | null;

export type ExamAttemptQuestionReport = {
    questionId: string;
    questionType: ExamQuestion['type'];
    prompt: string;
    answer: ExamAttemptAnswerValue;
    correctAnswer: ExamQuestionReportCorrectAnswer;
    isCorrect: boolean | null;
    awardedScore: number | null;
    maxScore: number;
    evaluation: EssayQuestionEvaluation | null;
    override: ExamAttemptItemOverride | null;
};

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
        const expected = new Set(
            answerKey.filter((item): item is number => typeof item === 'number'),
        );
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
    const acceptedAnswers = question.content.acceptedAnswers?.length
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
            normalizeText(submittedValue, caseSensitive) === normalizeText(blank, caseSensitive)
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
        case 'TRUE_FALSE': {
            const getBool = (v: any) => {
                if (typeof v === 'boolean') return v;
                if (typeof v === 'string') {
                    const norm = v.toLowerCase().trim();
                    if (norm === 'true') return true;
                    if (norm === 'false') return false;
                }
                return null;
            };

            const submitted = getBool(value);
            const expected =
                getBool(question.content.correctAnswer) ?? getBool(question.content.correctBoolean);

            if (submitted === null || expected === null) return false;
            return submitted === expected;
        }
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

function resolveQuestionCorrectAnswer(question: ExamQuestion): ExamQuestionReportCorrectAnswer {
    switch (question.type) {
        case 'MULTIPLE_CHOICE': {
            const answerKey = question.content.correctAnswer;
            const options = question.content.options ?? [];

            if (typeof answerKey === 'number') {
                return options[answerKey] ?? answerKey;
            }

            return typeof answerKey === 'string' ? answerKey : null;
        }
        case 'MULTIPLE_RESPONSE': {
            const answerKey = Array.isArray(question.content.correctAnswer)
                ? question.content.correctAnswer
                : [];
            const options = question.content.options ?? [];

            return answerKey.map((item) =>
                typeof item === 'number' ? (options[item] ?? item) : item,
            );
        }
        case 'TRUE_FALSE':
            return typeof question.content.correctBoolean === 'boolean'
                ? question.content.correctBoolean
                : typeof question.content.correctAnswer === 'boolean'
                  ? question.content.correctAnswer
                  : null;
        case 'IDENTIFICATION':
            return question.content.acceptedAnswers?.length
                ? question.content.acceptedAnswers
                : typeof question.content.correctAnswer === 'string'
                  ? [question.content.correctAnswer]
                  : null;
        case 'FILL_BLANK':
            return question.content.blanks ?? null;
        case 'MATCHING':
            return (question.content.pairs ?? []).reduce<Record<string, string>>((acc, pair) => {
                acc[pair.left] = pair.right;
                return acc;
            }, {});
        case 'ENUMERATION':
            return question.content.acceptedAnswers ?? question.content.blanks ?? null;
        case 'ESSAY':
            return null;
        default:
            return null;
    }
}

/**
 * Builds item-level report data for an exam attempt so instructor and student
 * report views can render answers, correct answers, and awarded points from
 * one shared helper.
 *
 * @param args - Questions, submitted answers, and optional essay evaluations
 * @returns Question-by-question grading report data in exam order
 */
export function buildExamAttemptQuestionReports(args: {
    questions: ExamQuestion[];
    answers: ExamAttemptAnswers;
    evaluations?: Record<string, EssayQuestionEvaluation>;
    itemOverrides?: Record<string, ExamAttemptItemOverride>;
}): ExamAttemptQuestionReport[] {
    const { questions, answers, evaluations = {}, itemOverrides = {} } = args;

    return questions.map((question) => {
        const answer = answers[question.id];
        const isCorrect = isCorrectAnswer(question, answer);
        const evaluation = evaluations[question.id] ?? null;
        const itemOverride = itemOverrides[question.id] ?? null;
        const awardedScore =
            typeof itemOverride?.awardedScore === 'number'
                ? itemOverride.awardedScore
                : isCorrect === null
                  ? typeof evaluation?.score === 'number'
                      ? evaluation.score
                      : null
                  : isCorrect
                    ? question.points
                    : 0;

        return {
            questionId: question.id,
            questionType: question.type,
            prompt: question.content.prompt,
            answer,
            correctAnswer: resolveQuestionCorrectAnswer(question),
            isCorrect,
            awardedScore,
            maxScore: question.points,
            evaluation,
            override: itemOverride,
        };
    });
}

/**
 * Scores an exam attempt across auto-gradable questions and returns the
 * aggregate score summary used throughout the exam flow.
 *
 * @param args - Questions and submitted answers for one attempt
 * @returns Aggregate score and review summary for the attempt
 */
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
