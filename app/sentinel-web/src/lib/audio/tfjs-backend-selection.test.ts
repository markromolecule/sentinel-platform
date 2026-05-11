import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSetBackend, mockReady, mockSetWasmPaths } = vi.hoisted(() => ({
    mockSetBackend: vi.fn(),
    mockReady: vi.fn(),
    mockSetWasmPaths: vi.fn(),
}));

vi.mock('@tensorflow/tfjs-core', () => ({
    setBackend: mockSetBackend,
    ready: mockReady,
}));

vi.mock('@tensorflow/tfjs-backend-wasm', () => ({
    setWasmPaths: mockSetWasmPaths,
}));

import { initializePreferredTfjsBackend } from './tfjs-backend-selection';

describe('initializePreferredTfjsBackend', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockSetBackend.mockReset();
        mockReady.mockReset();
        mockSetWasmPaths.mockReset();
    });

    it('prefers WebGL when a WebGL context is available', async () => {
        const getContext = vi.fn((kind: string) => (kind === 'webgl' ? {} : null));
        vi.spyOn(document, 'createElement').mockReturnValue({
            getContext,
        } as unknown as HTMLCanvasElement);

        mockSetBackend.mockResolvedValue(true);
        mockReady.mockResolvedValue(undefined);

        await expect(initializePreferredTfjsBackend()).resolves.toBe('webgl');

        expect(mockSetWasmPaths).toHaveBeenCalledWith('/tfjs-backend-wasm/');
        expect(mockSetBackend).toHaveBeenCalledWith('webgl');
        expect(mockReady).toHaveBeenCalledOnce();
    });

    it('falls back to WASM when WebGL setup fails', async () => {
        const getContext = vi.fn(() => ({}));
        vi.spyOn(document, 'createElement').mockReturnValue({
            getContext,
        } as unknown as HTMLCanvasElement);

        mockSetBackend
            .mockRejectedValueOnce(new Error('webgl unavailable'))
            .mockResolvedValueOnce(true);
        mockReady.mockResolvedValue(undefined);

        await expect(
            initializePreferredTfjsBackend({
                wasmPathPrefix: '/custom-wasm',
            }),
        ).resolves.toBe('wasm');

        expect(mockSetWasmPaths).toHaveBeenCalledWith('/custom-wasm/');
        expect(mockSetBackend).toHaveBeenNthCalledWith(1, 'webgl');
        expect(mockSetBackend).toHaveBeenNthCalledWith(2, 'wasm');
    });
});
