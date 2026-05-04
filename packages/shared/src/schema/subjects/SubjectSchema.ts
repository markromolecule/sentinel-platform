import * as z from 'zod';

export const subjectClassificationTypeSchema = z.enum(['GENERAL', 'CORE']);

const subjectSchemaShape = {
    code: z.string().min(2, 'Code must be at least 2 characters'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    institution_id: z.string().uuid('Invalid institution ID').optional().nullable(),
};

export const subjectFormSchema = z.object(subjectSchemaShape);

export const subjectUpdateFormSchema = z.object(subjectSchemaShape).partial();

export const subjectClassificationFormSchema = z.object({
    name: z.string().min(2, 'Group name must be at least 2 characters').max(120),
    type: subjectClassificationTypeSchema,
    description: z
        .string()
        .max(100, 'Description must not exceed 100 characters')
        .optional()
        .or(z.literal('')),
    subject_ids: z.array(z.uuid('Invalid subject ID')).default([]),
    department_id: z.string().uuid('Invalid department ID').optional().nullable(),
    course_ids: z.array(z.string().uuid('Invalid course ID')).default([]),
    institution_id: z.string().uuid('Invalid institution ID').optional().nullable(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
export type SubjectUpdateFormValues = z.infer<typeof subjectUpdateFormSchema>;
export type SubjectClassificationFormValues = z.infer<typeof subjectClassificationFormSchema>;
