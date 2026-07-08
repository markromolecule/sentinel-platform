import type { ExaminationGlobalSettings } from '@sentinel/shared';
import type { ExamConfigurationPayload, ExamSettingsState } from './configuration.types';

type PersistedExamSettingsState = {
    [Key in keyof ExamSettingsState]: boolean | null;
};

function hasOwnProperty<Value extends object, Key extends PropertyKey>(
    value: Value | null | undefined,
    key: Key,
): value is Value & Record<Key, unknown> {
    return value != null && Object.prototype.hasOwnProperty.call(value, key);
}

function resolveInheritedBoolean(args: {
    explicitValue: boolean | null | undefined;
    fallbackValue: boolean;
    defaultValue: boolean;
}) {
    const { explicitValue, fallbackValue, defaultValue } = args;

    const desiredValue =
        explicitValue === undefined
            ? fallbackValue
            : explicitValue === null
              ? defaultValue
              : explicitValue;

    return desiredValue === defaultValue ? null : desiredValue;
}

export function resolveExamSettings(args: {
    payload: ExamConfigurationPayload;
    globalSettings: Pick<
        ExaminationGlobalSettings,
        | 'defaultShuffleQuestions'
        | 'defaultShowCorrectAnswers'
        | 'defaultAllowReview'
        | 'defaultRandomizeChoices'
    >;
    fallback?: ExamSettingsState;
}): PersistedExamSettingsState {
    const { payload, globalSettings, fallback } = args;
    const fallbackSettings: ExamSettingsState = fallback ?? {
        shuffleQuestions: globalSettings.defaultShuffleQuestions,
        showCorrectAnswers: globalSettings.defaultShowCorrectAnswers,
        allowReview: globalSettings.defaultAllowReview,
        randomizeChoices: globalSettings.defaultRandomizeChoices,
    };

    const readOverride = (key: keyof ExamSettingsState) => {
        if (hasOwnProperty(payload.settings, key)) {
            return payload.settings[key] as boolean | null | undefined;
        }

        if (hasOwnProperty(payload, key)) {
            return payload[key] as boolean | null | undefined;
        }

        return undefined;
    };

    return {
        shuffleQuestions: resolveInheritedBoolean({
            explicitValue: readOverride('shuffleQuestions'),
            fallbackValue: fallbackSettings.shuffleQuestions,
            defaultValue: globalSettings.defaultShuffleQuestions,
        }),
        showCorrectAnswers: resolveInheritedBoolean({
            explicitValue: readOverride('showCorrectAnswers'),
            fallbackValue: fallbackSettings.showCorrectAnswers,
            defaultValue: globalSettings.defaultShowCorrectAnswers,
        }),
        allowReview: resolveInheritedBoolean({
            explicitValue: readOverride('allowReview'),
            fallbackValue: fallbackSettings.allowReview,
            defaultValue: globalSettings.defaultAllowReview,
        }),
        randomizeChoices: resolveInheritedBoolean({
            explicitValue: readOverride('randomizeChoices'),
            fallbackValue: fallbackSettings.randomizeChoices,
            defaultValue: globalSettings.defaultRandomizeChoices,
        }),
    };
}
