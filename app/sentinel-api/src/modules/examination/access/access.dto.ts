import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const verifyEligibilitySchema = {
    params: z.object({
        examId: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            isEligible: z.boolean(),
            reason: z.string().optional(),
            reasonCode: Schema.examRuntimeAccessReasonCodeSchema.optional(),
            runtimeAccess: Schema.examRuntimeAccessSchema,
            accessOverride: Schema.studentExamAccessOverrideSchema.nullable().optional(),
        }),
    }),
};

export type VerifyEligibilityResponse = z.infer<typeof verifyEligibilitySchema.response>;

export type ExamAccessContext = {
    examId: string;
    studentId: string;
    classroomId: string | null;
    subjectId: string;
    sectionId: string | null;
    sectionIds?: string[] | null;
    roomId: string | null;
    durationMinutes: number;
    scheduledDate: Date | string | null;
    endDateTime: Date | string | null;
    status: string | null;
    publishedAt: Date | string | null;
    institutionId: string | null;
};

export type ExamAccessEligibility =
    | {
        isEligible: false;
        reason: string;
        reasonCode: z.infer<typeof Schema.examRuntimeAccessReasonCodeSchema>;
        runtimeAccess: z.infer<typeof Schema.examRuntimeAccessSchema>;
        accessOverride?: z.infer<typeof Schema.studentExamAccessOverrideSchema> | null;
    }
    | {
        isEligible: true;
        context: ExamAccessContext;
        runtimeAccess: z.infer<typeof Schema.examRuntimeAccessSchema>;
        accessOverride?: z.infer<typeof Schema.studentExamAccessOverrideSchema> | null;
    };
