import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MonitoringPreloader } from './monitoring-preloader';
import type { ExamConfig } from '@sentinel/shared/types';

const { mockWarmupAudioAnomaly, mockWarmupMediaPipe } = vi.hoisted(() => ({
    mockWarmupAudioAnomaly: vi.fn(),
    mockWarmupMediaPipe: vi.fn(),
}));

vi.mock('./student-exam-audio-provider', () => ({
    useCheckupAudio: () => ({
        warmupAudioAnomaly: mockWarmupAudioAnomaly,
    }),
}));

vi.mock('./student-exam-mediapipe-provider', () => ({
    useStudentExamMediaPipeStream: () => ({
        warmupMediaPipe: mockWarmupMediaPipe,
    }),
}));

describe('MonitoringPreloader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('warms up audio anomaly detection when it is enabled, regardless of micRequired value', () => {
        const configWithMic = {
            micRequired: true,
            cameraRequired: false,
            aiRules: {
                audio_anomaly_detection: true,
                face_detection: false,
            },
        };

        render(<MonitoringPreloader configuration={configWithMic as unknown as ExamConfig} />);
        expect(mockWarmupAudioAnomaly).toHaveBeenCalledTimes(1);

        vi.clearAllMocks();

        const configWithoutMic = {
            micRequired: false,
            cameraRequired: false,
            aiRules: {
                audio_anomaly_detection: true,
                face_detection: false,
            },
        };

        render(<MonitoringPreloader configuration={configWithoutMic as unknown as ExamConfig} />);
        expect(mockWarmupAudioAnomaly).toHaveBeenCalledTimes(1);
    });

    it('does not warm up audio anomaly detection when it is disabled', () => {
        const configDisabled = {
            micRequired: true,
            cameraRequired: false,
            aiRules: {
                audio_anomaly_detection: false,
                face_detection: false,
            },
        };

        render(<MonitoringPreloader configuration={configDisabled as unknown as ExamConfig} />);
        expect(mockWarmupAudioAnomaly).not.toHaveBeenCalled();
    });

    it('warms up MediaPipe face detection only when face detection is enabled and camera is required', () => {
        const configEnabled = {
            micRequired: false,
            cameraRequired: true,
            aiRules: {
                audio_anomaly_detection: false,
                face_detection: true,
            },
        };

        render(<MonitoringPreloader configuration={configEnabled as unknown as ExamConfig} />);
        expect(mockWarmupMediaPipe).toHaveBeenCalledTimes(1);

        vi.clearAllMocks();

        const configNoCamera = {
            micRequired: false,
            cameraRequired: false,
            aiRules: {
                audio_anomaly_detection: false,
                face_detection: true,
            },
        };

        render(<MonitoringPreloader configuration={configNoCamera as unknown as ExamConfig} />);
        expect(mockWarmupMediaPipe).not.toHaveBeenCalled();

        vi.clearAllMocks();

        const configRulesDisabled = {
            micRequired: false,
            cameraRequired: true,
            aiRules: {
                audio_anomaly_detection: false,
                face_detection: false,
            },
        };

        render(
            <MonitoringPreloader configuration={configRulesDisabled as unknown as ExamConfig} />,
        );
        expect(mockWarmupMediaPipe).not.toHaveBeenCalled();
    });
});
