import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioAnomalyEngine, resampleAudioTo16kHz } from '../audio-anomaly-engine';
import { DEFAULT_AUDIO_ANOMALY_CONFIG } from '@sentinel/shared';
import * as tf from '@tensorflow/tfjs';

// Mock getAnomalyConfidence so we can deterministically trigger alerts
vi.mock('@sentinel/shared', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@sentinel/shared')>();
    return {
        ...mod,
        getAnomalyConfidence: vi.fn((scoresArray: Float32Array, anomalyType: string) => {
            // If the first element is 1.0, simulate a TALKING event with 0.9 confidence
            if (anomalyType === 'TALKING' && scoresArray[0] === 1.0) {
                return 0.9;
            }
            // Background noise mock trigger
            if (anomalyType === 'BACKGROUND_NOISE' && scoresArray[0] === 0.5) {
                return 0.7;
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
            shape: [data.length],
            dispose: vi.fn(),
        })),
        loadGraphModel: vi.fn().mockResolvedValue({
            predict: vi.fn((tensor) => {
                const data = tensor.dataSync();
                // Return a mock tensor with the same first element as the input
                return {
                    dataSync: () => new Float32Array([data[0], ...new Array(520).fill(0)]),
                    shape: [521],
                    dispose: vi.fn(),
                };
            }),
        }),
        tidy: vi.fn((fn) => fn()),
    };
});

