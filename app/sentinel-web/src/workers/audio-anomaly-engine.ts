import * as tf from '@tensorflow/tfjs';
import {
    type AudioAnomalySettings,
    type AudioAnomalyTypeValue,
    evaluateAudioAnomalyTrigger,
    getAnomalyConfidence,
} from '@sentinel/shared';

type AudioEngineDebugSnapshot = {
    captureWindowStartedAt: string;
    captureWindowEndedAt: string;
    inferenceCompletedAt: string;
    inputSampleRate: number;
    resampledSampleCount: number;
    rms: number;
    topClassIds: number[];
    topClassScores: number[];
    selectedAnomalyConfidence: Partial<Record<AudioAnomalyTypeValue, number>>;
    frameCounters: Partial<Record<AudioAnomalyTypeValue, number>>;
    cooldownStatus: Partial<Record<AudioAnomalyTypeValue, boolean>>;
};

export type AudioEngineDetection = {
    anomalyType: AudioAnomalyTypeValue;
    confidenceScore: number;
    detectedAt: string;
    debugSnapshot?: AudioEngineDebugSnapshot;
};

const TARGET_SAMPLE_RATE = 16_000;
const BACKGROUND_NOISE_RMS_THRESHOLD = 0.08;

function isDevelopmentDebugEnabled() {
    return process.env.NODE_ENV === 'development';
}

/**
 * Linearly resamples mono PCM audio into the 16 kHz waveform YAMNet expects.
 *
 * @param samples Source PCM samples captured at the browser's audio context rate.
 * @param sourceSampleRate Sample rate attached to the incoming PCM buffer.
 * @returns A new `Float32Array` aligned to the 16 kHz inference rate.
 */
export function resampleAudioTo16kHz(
    samples: Float32Array,
    sourceSampleRate: number,
): Float32Array {
    if (sourceSampleRate <= 0 || !Number.isFinite(sourceSampleRate)) {
        return samples;
    }

    if (sourceSampleRate === TARGET_SAMPLE_RATE) {
        return samples;
    }

    const targetLength = Math.max(
        1,
        Math.round((samples.length * TARGET_SAMPLE_RATE) / sourceSampleRate),
    );
    const resampled = new Float32Array(targetLength);
    const ratio = sourceSampleRate / TARGET_SAMPLE_RATE;

    for (let index = 0; index < targetLength; index += 1) {
        const sourceIndex = index * ratio;
        const lowerIndex = Math.floor(sourceIndex);
        const upperIndex = Math.min(lowerIndex + 1, samples.length - 1);
        const interpolation = sourceIndex - lowerIndex;
        const lowerValue = samples[lowerIndex] ?? 0;
        const upperValue = samples[upperIndex] ?? lowerValue;
        resampled[index] = lowerValue + (upperValue - lowerValue) * interpolation;
    }

    return resampled;
}

export class AudioAnomalyEngine {
    // Constants for cooldown and frame thresholds
    private static readonly SILENCE_MIN_CONSECUTIVE_FRAMES = 5;
    private static readonly SILENCE_MIN_COOLDOWN_MS = 180_000;
    private static readonly BACKGROUND_NOISE_MIN_COOLDOWN_MS = 60_000;

    private model: tf.GraphModel | null = null;
    private config: AudioAnomalySettings;
    private isDetecting = false;

    // Buffer to hold audio samples until we have enough for YAMNet (0.975s @ 16kHz = 15600 samples)
    private readonly EXPECTED_SAMPLES = 15600;
    private sampleBuffer: Float32Array = new Float32Array(this.EXPECTED_SAMPLES);
    private bufferIndex = 0;

    private frameCounters: Map<AudioAnomalyTypeValue, number> = new Map();
    private lastAlertTime: Map<AudioAnomalyTypeValue, number> = new Map();
    private lastDebugSnapshot: AudioEngineDebugSnapshot | null = null;

    private getRequiredConsecutiveFrames(anomalyType: AudioAnomalyTypeValue): number {
        if (anomalyType === 'SILENCE_DETECTED') {
            // Silence requires a higher threshold (min 5 frames, ~5 seconds) to avoid false positives on brief gaps
            return Math.max(
                this.config.consecutiveFrameThreshold,
                AudioAnomalyEngine.SILENCE_MIN_CONSECUTIVE_FRAMES,
            );
        }

        return this.config.consecutiveFrameThreshold;
    }

    private getCooldownMs(anomalyType: AudioAnomalyTypeValue): number {
        if (anomalyType === 'SILENCE_DETECTED') {
            // Cooldowns are longer for silence to prevent spamming notifications while the room is quiet
            return Math.max(this.config.cooldownMs, AudioAnomalyEngine.SILENCE_MIN_COOLDOWN_MS);
        }

        if (anomalyType === 'BACKGROUND_NOISE') {
            // Background noise cooldown is also extended to prevent flooding the database/UI with persistent hum reports
            return Math.max(
                this.config.cooldownMs,
                AudioAnomalyEngine.BACKGROUND_NOISE_MIN_COOLDOWN_MS,
            );
        }

        return this.config.cooldownMs;
    }

