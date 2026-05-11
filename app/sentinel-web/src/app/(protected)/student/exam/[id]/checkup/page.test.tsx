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
    mockCheckupAudio,
} = vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockPatchStoredStudentExamFlow: vi.fn(),
    mockStudentExamData: vi.fn(),
    mockCheckupManager: vi.fn(),
    mockCheckupMediaPipe: vi.fn(),
    mockCheckupAudio: vi.fn(),
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
    useCheckupMediaPipe: (args: unknown) => mockCheckupMediaPipe(args),
}));

vi.mock('../_hooks/use-student-checkup-manager', () => ({
    useStudentCheckupManager: () => mockCheckupManager(),
}));

vi.mock('../_components/student-exam-audio-provider', () => ({
    useCheckupAudio: () => mockCheckupAudio(),
}));

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
            title,
            description,
        }: {
            primaryLabel: string;
            primaryDisabled?: boolean;
            title?: string;
            description?: string;
        }) => (
            <div>
                {title ? <p>{title}</p> : null}
                {description ? <p>{description}</p> : null}
                <button type="button" disabled={primaryDisabled}>
                    {primaryLabel}
                </button>
            </div>
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

vi.mock('../_lib/student-exam-flow', async () => {
    const actual = await vi.importActual<typeof import('../_lib/student-exam-flow')>(
        '../_lib/student-exam-flow',
    );

    return {
        ...actual,
        buildStudentExamHref: (examId: string, step: string) => `/student/exam/${examId}/${step}`,
        patchStoredStudentExamFlow: mockPatchStoredStudentExamFlow,
    };
});

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
        mockCheckupAudio.mockReturnValue({
            audioStream: null,
            isAudioStreamActive: true,
            audioState: 'granted',
            isRequestingAudio: false,
            audioErrorMessage: null,
            requestAudioAccess: vi.fn(),
            stopAudioStream: vi.fn(),
        });
        mockCheckupMediaPipe.mockImplementation(() => ({
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
            calibrationReadyFrames: 3,
            calibrationHoldSecondsRemaining: 1.5,
            requiredCalibrationReadyFrames: 6,
            isCalibrated: false,
            isEnabled: true,
        }));
    });

    it('shows the current calibration UI and keeps the lobby locked while checkup activation is incomplete', () => {
        render(<StudentExamCheckupPage />);

        expect(screen.getByText(/system checkup/i)).toBeTruthy();
        expect(screen.getByText(/awaiting alignment/i)).toBeTruthy();
        expect(
            screen.getByText(/center your face in the guide to begin calibration/i),
        ).toBeTruthy();
        expect(screen.getByText(/progress 50/i)).toBeTruthy();
        expect(
            (screen.getByRole('button', { name: /finalizing setup/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
    });

    it('keeps checkup MediaPipe disabled when camera AI monitoring is not required for the exam', () => {
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
            calibrationReadyFrames: 0,
            calibrationHoldSecondsRemaining: 0,
            requiredCalibrationReadyFrames: 6,
            isCalibrated: false,
            isEnabled: false,
        });

        render(<StudentExamCheckupPage />);

        expect(mockCheckupMediaPipe).toHaveBeenCalledWith(
            expect.objectContaining({
                mediaPipeSandbox: expect.objectContaining({
                    enabled: false,
                    captureDuringCheckup: false,
                    calibrationRequired: false,
                }),
            }),
        );
        expect(screen.queryByText(/awaiting alignment/i)).toBeNull();
        expect(
            (screen.getByRole('button', { name: /continue to lobby/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(false);
    });

    it('forces student checkup calibration when the exam requires attempt-time MediaPipe even if rollout toggles were left off', () => {
        mockStudentExamData.mockReturnValue(
            createStudentExamData({
                mediaPipeSandbox: {
                    ...createStudentExamData().mediaPipeSandbox,
                    enabled: false,
                    captureDuringCheckup: false,
                    emitDuringExam: false,
                    calibrationRequired: false,
                },
            }),
        );

        render(<StudentExamCheckupPage />);

        expect(mockCheckupMediaPipe).toHaveBeenCalledWith(
            expect.objectContaining({
                mediaPipeSandbox: expect.objectContaining({
                    enabled: true,
                    captureDuringCheckup: true,
                    emitDuringExam: true,
                    calibrationRequired: true,
                }),
            }),
        );
        expect(
            (screen.getByRole('button', { name: /finalizing setup/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
    });

    it('stores a completed checkup state without fake MediaPipe activation when rollout is disabled', () => {
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
                    emitDuringExam: false,
                    calibrationRequired: false,
                },
            }),
        );
        mockCheckupMediaPipe.mockImplementation(() => ({
            overlayCanvasRef: { current: null },
            analysis: null,
            errorMessage: null,
            calibrationProgress: 0,
            calibrationReadyFrames: 0,
            calibrationHoldSecondsRemaining: 0,
            requiredCalibrationReadyFrames: 6,
            isCalibrated: false,
            isEnabled: false,
        }));

        render(<StudentExamCheckupPage />);

        expect(mockCheckupMediaPipe).toHaveBeenCalledWith(
            expect.objectContaining({
                mediaPipeSandbox: expect.objectContaining({
                    enabled: false,
                    captureDuringCheckup: false,
                    emitDuringExam: false,
                    calibrationRequired: false,
                }),
            }),
        );
        expect(mockPatchStoredStudentExamFlow).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
            expect.objectContaining({
                checkupCompleted: true,
                mediaPipeActivatedAt: null,
                mediaPipeCalibrationCompletedAt: null,
                mediaPipeActivationSource: null,
            }),
        );
    });

    it('keeps the continue button locked until calibration finishes even when the sandbox marks calibration optional', () => {
        mockStudentExamData.mockReturnValue(
            createStudentExamData({
                mediaPipeSandbox: {
                    ...createStudentExamData().mediaPipeSandbox,
                    calibrationRequired: false,
                },
            }),
        );
        mockCheckupMediaPipe.mockReturnValue({
            overlayCanvasRef: { current: null },
            analysis: {
                status: 'ready',
                signal: null,
                faceCount: 1,
                confidenceScore: 0.94,
                gazeDirection: 'center',
                eyeState: 'open',
                faceBounds: null,
                reasons: ['Single-face tracking is stable and aligned with the active thresholds.'],
            },
            errorMessage: null,
            calibrationProgress: 83,
            calibrationReadyFrames: 5,
            calibrationHoldSecondsRemaining: 0.5,
            requiredCalibrationReadyFrames: 6,
            isCalibrated: false,
            isEnabled: true,
        });

        render(<StudentExamCheckupPage />);

        expect(screen.getByText(/holding position/i)).toBeTruthy();
        expect(screen.getByText(/please stay still for 0.5 seconds/i)).toBeTruthy();
        expect(
            (screen.getByRole('button', { name: /finalizing setup/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
    });

    it('restores the continue button once calibration is complete', () => {
        mockCheckupMediaPipe.mockReturnValue({
            overlayCanvasRef: { current: null },
            analysis: {
                status: 'ready',
                signal: null,
                faceCount: 1,
                confidenceScore: 0.96,
                gazeDirection: 'center',
                eyeState: 'open',
                faceBounds: null,
                reasons: ['Single-face tracking is stable and aligned with the active thresholds.'],
            },
            errorMessage: null,
            calibrationProgress: 100,
            calibrationReadyFrames: 6,
            calibrationHoldSecondsRemaining: 0,
            requiredCalibrationReadyFrames: 6,
            isCalibrated: true,
            isEnabled: true,
        });

        render(<StudentExamCheckupPage />);

        expect(screen.getByText(/calibration successful/i)).toBeTruthy();
        expect(screen.getByText(/you are now ready to continue to the lobby/i)).toBeTruthy();
        expect(
            (screen.getByRole('button', { name: /continue to lobby/i }) as HTMLButtonElement)
                .disabled,
        ).toBe(false);
        expect(mockPatchStoredStudentExamFlow).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
            expect.objectContaining({
                checkupCompleted: true,
                mediaPipeActivationSource: 'checkup',
            }),
        );
    });
});
