import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioAnomalyEngine } from '../audio-anomaly-engine';
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
        expect(DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes).not.toContain(
            'SILENCE_DETECTED',
        );
    });

    it('triggers onAnomalyDetected when consecutive frame threshold is met', async () => {
        const onAnomalyDetected = vi.fn();

        const frame1 = new Float32Array(15600);
        frame1[0] = 1.0;

        await engine.processAudioChunk(frame1, onAnomalyDetected);
        expect(onAnomalyDetected).not.toHaveBeenCalled(); // Only 1 hit, threshold is 2

        const frame2 = new Float32Array(15600);
        frame2[0] = 1.0;

        await engine.processAudioChunk(frame2, onAnomalyDetected);
        // 2 consecutive hits, should trigger
        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);
        expect(onAnomalyDetected).toHaveBeenCalledWith({
            TALKING: 0.9,
        });
    });

    it('resets counter if consecutive streak is broken', async () => {
        const onAnomalyDetected = vi.fn();

        const frameHit = new Float32Array(15600);
        frameHit[0] = 1.0;

        const frameMiss = new Float32Array(15600);
        frameMiss[0] = 0.0;

        await engine.processAudioChunk(frameHit, onAnomalyDetected); // 1 hit
        await engine.processAudioChunk(frameMiss, onAnomalyDetected); // streak broken, reset to 0
        await engine.processAudioChunk(frameHit, onAnomalyDetected); // 1 hit again

        expect(onAnomalyDetected).not.toHaveBeenCalled();
    });

    it('buffers smaller chunks seamlessly', async () => {
        const onAnomalyDetected = vi.fn();

        const chunk1 = new Float32Array(5000);
        chunk1[0] = 1.0;
        const chunk2 = new Float32Array(5000);
        const chunk3 = new Float32Array(5600);

        await engine.processAudioChunk(chunk1, onAnomalyDetected);
        await engine.processAudioChunk(chunk2, onAnomalyDetected);

        const tfMock = await import('@tensorflow/tfjs');
        const predictMock = (await tfMock.loadGraphModel('')).predict;
        expect(predictMock).not.toHaveBeenCalled();

        await engine.processAudioChunk(chunk3, onAnomalyDetected);
        expect(predictMock).toHaveBeenCalledTimes(1);
    });

    it('triggers BACKGROUND_NOISE when detected', async () => {
        const onAnomalyDetected = vi.fn();

        const frame = new Float32Array(15600);
        frame[0] = 0.5;

        await engine.processAudioChunk(frame, onAnomalyDetected);
        await engine.processAudioChunk(frame, onAnomalyDetected);

        expect(onAnomalyDetected).toHaveBeenCalledWith({
            BACKGROUND_NOISE: 0.7,
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

        await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        await engine.processAudioChunk(silentFrame, onAnomalyDetected);

        expect(onAnomalyDetected).not.toHaveBeenCalled();

        await engine.processAudioChunk(silentFrame, onAnomalyDetected);

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
            await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date('2026-05-11T00:01:00.000Z'));

        for (let i = 0; i < 5; i++) {
            await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date('2026-05-11T00:03:01.000Z'));

        for (let i = 0; i < 5; i++) {
            await engine.processAudioChunk(silentFrame, onAnomalyDetected);
        }

        expect(onAnomalyDetected).toHaveBeenCalledTimes(2);
    });
});
