import * as z from 'zod';

const yearLevelSchema = z.coerce
    .number()
    .int()
    .min(1, 'Year level must be at least 1')
    .max(6, 'Year level must be at most 6');

export const subjectOfferingFormSchema = z.object({
    subject_id: z.string().uuid('Invalid subject ID'),
    term_id: z.string().uuid('Invalid term ID'),
    department_ids: z.array(z.string().uuid('Invalid department ID')).default([]),
    course_ids: z.array(z.string().uuid('Invalid course ID')).default([]),
    section_ids: z.array(z.string().uuid('Invalid section ID')).default([]),
    year_levels: z.array(yearLevelSchema).default([]),
});

export const subjectOfferingUpdateFormSchema = subjectOfferingFormSchema
    .omit({
        subject_id: true,
    })
    .partial()
    .extend({
        status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']).optional(),
    });

export const subjectOfferingDuplicateStrategySchema = z
    .enum(['skip_existing', 'fail_existing'])
    .default('skip_existing');

export const classificationSubjectOfferingFormSchema = z.object({
    subject_classification_id: z.string().uuid('Invalid subject classification ID'),
    term_id: z.string().uuid('Invalid term ID'),
    department_ids: z.array(z.string().uuid('Invalid department ID')).default([]),
    course_ids: z.array(z.string().uuid('Invalid course ID')).default([]),
    section_ids: z.array(z.string().uuid('Invalid section ID')).default([]),
    year_levels: z.array(yearLevelSchema).default([]),
    duplicate_strategy: subjectOfferingDuplicateStrategySchema.optional(),
});

export type SubjectOfferingFormValues = z.infer<typeof subjectOfferingFormSchema>;
export type SubjectOfferingUpdateFormValues = z.infer<typeof subjectOfferingUpdateFormSchema>;
export type SubjectOfferingDuplicateStrategy = z.infer<
    typeof subjectOfferingDuplicateStrategySchema
>;
export type ClassificationSubjectOfferingFormValues = z.infer<
    typeof classificationSubjectOfferingFormSchema
>;
