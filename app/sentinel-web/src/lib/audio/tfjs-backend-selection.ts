import * as tf from '@tensorflow/tfjs-core';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';

const DEFAULT_WASM_PATH_PREFIX = '/tfjs-backend-wasm/';

function normalizeWasmPathPrefix(pathPrefix: string) {
    return pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;
}

function isWebGlAvailable() {
    if (typeof document === 'undefined') {
        return false;
    }

    const canvas = document.createElement('canvas');

    return Boolean(
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    );
}

export async function initializePreferredTfjsBackend(args?: { wasmPathPrefix?: string }) {
    setWasmPaths(normalizeWasmPathPrefix(args?.wasmPathPrefix ?? DEFAULT_WASM_PATH_PREFIX));

    const backendOrder = isWebGlAvailable() ? ['webgl', 'wasm'] : ['wasm', 'webgl'];

    for (const backend of backendOrder) {
        try {
            const didSetBackend = await tf.setBackend(backend);

            if (!didSetBackend) {
                continue;
            }

            await tf.ready();

            return backend;
        } catch {
            continue;
        }
    }

    throw new Error('Unable to initialize a TensorFlow.js backend. Tried WebGL and WASM.');
}
