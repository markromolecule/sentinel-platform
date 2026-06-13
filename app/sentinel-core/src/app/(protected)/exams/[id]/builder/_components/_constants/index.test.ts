import { describe, expect, it, vi } from 'vitest';
import type { ExamConfiguration, ExamSettings } from '@sentinel/shared/types';
import {
    applyExamRuleToggle,
    getExamRuleToggleKey,
    getExamRuleToggleState,
    TOGGLE_OPTIONS,
} from './index';

const settings: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: false,
};

const configuration: ExamConfiguration = {
    lobbyAdmissionMode: 'INSTRUCTOR_GATED',
    maxReconnectAttempts: 3,
    strictMode: true,
    screenLock: true,
    cameraRequired: true,
    micRequired: true,
    autoSubmitTimeoutMinutes: 5,
    aiRules: {
        gaze_tracking: true,
        face_detection: true,
        audio_anomaly_detection: true,
        multiple_faces_detection: true,
    },
    webSecurity: {
        tab_switching_monitor: true,
        full_screen_required: true,
        clipboard_control: true,
        right_click_disable: true,
        print_screen_disable: true,
    },
    mobileSecurity: {
        app_pinning_required: true,
        prevent_backgrounding: true,
        notification_block: true,
        screenshot_block: true,
        root_jailbreak_detection: true,
    },
};

describe('exam builder rule toggles', () => {
    it('includes instructor admit in the shared rule metadata', () => {
        expect(TOGGLE_OPTIONS.map(getExamRuleToggleKey)).toContain(
            'configuration-lobbyAdmissionMode',
        );
    });

    it('reads instructor admit state from configuration', () => {
        const option = TOGGLE_OPTIONS.find((item) => item.key === 'lobbyAdmissionMode');

        expect(option).toBeDefined();
        expect(
            getExamRuleToggleState({
                option: option!,
                settings,
                configuration,
            }),
        ).toBe(true);
    });

    it('routes instructor admit toggles to the lobby admission handler', () => {
        const option = TOGGLE_OPTIONS.find((item) => item.key === 'lobbyAdmissionMode');
        const onToggleSetting = vi.fn();
        const onToggleLobbyAdmissionMode = vi.fn();

        applyExamRuleToggle({
            option: option!,
            checked: false,
            onToggleSetting,
            onToggleLobbyAdmissionMode,
        });

        expect(onToggleSetting).not.toHaveBeenCalled();
        expect(onToggleLobbyAdmissionMode).toHaveBeenCalledWith(false);
    });
});