describe('AudioAnomalyEngine', () => {
    let engine: AudioAnomalyEngine;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Deep clone the config and modify consecutiveFrameThreshold to 2
        const config = JSON.parse(JSON.stringify(DEFAULT_AUDIO_ANOMALY_CONFIG));
        config.consecutiveFrameThreshold = 2;
        config.cooldownMs = 0; // Disable cooldown for tests
        // Exclude silence detection from general tests to avoid RMS triggers on empty buffers
        config.enabledAnomalyTypes = [
            'TALKING',
            'TYPING',
            'TAPPING',
            'MOUTH_BREATHING',
            'BACKGROUND_NOISE',
        ];

        engine = new AudioAnomalyEngine(config);
        await engine.initialize();
        engine.start();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('loads the local TF.js YAMNet bundle from the public runtime path', async () => {
        expect(tf.loadGraphModel).toHaveBeenCalledWith(
            expect.stringContaining('/models/yamnet/model.json'),
        );
    });

    it('does not enable silence detection by default', () => {
        expect(DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes).not.toContain('SILENCE_DETECTED');
    });

    it('triggers onAnomalyDetected when consecutive frame threshold is met', async () => {
        const onAnomalyDetected = vi.fn();

        const frame1 = new Float32Array(15600);
        frame1[0] = 1.0;

        await engine.processAudioChunk(frame1, 16000, onAnomalyDetected);
        expect(onAnomalyDetected).not.toHaveBeenCalled(); // Only 1 hit, threshold is 2

        const frame2 = new Float32Array(15600);
        frame2[0] = 1.0;

        await engine.processAudioChunk(frame2, 16000, onAnomalyDetected);
        // 2 consecutive hits, should trigger
        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);
        expect(onAnomalyDetected).toHaveBeenCalledWith({
            TALKING: 0.9,
        });
    });

    it('does not trigger when talking confidence never reaches the configured threshold', async () => {
        const onAnomalyDetected = vi.fn();

        const frame = new Float32Array(15600);
        frame[0] = 0.0;

        await engine.processAudioChunk(frame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(frame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).not.toHaveBeenCalled();
    });

    it('does not emit a silence anomaly when only low-amplitude frames are present and silence detection is disabled', async () => {
        const onAnomalyDetected = vi.fn();

        const quietFrame = new Float32Array(15600).fill(0.01);

        await engine.processAudioChunk(quietFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(quietFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(quietFrame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).not.toHaveBeenCalled();
    });

    it('resets counter if consecutive streak is broken', async () => {
        const onAnomalyDetected = vi.fn();

        const frameHit = new Float32Array(15600);
        frameHit[0] = 1.0;

        const frameMiss = new Float32Array(15600);
        frameMiss[0] = 0.0;

        await engine.processAudioChunk(frameHit, 16000, onAnomalyDetected); // 1 hit
        await engine.processAudioChunk(frameMiss, 16000, onAnomalyDetected); // streak broken, reset to 0
        await engine.processAudioChunk(frameHit, 16000, onAnomalyDetected); // 1 hit again

        expect(onAnomalyDetected).not.toHaveBeenCalled();
    });

    it('buffers smaller chunks seamlessly', async () => {
        const onAnomalyDetected = vi.fn();

        const chunk1 = new Float32Array(5000);
        chunk1[0] = 1.0;
        const chunk2 = new Float32Array(5000);
        const chunk3 = new Float32Array(5600);

        await engine.processAudioChunk(chunk1, 16000, onAnomalyDetected);
        await engine.processAudioChunk(chunk2, 16000, onAnomalyDetected);

        const tfMock = await import('@tensorflow/tfjs');
        const predictMock = (await tfMock.loadGraphModel('')).predict;
        expect(predictMock).not.toHaveBeenCalled();

        await engine.processAudioChunk(chunk3, 16000, onAnomalyDetected);
        expect(predictMock).toHaveBeenCalledTimes(1);
    });

    it('resamples 48 kHz input down to 16 kHz for YAMNet-sized inference windows', () => {
        const input = new Float32Array(48_000).fill(0.25);
        const resampled = resampleAudioTo16kHz(input, 48_000);

        expect(resampled).toHaveLength(16_000);
        expect(resampled[0]).toBeCloseTo(0.25, 5);
    });

    it('triggers BACKGROUND_NOISE when detected', async () => {
        const onAnomalyDetected = vi.fn();

        const frame = new Float32Array(15600);
        frame[0] = 0.5;

        await engine.processAudioChunk(frame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(frame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).toHaveBeenCalledWith({
            BACKGROUND_NOISE: 0.7,
        });
    });

    it('triggers BACKGROUND_NOISE from the RMS fallback when class scores stay low but amplitude is high', async () => {
        const onAnomalyDetected = vi.fn();

        const loudFrame = new Float32Array(15600).fill(0.2);

        await engine.processAudioChunk(loudFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(loudFrame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).toHaveBeenCalledWith({
            BACKGROUND_NOISE: expect.any(Number),
        });
    });

    it('triggers SILENCE_DETECTED only after a stricter sustained-frame requirement', async () => {
        const onAnomalyDetected = vi.fn();

        engine.updateConfig({
            ...DEFAULT_AUDIO_ANOMALY_CONFIG,
            consecutiveFrameThreshold: 2,
            cooldownMs: 0,
            enabledAnomalyTypes: ['SILENCE_DETECTED'],
        });

        const silentFrame = new Float32Array(15600).fill(0.01);

        await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).not.toHaveBeenCalled();

        await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);

        expect(onAnomalyDetected).toHaveBeenCalledWith({
            SILENCE_DETECTED: expect.any(Number),
        });
    });

    it('does not retrigger silence immediately because it uses an extended cooldown', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-11T00:00:00.000Z'));

        const onAnomalyDetected = vi.fn();

        engine.updateConfig({
            ...DEFAULT_AUDIO_ANOMALY_CONFIG,
            consecutiveFrameThreshold: 1,
            cooldownMs: 0,
            enabledAnomalyTypes: ['SILENCE_DETECTED'],
        });

        const silentFrame = new Float32Array(15600).fill(0.0);

        for (let i = 0; i < 5; i++) {
            await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date('2026-05-11T00:01:00.000Z'));

        for (let i = 0; i < 5; i++) {
            await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date('2026-05-11T00:03:01.000Z'));

        for (let i = 0; i < 5; i++) {
            await engine.processAudioChunk(silentFrame, 16000, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(2);
    });
});
