import * as z from 'zod';
import {
    AUDIO_ANOMALY_TYPES,
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
} from '../../audio';

const nullableDateSchema = z.union([z.coerce.date(), z.string()]).nullable();

export const audioAnomalyTypeSchema = z.enum(AUDIO_ANOMALY_TYPES);

export const audioAnomalyThresholdsSchema = z
    .object({
        TALKING: z.number().min(0).max(1),
        TYPING: z.number().min(0).max(1),
        TAPPING: z.number().min(0).max(1),
        MOUTH_BREATHING: z.number().min(0).max(1),
        BACKGROUND_NOISE: z.number().min(0).max(1),
        SILENCE_DETECTED: z.number().min(0).max(1),
    })
    .strict();

export const audioAnomalyConfigSchema = z
    .object({
        sensitivityMultiplier: z.number().min(0.5).max(2),
        consecutiveFrameThreshold: z.number().int().min(1).max(10),
        cooldownMs: z.number().int().min(1000),
        thresholds: audioAnomalyThresholdsSchema,
        enabledAnomalyTypes: z.array(audioAnomalyTypeSchema).min(1).max(AUDIO_ANOMALY_TYPES.length),
    })
    .strict();

export const audioAnomalyConfigUpdateSchema = z
    .object({
        sensitivityMultiplier: z.number().min(0.5).max(2).optional(),
        consecutiveFrameThreshold: z.number().int().min(1).max(10).optional(),
        cooldownMs: z.number().int().min(1000).optional(),
        thresholds: audioAnomalyThresholdsSchema.partial().optional(),
        enabledAnomalyTypes: z
            .array(audioAnomalyTypeSchema)
            .min(1)
            .max(AUDIO_ANOMALY_TYPES.length)
            .optional(),
    })
    .strict();

export const audioAnomalyConfigRecordSchema = z
    .object({
        category: z.string(),
        key: z.string(),
        description: z.string().nullable(),
        value: audioAnomalyConfigSchema,
        updatedAt: nullableDateSchema,
        updatedBy: z.string().nullable(),
    })
    .strict();

export const audioAnomalyConfigBodySchema = audioAnomalyConfigSchema.default({
    ...DEFAULT_AUDIO_ANOMALY_CONFIG,
    thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
    enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
});

export type AudioAnomalyTypeSchemaValues = z.infer<typeof audioAnomalyTypeSchema>;
export type AudioAnomalyThresholdsSchemaValues = z.infer<typeof audioAnomalyThresholdsSchema>;
export type AudioAnomalyConfigSchemaValues = z.infer<typeof audioAnomalyConfigSchema>;
export type AudioAnomalyConfigUpdateSchemaValues = z.infer<typeof audioAnomalyConfigUpdateSchema>;
export type AudioAnomalyConfigRecordSchemaValues = z.infer<typeof audioAnomalyConfigRecordSchema>;
