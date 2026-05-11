import * as z from 'zod';

export const roomNamingRuleSchema = z
    .object({
        label: z.string().min(1, 'Room label is required').max(120),
        prefix: z.string().max(40).default(''),
        virtualPrefix: z.string().max(40).default(''),
    })
    .strict();

export const sectionNamingRuleSchema = z
    .object({
        courseId: z.string().uuid('Invalid course ID'),
        format: z.string().min(1, 'Section format is required').max(120),
        preview: z.string().max(120).default(''),
    })
    .strict();

export const institutionNamingRulesSchema = z
    .object({
        room: roomNamingRuleSchema,
        sectionRulesByCourseId: z.record(z.string(), sectionNamingRuleSchema).default({}),
    })
    .strict();

export const institutionNamingConventionSchema = z
    .object({
        roomCodeFormat: z.string().max(120).nullable().optional(),
        sectionCodeFormat: z.string().max(120).nullable().optional(),
        namingRules: institutionNamingRulesSchema,
    })
    .strict();

export const institutionSchema = z.object({
    name: z
        .string()
        .min(1, 'Institution name is required')
        .max(100, 'Institution name must not exceed 100 characters'),
    code: z
        .string()
        .min(1, 'Institution code is required')
        .max(10, 'Institution code must not exceed 10 characters'),
    parentInstitutionId: z.string().uuid().nullable().optional(),
    institutionKind: z.enum(['STANDALONE', 'PARENT', 'CHILD']).optional(),
    namingConventions: institutionNamingConventionSchema.nullable().optional(),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
export type InstitutionNamingConventionFormValues = z.infer<
    typeof institutionNamingConventionSchema
>;
