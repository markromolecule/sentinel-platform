'use client';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamAttemptPage from './page';

const {
    mockRouterReplace,
    mockStudentExamData,
    mockExamSession,
    mockExamMonitoring,
    mockAttemptMediaPipeMonitoring,
    mockUseAudioAnomalyWorker,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockStudentExamData: vi.fn(),
    mockExamSession: vi.fn(),
    mockExamMonitoring: vi.fn(),
    mockAttemptMediaPipeMonitoring: vi.fn(),
    mockUseAudioAnomalyWorker: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('../_components/student-exam-loading-state', () => ({
    StudentExamLoadingState: () => <div>Loading...</div>,
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-exam-session', () => ({
    useExamSession: () => mockExamSession(),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring', () => ({
    useExamMonitoring: (args: unknown) => mockExamMonitoring(args),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring', () => ({
    useAttemptMediaPipeMonitoring: () => mockAttemptMediaPipeMonitoring(),
}));

vi.mock('@/hooks/use-audio-anomaly-worker', () => ({
    useAudioAnomalyWorker: () => mockUseAudioAnomalyWorker(),
}));

vi.mock('@/app/(protected)/student/exam/[id]/attempt/_lib/exam-turn-in-storage', () => ({
    writeStoredExamTurnInPreview: vi.fn(),
}));

vi.mock('@/lib/config', () => ({
    default: {
        isProduction: false,
        isDevelopment: true,
    },
    config: {
        isProduction: false,
        isDevelopment: true,
    },
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
        AlertDialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
            open ? <div>{children}</div> : null,
        AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        AlertDialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        AlertDialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        AlertDialogAction: ({
            children,
            onClick,
        }: {
            children: ReactNode;
            onClick?: () => void;
        }) => <button onClick={onClick}>{children}</button>,
    };
});

vi.mock('@/features/exams/_components/engine', () => ({
    ExamAttemptShell: ({
        title,
        status,
        toolbar,
        questionRail,
        passagePanel,
        footer,
        children,
    }: {
        title: string;
        status: ReactNode;
        toolbar: ReactNode;
        questionRail: ReactNode;
        passagePanel: ReactNode;
        footer: ReactNode;
        children: ReactNode;
    }) => (
        <div>
            <h1>{title}</h1>
            <div>{status}</div>
            <div>{toolbar}</div>
            <div>{questionRail}</div>
            <div>{passagePanel}</div>
            <div>{children}</div>
            <div>{footer}</div>
        </div>
    ),
    type: {},
    hasAnswer: (value: unknown) => value !== null && value !== undefined && value !== '',
    formatTimer: (seconds: number) => `${seconds}s`,
    getRuntimePassageDetails: () => ({
        title: 'Passage',
        description: '',
        body: '<p>Passage body</p>',
    }),
    ExamAttemptRuntimeHeader: ({ onSubmit }: { onSubmit: () => void }) => (
        <button onClick={onSubmit}>Turn in exam</button>
    ),
    ExamAttemptRuntimeFooter: () => <div>Footer</div>,
    ExamAttemptRuntimeNavigation: () => <div>Navigation</div>,
    ExamAttemptRuntimePassage: () => <div>Passage</div>,
    ExamAttemptRuntimeSecurity: ({
        securityLockReason,
        onResumeExam,
    }: {
        securityLockReason: string | null;
        onResumeExam: () => void;
    }) => (
        <div>
            {securityLockReason ? (
                <div>
                    <span>Return to the secured exam view</span>
                    <button onClick={onResumeExam}>Resume Exam</button>
                </div>
            ) : (
                'Security'
            )}
        </div>
    ),
    ExamAttemptRuntimeQuestion: ({
        currentQuestion,
        onAnswerChange,
    }: {
        currentQuestion: {
            content: {
                prompt: string;
            };
        };
        onAnswerChange: (value: string) => void;
    }) => (
        <div>
            <div>{currentQuestion.content.prompt}</div>
            <button onClick={() => onAnswerChange('4')}>Answer 4</button>
        </div>
    ),
}));

function createStudentExamData() {
    return {
        examId: '11111111-1111-1111-1111-111111111111',
        exam: {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'MediaPipe attempt',
            description: 'Attempt description',
            duration: 60,
            status: 'available',
            runtimeAccess: {
                canStart: true,
                canResume: false,
                hasActiveAttempt: true,
            },
        },
        configuration: {
            cameraRequired: true,
            micRequired: true,
            maxReconnectAttempts: 3,
            strictMode: true,
            screenLock: true,
            autoSubmitTimeoutMinutes: 5,
            aiRules: {
                gaze_tracking: true,
                face_detection: true,
                audio_anomaly_detection: false,
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
                root_jailbreak_detection: false,
            },
        },
        mediaPipeSandbox: {
            enabled: true,
            captureDuringCheckup: true,
            emitDuringExam: true,
            confidenceThreshold: 0.8,
            frameIntervalMs: 500,
            offScreenDurationMs: 3000,
            calibrationRequired: false,
            debugOverlayEnabled: false,
        },
        questions: [
            {
                id: 'question-1',
                content: {
                    prompt: 'What is 2 + 2?',
                    options: ['3', '4'],
                },
                orderIndex: 0,
            },
        ],
        isLoading: false,
    };
}

describe('StudentExamAttemptPage', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
        Object.defineProperty(document, 'fullscreenElement', {
            value: null,
            configurable: true,
        });
        Object.defineProperty(document, 'exitFullscreen', {
            value: vi.fn().mockResolvedValue(undefined),
            configurable: true,
        });

        mockStudentExamData.mockReturnValue(createStudentExamData());
        mockExamSession.mockReturnValue({
            examSession: {
                sessionId: '22222222-2222-2222-2222-222222222222',
                configSnapshot: null,
            },
            isInitializingSession: false,
            elapsedSeconds: 120,
            secondsRemaining: 1800,
            saveAnswerDraft: vi.fn(),
            syncProgress: vi.fn(),
        });
        mockExamMonitoring.mockReturnValue({
            securityLockReason: null,
            isResumingExam: false,
            resumeSecuredExam: vi.fn(),
            fullScreenContainerRef: { current: null },
            suspendSecurityMonitoring: vi.fn(),
        });
        mockAttemptMediaPipeMonitoring.mockReturnValue({
            videoRef: { current: null },
            analysis: {
                status: 'off-screen',
            },
            phase: 'running',
            errorMessage: null,
            activeIncident: null,
            dismissIncident: vi.fn(),
            isEnabled: true,
        });
        mockUseAudioAnomalyWorker.mockReturnValue({
            errorMessage: null,
            isEnabled: false,
            phase: 'idle',
        });
    });

    it('renders the active MediaPipe status badge inside the attempt shell', () => {
        render(<StudentExamAttemptPage />);

        expect(screen.getByText(/mediapipe off-screen/i)).toBeTruthy();
        expect(screen.getByText(/what is 2 \+ 2\?/i)).toBeTruthy();
    });

    it('renders the MediaPipe video element when MediaPipe monitoring is enabled', () => {
        render(<StudentExamAttemptPage />);

        const video = screen.getByTestId('attempt-mediapipe-video');

        expect(video.tagName).toBe('VIDEO');
        expect(video.className).not.toContain('hidden');
    });

    it('stays on the attempt view during normal answering flow', () => {
        render(<StudentExamAttemptPage />);

        fireEvent.click(screen.getByRole('button', { name: /answer 4/i }));

        expect(screen.getByText(/what is 2 \+ 2\?/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /turn in exam/i })).toBeTruthy();
        expect(screen.queryByText(/loading\.\.\./i)).toBeNull();
    });

    it('shows a MediaPipe incident dialog when an actionable signal is raised', () => {
        mockAttemptMediaPipeMonitoring.mockReturnValue({
            videoRef: { current: null },
            analysis: {
                status: 'multiple-faces',
            },
            phase: 'running',
            errorMessage: null,
            activeIncident: {
                eventType: 'MULTIPLE_FACES',
                detectedAt: '2026-04-22T12:00:00.000Z',
                analysis: {
                    status: 'multiple-faces',
                    signal: 'MULTIPLE_FACES',
                    faceCount: 2,
                    confidenceScore: 0.91,
                    gazeDirection: null,
                    eyeState: 'unknown',
                    faceBounds: null,
                    reasons: ['More than one face was detected in the active camera frame.'],
                },
            },
            dismissIncident: vi.fn(),
            isEnabled: true,
        });

        render(<StudentExamAttemptPage />);

        expect(screen.getByText(/multiple faces detected/i)).toBeTruthy();
        expect(screen.getByText(/only you are visible/i)).toBeTruthy();
    });

    it('shows a non-blocking MediaPipe warning when monitoring fails but keeps the exam visible', () => {
        mockAttemptMediaPipeMonitoring.mockReturnValue({
            videoRef: { current: null },
            analysis: null,
            phase: 'error',
            errorMessage:
                'MediaPipe monitoring could not start for this attempt. Existing browser security monitoring remains active.',
            activeIncident: null,
            dismissIncident: vi.fn(),
            isEnabled: true,
        });

        render(<StudentExamAttemptPage />);

        expect(
            screen.getByText(/existing browser security monitoring remains active/i),
        ).toBeTruthy();
        expect(screen.getByText(/mediapipe error/i)).toBeTruthy();
        expect(screen.getByText(/what is 2 \+ 2\?/i)).toBeTruthy();
    });

    it('starts result navigation before exiting fullscreen on turn in', () => {
        vi.useFakeTimers();
        const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
        const mockSuspendSecurityMonitoring = vi.fn();

        Object.defineProperty(document, 'fullscreenElement', {
            value: document.documentElement,
            configurable: true,
        });
        Object.defineProperty(document, 'exitFullscreen', {
            value: mockExitFullscreen,
            configurable: true,
        });
        mockExamMonitoring.mockReturnValue({
            securityLockReason: null,
            isResumingExam: false,
            resumeSecuredExam: vi.fn(),
            fullScreenContainerRef: { current: null },
            suspendSecurityMonitoring: mockSuspendSecurityMonitoring,
        });

        render(<StudentExamAttemptPage />);

        fireEvent.click(screen.getByRole('button', { name: /answer 4/i }));
        fireEvent.click(screen.getByRole('button', { name: /turn in exam/i }));

        expect(mockSuspendSecurityMonitoring).toHaveBeenCalled();
        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/11111111-1111-1111-1111-111111111111/result',
        );
        expect(mockExitFullscreen).not.toHaveBeenCalled();

        act(() => {
            vi.runOnlyPendingTimers();
        });

        expect(mockExitFullscreen).toHaveBeenCalled();
        expect(mockRouterReplace.mock.invocationCallOrder[0]).toBeLessThan(
            mockExitFullscreen.mock.invocationCallOrder[0],
        );
    });

    it('displays the security lock overlay when a monitoring violation occurs', () => {
        // Mock a focus-loss lock state
        mockExamMonitoring.mockReturnValue({
            securityLockReason: 'focus-loss',
            isResumingExam: false,
            resumeSecuredExam: vi.fn(),
            fullScreenContainerRef: { current: null },
            suspendSecurityMonitoring: vi.fn(),
        });

        render(<StudentExamAttemptPage />);

        // The text for focus-loss comes from ExamAttemptRuntimeSecurity
        expect(screen.getByText(/return to the secured exam view/i)).toBeTruthy();
        expect(screen.getByText(/resume exam/i)).toBeTruthy();
    });

    it('removes the security lock overlay and allows interaction after clicking resume', () => {
        const resumeSecuredExam = vi.fn();
        mockExamMonitoring.mockReturnValue({
            securityLockReason: 'focus-loss',
            isResumingExam: false,
            resumeSecuredExam,
            fullScreenContainerRef: { current: null },
            suspendSecurityMonitoring: vi.fn(),
        });

        render(<StudentExamAttemptPage />);

        const resumeButton = screen.getByRole('button', { name: /resume exam/i });
        fireEvent.click(resumeButton);

        expect(resumeSecuredExam).toHaveBeenCalled();
    });
});
