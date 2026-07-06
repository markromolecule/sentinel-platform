import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { examinationGlobalSettingsValueSchema } from '@sentinel/shared/schema';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

/**
 * Parses a raw `system_settings.setting_value` payload into the shared examination-global-settings shape.
 */
export function parseExaminationGlobalSettingsValue(value: unknown): ExaminationGlobalSettings {
    const parseCandidate = (candidate: unknown) => {
        const parsed = examinationGlobalSettingsValueSchema.safeParse(candidate);
        return parsed.success ? parsed.data : null;
    };

    const directValue = parseCandidate(value);
    if (directValue) {
        return directValue;
    }

    if (typeof value === 'string') {
        try {
            const parsedJson = JSON.parse(value);
            const parsedValue = parseCandidate(parsedJson);
            if (parsedValue) {
                return parsedValue;
            }
        } catch {
            // Ignore malformed JSON and fall through to defaults.
        }
    }

    return { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS };
}
