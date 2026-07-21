import { describe, expect, it } from 'vitest';
import { liveKitWebhookRoute } from './controllers/livekit-webhook.controller';

describe('LiveKit infrastructure routes', () => {
    it('exposes the verified webhook endpoint for OpenAPI contract generation', () => {
        expect(liveKitWebhookRoute.method).toBe('post');
        expect(liveKitWebhookRoute.path).toBe('/webhooks');
        expect(liveKitWebhookRoute.tags).toContain('Infrastructure');
    });
});
