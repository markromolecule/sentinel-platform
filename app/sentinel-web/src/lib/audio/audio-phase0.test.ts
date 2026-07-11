import { describe, expect, it, vi } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import {
    checkAudioCapabilities,
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    mapYamnetScoresToAnomaly,
} from '@sentinel/shared/audio';

describe('mapYamnetScoresToAnomaly', () => {
    it('returns TALKING when the speech class breaches the configured threshold', () => {
        const scores = new Float32Array(521);
        scores[0] = 0.8;

        const result = mapYamnetScoresToAnomaly(scores, DEFAULT_AUDIO_ANOMALY_CONFIG);

        expect(result?.type).toBe('TALKING');
        expect(result?.confidence).toBeCloseTo(0.8);
    });

    it('returns null when all scores stay below their thresholds', () => {
        const scores = new Float32Array(521);
        scores[0] = 0.4;
        scores[400] = 0.3;

        expect(mapYamnetScoresToAnomaly(scores, DEFAULT_AUDIO_ANOMALY_CONFIG)).toBeNull();
    });

    it('applies the sensitivity multiplier when calculating thresholds', () => {
        const scores = new Float32Array(521);
        scores[380] = 0.4;

        const result = mapYamnetScoresToAnomaly(scores, {
            ...DEFAULT_AUDIO_ANOMALY_CONFIG,
            sensitivityMultiplier: 2,
            enabledAnomalyTypes: ['TALKING', 'TYPING', 'BACKGROUND_NOISE'],
        });

        expect(result?.type).toBe('TYPING');
        expect(result?.confidence).toBeCloseTo(0.4);
    });
});

describe('checkAudioCapabilities', () => {
    it('reports granted microphone permission when browser capabilities are present', async () => {
        const originalWorker = globalThis.Worker;
        const originalAudioContext = globalThis.AudioContext;
        const originalWebAssembly = globalThis.WebAssembly;
        const originalNavigator = globalThis.navigator;

        class MockWorker {}
        class MockAudioContext {}

        Object.defineProperty(globalThis, 'Worker', {
            configurable: true,
            value: MockWorker,
        });
        Object.defineProperty(globalThis, 'AudioContext', {
            configurable: true,
            value: MockAudioContext,
        });
        Object.defineProperty(globalThis, 'WebAssembly', {
            configurable: true,
            value: {
                validate: vi.fn().mockReturnValue(true),
            },
        });
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: {
                mediaDevices: {
                    getUserMedia: vi.fn(),
                },
                permissions: {
                    query: vi.fn().mockResolvedValue({ state: 'granted' }),
                },
            },
        });

        await expect(checkAudioCapabilities()).resolves.toEqual({
            webWorkerSupported: true,
            webAudioSupported: true,
            microphonePermission: 'granted',
            wasmSupported: true,
        });

        Object.defineProperty(globalThis, 'Worker', {
            configurable: true,
            value: originalWorker,
        });
        Object.defineProperty(globalThis, 'AudioContext', {
            configurable: true,
            value: originalAudioContext,
        });
        Object.defineProperty(globalThis, 'WebAssembly', {
            configurable: true,
            value: originalWebAssembly,
        });
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: originalNavigator,
        });
    });

    it('gracefully falls back to unavailable and prompt states when browser APIs are missing', async () => {
        const originalWorker = globalThis.Worker;
        const originalAudioContext = globalThis.AudioContext;
        const originalWebAssembly = globalThis.WebAssembly;
        const originalNavigator = globalThis.navigator;

        Object.defineProperty(globalThis, 'Worker', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(globalThis, 'AudioContext', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(globalThis, 'WebAssembly', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: {
                mediaDevices: {
                    getUserMedia: vi.fn(),
                },
            },
        });

        await expect(checkAudioCapabilities()).resolves.toEqual({
            webWorkerSupported: false,
            webAudioSupported: false,
            microphonePermission: 'prompt',
            wasmSupported: false,
        });

        Object.defineProperty(globalThis, 'Worker', {
            configurable: true,
            value: originalWorker,
        });
        Object.defineProperty(globalThis, 'AudioContext', {
            configurable: true,
            value: originalAudioContext,
        });
        Object.defineProperty(globalThis, 'WebAssembly', {
            configurable: true,
            value: originalWebAssembly,
        });
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: originalNavigator,
        });
    });
});

describe('local YAMNet asset bundle', () => {
    it('ships a TF.js graph model and matching class map in public/models/yamnet', () => {
        const modelsDir = path.resolve(process.cwd(), 'public/models/yamnet');
        const modelJsonPath = path.join(modelsDir, 'model.json');
        const classMapPath = path.join(modelsDir, 'yamnet_class_map.csv');
        const shardPaths = [
            'group1-shard1of4.bin',
            'group1-shard2of4.bin',
            'group1-shard3of4.bin',
            'group1-shard4of4.bin',
        ].map((fileName) => path.join(modelsDir, fileName));

        const modelJson = JSON.parse(readFileSync(modelJsonPath, 'utf8')) as {
            format: string;
            signature?: {
                inputs?: Record<string, { name: string }>;
                outputs?: Record<string, { tensorShape?: { dim?: Array<{ size?: string }> } }>;
            };
            weightsManifest?: Array<{ paths?: string[] }>;
        };

        expect(modelJson.format).toBe('graph-model');
        expect(modelJson.signature?.inputs?.waveform?.name).toBe('waveform:0');
        expect(modelJson.signature?.outputs?.output_0?.tensorShape?.dim?.[1]?.size).toBe('521');
        expect(modelJson.weightsManifest?.[0]?.paths).toEqual([
            'group1-shard1of4.bin',
            'group1-shard2of4.bin',
            'group1-shard3of4.bin',
            'group1-shard4of4.bin',
        ]);

        expect(readFileSync(classMapPath, 'utf8')).toContain('0,/m/09x0r,Speech');

        for (const shardPath of shardPaths) {
            expect(statSync(shardPath).size).toBeGreaterThan(0);
        }
    });
});
