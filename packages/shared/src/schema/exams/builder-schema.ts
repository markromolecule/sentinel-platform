import * as z from 'zod';
import { examDetailSchema, examIdParamsSchema, updateExamBodySchema } from './exam-schema';
import { questionTypeDefinitionSchema } from './question-type-schema';

export const builderWorkspaceSchema = z.object({
    exam: examDetailSchema,
    questionTypes: z.array(questionTypeDefinitionSchema),
});

export const builderWorkspaceParamsSchema = examIdParamsSchema;

export const saveBuilderWorkspaceBodySchema = updateExamBodySchema;
