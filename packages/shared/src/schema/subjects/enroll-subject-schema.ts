import * as z from 'zod';

export const enrollSubjectSchema = z.object({
    subject_code: z.string().min(1, 'Subject is required'),
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

