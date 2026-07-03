import { describe, expect, it } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

describe('transitionExamAttemptLifecycle', () => {
    it('allows a legal lock transition', () => {
        expect(
            transitionExamAttemptLifecycle({
                currentState: 'IN_PROGRESS',
                nextState: 'LOCKED',
                eventType: 'LOCKED',
            }),
        ).toEqual({
            previousState: 'IN_PROGRESS',
            nextState: 'LOCKED',
            eventType: 'LOCKED',
        });
    });

    it('allows a legal reopen transition', () => {
        expect(
            transitionExamAttemptLifecycle({
                currentState: 'LOCKED',
                nextState: 'IN_PROGRESS',
                eventType: 'REOPENED',
            }),
        ).toEqual({
            previousState: 'LOCKED',
            nextState: 'IN_PROGRESS',
            eventType: 'REOPENED',
        });
    });

    it('rejects an illegal lock transition', () => {
        expect(() =>
            transitionExamAttemptLifecycle({
                currentState: 'SUBMITTED',
                nextState: 'LOCKED',
                eventType: 'LOCKED',
            }),
        ).toThrow(HTTPException);
    });

    it('rejects an illegal next state for finalization', () => {
        expect(() =>
            transitionExamAttemptLifecycle({
                currentState: 'SUBMITTED',
                nextState: 'LOCKED',
                eventType: 'FINALIZED',
            }),
        ).toThrow(HTTPException);
    });
});