    constructor(initialConfig: AudioAnomalySettings) {
        this.config = initialConfig;
    }

    async initialize(): Promise<void> {
        // This worker currently serves only the converted YAMNet model bundle.
        // The app does not yet serve TF.js WASM binaries, and WebGL is not a
        // reliable worker target here, so CPU is the deterministic backend.
        const didSetCpuBackend = await tf.setBackend('cpu');

        if (!didSetCpuBackend) {
            throw new Error('Unable to initialize the TensorFlow.js CPU backend.');
        }

        await tf.ready();

        // Load YAMNet graph model from the public directory
        // YAMNet expects a 1D float32 tensor of waveform samples at 16kHz
        const modelUrl = new URL('/models/yamnet/model.json', self.location.origin).toString();
        this.model = await tf.loadGraphModel(modelUrl);
    }

    start(): void {
        this.isDetecting = true;
        this.bufferIndex = 0;
        this.frameCounters.clear();
        this.lastAlertTime.clear();
    }

    stop(): void {
        this.isDetecting = false;
        this.bufferIndex = 0;
        this.frameCounters.clear();
    }

    dispose(): void {
        this.stop();
        this.model?.dispose();
        this.model = null;
    }

    getDebugSnapshot(): AudioEngineDebugSnapshot | null {
        return this.lastDebugSnapshot;
    }

    updateConfig(newConfig: AudioAnomalySettings): void {
        this.config = newConfig;
        const enabled = new Set<string>(newConfig.enabledAnomalyTypes);

        // Remove counters and alert timers for any types that were disabled
        for (const key of this.frameCounters.keys()) {
            if (!enabled.has(key)) {
                this.frameCounters.delete(key);
            }
        }
        for (const key of this.lastAlertTime.keys()) {
            if (!enabled.has(key)) {
                this.lastAlertTime.delete(key);
            }
        }
    }

    processAudioChunk(
        samples: Float32Array,
        sampleRate: number,
        onAnomalyDetected: (detection: AudioEngineDetection) => void,
    ): void {
        if (!this.isDetecting || !this.model) return;
        const normalizedSamples = resampleAudioTo16kHz(samples, sampleRate);

        // Append incoming samples to our buffer
        let offset = 0;
        while (offset < normalizedSamples.length) {
            const spaceInBuffer = this.EXPECTED_SAMPLES - this.bufferIndex;
            const samplesToCopy = Math.min(spaceInBuffer, normalizedSamples.length - offset);

            this.sampleBuffer.set(
                normalizedSamples.subarray(offset, offset + samplesToCopy),
                this.bufferIndex,
            );
            this.bufferIndex += samplesToCopy;
            offset += samplesToCopy;

            // If we have filled the buffer, process it
            if (this.bufferIndex >= this.EXPECTED_SAMPLES) {
                this.runInference(this.sampleBuffer, sampleRate, onAnomalyDetected);
                this.bufferIndex = 0; // Reset buffer
            }
        }
    }

