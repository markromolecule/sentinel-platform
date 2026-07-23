/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import type { ExamConfigurationState } from '@sentinel/services';
import { AiRulesSection } from './ai-rules-section';
import { useEffect } from 'react';

const defaultValues: ExamConfigurationState = {
    settings: {
        shuffleQuestions: false,
        showCorrectAnswers: false,
        allowReview: false,
        randomizeChoices: false,
    },
    configuration: {
        lobbyAdmissionMode: 'AUTOMATIC',
        releaseScoreMode: 'AUTO_RELEASE',
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
    },
};

describe('AiRulesSection', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders automatic close policy switch and toggles custom fields', () => {
        let formRef: any;

        function Harness() {
            const form = useForm<ExamConfigurationState>({ defaultValues });

            useEffect(() => {
                formRef = form;
            });

            return (
                <FormProvider {...form}>
                    <AiRulesSection />
                </FormProvider>
            );
        }

        render(<Harness />);

        // The policy is enabled by default (form default is checked)
        expect(screen.getByRole('switch', { name: /enable automatic close/i })).toBeTruthy();
        expect(screen.getByLabelText(/high incident threshold/i)).toBeTruthy();
        expect(screen.getByLabelText(/monitoring window/i)).toBeTruthy();

        // Turn it off
        fireEvent.click(screen.getByRole('switch', { name: /enable automatic close/i }));
        expect(formRef?.getValues('configuration.automaticClosePolicy.enabled')).toBe(false);

        // Sub-options should not be rendered
        expect(screen.queryByLabelText(/high incident threshold/i)).toBeNull();
    });

    it('toggles useOccurrenceCount and sets immediateCloseEventTypes', () => {
        let formRef: any;

        function Harness() {
            const form = useForm<ExamConfigurationState>({
                defaultValues: {
                    ...defaultValues,
                    configuration: {
                        ...defaultValues.configuration,
                        automaticClosePolicy: {
                            enabled: true,
                            highIncidentThreshold: 3,
                            windowMinutes: 15,
                            useOccurrenceCount: false,
                            immediateCloseEventTypes: [],
                        },
                    } as any,
                },
            });

            useEffect(() => {
                formRef = form;
            });

            return (
                <FormProvider {...form}>
                    <AiRulesSection />
                </FormProvider>
            );
        }

        render(<Harness />);

        // Toggle occurrence count
        fireEvent.click(screen.getByRole('switch', { name: /use incident occurrence count/i }));
        expect(formRef?.getValues('configuration.automaticClosePolicy.useOccurrenceCount')).toBe(
            true,
        );

        // Toggle fullscreen_exit checkbox
        const fullscreenCheckbox = screen.getByLabelText(/fullscreen exit/i);
        fireEvent.click(fullscreenCheckbox);
        expect(
            formRef?.getValues('configuration.automaticClosePolicy.immediateCloseEventTypes'),
        ).toContain('fullscreen_exit');
    });
});
