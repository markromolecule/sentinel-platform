import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import type { ExamConfigurationState } from '@sentinel/services';
import { ExamRulesSection } from './exam-rules-section';

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

describe('ExamRulesSection', () => {
    afterEach(() => {
        cleanup();
    });

    it('stores instructor admit as a lobby admission mode', () => {
        let formRef: UseFormReturn<ExamConfigurationState> | undefined;

        function Harness() {
            const form = useForm<ExamConfigurationState>({ defaultValues });
            formRef = form;

            return (
                <FormProvider {...form}>
                    <ExamRulesSection />
                </FormProvider>
            );
        }

        render(<Harness />);

        fireEvent.click(screen.getByRole('switch', { name: /require instructor admit/i }));

        expect(formRef?.getValues('configuration.lobbyAdmissionMode')).toBe('INSTRUCTOR_GATED');
    });

    it('stores score release mode through the auto release toggle', () => {
        let formRef: UseFormReturn<ExamConfigurationState> | undefined;

        function Harness() {
            const form = useForm<ExamConfigurationState>({ defaultValues });
            formRef = form;

            return (
                <FormProvider {...form}>
                    <ExamRulesSection />
                </FormProvider>
            );
        }

        render(<Harness />);

        fireEvent.click(screen.getByRole('switch', { name: /auto-release student score/i }));

        expect(formRef?.getValues('configuration.releaseScoreMode')).toBe('MANUAL_RELEASE');
    });
});
