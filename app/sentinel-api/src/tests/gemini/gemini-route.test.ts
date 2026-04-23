import { describe, expect, it } from 'vitest';
import app from '../../app';

describe('Gemini AI routes', () => {
    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'keeps %s registered behind auth',
        async (path) => {
            const response = await app.request(path, {
                method: 'POST',
            });

            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toMatchObject({
                message: 'Missing auth token',
            });
        },
    );
});
