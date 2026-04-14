import { z } from '@hono/zod-openapi';

export const verifyEligibilitySchema = {
    params: z.object({
        examId: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            isEligible: z.boolean(),
            reason: z.string().optional(),
        }),
    }),
};

export type VerifyEligibilityResponse = z.infer<typeof verifyEligibilitySchema.response>;

export type ExamAccessContext = {
    examId: string;
    studentId: string;
    subjectId: string;
    sectionId: string | null;
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
      }
    | {
          isEligible: true;
          context: ExamAccessContext;
      };
