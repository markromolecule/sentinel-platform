import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    subjectOfferingFormSchema: subjectOfferingBodySchema,
    subjectOfferingUpdateFormSchema: subjectOfferingUpdateBodySchema,
} = Schema;

export const subjectOfferingSchemaOpenApi = z
    .object({
        subject_offering_id: z.string().uuid(),
        subject_id: z.string().uuid(),
        subject_code: z.string().max(50).openapi({ example: 'INF231' }),
        subject_title: z.string().max(255).openapi({ example: 'Introduction to Computing' }),
        term_id: z.string().uuid(),
        term_academic_year: z.string().openapi({ example: '2026-2027' }),
        term_semester: z.string().openapi({ example: '1st Semester' }),
        term_start_date: z.union([z.coerce.date(), z.string()]).nullable(),
        term_end_date: z.union([z.coerce.date(), z.string()]).nullable(),
        status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']),
        department_ids: z.array(z.string().uuid()),
        course_ids: z.array(z.string().uuid()),
        section_ids: z.array(z.string().uuid()),
        year_levels: z.array(z.number().int()),
        created_at: z.union([z.coerce.date(), z.string()]).nullable(),
        updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
        created_by: z.string().nullable(),
        updated_by: z.string().nullable(),
    })
    .openapi('SubjectOffering');

export const getSubjectOfferingsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            subject_id: z.string().uuid().optional(),
            term_id: z.string().uuid().optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(subjectOfferingSchemaOpenApi),
    }),
};

export const createSubjectOfferingSchema = {
    body: subjectOfferingBodySchema,
    response: z.object({
        message: z.string(),
        data: subjectOfferingSchemaOpenApi,
    }),
};

export const updateSubjectOfferingSchema = {
    params: z.object({
        id: z.string().uuid('Invalid subject offering ID format'),
    }),
    body: subjectOfferingUpdateBodySchema,
    response: z.object({
        message: z.string(),
        data: subjectOfferingSchemaOpenApi,
    }),
};
