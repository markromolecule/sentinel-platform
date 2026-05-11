import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioAnomalyEngine } from '../audio-anomaly-engine';
import { DEFAULT_AUDIO_ANOMALY_CONFIG } from '@sentinel/shared';
import * as tf from '@tensorflow/tfjs';

// Mock mapYamnetScoresToAnomaly so we can deterministically trigger alerts
vi.mock('@sentinel/shared', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@sentinel/shared')>();
    return {
        ...mod,
        mapYamnetScoresToAnomaly: vi.fn((scoresArray: Float32Array) => {
            // If the first element is 1.0, simulate a TALKING event with 0.9 confidence
            if (scoresArray[0] === 1.0) {
                return { type: 'TALKING', confidence: 0.9 };
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
                // Return a mock tensor with the same first element as the input
                return {
                    dataSync: () => new Float32Array([data[0], ...new Array(520).fill(0)]),
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

        engine = new AudioAnomalyEngine(config);
        await engine.initialize();
        engine.start();
    });

    it('loads the local TF.js YAMNet bundle from the public runtime path', async () => {
        expect(tf.loadGraphModel).toHaveBeenCalledWith(
            expect.stringContaining('/models/yamnet/model.json'),
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
});
