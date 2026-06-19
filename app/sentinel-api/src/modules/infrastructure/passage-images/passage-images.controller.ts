import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../examination/assessment/assessment-access';
import {
    uploadPassageImageMultipartSchema,
    uploadPassageImageResponseSchema,
} from './passage-images.dto';
import { uploadPassageImage } from './passage-images.service';

export const uploadPassageImageRoute = createRoute({
    method: 'post',
    path: '/upload',
    tags: ['Passage Images'],
    summary: 'Upload a passage image',
    description:
        'Uploads a passage image to Supabase storage and returns a public URL for the editor.',
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: uploadPassageImageMultipartSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Image uploaded successfully',
            content: {
                'application/json': {
                    schema: uploadPassageImageResponseSchema,
                },
            },
        },
        400: {
            description: 'Bad Request',
        },
        413: {
            description: 'Payload too large',
        },
        415: {
            description: 'Unsupported media type',
        },
    },
});

export const uploadPassageImageRouteHandler: AppRouteHandler<
    typeof uploadPassageImageRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertAssessmentAccess(c);

    const multipartBody = (await c.req.parseBody({
        all: true,
    })) as Record<string, string | File | (string | File)[]>;

    const file = multipartBody.file;

    if (!file || Array.isArray(file)) {
        throw new HTTPException(400, {
            message: 'A single image file is required.',
        });
    }

    const uploadedImage = await uploadPassageImage(
        file as File,
        supabaseUser?.sub ?? c.get('user')?.id,
    );

    return c.json({
        message: 'Image uploaded successfully',
        data: uploadedImage,
    });
};
