import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    parseGenerateQuestionPreviewMultipartBody,
    QuestionGeneratorService,
    resolvePdfFilesFromMultipartBody,
} from '../../../../lib/gemini/services/question-generator';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import {
    generatePreviewMultipartSchema,
    generatePreviewRouteSchema,
} from '../gemini.dto';
import { LogsService } from '../../../general/logs/logs.service';

export const MAX_LEGACY_PDF_SIZE_BYTES = 25 * 1024 * 1024;

export function createGenerateQuestionPreviewRoute(path: '/generate-preview' | '/generate-review') {
    return createRoute({
        method: 'post',
        path,
        tags: ['AI'],
        summary:
            path === '/generate-review'
                ? 'Legacy alias for generating an AI question preview from a PDF lesson'
                : 'Generate an AI question preview from a PDF lesson',
        request: {
            body: {
                content: {
                    'multipart/form-data': {
                        schema: generatePreviewMultipartSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Structured AI preview generated successfully',
                content: {
                    'application/json': {
                        schema: generatePreviewRouteSchema.response,
                    },
                },
            },
        },
    });
}

export const generatePreviewRoute = createGenerateQuestionPreviewRoute('/generate-preview');
export const legacyGenerateReviewRoute = createGenerateQuestionPreviewRoute('/generate-review');

export const generatePreviewRouteHandler: AppRouteHandler<typeof generatePreviewRoute> = async (
    c,
) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const dbUser = c.get('user');

    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: dbUser?.id ?? supabaseUser?.sub,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    requireActivePermission(
        c,
        ['ai:generate_questions', 'assessments:manage'],
        'Forbidden. Insufficient permissions.',
    );

    const multipartBody = (await c.req.parseBody({
        all: true,
    })) as Record<string, string | File | (string | File)[]>;
    const files = resolvePdfFilesFromMultipartBody(multipartBody);

    if (files.some((file) => file.size > MAX_LEGACY_PDF_SIZE_BYTES)) {
        throw new HTTPException(413, {
            message: 'PDF file is too large for AI preview generation.',
        });
    }

    const parsedConfig = parseGenerateQuestionPreviewMultipartBody(multipartBody);

    // Legacy Route Gating: reject heavy requests to protect against edge proxy timeouts
    const totalQuestions =
        parsedConfig.questionCount ??
        parsedConfig.questionTypeDistribution?.reduce((sum, item) => sum + item.count, 0) ??
        0;

    if (totalQuestions > 10 || files.length > 1) {
        throw new HTTPException(400, {
            message:
                'Generations with more than 10 questions or multiple files must use the asynchronous endpoint POST /ai/generate-preview/jobs.',
        });
    }

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: parsedConfig.institutionId,
    });

    const startTime = Date.now();
    const preview = await QuestionGeneratorService.generatePreviewFromPdf({
        files,
        config: {
            ...parsedConfig,
            institutionId: institutionId ?? undefined,
        },
    });
    const latency = Date.now() - startTime;

    // Telemetry logging
    if (dbUser?.id && institutionId) {
        try {
            await LogsService.createLog(c.get('dbClient'), {
                userId: dbUser.id,
                action: 'integration.gemini_scan_completed',
                resourceType: 'gemini',
                resourceId: 'gemini-scan',
                activeInstitutionId: institutionId,
                details: {
                    fileCount: files.length,
                    latencyMs: latency,
                    promptType: (parsedConfig as any).promptType ?? 'lesson',
                },
            });
        } catch (logErr) {
            console.error('Failed to log gemini scan:', logErr);
        }
    }

    return c.json({
        message: 'AI preview generated successfully',
        data: preview,
    });
};
