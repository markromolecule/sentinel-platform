import { describe, expect, it } from 'vitest';
import { buildDefaultExamConfiguration } from '../../modules/examination/configuration/services/build-default-exam-configuration.service';
import { hasExamConfigurationChanges } from '../../modules/examination/configuration/services/has-exam-configuration-changes.service';
import { mapExamConfigurationState } from '../../modules/examination/configuration/services/map-exam-configuration-state.service';
import { resolveExamSettings } from '../../modules/examination/configuration/services/resolve-exam-settings.service';

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
            lobbyAdmissionMode: 'AUTOMATIC',
            maxReconnectAttempts: 3,
            strictMode: true,
            screenLock: true,
            cameraRequired: true,
            micRequired: true,
            autoSubmitTimeoutMinutes: 5,
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

        expect(hasExamConfigurationChanges({})).toBe(false);
    });

    it('builds default configuration values', () => {
        const result = buildDefaultExamConfiguration();

        expect(result.cameraRequired).toBe(true);
        expect(result.strictMode).toBe(true);
        expect(result.screenLock).toBe(true);
        expect(result.aiRules).toMatchObject({
            gaze_tracking: true,
            face_detection: true,
            audio_anomaly_detection: true,
            multiple_faces_detection: true,
        });
    });
});
