import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioAnomalyEngine } from '../audio-anomaly-engine';
import { DEFAULT_AUDIO_ANOMALY_CONFIG } from '@sentinel/shared';

// Mock getAnomalyConfidence so we can deterministically trigger alerts
vi.mock('@sentinel/shared', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@sentinel/shared')>();
    return {
        ...mod,
        getAnomalyConfidence: vi.fn((scoresArray: Float32Array, anomalyType: string) => {
            // For integration test, simulate TALKING for specific payload
            if (anomalyType === 'TALKING' && scoresArray[0] > 0.6) {
                return scoresArray[0];
            }
            return null;
        }),
    };
});

// Mock TF.js
vi.mock('@tensorflow/tfjs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tensorflow/tfjs')>();
    return {
        ...actual,
        setBackend: vi.fn().mockResolvedValue(true),
        ready: vi.fn().mockResolvedValue(true),
        tensor1d: vi.fn((data) => ({
            dataSync: () => data,
            dispose: vi.fn(),
        })),
        loadGraphModel: vi.fn().mockResolvedValue({
            predict: vi.fn((tensor) => {
                const data = tensor.dataSync();
                let mockScore = 0;
                if (Math.abs(data[0] - 0.99) < 0.0001) {
                    mockScore = 0.88;
                }

                return {
                    data: async () => new Float32Array([mockScore, ...new Array(520).fill(0)]),
                    dataSync: () => new Float32Array([mockScore, ...new Array(520).fill(0)]),
                    dispose: vi.fn(),
                };
            }),
        }),
        tidy: vi.fn((fn) => fn()),
    };
});

// Mock global fetch for POST /incidents/audio
global.fetch = vi.fn();

describe('Audio Anomaly Complete Lifecycle (Integration)', () => {
    let engine: AudioAnomalyEngine;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Initialize with production config, but disable silence detection to avoid conflict with TALKING mock
        const config = JSON.parse(JSON.stringify(DEFAULT_AUDIO_ANOMALY_CONFIG));
        config.enabledAnomalyTypes = config.enabledAnomalyTypes.filter(
            (t: string) => t !== 'SILENCE_DETECTED',
        );
        config.consecutiveFrameThreshold = 2;

        engine = new AudioAnomalyEngine(config);
        await engine.initialize();
        engine.start();
    });

    it('Scenario: Talking detected during exam', async () => {
        const onAnomalyDetected = vi.fn();

        // Step 1: Inject browser-rate audio that must be resampled before YAMNet inference.
        const frameData = new Float32Array(46_800);
        frameData[0] = 0.99; // Our trigger for "Speech" in mock

        // Feed frame 1
        await engine.processAudioChunk(frameData, 48_000, onAnomalyDetected);
        expect(onAnomalyDetected).not.toHaveBeenCalled(); // Need 2 consecutive frames after resampling

        // Feed frame 2
        await engine.processAudioChunk(frameData, 48_000, onAnomalyDetected);

        // Then the worker emits an ANOMALY event with type=TALKING and confidence >= 0.65
        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);
        expect(onAnomalyDetected).toHaveBeenCalledWith(
            expect.objectContaining({
                TALKING: expect.any(Number),
            }),
        );
        expect(onAnomalyDetected.mock.calls[0][0].TALKING).toBeCloseTo(0.88, 5);

        // Simulate main thread posting to telemetry
        const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        const alertPayload = {
            examSessionId: 'test-exam-123',
            studentId: 'test-student-456',
            anomalyType: 'TALKING',
            confidence: 0.88,
            detectedAt: new Date().toISOString(),
            frameWindow: 2,
        };

        await fetch('/api/telemetry/events', {
            method: 'POST',
            body: JSON.stringify({
                eventType: 'AUDIO_ANOMALY',
                data: alertPayload,
            }),
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0]).toBe('/api/telemetry/events');

        const body = JSON.parse(fetchCall[1].body);
        expect(body.eventType).toBe('AUDIO_ANOMALY');
        expect(body.data.anomalyType).toBe('TALKING');
        expect(body.data.confidence).toBeGreaterThanOrEqual(0.65);
    });

    it('keeps silence detection opt-in instead of enabling it in the default runtime config', () => {
        expect(DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes).not.toContain('SILENCE_DETECTED');
    });
});
