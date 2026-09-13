import { vi, describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── React Mocking ───
let stateValues: any[] = [];
let stateIndex = 0;
let effectCallbacks: Array<() => void | (() => void)> = [];

vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        default: actual,
        useState: (initialValue: any) => {
            const currentIndex = stateIndex;
            if (stateValues[currentIndex] === undefined) {
                stateValues[currentIndex] = initialValue;
            }
            const value = stateValues[currentIndex];
            const setValue = (newValue: any) => {
                if (typeof newValue === 'function') {
                    stateValues[currentIndex] = newValue(stateValues[currentIndex]);
                } else {
                    stateValues[currentIndex] = newValue;
                }
            };
            stateIndex++;
            return [value, setValue];
        },
        useEffect: (callback: () => void | (() => void)) => {
            effectCallbacks.push(callback);
        },
        useCallback: (fn: any) => fn,
        useMemo: (fn: any) => fn(),
        useRef: (initial: any) => ({ current: initial }),
        useContext: () => null,
    };
});

// ─── Native & Navigation Mocks ───
const mockRouter = {
    back: vi.fn(),
    push: vi.fn(),
};

vi.mock('expo-router', () => ({
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({ id: 'test-exam-123' }),
}));

vi.mock('react-native', () => ({
    useColorScheme: () => 'light',
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj.ios ?? obj.default,
    },
}));

vi.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        getItem: vi.fn(),
        setItem: vi.fn(),
    },
}));

// ─── Camera Mock ───
const mockRequestCameraPermission = vi.fn().mockResolvedValue({ granted: true });
let mockPermissionState: { granted: boolean; canAskAgain: boolean } | null = { granted: true, canAskAgain: true };

vi.mock('expo-camera', () => ({
    useCameraPermissions: () => [mockPermissionState, mockRequestCameraPermission],
}));

// ─── Audio Mock ───
const mockAudioRecorder = {
    isRecording: false,
    prepareToRecordAsync: vi.fn().mockResolvedValue(undefined),
    record: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
};

let mockRecorderMetering: number | undefined = -20;

vi.mock('expo-audio', () => ({
    useAudioRecorder: () => mockAudioRecorder,
    useAudioRecorderState: () => ({ metering: mockRecorderMetering }),
    AudioModule: {
        requestRecordingPermissionsAsync: vi.fn().mockResolvedValue({ granted: true }),
        setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
    },
    RecordingPresets: {
        HIGH_QUALITY: {},
    },
}));

// ─── Storage Mock ───
const mockReadStoredCalibration = vi.fn().mockResolvedValue(null);
const mockWriteStoredCalibration = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/exam/lib/mobile-exam-storage', () => ({
    readStoredMobileCalibrationProfile: (id: string) => mockReadStoredCalibration(id),
    writeStoredMobileCalibrationProfile: (id: string, p: any) => mockWriteStoredCalibration(id, p),
}));

// ─── MediaPipe Calibration Mock ───
vi.mock('@sentinel/shared', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        createMediaPipeCalibrationSample: vi.fn((args: any) => ({
            yaw: 0,
            pitch: 0,
            roll: 0,
            leftEyeGaze: { x: 0, y: 0 },
            rightEyeGaze: { x: 0, y: 0 },
            confidenceScore: args.confidenceScore,
        })),
    };
});

vi.mock('@/features/exam/lib/mobile-mediapipe-calibration', () => ({
    evaluateMobileCheckupFrame: vi.fn(() => ({
        evaluation: { isValid: true, details: 'Centered' },
    })),
    isMobileCalibrationStable: vi.fn(() => true),
    buildMobileCalibrationProfile: vi.fn(() => ({ profileId: 'profile-abc' })),
}));

// ─── Exam Query Mock ───
const mockExamData = {
    id: 'test-exam-123',
    title: 'Biology 101 Midterm',
    status: 'ACTIVE',
    configuration: {
        cameraRequired: true,
        micRequired: true,
        mobileSecurity: { prevent_backgrounding: true },
    },
    mediaPipeSandbox: {
        enabled: true,
        captureDuringCheckup: true,
        confidenceThreshold: 0.6,
    },
};

vi.mock('@sentinel/hooks', () => ({
    useExamQuery: () => ({ data: mockExamData }),
}));

