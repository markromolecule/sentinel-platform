import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../types/hono';
import {
    parseGenerateQuestionPreviewMultipartBody,
    QuestionGeneratorService,
    resolvePdfFilesFromMultipartBody,
} from '../../../lib/gemini/services/question-generator';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../examination/assessment/assessment-access';
import { generatePreviewMultipartSchema, generatePreviewRouteSchema } from './gemini.dto';

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function createGenerateQuestionPreviewRoute(path: '/generate-preview' | '/generate-review') {
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
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(role);

    const multipartBody = (await c.req.parseBody({
        all: true,
    })) as Record<string, string | File | (string | File)[]>;
    const files = resolvePdfFilesFromMultipartBody(multipartBody);

    if (files.some((file) => file.size > MAX_PDF_SIZE_BYTES)) {
        throw new HTTPException(413, {
            message: 'PDF file is too large for AI preview generation.',
        });
    }

    const parsedConfig = parseGenerateQuestionPreviewMultipartBody(multipartBody);
    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: parsedConfig.institutionId,
    });

    const preview = await QuestionGeneratorService.generatePreviewFromPdf({
        files,
        config: {
            ...parsedConfig,
            institutionId: institutionId ?? undefined,
        },
    });

    return c.json({
        message: 'AI preview generated successfully',
        data: preview,
    });
};
