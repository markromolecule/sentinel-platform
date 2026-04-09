import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    accessControlAssignmentBodySchema,
    accessControlAssignmentParamsSchema,
    accessControlAssignmentSchema: accessControlAssignmentRecordSchema,
    accessControlOverviewSchema: accessControlOverviewBodySchema,
    examinationGlobalSettingsBodySchema,
    examinationGlobalSettingsRecordSchema: examinationGlobalSettingsRecordBodySchema,
} = Schema;

export const accessControlOverviewSchemaObject = {
    ...accessControlOverviewBodySchema.shape,
};

export const accessControlOverviewSchema = z
    .object(accessControlOverviewSchemaObject)
    .openapi('AccessControlOverview');

export const accessControlAssignmentSchemaObject = {
    ...accessControlAssignmentRecordSchema.shape,
};

export const accessControlAssignmentSchema = z
    .object(accessControlAssignmentSchemaObject)
    .openapi('AccessControlAssignment');

export const examinationGlobalSettingsRecordSchemaObject = {
    ...examinationGlobalSettingsRecordBodySchema.shape,
};

export const examinationGlobalSettingsRecordSchema = z
    .object(examinationGlobalSettingsRecordSchemaObject)
    .openapi('ExaminationGlobalSettingsRecord');

export const getAccessControlOverviewSchema = {
    response: z.object({
        message: z.string(),
        data: accessControlOverviewSchema,
    }),
};

export const getAccessControlAssignmentsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(accessControlAssignmentSchema),
    }),
};

export const createAccessControlAssignmentSchema = {
    body: accessControlAssignmentBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlAssignmentSchema,
    }),
};

export const deleteAccessControlAssignmentSchema = {
    params: accessControlAssignmentParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const getAccessControlExaminationSettingsSchema = {
    response: z.object({
        message: z.string(),
        data: examinationGlobalSettingsRecordSchema,
    }),
};

export const updateAccessControlExaminationSettingsSchema = {
    body: examinationGlobalSettingsBodySchema,
    response: z.object({
        message: z.string(),
        data: examinationGlobalSettingsRecordSchema,
    }),
};

export type GetAccessControlOverviewResponse = z.infer<
    typeof getAccessControlOverviewSchema.response
>;
export type GetAccessControlAssignmentsResponse = z.infer<
    typeof getAccessControlAssignmentsSchema.response
>;
export type CreateAccessControlAssignmentBody = z.infer<
    typeof createAccessControlAssignmentSchema.body
>;
export type CreateAccessControlAssignmentResponse = z.infer<
    typeof createAccessControlAssignmentSchema.response
>;
export type DeleteAccessControlAssignmentParams = z.infer<
    typeof deleteAccessControlAssignmentSchema.params
>;
export type DeleteAccessControlAssignmentResponse = z.infer<
    typeof deleteAccessControlAssignmentSchema.response
>;
export type GetAccessControlExaminationSettingsResponse = z.infer<
    typeof getAccessControlExaminationSettingsSchema.response
>;
export type UpdateAccessControlExaminationSettingsBody = z.infer<
    typeof updateAccessControlExaminationSettingsSchema.body
>;
export type UpdateAccessControlExaminationSettingsResponse = z.infer<
    typeof updateAccessControlExaminationSettingsSchema.response
>;
