import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadMock, getPublicUrlMock, fromMock } = vi.hoisted(() => {
    const uploadMock = vi.fn();
    const getPublicUrlMock = vi.fn();
    const fromMock = vi.fn(() => ({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
    }));

    return { uploadMock, getPublicUrlMock, fromMock };
});

vi.mock('../../../lib/supabase-admin', () => ({
    supabaseAdmin: {
        storage: {
            from: fromMock,
        },
    },
}));

import { uploadPassageImage } from './passage-images.service';

describe('uploadPassageImage', () => {
    beforeEach(() => {
        process.env.SUPABASE_PASSAGE_IMAGE_BUCKET = 'lesson-images';
        uploadMock.mockReset();
        getPublicUrlMock.mockReset();
        fromMock.mockClear();
    });

    it('uploads an image and returns a public url', async () => {
        uploadMock.mockResolvedValue({ error: null });
        getPublicUrlMock.mockReturnValue({
            data: { publicUrl: 'https://cdn.example.com/lesson-images/passage-image.png' },
        });

        const file = new File([new Uint8Array([1, 2, 3])], 'passage.png', {
            type: 'image/png',
        });

        const uploaded = await uploadPassageImage(file, 'user-123');

        expect(fromMock).toHaveBeenCalledWith('lesson-images');
        expect(uploadMock).toHaveBeenCalledTimes(1);
        expect(uploaded).toEqual({
            bucket: 'lesson-images',
            path: expect.stringContaining('PASSAGE/user-123/'),
            url: 'https://cdn.example.com/lesson-images/passage-image.png',
        });
    });

    it('rejects unsupported mime types', async () => {
        const file = new File([new Uint8Array([1, 2, 3])], 'passage.txt', {
            type: 'text/plain',
        });

        await expect(uploadPassageImage(file, 'user-123')).rejects.toMatchObject({
            status: 415,
        });
    });
});
