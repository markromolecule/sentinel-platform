import { describe, expect, it } from 'vitest';
import { AppBackgroundingRule } from './mobile-rules';

describe('Mobile telemetry ingestion rules', () => {
    it('accepts and persists app backgrounding as an immediate mobile event', async () => {
        const rule = new AppBackgroundingRule();
        const decision = await rule.evaluate({
            examSessionId: '11111111-1111-1111-1111-111111111111',
            studentId: '22222222-2222-2222-2222-222222222222',
            timestamp: new Date('2026-04-23T00:00:00.000Z').toISOString(),
            platform: 'MOBILE',
            source: 'CLIENT',
            ruleKey: 'mobileSecurity.prevent_backgrounding',
            eventType: 'APP_BACKGROUNDING',
            sessionContext: {
                browser: 'Safari',
                os: 'iOS',
                deviceType: 'MOBILE',
                clientCapabilities: ['visibility-monitor'],
            },
        });

        expect(decision.action).toBe('persist');
        expect(decision.action === 'persist' ? decision.payload.eventType : null).toBe(
            'APP_BACKGROUNDING',
        );
        expect(decision.action === 'persist' ? decision.payload.platform : null).toBe('MOBILE');
        expect(
            decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
        ).toEqual(
            expect.objectContaining({
                trigger: 'immediate',
            }),
        );
    });
});
