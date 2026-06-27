import { describe, expect, it } from 'vitest';
import { updateGradingAttemptBodySchema } from './grading-schema';

describe('updateGradingAttemptBodySchema', () => {
    it('validates successfully when evaluations are omitted', () => {
        const payload = {
            itemOverrides: {
                '4a542627-7091-44c5-b606-80f0b04439d8': {
                    awardedScore: 4,
                    reason: 'Accepted alternate reasoning.',
                },
            },
            finalize: true,
        };

        const result = updateGradingAttemptBodySchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('validates successfully when evaluations are provided', () => {
        const payload = {
            evaluations: {
                '7813756c-b61f-4a25-b237-3e38250e9f8d': {
                    scores: {
                        contentSubstance: 3,
                        structureOrganization: 4,
                        argumentationSupport: 2,
                        styleTone: 3,
                        grammarConventions: 4,
                    },
                    feedback: 'Good job!',
                },
            },
            finalize: true,
        };

        const result = updateGradingAttemptBodySchema.safeParse(payload);
        expect(result.success).toBe(true);
    });
});
