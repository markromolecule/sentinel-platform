import { HTTPException } from 'hono/http-exception';
import type { ExamAttemptLifecycleEventType, ExamAttemptLifecycleState } from '@sentinel/shared';

const ALLOWED_LIFECYCLE_TRANSITIONS: Record<
    ExamAttemptLifecycleEventType,
    {
        currentStates: Array<ExamAttemptLifecycleState | null>;
        nextStates: Array<ExamAttemptLifecycleState | null>;
    }
> = {
    STARTED: {
        currentStates: [null],
        nextStates: ['IN_PROGRESS'],
    },
    SUBMITTED: {
        currentStates: ['IN_PROGRESS', 'LOCKED'],
        nextStates: ['SUBMITTED'],
    },
    LOCKED: {
        currentStates: ['IN_PROGRESS'],
        nextStates: ['LOCKED'],
    },
    REOPENED: {
        currentStates: ['LOCKED', 'CLOSED'],
        nextStates: ['IN_PROGRESS'],
    },
    RESET: {
        currentStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED'],
        nextStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED'],
    },
    CLOSED: {
        currentStates: ['IN_PROGRESS', 'LOCKED', 'SUBMITTED'],
        nextStates: ['CLOSED'],
    },
    SUPERSEDED: {
        currentStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED'],
        nextStates: ['SUPERSEDED'],
    },
    FINALIZED: {
        currentStates: ['SUBMITTED', 'CLOSED'],
        nextStates: ['SUBMITTED', 'CLOSED'],
    },
    FINALIZATION_REVISED: {
        currentStates: ['SUBMITTED', 'CLOSED'],
        nextStates: ['SUBMITTED', 'CLOSED'],
    },
    MAKEUP_GRANTED: {
        currentStates: [null, 'IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
        nextStates: [null, 'IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
    },
    RETAKE_GRANTED: {
        currentStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
        nextStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
    },
    INCIDENT_REVIEWED: {
        currentStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
        nextStates: ['IN_PROGRESS', 'LOCKED', 'CLOSED', 'SUBMITTED', 'SUPERSEDED'],
    },
};

/**
 * Validates whether an attempt lifecycle event is allowed for the given state transition.
 */
export function transitionExamAttemptLifecycle(args: {
    currentState: ExamAttemptLifecycleState | null;
    nextState: ExamAttemptLifecycleState | null;
    eventType: ExamAttemptLifecycleEventType;
}) {
    const rule = ALLOWED_LIFECYCLE_TRANSITIONS[args.eventType];

    if (!rule) {
        throw new HTTPException(400, {
            message: `Unsupported lifecycle event type: ${args.eventType}.`,
        });
    }

    if (!rule.currentStates.includes(args.currentState)) {
        throw new HTTPException(409, {
            message: `Cannot apply ${args.eventType} when the attempt is ${args.currentState ?? 'UNSTARTED'}.`,
        });
    }

    if (!rule.nextStates.includes(args.nextState)) {
        throw new HTTPException(409, {
            message: `Cannot transition attempt from ${args.currentState ?? 'UNSTARTED'} to ${args.nextState ?? 'UNSTARTED'} via ${args.eventType}.`,
        });
    }

    return {
        previousState: args.currentState,
        nextState: args.nextState,
        eventType: args.eventType,
    };
}
