import * as z from 'zod';

export const enrollSubjectSchema = z.object({
    subject_offering_id: z.string().uuid('Invalid offered subject ID'),
    department_id: z.string().uuid('Invalid department ID').min(1, 'Department is required'),
    course_id: z.string().uuid('Invalid course ID').min(1, 'Course is required'),
    year_level: z.coerce.number().int().min(1, 'Year level must be at least 1'),
    section_ids: z
        .array(z.string().uuid('Invalid section ID'))
        .min(1, 'At least one section must be selected'),
});

export const instructorSubjectEnrollmentSchema = enrollSubjectSchema;
export type EnrollSubjectFormValues = z.infer<typeof enrollSubjectSchema>;
export type InstructorSubjectEnrollmentFormValues = EnrollSubjectFormValues;

const requestYearLevelSchema = z.coerce.number().int().min(1).max(6);

export const instructorSubjectRequestSchema = z
    .object({
        subject_offering_id: z.string().uuid('Invalid offered subject ID'),
        department_id: z.string().uuid('Invalid department ID').optional(),
        course_id: z.string().uuid('Invalid course ID').optional(),
        year_level: requestYearLevelSchema.optional(),
        department_ids: z.array(z.string().uuid('Invalid department ID')).default([]),
        course_ids: z.array(z.string().uuid('Invalid course ID')).default([]),
        year_levels: z.array(requestYearLevelSchema).default([]),
        section_ids: z.array(z.string().uuid('Invalid section ID')).default([]),
    })
    .superRefine((values, ctx) => {
        const hasLegacyScope =
            Boolean(values.department_id) &&
            Boolean(values.course_id) &&
            typeof values.year_level === 'number';
        const hasGroupedScope =
            values.department_ids.length > 0 &&
            values.course_ids.length > 0 &&
            values.year_levels.length > 0;
        const hasSectionIds = values.section_ids.length > 0;

        if (!hasSectionIds && !hasLegacyScope && !hasGroupedScope) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Select at least one section, or provide departments, courses, and year levels.',
                path: ['section_ids'],
            });
        }
    });

export type InstructorSubjectRequestValues = z.infer<typeof instructorSubjectRequestSchema>;

export const updateEnrollmentRequestSchema = instructorSubjectRequestSchema.extend({
    request_ids: z
        .array(z.string().uuid('Invalid enrollment request ID'))
        .min(1, 'At least one enrollment request is required'),
});

export type UpdateEnrollmentRequestValues = z.infer<typeof updateEnrollmentRequestSchema>;
