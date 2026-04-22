'use client';

import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamAttemptPage from './page';

const {
    mockRouterReplace,
    mockStudentExamData,
    mockExamSession,
    mockExamMonitoring,
    mockAttemptMediaPipeMonitoring,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockStudentExamData: vi.fn(),
    mockExamSession: vi.fn(),
    mockExamMonitoring: vi.fn(),
    mockAttemptMediaPipeMonitoring: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('../_components/student-exam-loading-state', () => ({
    StudentExamLoadingState: () => <div>Loading...</div>,
}));

vi.mock('../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('../_hooks/use-exam-session', () => ({
    useExamSession: () => mockExamSession(),
}));

vi.mock('../_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

vi.mock('../_hooks/use-exam-monitoring', () => ({
    useExamMonitoring: () => mockExamMonitoring(),
}));

vi.mock('../_hooks/use-attempt-mediapipe-monitoring', () => ({
    useAttemptMediaPipeMonitoring: () => mockAttemptMediaPipeMonitoring(),
}));

vi.mock('../_lib/exam-turn-in-storage', () => ({
    writeStoredExamTurnInPreview: vi.fn(),
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
        AlertDialogDescription: ({ children }: { children: ReactNode }) => (
            <div>{children}</div>
        ),
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
    getExamContextDetails: () => null,
    ExamAttemptRuntimeHeader: () => <div>Header</div>,
    ExamAttemptRuntimeFooter: () => <div>Footer</div>,
    ExamAttemptRuntimeNavigation: () => <div>Navigation</div>,
    ExamAttemptRuntimePassage: () => <div>Passage</div>,
    ExamAttemptRuntimeSecurity: () => <div>Security</div>,
    ExamAttemptRuntimeQuestion: ({
        currentQuestion,
    }: {
        currentQuestion: {
            content: {
                prompt: string;
            };
        };
    }) => <div>{currentQuestion.content.prompt}</div>,
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
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();

        mockStudentExamData.mockReturnValue(createStudentExamData());
        mockExamSession.mockReturnValue({
            examSession: {
                sessionId: '22222222-2222-2222-2222-222222222222',
                configSnapshot: null,
            },
            isInitializingSession: false,
            elapsedSeconds: 120,
            secondsRemaining: 1800,
            syncProgress: vi.fn(),
        });
        mockExamMonitoring.mockReturnValue({
            securityLockReason: null,
            isResumingExam: false,
            resumeSecuredExam: vi.fn(),
            fullScreenContainerRef: { current: null },
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
    });

    it('renders the active MediaPipe status badge inside the attempt shell', () => {
        render(<StudentExamAttemptPage />);

        expect(screen.getByText(/mediapipe off-screen/i)).toBeTruthy();
        expect(screen.getByText(/what is 2 \+ 2\?/i)).toBeTruthy();
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
});
