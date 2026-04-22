'use client';

import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamCheckupPage from './page';

const {
    mockRouterPush,
    mockPatchStoredStudentExamFlow,
    mockStudentExamData,
    mockCheckupManager,
    mockCheckupMediaPipe,
} = vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockPatchStoredStudentExamFlow: vi.fn(),
    mockStudentExamData: vi.fn(),
    mockCheckupManager: vi.fn(),
    mockCheckupMediaPipe: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

vi.mock('../_components/student-exam-loading-state', () => ({
    StudentExamLoadingState: () => <div>Loading...</div>,
}));

vi.mock('../_components/student-flow-shell', () => ({
    StudentFlowShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('../_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

vi.mock('../_hooks/use-checkup-mediapipe', () => ({
    useCheckupMediaPipe: () => mockCheckupMediaPipe(),
}));

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_hooks/use-checkup-manager',
    () => ({
        useCheckupManager: () => mockCheckupManager(),
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header',
    () => ({
        PreviewPageHeader: ({ title, description }: { title: string; description: string }) => (
            <div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        ),
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list',
    () => ({
        ReadinessList: () => <div>Readiness list</div>,
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions',
    () => ({
        PreviewFooterActions: ({
            primaryLabel,
            primaryDisabled,
        }: {
            primaryLabel: string;
            primaryDisabled?: boolean;
        }) => (
            <button type="button" disabled={primaryDisabled}>
                {primaryLabel}
            </button>
        ),
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants',
    () => ({
        CHECKUP_READINESS_ITEMS: [],
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/device-preview-panel',
    () => ({
        DevicePreviewPanel: () => <div>Device preview</div>,
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/checkup-status-card',
    () => ({
        CheckupStatusCard: () => <div>Check status</div>,
    }),
);

vi.mock('../_lib/student-exam-flow', () => ({
    buildStudentExamHref: (examId: string, step: string) => `/student/exam/${examId}/${step}`,
    patchStoredStudentExamFlow: mockPatchStoredStudentExamFlow,
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
        Progress: ({ value }: { value?: number }) => <div>Progress {value ?? 0}</div>,
    };
});

function createStudentExamData(overrides?: Record<string, unknown>) {
    return {
        examId: '11111111-1111-1111-1111-111111111111',
        exam: {
            status: 'published',
            attemptId: null,
            runtimeAccess: {
                canStart: true,
                canResume: false,
                hasActiveAttempt: false,
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
            emitDuringExam: false,
            confidenceThreshold: 0.8,
            frameIntervalMs: 500,
            offScreenDurationMs: 3000,
            calibrationRequired: true,
            debugOverlayEnabled: false,
        },
        isLoading: false,
        ...overrides,
    };
}

describe('StudentExamCheckupPage', () => {
    beforeEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();

        mockStudentExamData.mockReturnValue(createStudentExamData());
        mockCheckupManager.mockReturnValue({
            videoRef: { current: null },
            cameraState: 'granted',
            micState: 'granted',
            isRequesting: false,
            isStreamActive: true,
            errorMessage: null,
            isCheckupReady: true,
            requestDeviceAccess: vi.fn(),
        });
        mockCheckupMediaPipe.mockReturnValue({
            overlayCanvasRef: { current: null },
            analysis: {
                status: 'off-screen',
                signal: 'GAZE_OFF_SCREEN',
                faceCount: 1,
                confidenceScore: 0.91,
                gazeDirection: 'left',
                eyeState: 'open',
                faceBounds: null,
                reasons: ['Eye tracking indicates the student is looking away from center.'],
            },
            errorMessage: null,
            calibrationProgress: 50,
            isCalibrated: false,
            isEnabled: true,
        });
    });

    it('shows the expanded MediaPipe checkup outputs and keeps the lobby locked while calibration is required', () => {
        render(<StudentExamCheckupPage />);

        expect(screen.getByText(/face visibility/i)).toBeTruthy();
        expect(screen.getByText(/single face visible/i)).toBeTruthy();
        expect(screen.getByText(/multiple-face warning/i)).toBeTruthy();
        expect(screen.getByText(/no additional faces detected/i)).toBeTruthy();
        expect(screen.getByText(/gaze calibration guidance/i)).toBeTruthy();
        expect(screen.getByText(/center your face and eyes inside the frame/i)).toBeTruthy();
        expect(screen.getByText(/eye state/i)).toBeTruthy();
        expect(screen.getByText(/^open$/i)).toBeTruthy();
        expect(screen.getByText(/confidence snapshot/i)).toBeTruthy();
        expect(screen.getByText('0.91')).toBeTruthy();
        expect(screen.getByText(/calibration completion/i)).toBeTruthy();
        expect(screen.getByText(/calibration still required/i)).toBeTruthy();
        expect(
            (screen.getByRole('button', { name: /continue to lobby/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
    });

    it('does not block the student unexpectedly when the sandbox is disabled', () => {
        mockStudentExamData.mockReturnValue(
            createStudentExamData({
                configuration: {
                    ...createStudentExamData().configuration,
                    cameraRequired: false,
                },
                mediaPipeSandbox: {
                    ...createStudentExamData().mediaPipeSandbox,
                    enabled: false,
                    captureDuringCheckup: false,
                    calibrationRequired: false,
                },
            }),
        );
        mockCheckupManager.mockReturnValue({
            videoRef: { current: null },
            cameraState: 'idle',
            micState: 'granted',
            isRequesting: false,
            isStreamActive: false,
            errorMessage: null,
            isCheckupReady: true,
            requestDeviceAccess: vi.fn(),
        });
        mockCheckupMediaPipe.mockReturnValue({
            overlayCanvasRef: { current: null },
            analysis: null,
            errorMessage: null,
            calibrationProgress: 0,
            isCalibrated: false,
            isEnabled: false,
        });

        render(<StudentExamCheckupPage />);

        expect(
            (screen.getByRole('button', { name: /continue to lobby/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(false);
    });
});
