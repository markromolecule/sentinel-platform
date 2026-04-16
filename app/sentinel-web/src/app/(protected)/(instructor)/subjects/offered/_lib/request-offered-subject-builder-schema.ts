import * as z from 'zod';

const requestBuilderYearLevelSchema = z.number().int().min(1).max(6);

export const requestOfferedSubjectBuilderFormSchema = z.object({
    subject_offering_id: z.string().uuid('Invalid offered subject ID'),
    department_ids: z.array(z.string().uuid('Invalid department ID')).default([]),
    course_ids: z.array(z.string().uuid('Invalid course ID')).default([]),
    year_levels: z.array(requestBuilderYearLevelSchema).default([]),
    section_ids: z.array(z.string().uuid('Invalid section ID')).default([]),
}).superRefine((values, ctx) => {
    const hasGroupedScope =
        values.department_ids.length > 0 &&
        values.course_ids.length > 0 &&
        values.year_levels.length > 0;
    const hasSectionIds = values.section_ids.length > 0;

    if (!hasSectionIds && !hasGroupedScope) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
                'Select at least one section, or complete the department, course, and year-level audience.',
            path: ['section_ids'],
        });
    }
});

export type RequestOfferedSubjectBuilderFormValues = z.infer<
    typeof requestOfferedSubjectBuilderFormSchema
>;
