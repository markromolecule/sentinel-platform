import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentCheckupManager } from './use-student-checkup-manager';

const mockUseStudentExamMediaPipeStream = vi.fn();
const mockUseCheckupAudio = vi.fn();

vi.mock('../_components/student-exam-mediapipe-provider', () => ({
    useStudentExamMediaPipeStream: () => mockUseStudentExamMediaPipeStream(),
    isLiveVideoStream: (stream: unknown) => Boolean(stream),
}));

vi.mock('../_components/student-exam-audio-provider', () => ({
    useCheckupAudio: () => mockUseCheckupAudio(),
    isLiveAudioStream: (stream: unknown) => Boolean(stream),
}));

describe('useStudentCheckupManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseStudentExamMediaPipeStream.mockReturnValue({
            stream: { getTracks: () => [{ kind: 'video', readyState: 'live' }] },
            cameraState: 'granted',
            isRequesting: false,
            isStreamActive: true,
            errorMessage: null,
            mediaPipeError: null,
            requestDeviceAccess: vi.fn().mockResolvedValue(undefined),
            isCameraReady: vi.fn().mockReturnValue(true),
            isMediaPipeReady: vi.fn().mockReturnValue(true),
        });

        mockUseCheckupAudio.mockReturnValue({
            audioStream: { getTracks: () => [{ kind: 'audio', readyState: 'live' }] },
            audioState: 'granted',
            isRequestingAudio: false,
            audioErrorMessage: null,
            requestAudioAccess: vi.fn().mockResolvedValue(undefined),
            isAudioReady: vi.fn().mockReturnValue(true),
        });
    });

    it('returns isCheckupReady true when all required devices and MediaPipe are ready', () => {
        const configuration = {
            cameraRequired: true,
            micRequired: true,
            aiRules: { gaze_tracking: true },
        } as any;

        const { result } = renderHook(() => useStudentCheckupManager({ configuration }));

        expect(result.current.isCheckupReady).toBe(true);
        expect(result.current.cameraState).toBe('granted');
        expect(result.current.micState).toBe('granted');
    });

    it('returns isCheckupReady false when camera is required but no live stream is active', () => {
        mockUseStudentExamMediaPipeStream.mockReturnValue({
            stream: null,
            cameraState: 'blocked',
            isRequesting: false,
            isStreamActive: false,
            errorMessage: 'Camera access blocked',
            mediaPipeError: null,
            requestDeviceAccess: vi.fn(),
            isCameraReady: vi.fn().mockReturnValue(false),
            isMediaPipeReady: vi.fn().mockReturnValue(false),
        });

        const configuration = {
            cameraRequired: true,
            micRequired: false,
            aiRules: {},
        } as any;

        const { result } = renderHook(() => useStudentCheckupManager({ configuration }));

        expect(result.current.isCheckupReady).toBe(false);
        expect(result.current.errorMessage).toBe('Camera access blocked');
    });
});
