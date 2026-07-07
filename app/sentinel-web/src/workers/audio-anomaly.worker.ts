import { AudioAnomalyEngine } from '../workers/audio-anomaly-engine';
import { type AudioAnomalySettings } from '@sentinel/shared';

let engine: AudioAnomalyEngine | null = null;

self.onmessage = async (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'INIT':
            try {
                if (engine) {
                    engine.dispose();
                }
                engine = new AudioAnomalyEngine(payload.config as AudioAnomalySettings);
                await engine.initialize();
                self.postMessage({ type: 'INIT_SUCCESS' });
            } catch (error) {
                self.postMessage({
                    type: 'INIT_FAILURE',
                    payload: {
                        message:
                            error instanceof Error
                                ? error.message
                                : 'Audio anomaly worker initialization failed.',
                    },
                });
            }
            break;

        case 'START_DETECTION':
            if (engine) engine.start();
            break;

        case 'PROCESS_AUDIO':
            if (engine) {
                engine.processAudioChunk(payload.samples, payload.sampleRate, (anomalies) => {
                    self.postMessage({ type: 'ANOMALY_DETECTED', payload: { anomalies } });
                });
            }
            break;
        case 'STOP_DETECTION':
            if (engine) engine.stop();
            break;

        case 'UPDATE_CONFIG':
            if (engine) engine.updateConfig(payload.config as AudioAnomalySettings);
            break;

        case 'DISPOSE':
            if (engine) {
                engine.dispose();
                engine = null;
            }
            break;
    }
};
