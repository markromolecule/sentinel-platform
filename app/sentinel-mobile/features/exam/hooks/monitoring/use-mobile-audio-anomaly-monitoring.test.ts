import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('expo-constants', () => ({
    default: {
        expoConfig: {
            version: '1.0.0',
        },
        nativeAppVersion: '1.0.0',
    },
}));

vi.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        Version: '17.0',
    },
}));

// ─── React Mocking ───
let stateValues: any[] = [];
let stateIndex = 0;
let effectCallbacks: Array<() => void | (() => void)> = [];

vi.mock('react', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        default: actual.default || actual,
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
    };
});

// Mock @sentinel/hooks useAudioSettingsQuery
const mockAudioSettingsQuery = vi.fn();
vi.mock('@sentinel/hooks', () => ({
    useAudioSettingsQuery: () => mockAudioSettingsQuery(),
}));

// Mock telemetry client
const mockEmitTelemetry = vi.fn().mockResolvedValue(true);
vi.mock('@/features/exam/lib/mobile-telemetry-client', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        emitMobileTelemetryEvent: (args: any) => mockEmitTelemetry(args),
    };
});

import { useMobileAudioAnomalyMonitoring } from './use-mobile-audio-anomaly-monitoring';
import { DEFAULT_AUDIO_ANOMALY_CONFIG } from '@sentinel/shared';

