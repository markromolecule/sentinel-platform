import * as tf from '@tensorflow/tfjs';
import { type AudioAnomalySettings, getAnomalyConfidence } from '@sentinel/shared';

export class AudioAnomalyEngine {
    private model: tf.GraphModel | null = null;
    private config: AudioAnomalySettings;
    private isDetecting = false;

    // Buffer to hold audio samples until we have enough for YAMNet (0.975s @ 16kHz = 15600 samples)
    private readonly EXPECTED_SAMPLES = 15600;
    private sampleBuffer: Float32Array = new Float32Array(this.EXPECTED_SAMPLES);
    private bufferIndex = 0;

    private frameCounters: Map<string, number> = new Map();
    private lastAlertTime: Map<string, number> = new Map();

    private getRequiredConsecutiveFrames(anomalyType: string): number {
        if (anomalyType === 'SILENCE_DETECTED') {
            return Math.max(this.config.consecutiveFrameThreshold, 5);
        }

        return this.config.consecutiveFrameThreshold;
    }

    private getCooldownMs(anomalyType: string): number {
        if (anomalyType === 'SILENCE_DETECTED') {
            return Math.max(this.config.cooldownMs, 180_000);
        }

        if (anomalyType === 'BACKGROUND_NOISE') {
            return Math.max(this.config.cooldownMs, 60_000);
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

    updateConfig(newConfig: AudioAnomalySettings): void {
        this.config = newConfig;
    }

    async processAudioChunk(
        samples: Float32Array,
        onAnomalyDetected: (results: Record<string, number>) => void,
    ): Promise<void> {
        if (!this.isDetecting || !this.model) return;

        // Append incoming samples to our buffer
        let offset = 0;
        while (offset < samples.length) {
            const spaceInBuffer = this.EXPECTED_SAMPLES - this.bufferIndex;
            const samplesToCopy = Math.min(spaceInBuffer, samples.length - offset);

            this.sampleBuffer.set(
                samples.subarray(offset, offset + samplesToCopy),
                this.bufferIndex,
            );
            this.bufferIndex += samplesToCopy;
            offset += samplesToCopy;

            // If we have filled the buffer, process it
            if (this.bufferIndex >= this.EXPECTED_SAMPLES) {
                this.runInference(this.sampleBuffer, onAnomalyDetected);
                this.bufferIndex = 0; // Reset buffer
            }
        }
    }

    private runInference(
        samples: Float32Array,
        onAnomalyDetected: (results: Record<string, number>) => void,
    ): void {
        try {
            tf.tidy(() => {
                if (!this.model) return;

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
                } else {
                    scoresTensor = output as tf.Tensor;
                }

                const scoresArray = scoresTensor.dataSync() as Float32Array;
                const now = Date.now();

                // Calculate RMS for silence detection
                let sumSquares = 0;
                for (let i = 0; i < samples.length; i++) {
                    sumSquares += samples[i] * samples[i];
                }
                const rms = Math.sqrt(sumSquares / samples.length);

                const detectedAnomalies: Record<string, number> = {};

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
                        confidence = getAnomalyConfidence(
                            scoresArray,
                            anomalyType as any,
                            this.config,
                        );
                    }

                    if (confidence !== null) {
                        const count = (this.frameCounters.get(anomalyType) ?? 0) + 1;
                        this.frameCounters.set(anomalyType, count);

                        const lastAlert = this.lastAlertTime.get(anomalyType) ?? 0;
                        const cooldownMs = this.getCooldownMs(anomalyType);
                        const requiredConsecutiveFrames =
                            this.getRequiredConsecutiveFrames(anomalyType);
                        const cooldownExpired = now - lastAlert > cooldownMs;

                        if (count >= requiredConsecutiveFrames && cooldownExpired) {
                            this.frameCounters.set(anomalyType, 0); // reset after triggering
                            this.lastAlertTime.set(anomalyType, now);
                            onAnomalyDetected({ [anomalyType]: confidence });
                        }
                    } else {
                        // Reset counter for this type because it didn't trigger this frame
                        this.frameCounters.set(anomalyType, 0);
                    }
                }
            });
        } catch (error) {
            console.error('[AudioAnomalyEngine] Inference failed:', error);
        }
    }
}
