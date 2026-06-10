import { generateQuestionPreviewConfigSchema } from '@sentinel/shared';
import {
    readBoolean,
    readInteger,
    readJsonObject,
    readMultipartString,
    readStringArray,
    type MultipartBody,
} from './readers';

/**
 * Parses a multipart form body into a validated `GenerateQuestionPreviewConfig`.
 * Supports both flat field submission and a single JSON `config` blob.
 */
export function parseGenerateQuestionPreviewMultipartBody(body: MultipartBody) {
    const configPayload = readJsonObject(body.config ?? body.configuration);

    return generateQuestionPreviewConfigSchema.parse({
        target: readMultipartString(body.target) ?? configPayload.target,
        institutionId: readMultipartString(body.institutionId) ?? configPayload.institutionId,
        name: readMultipartString(body.name) ?? configPayload.name,
        description: readMultipartString(body.description) ?? configPayload.description,
        tags:
            readStringArray(body.tags) ??
            readStringArray(body['tags[]']) ??
            readStringArray(configPayload.tags) ??
            [],
        isPublic:
            readBoolean(readMultipartString(body.isPublic)) ??
            readBoolean(configPayload.isPublic) ??
            false,
        questionType: readMultipartString(body.questionType) ?? configPayload.questionType,
        questionTypeDistribution: configPayload.questionTypeDistribution,
        questionCount:
            readInteger(readMultipartString(body.questionCount)) ?? configPayload.questionCount,
        difficulty: readMultipartString(body.difficulty) ?? configPayload.difficulty,
        points: readInteger(readMultipartString(body.points)) ?? configPayload.points,
        subjectId: readMultipartString(body.subjectId) ?? configPayload.subjectId,
        language: readMultipartString(body.language) ?? configPayload.language,
        additionalInstructions:
            readMultipartString(body.additionalInstructions) ??
            configPayload.additionalInstructions,
        bloomLevels:
            readStringArray(body.bloomLevels) ??
            readStringArray(body['bloomLevels[]']) ??
            readStringArray(configPayload.bloomLevels) ??
            undefined,
    });
}
