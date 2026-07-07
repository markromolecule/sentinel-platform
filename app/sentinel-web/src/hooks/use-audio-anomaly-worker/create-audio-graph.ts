import { BUFFER_SIZE, CHANNELS } from './_constants';
import type { AudioFramePayload, AudioGraphComponents } from './_types';

/**
 * Helper to construct the Web Audio API graph and capture microphone stream.
 *
 * @param providedStream Optional pre-existing MediaStream
 * @param worker Web Worker instance
 * @param onAudioProcess Callback invoked with raw audio buffer sample chunks
 */
export async function createAudioGraph(
    providedStream: MediaStream | null | undefined,
    worker: Worker,
    onAudioProcess: (payload: AudioFramePayload) => void,
): Promise<AudioGraphComponents> {
    const stream = providedStream ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
        await audioContext.resume().catch((err) => {
            console.error('Failed to resume AudioContext:', err);
        });
    }
    const source = audioContext.createMediaStreamSource(stream);
    // eslint-disable-next-line new-cap
    const processor = audioContext.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);

    processor.onaudioprocess = (audioEvent) => {
        const samples = audioEvent.inputBuffer.getChannelData(0);
        // Copy to a new Float32Array for worker transfer since getChannelData returns a shared view
        onAudioProcess({
            samples: new Float32Array(samples),
            sampleRate: audioContext.sampleRate,
        });
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    return { stream, audioContext, source, processor };
}
