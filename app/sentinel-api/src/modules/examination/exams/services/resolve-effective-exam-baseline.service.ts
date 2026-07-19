import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';
import type { RawExamRecord } from './map-exam-response.service';

type BaselineExamRecord = Pick<RawExamRecord, 'duration_minutes' | 'passing_score'> & {
    shuffle_questions?: boolean | null;
    show_correct_answers?: boolean | null;
    allow_review?: boolean | null;
    randomize_choices?: boolean | null;
};

/**
 * Resolves the effective exam baseline by applying Support-managed defaults when
 * nullable exam-local values are unset or malformed.
 */
export function resolveEffectiveExamBaseline(
    record: BaselineExamRecord,
    globalSettings?: Partial<ExaminationGlobalSettings> | null,
) {
    const mergedDefaults = {
        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        ...(globalSettings ?? {}),
    };
    const defaults = {
        ...mergedDefaults,
        defaultDurationMinutes: Number.isFinite(mergedDefaults.defaultDurationMinutes)
            ? mergedDefaults.defaultDurationMinutes
            : DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultDurationMinutes,
        defaultPassingScore: Number.isFinite(mergedDefaults.defaultPassingScore)
            ? mergedDefaults.defaultPassingScore
            : DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore,
    };

    return {
        durationMinutes:
            typeof record.duration_minutes === 'number' && Number.isFinite(record.duration_minutes)
                ? record.duration_minutes
                : defaults.defaultDurationMinutes,
        passingScore:
            typeof record.passing_score === 'number' && Number.isFinite(record.passing_score)
                ? record.passing_score
                : defaults.defaultPassingScore,
        settings: {
            shuffleQuestions: record.shuffle_questions ?? defaults.defaultShuffleQuestions,
            showCorrectAnswers: record.show_correct_answers ?? defaults.defaultShowCorrectAnswers,
            allowReview: record.allow_review ?? defaults.defaultAllowReview,
            randomizeChoices: record.randomize_choices ?? defaults.defaultRandomizeChoices,
        },
    };
}

/**
 * Applies the effective duration and passing score baseline onto a raw exam-shaped
 * record so downstream mappers can consume normalized values.
 */
export function applyEffectiveExamBaselineToRawRecord<T extends RawExamRecord>(
    record: T,
    globalSettings?: Partial<ExaminationGlobalSettings> | null,
): T {
    const baseline = resolveEffectiveExamBaseline(record, globalSettings);

    return {
        ...record,
        duration_minutes: baseline.durationMinutes,
        passing_score: baseline.passingScore,
    };
}