describe('useMobileAudioAnomalyMonitoring', () => {
    beforeEach(() => {
        stateValues = [];
        stateIndex = 0;
        effectCallbacks = [];
        vi.clearAllMocks();
        mockAudioSettingsQuery.mockReturnValue({
            data: null,
            isLoading: false,
        });
    });

    it('enables audio monitoring when rules permit and valid session credentials exist', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examId: 'exam-1',
            examSessionId: 'sess-1',
            studentId: 'stud-1',
            configuration: {
                aiRules: {
                    audio_anomaly_detection: true,
                },
                micRequired: true,
            } as any,
        });

        expect(result.isEnabled).toBe(true);
        expect(result.isMonitoring).toBe(false); // idle initially
        expect(result.bridgeStatus).toBe('idle');
        expect(result.error).toBeNull();
    });

    it('disables monitoring when audio_anomaly_detection is explicitly false', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examId: 'exam-1',
            examSessionId: 'sess-1',
            studentId: 'stud-1',
            configuration: {
                aiRules: {
                    audio_anomaly_detection: false,
                },
            } as any,
        });

        expect(result.isEnabled).toBe(false);
    });

    it('disables monitoring when micRequired is false', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examId: 'exam-1',
            examSessionId: 'sess-1',
            studentId: 'stud-1',
            configuration: {
                micRequired: false,
            } as any,
        });

        expect(result.isEnabled).toBe(false);
    });

    it('disables monitoring when session ID or student ID is missing', () => {
        const missingSession = useMobileAudioAnomalyMonitoring({
            examId: 'exam-1',
            studentId: 'stud-1',
        });
        expect(missingSession.isEnabled).toBe(false);

        stateIndex = 0;
        stateValues = [];
        const missingStudent = useMobileAudioAnomalyMonitoring({
            examId: 'exam-1',
            examSessionId: 'sess-1',
        });
        expect(missingStudent.isEnabled).toBe(false);
    });

    it('adopts shared calibration from useAudioSettingsQuery', () => {
        mockAudioSettingsQuery.mockReturnValue({
            data: {
                value: {
                    sensitivityMultiplier: 1.5,
                    consecutiveFrameThreshold: 3,
                    cooldownMs: 8000,
                    thresholds: {
                        TALKING: 0.6,
                    },
                    enabledAnomalyTypes: ['TALKING'],
                },
            },
            isLoading: false,
        });

        const result = useMobileAudioAnomalyMonitoring({
            examSessionId: 'sess-1',
            studentId: 'stud-1',
        });

        expect(result.effectiveConfig.sensitivityMultiplier).toBe(1.5);
        expect(result.effectiveConfig.consecutiveFrameThreshold).toBe(3);
        expect(result.effectiveConfig.cooldownMs).toBe(8000);
        expect(result.effectiveConfig.thresholds.TALKING).toBe(0.6);
        expect(result.effectiveConfig.enabledAnomalyTypes).toEqual(['TALKING']);
    });

    it('falls back to DEFAULT_AUDIO_ANOMALY_CONFIG when query has no data', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examSessionId: 'sess-1',
            studentId: 'stud-1',
        });

        expect(result.effectiveConfig.sensitivityMultiplier).toBe(
            DEFAULT_AUDIO_ANOMALY_CONFIG.sensitivityMultiplier,
        );
        expect(result.effectiveConfig.consecutiveFrameThreshold).toBe(
            DEFAULT_AUDIO_ANOMALY_CONFIG.consecutiveFrameThreshold,
        );
        expect(result.effectiveConfig.cooldownMs).toBe(
            DEFAULT_AUDIO_ANOMALY_CONFIG.cooldownMs,
        );
        expect(result.effectiveConfig.thresholds.TALKING).toBe(
            DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds.TALKING,
        );
    });

    it('updates bridge status and transitions to isMonitoring = true when running', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examSessionId: 'sess-1',
            studentId: 'stud-1',
        });

        expect(result.isMonitoring).toBe(false);

        result.handleStatusChange('running');
        expect(stateValues[0]).toBe('running');
    });

    it('captures bridge error gracefully without throwing', () => {
        const result = useMobileAudioAnomalyMonitoring({
            examSessionId: 'sess-1',
            studentId: 'stud-1',
        });

        result.handleError({
            code: 'permission_denied',
            message: 'Microphone permission denied',
        });

        expect(stateValues[1]).toEqual({
            code: 'permission_denied',
            message: 'Microphone permission denied',
        });
        expect(stateValues[0]).toBe('error');
    });

    it('forwards qualified anomaly to onAnomalyDetected callback and emits telemetry', () => {
        const onAnomaly = vi.fn();
        const apiClient = {};
        const config = {
            aiRules: { audio_anomaly_detection: true },
            micRequired: true,
        };

        const result = useMobileAudioAnomalyMonitoring({
            apiClient: apiClient as any,
            configuration: config as any,
            examSessionId: 'sess-1',
            studentId: 'stud-1',
            onAnomalyDetected: onAnomaly,
        });

        const anomaly = {
            anomalyType: 'TALKING' as const,
            confidenceScore: 0.92,
            detectedAt: '2026-09-14T12:00:00.000Z',
        };

        result.handleAnomalyDetected(anomaly);
        expect(onAnomaly).toHaveBeenCalledWith(anomaly);
        expect(mockEmitTelemetry).toHaveBeenCalledWith(
            expect.objectContaining({
                apiClient,
                examSessionId: 'sess-1',
                studentId: 'stud-1',
                eventType: 'AUDIO_ANOMALY',
                metadata: expect.objectContaining({
                    anomalyType: 'TALKING',
                    confidenceScore: 0.92,
                }),
            }),
        );
    });

    it('tolerates telemetry emission errors without interrupting student', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockEmitTelemetry.mockRejectedValueOnce(new Error('Network offline'));

        const onAnomaly = vi.fn();
        const result = useMobileAudioAnomalyMonitoring({
            examSessionId: 'sess-1',
            studentId: 'stud-1',
            onAnomalyDetected: onAnomaly,
        });

        const anomaly = {
            anomalyType: 'BACKGROUND_NOISE' as const,
            confidenceScore: 0.85,
            detectedAt: '2026-09-14T12:00:00.000Z',
        };

        // Must not throw
        expect(() => result.handleAnomalyDetected(anomaly)).not.toThrow();
        expect(onAnomaly).toHaveBeenCalledWith(anomaly);

        consoleSpy.mockRestore();
    });
});

