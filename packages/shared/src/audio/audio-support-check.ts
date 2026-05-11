import type { AudioCapabilityReport } from './audio-anomaly';

function hasWebAudioSupport() {
    const webkitAudioContext = (
        globalThis as typeof globalThis & {
            webkitAudioContext?: unknown;
        }
    ).webkitAudioContext;

    return (
        typeof globalThis.AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined'
    );
}

function hasWasmSupport() {
    if (typeof globalThis.WebAssembly === 'undefined') {
        return false;
    }

    if (typeof globalThis.WebAssembly.validate === 'function') {
        return globalThis.WebAssembly.validate(
            new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]),
        );
    }

    return true;
}

async function getMicrophonePermission(): Promise<AudioCapabilityReport['microphonePermission']> {
    if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
        return 'unavailable';
    }

    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
        return 'prompt';
    }

    try {
        const result = await navigator.permissions.query({
            name: 'microphone' as PermissionName,
        });

        if (result.state === 'granted' || result.state === 'denied' || result.state === 'prompt') {
            return result.state;
        }

        return 'prompt';
    } catch {
        return 'prompt';
    }
}

export async function checkAudioCapabilities(): Promise<AudioCapabilityReport> {
    return {
        webWorkerSupported: typeof globalThis.Worker !== 'undefined',
        webAudioSupported: hasWebAudioSupport(),
        microphonePermission: await getMicrophonePermission(),
        wasmSupported: hasWasmSupport(),
    };
}
