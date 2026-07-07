import {
    type AudioAnomalyConfig,
    type AudioAnomalyType,
    DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
    YAMNET_CLASS_IDS_BY_ANOMALY_TYPE,
} from './audio-anomaly';

const YAMNET_OUTPUT_CLASS_COUNT = 521;

function clampThreshold(value: number) {
    return Math.min(1, Math.max(0, value));
}

function getEffectiveThreshold(config: AudioAnomalyConfig, anomalyType: AudioAnomalyType) {
    const configuredThreshold =
        config.thresholds[anomalyType] ?? DEFAULT_AUDIO_ANOMALY_THRESHOLDS[anomalyType];
    const sensitivityMultiplier =
        config.sensitivityMultiplier > 0 ? config.sensitivityMultiplier : 1;

    return clampThreshold(configuredThreshold / sensitivityMultiplier);
}

function getHighestClassScore(scores: Float32Array, classIds: readonly number[]) {
    let highestScore = 0;

    for (const classId of classIds) {
        if (classId < 0 || classId >= scores.length) {
            continue;
        }

        highestScore = Math.max(highestScore, scores[classId] ?? 0);
    }

    return highestScore;
}

/**
 * Resolves the highest matching YAMNet confidence for one anomaly type and
 * returns `null` when the configured threshold is not met.
 */
export function getAnomalyConfidence(
    scores: Float32Array,
    anomalyType: AudioAnomalyType,
    config: AudioAnomalyConfig,
): number | null {
    if (scores.length !== YAMNET_OUTPUT_CLASS_COUNT) {
        return null;
    }

    const confidence = getHighestClassScore(scores, YAMNET_CLASS_IDS_BY_ANOMALY_TYPE[anomalyType]);
    const effectiveThreshold = getEffectiveThreshold(config, anomalyType);

    return confidence >= effectiveThreshold ? confidence : null;
}

/**
 * Maps a YAMNet score vector to the strongest enabled anomaly label.
 */
export function mapYamnetScoresToAnomaly(
    scores: Float32Array,
    config: AudioAnomalyConfig,
): { type: AudioAnomalyType; confidence: number } | null {
    if (scores.length !== YAMNET_OUTPUT_CLASS_COUNT) {
        throw new Error(
            `Expected ${YAMNET_OUTPUT_CLASS_COUNT} YAMNet scores, received ${scores.length}.`,
        );
    }

    let bestMatch: { type: AudioAnomalyType; confidence: number } | null = null;

    for (const anomalyType of config.enabledAnomalyTypes) {
        const confidence = getHighestClassScore(
            scores,
            YAMNET_CLASS_IDS_BY_ANOMALY_TYPE[anomalyType],
        );
        const effectiveThreshold = getEffectiveThreshold(config, anomalyType);

        if (confidence < effectiveThreshold) {
            continue;
        }

        if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
                type: anomalyType,
                confidence,
            };
        }
    }

    return bestMatch;
}