    private runInference(
        samples: Float32Array,
        inputSampleRate: number,
        onAnomalyDetected: (detection: AudioEngineDetection) => void,
    ): void {
        try {
            tf.tidy(() => {
                if (!this.model) return;
                const inferenceCompletedAt = new Date().toISOString();
                const inferenceCompletedAtMs = new Date(inferenceCompletedAt).getTime();
                const captureWindowEndedAt = inferenceCompletedAt;
                const captureWindowStartedAt = new Date(
                    inferenceCompletedAtMs -
                        Math.round((samples.length / TARGET_SAMPLE_RATE) * 1000),
                ).toISOString();

                const waveform = tf.tensor1d(samples);
                const output = this.model.predict(waveform);

                let scoresTensor: tf.Tensor;
                if (Array.isArray(output)) {
                    // YAMNet often returns [scores, embeddings, spectrogram] or similar.
                    // We need the scores (shape [..., 521]).
                    const match = output.find((t) => t.shape[t.shape.length - 1] === 521);
                    if (!match) {
                        const shapes = output.map((t) => `[${t.shape.join(',')}]`).join(', ');
                        throw new Error(
                            `Expected output with 521 classes not found. Model returned: ${shapes}`,
                        );
                    }
                    scoresTensor = match;
                } else if (output && typeof (output as any).dataSync === 'function') {
                    scoresTensor = output as tf.Tensor;
                } else {
                    throw new Error('Unexpected NamedTensorMap output from model.predict()');
                }

                const scoresArray = scoresTensor.dataSync() as Float32Array;
                const now = Date.now();
                const topClassIds = Array.from(scoresArray.entries())
                    .sort((left, right) => right[1] - left[1])
                    .slice(0, 5)
                    .map(([classId]) => classId);
                const topClassScores = topClassIds.map((classId) => scoresArray[classId] ?? 0);

                // Calculate RMS for silence detection
                let sumSquares = 0;
                for (let i = 0; i < samples.length; i++) {
                    sumSquares += samples[i] * samples[i];
                }
                const rms = Math.sqrt(sumSquares / samples.length);
                const selectedAnomalyConfidence: Partial<Record<AudioAnomalyTypeValue, number>> =
                    {};
                const cooldownStatus: Partial<Record<AudioAnomalyTypeValue, boolean>> = {};
                const triggeredAnomalies: Partial<Record<AudioAnomalyTypeValue, number>> = {};

                // Evaluate all enabled anomaly types independently
                for (const anomalyType of this.config.enabledAnomalyTypes) {
                    let confidence: number | null = null;

                    if (anomalyType === 'SILENCE_DETECTED') {
                        const threshold = this.config.thresholds.SILENCE_DETECTED;
                        if (rms < threshold) {
                            confidence = Math.max(
                                0,
                                Math.min(1, (threshold - rms) / Math.max(threshold, 0.0001)),
                            );
                        }
                    } else {
                        // Check YAMNet-based anomalies
                        confidence = getAnomalyConfidence(scoresArray, anomalyType, this.config);

                        if (
                            confidence === null &&
                            anomalyType === 'BACKGROUND_NOISE' &&
                            rms >= BACKGROUND_NOISE_RMS_THRESHOLD
                        ) {
                            confidence = Math.min(
                                1,
                                rms / Math.max(BACKGROUND_NOISE_RMS_THRESHOLD, 0.0001),
                            );
                        }
                    }

                    if (confidence !== null) {
                        selectedAnomalyConfidence[anomalyType] = confidence;
                        const currentCount = this.frameCounters.get(anomalyType) ?? 0;
                        const lastAlert = this.lastAlertTime.get(anomalyType) ?? 0;
                        const cooldownMs = this.getCooldownMs(anomalyType);
                        const requiredConsecutiveFrames =
                            this.getRequiredConsecutiveFrames(anomalyType);
                        const triggerDecision = evaluateAudioAnomalyTrigger({
                            anomalyType,
                            confidence,
                            threshold: 0,
                            consecutiveFrames: currentCount,
                            requiredConsecutiveFrames,
                            cooldownMs,
                            lastTriggeredAtMs: lastAlert || null,
                            nowMs: now,
                        });

                        this.frameCounters.set(anomalyType, triggerDecision.nextConsecutiveFrames);
                        cooldownStatus[anomalyType] = !triggerDecision.cooldownActive;

                        if (
                            triggerDecision.triggered &&
                            triggerDecision.acceptedConfidence !== null
                        ) {
                            this.lastAlertTime.set(anomalyType, now);
                            triggeredAnomalies[anomalyType] =
                                triggerDecision.acceptedConfidence;
                        }
                    } else {
                        // Reset counter for this type because it didn't trigger this frame
                        this.frameCounters.set(anomalyType, 0);
                    }
                }

                const triggeredEntries = Object.entries(triggeredAnomalies) as Array<
                    [AudioAnomalyTypeValue, number]
                >;

                if (triggeredEntries.length > 0) {
                    const [primaryAnomalyType, primaryConfidence] = triggeredEntries.reduce(
                        (best, current) => (current[1] > best[1] ? current : best),
                    );
                    const debugSnapshot = isDevelopmentDebugEnabled()
                        ? {
                              captureWindowStartedAt,
                              captureWindowEndedAt,
                              inferenceCompletedAt,
                              inputSampleRate,
                              resampledSampleCount: samples.length,
                              rms,
                              topClassIds,
                              topClassScores,
                              selectedAnomalyConfidence,
                              frameCounters: Object.fromEntries(this.frameCounters.entries()),
                              cooldownStatus,
                          }
                        : undefined;

                    onAnomalyDetected({
                        anomalyType: primaryAnomalyType,
                        confidenceScore: primaryConfidence,
                        detectedAt: inferenceCompletedAt,
                        debugSnapshot,
                    });
                }

                if (isDevelopmentDebugEnabled()) {
                    this.lastDebugSnapshot = {
                        captureWindowStartedAt,
                        captureWindowEndedAt,
                        inferenceCompletedAt,
                        inputSampleRate,
                        resampledSampleCount: samples.length,
                        rms,
                        topClassIds,
                        topClassScores,
                        selectedAnomalyConfidence,
                        frameCounters: Object.fromEntries(this.frameCounters.entries()),
                        cooldownStatus,
                    };
                }
            });
        } catch (error) {
            console.error('[AudioAnomalyEngine] Inference failed:', error);
        }
    }
}
