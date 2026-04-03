import { describe, expect, it } from 'vitest';
import {
    buildDefaultExamConfiguration,
} from '../../modules/configuration/services/build-default-exam-configuration';
import { hasExamConfigurationChanges } from '../../modules/configuration/services/has-exam-configuration-changes';
import { mapExamConfigurationState } from '../../modules/configuration/services/map-exam-configuration-state';
import { resolveExamSettings } from '../../modules/configuration/services/resolve-exam-settings';

describe('configuration module', () => {
    it('maps missing stored configuration to stable defaults', () => {
        const result = mapExamConfigurationState();

        expect(result.settings).toEqual({
            shuffleQuestions: false,
            showCorrectAnswers: false,
            allowReview: false,
            randomizeChoices: false,
        });
        expect(result.configuration).toMatchObject({
            maxReconnectAttempts: 3,
            strictMode: true,
            cameraRequired: true,
            micRequired: true,
            screenLock: true,
            autoSubmitTimeoutMinutes: 5,
            allowedDevices: [],
        });
    });

    it('resolves settings with payload values before fallback values', () => {
        const result = resolveExamSettings({
            payload: {
                shuffleQuestions: true,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: true,
            },
            fallback: {
                shuffleQuestions: false,
                showCorrectAnswers: true,
                allowReview: false,
                randomizeChoices: false,
            },
        });

        expect(result).toEqual({
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        });
    });

    it('detects when an update payload changes configuration concerns', () => {
        expect(
            hasExamConfigurationChanges({
                configuration: {
                    cameraRequired: false,
                },
            }),
        ).toBe(true);

        expect(
            hasExamConfigurationChanges({
            }),
        ).toBe(false);
    });

    it('builds default configuration values', () => {
        const result = buildDefaultExamConfiguration();

        expect(result.cameraRequired).toBe(true);
        expect(result.strictMode).toBe(true);
        expect(result.aiRules).toMatchObject({
            gaze_tracking: true,
            tab_switching: true,
            face_detection: true,
            audio_detection: true,
        });
    });
});
