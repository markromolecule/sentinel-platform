import { HTTPException } from 'hono/http-exception';
import { Schema } from '@sentinel/shared';
import type { QuestionType } from '@sentinel/shared/types';

export const QUESTION_TYPES = Schema.QUESTION_TYPES;
export const EXAM_STATUSES = Schema.EXAM_STATUSES;
export const questionTypeSchema = Schema.questionTypeSchema;
export const questionContentSchema = Schema.questionContentSchema;
export const questionTagsSchema = Schema.questionTagsSchema;
export const examSettingsSchema = Schema.examSettingsSchema;
export const examConfigurationSchema = Schema.examConfigurationSchema;
export const examStatusSchema = Schema.examStatusSchema;
export const questionInputSchema = Schema.questionInputSchema;

export function validateQuestionContentByType(type: QuestionType, content: unknown) {
    const schema = Schema.questionContentSchemaByType[type];
    const result = schema.safeParse(content);

    if (!result.success) {
        throw new HTTPException(400, {
            message: result.error.issues[0]?.message ?? 'Invalid question content.',
        });
    }

    return result.data;
}

export function mapExamStatusToDb(status: (typeof EXAM_STATUSES)[number]) {
    return status.toUpperCase().replace('-', '_');
}

export function mapExamStatusFromDb(status?: string | null) {
    return (status?.toLowerCase().replace('_', '-') ?? 'draft') as (typeof EXAM_STATUSES)[number];
}
