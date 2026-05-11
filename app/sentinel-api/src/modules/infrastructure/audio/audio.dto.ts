import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    audioAnomalyConfigRecordSchema: audioAnomalyConfigRecordBodySchema,
    audioAnomalyConfigUpdateSchema,
} = Schema;

export const audioAnomalyConfigRecordSchema = z
    .object({
        ...audioAnomalyConfigRecordBodySchema.shape,
    })
    .openapi('AudioAnomalyConfigRecord');

export const getAudioSettingsSchema = {
    response: z.object({
        message: z.string(),
        data: audioAnomalyConfigRecordSchema,
    }),
};

export const updateAudioSettingsSchema = {
    body: audioAnomalyConfigUpdateSchema,
    response: z.object({
        message: z.string(),
        data: audioAnomalyConfigRecordSchema,
    }),
};