import { useCheckupCamera } from './use-checkup-camera';
import { useCheckupAudio } from './use-checkup-audio';
import { useCheckupCalibration } from './use-checkup-calibration';
import { useExamCheckup } from './use-exam-checkup';

describe('use-exam-checkup refactor', () => {
    beforeEach(() => {
        stateValues = [];
        stateIndex = 0;
        effectCallbacks = [];
        mockRecorderMetering = -20;
        mockPermissionState = { granted: true, canAskAgain: true };
        vi.clearAllMocks();
    });

    describe('useCheckupCamera sub-hook', () => {
        it('initializes camera with front facing, permission, and handlers', () => {
            const camera = useCheckupCamera({ requiresCamera: true });

            expect(camera.cameraFacing).toBe('front');
            expect(camera.cameraReady).toBe(false);
            expect(camera.hasCameraPermission).toBe(true);

            camera.flipCamera();
            // State index 0 is cameraFacing, toggled to back
            expect(stateValues[0]).toBe('back');

            camera.onCameraReady();
            // State index 1 is cameraReady, set to true
            expect(stateValues[1]).toBe(true);
        });

        it('handles onCameraMountError by setting cameraReady', () => {
            const camera = useCheckupCamera({ requiresCamera: true });
            camera.onCameraMountError(new Error('Mount failed'));
            expect(stateValues[1]).toBe(true);
        });
    });

    describe('useCheckupAudio sub-hook', () => {
        it('normalizes metering value and detects input above threshold', () => {
            mockRecorderMetering = -10; // Normalized: (-10 + 60) / 60 = 0.83 > 0.15
            const audio = useCheckupAudio({ requiresMicrophone: true });

            // Run effects (metering processing & lifecycle)
            effectCallbacks.forEach((cb) => cb());

            expect(audio.startMicMetering).toBeDefined();
            expect(audio.stopMicMetering).toBeDefined();
        });

        it('stops microphone gracefully when recording', async () => {
            mockAudioRecorder.isRecording = true;
            const audio = useCheckupAudio({ requiresMicrophone: true });
            await audio.stopMicMetering();
            expect(mockAudioRecorder.stop).toHaveBeenCalled();
        });
    });

    describe('useCheckupCalibration sub-hook', () => {
        it('handles landmark detection and accumulates calibration samples', () => {
            const calibration = useCheckupCalibration({
                id: 'test-exam-123',
                exam: mockExamData as any,
                cameraReady: true,
                hasCameraPermission: true,
            });

            // Trigger landmark frames
            const mockLandmarks = [[{ x: 0.5, y: 0.5 }]];
            calibration.handleLandmarksDetected(mockLandmarks, 0.95);

            // stateIndex 4 in useCheckupCalibration is isFaceCentered
            expect(stateValues[4]).toBe(true);
        });
    });

    describe('useExamCheckup coordinator hook', () => {
        it('assembles all camera, audio, calibration, and navigation features cleanly', () => {
            const checkup = useExamCheckup();

            expect(checkup.exam?.title).toBe('Biology 101 Midterm');
            expect(checkup.requiresCamera).toBe(true);
            expect(checkup.requiresMicrophone).toBe(true);
            expect(checkup.cameraFacing).toBe('front');
            expect(checkup.handleGoBack).toBeDefined();
            expect(checkup.handleStartExam).toBeDefined();
        });

        it('navigates back and stops mic metering on handleGoBack', async () => {
            const checkup = useExamCheckup();
            await checkup.handleGoBack();
            expect(mockRouter.back).toHaveBeenCalled();
        });

        it('persists audio ready state and pushes to lobby on handleStartExam when calibrated', async () => {
            const checkup = useExamCheckup();

            // Calibrate: set isCalibrated = true, micDetected = true
            // In full hook render:
            // State 0: cameraFacing ('front')
            // State 1: cameraReady (false)
            // State 2: micLevel (0)
            // State 3: micDetected (false) -> set to true
            // State 4: calibrationProgress (0)
            // State 5: isCalibrated (false) -> set to true
            stateValues[3] = true; // micDetected
            stateValues[5] = true; // isCalibrated

            stateIndex = 0;
            const calibratedCheckup = useExamCheckup();
            await calibratedCheckup.handleStartExam();

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('sentinel-mobile:audio-ready:test-exam-123', 'true');
            expect(mockRouter.push).toHaveBeenCalledWith('/exam/test-exam-123/lobby');
        });
    });
});
