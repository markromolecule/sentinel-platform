import { describe, expect, it } from 'vitest';
import { evaluateActionBurst } from './action-burst';

describe('evaluateActionBurst', () => {
    it('suppresses a second browser signal inside one burst window', () => {
        expect(
            evaluateActionBurst({
                lastAcceptedAt: 1_000,
                candidateAt: 1_500,
                windowMs: 800,
            }),
        ).toEqual({
            accepted: false,
            nextAcceptedAt: 1_000,
        });
    });

    it('accepts a signal exactly on the burst boundary', () => {
        expect(
            evaluateActionBurst({
                lastAcceptedAt: 1_000,
                candidateAt: 1_800,
                windowMs: 800,
            }),
        ).toEqual({
            accepted: true,
            nextAcceptedAt: 1_800,
        });
    });

    it('lets distinct event types keep separate state by returning caller-owned timestamps', () => {
        const clipboard = evaluateActionBurst({
            lastAcceptedAt: 0,
            candidateAt: 800,
            windowMs: 800,
        });
        const rightClick = evaluateActionBurst({
            lastAcceptedAt: 0,
            candidateAt: 800,
            windowMs: 800,
        });

        expect(clipboard).toEqual({
            accepted: true,
            nextAcceptedAt: 800,
        });
        expect(rightClick).toEqual({
            accepted: true,
            nextAcceptedAt: 800,
        });
    });

    it('accepts a later action after the burst window rolls over', () => {
        expect(
            evaluateActionBurst({
                lastAcceptedAt: 2_000,
                candidateAt: 2_901,
                windowMs: 800,
            }),
        ).toEqual({
            accepted: true,
            nextAcceptedAt: 2_901,
        });
    });
});
