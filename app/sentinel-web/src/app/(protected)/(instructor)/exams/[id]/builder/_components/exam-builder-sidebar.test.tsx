import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ExamConfiguration, ExamSettings } from '@sentinel/shared/types';
import { useExamConfigurationQuery } from '@sentinel/hooks';
import { useParams } from 'next/navigation';
import { ExamBuilderSidebar } from './exam-builder-sidebar';

vi.mock('@sentinel/hooks', () => ({
    useExamConfigurationQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useParams: vi.fn(),
}));

afterEach(() => {
    cleanup();
});

const settings: ExamSettings = {
    shuffleQuestions: false,
    showCorrectAnswers: false,
    allowReview: false,
    randomizeChoices: false,
};

const configuration: ExamConfiguration = {
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
};

describe('ExamBuilderSidebar', () => {
    it('toggles rule switches from the sidebar', () => {
        const handleToggleExamSetting = vi.fn();
        const handleToggleLobbyAdmissionMode = vi.fn();
        const handleToggleReleaseScoreMode = vi.fn();
        const handleToggleStrictMode = vi.fn();

        vi.mocked(useParams).mockReturnValue({ id: 'exam-1' });
        vi.mocked(useExamConfigurationQuery).mockReturnValue({
            data: { configuration },
            isLoading: false,
        } as never);

        render(
            <ExamBuilderSidebar
                settings={settings}
                configuration={configuration}
                handleToggleExamSetting={handleToggleExamSetting}
                handleToggleLobbyAdmissionMode={handleToggleLobbyAdmissionMode}
                handleToggleReleaseScoreMode={handleToggleReleaseScoreMode}
                handleToggleStrictMode={handleToggleStrictMode}
            />,
        );

        fireEvent.click(screen.getByRole('switch', { name: 'Shuffle Questions' }));
        fireEvent.click(screen.getByRole('switch', { name: 'Require Instructor Admit' }));
        fireEvent.click(screen.getByRole('switch', { name: 'Auto Release Scores' }));
        fireEvent.click(screen.getByRole('switch', { name: 'Strict Mode' }));

        expect(handleToggleExamSetting).toHaveBeenCalledWith('shuffleQuestions', true);
        expect(handleToggleLobbyAdmissionMode).toHaveBeenCalledWith(true);
        expect(handleToggleReleaseScoreMode).toHaveBeenCalledWith(false);
        expect(handleToggleStrictMode).toHaveBeenCalledWith(false);
    });

    it('shows the configuration summary and full configuration link', () => {
        vi.mocked(useParams).mockReturnValue({ id: 'exam-1' });
        vi.mocked(useExamConfigurationQuery).mockReturnValue({
            data: { configuration },
            isLoading: false,
        } as never);

        render(
            <ExamBuilderSidebar
                settings={settings}
                configuration={configuration}
                handleToggleExamSetting={vi.fn()}
                handleToggleLobbyAdmissionMode={vi.fn()}
                handleToggleReleaseScoreMode={vi.fn()}
                handleToggleStrictMode={vi.fn()}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Configuration' })).toBeTruthy();
        expect(
            screen.getByRole('link', { name: /open full configuration/i }).getAttribute('href'),
        ).toBe('/exams/config?id=exam-1');
    });
});
