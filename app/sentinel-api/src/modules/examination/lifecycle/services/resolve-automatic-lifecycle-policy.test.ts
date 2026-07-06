import { describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { resolveAutomaticLifecyclePolicy } from './resolve-automatic-lifecycle-policy';

function createPolicyDb(args: {
    attempt?: {
        attempt_id: string;
        exam_id: string | null;
        lifecycle_state: string | null;
        ai_rules?: any;
    } | null;
    incidents?: Array<{ incident_id: string; details?: any }>;
}) {
    return {
        selectFrom: vi.fn((table: string) => {
            const builder = {
                leftJoin: vi.fn(() => builder),
                select: vi.fn(() => builder),
                where: vi.fn(() => builder),
                orderBy: vi.fn(() => builder),
                executeTakeFirst: vi.fn(async () =>
                    table === 'exam_attempts' ? (args.attempt ?? null) : null,
                ),
                execute: vi.fn(async () =>
                    table === 'flagged_incidents' ? (args.incidents ?? []) : [],
                ),
            };

            return builder;
        }),
    } as unknown as DbClient;
}

describe('resolveAutomaticLifecyclePolicy', () => {
    it('returns a close decision once the default threshold is met', async () => {
        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: createPolicyDb({
                attempt: {
                    attempt_id: 'attempt-1',
                    exam_id: 'exam-1',
                    lifecycle_state: 'IN_PROGRESS',
                },
                incidents: [
                    { incident_id: 'incident-1' },
                    { incident_id: 'incident-2' },
                    { incident_id: 'incident-3' },
                ],
            }),
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'CLOSE_ATTEMPT',
            attemptId: 'attempt-1',
            examId: 'exam-1',
            reasonCode: 'AUTO_HIGH_INCIDENT_THRESHOLD',
            matchingIncidentIds: ['incident-1', 'incident-2', 'incident-3'],
        });
    });

    it('returns a no-op when the default threshold is not applicable', async () => {
        const thresholdResolution = await resolveAutomaticLifecyclePolicy({
            dbClient: createPolicyDb({
                attempt: {
                    attempt_id: 'attempt-1',
                    exam_id: 'exam-1',
                    lifecycle_state: 'IN_PROGRESS',
                },
                incidents: [{ incident_id: 'incident-1' }, { incident_id: 'incident-2' }],
            }),
            attemptId: 'attempt-1',
        });
        const closedResolution = await resolveAutomaticLifecyclePolicy({
            dbClient: createPolicyDb({
                attempt: {
                    attempt_id: 'attempt-2',
                    exam_id: 'exam-1',
                    lifecycle_state: 'CLOSED',
                },
                incidents: [
                    { incident_id: 'incident-1' },
                    { incident_id: 'incident-2' },
                    { incident_id: 'incident-3' },
                ],
            }),
            attemptId: 'attempt-2',
        });

        expect(thresholdResolution).toMatchObject({
            action: 'NONE',
            attemptId: 'attempt-1',
            matchingIncidentIds: ['incident-1', 'incident-2'],
        });
        expect(closedResolution).toMatchObject({
            action: 'NONE',
            attemptId: 'attempt-2',
            matchingIncidentIds: [],
        });
    });

    it('returns a no-op when the attempt is missing an exam id', async () => {
        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: createPolicyDb({
                attempt: {
                    attempt_id: 'attempt-1',
                    exam_id: null,
                    lifecycle_state: 'IN_PROGRESS',
                },
                incidents: [
                    { incident_id: 'incident-1' },
                    { incident_id: 'incident-2' },
                    { incident_id: 'incident-3' },
                ],
            }),
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'NONE',
            attemptId: 'attempt-1',
            matchingIncidentIds: [],
        });
    });

    it('respects a disabled automaticClosePolicy', async () => {
        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: createPolicyDb({
                attempt: {
                    attempt_id: 'attempt-1',
                    exam_id: 'exam-1',
                    lifecycle_state: 'IN_PROGRESS',
                    ai_rules: {
                        automaticClosePolicy: {
                            enabled: false,
                        },
                    },
                },
                incidents: [
                    { incident_id: 'incident-1' },
                    { incident_id: 'incident-2' },
                    { incident_id: 'incident-3' },
                ],
            }),
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'NONE',
            attemptId: 'attempt-1',
            matchingIncidentIds: [],
        });
    });

    it('uses configured highIncidentThreshold', async () => {
        const db = createPolicyDb({
            attempt: {
                attempt_id: 'attempt-1',
                exam_id: 'exam-1',
                lifecycle_state: 'IN_PROGRESS',
                ai_rules: {
                    automaticClosePolicy: {
                        enabled: true,
                        highIncidentThreshold: 2,
                    },
                },
            },
            incidents: [{ incident_id: 'incident-1' }, { incident_id: 'incident-2' }],
        });

        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: db,
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'CLOSE_ATTEMPT',
            attemptId: 'attempt-1',
            examId: 'exam-1',
            matchingIncidentIds: ['incident-1', 'incident-2'],
        });
    });

    it('sums occurrence counts when useOccurrenceCount is true', async () => {
        const db = createPolicyDb({
            attempt: {
                attempt_id: 'attempt-1',
                exam_id: 'exam-1',
                lifecycle_state: 'IN_PROGRESS',
                ai_rules: {
                    automaticClosePolicy: {
                        enabled: true,
                        highIncidentThreshold: 5,
                        useOccurrenceCount: true,
                    },
                },
            },
            incidents: [
                { incident_id: 'incident-1', details: { occurrenceCount: 3 } },
                { incident_id: 'incident-2', details: { occurrenceCount: 2 } },
            ],
        });

        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: db,
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'CLOSE_ATTEMPT',
            attemptId: 'attempt-1',
            examId: 'exam-1',
            matchingIncidentIds: ['incident-1', 'incident-2'],
        });
    });

    it('does not close if occurrence count threshold is not met', async () => {
        const db = createPolicyDb({
            attempt: {
                attempt_id: 'attempt-1',
                exam_id: 'exam-1',
                lifecycle_state: 'IN_PROGRESS',
                ai_rules: {
                    automaticClosePolicy: {
                        enabled: true,
                        highIncidentThreshold: 5,
                        useOccurrenceCount: true,
                    },
                },
            },
            incidents: [
                { incident_id: 'incident-1', details: { occurrenceCount: 3 } },
                { incident_id: 'incident-2', details: { occurrenceCount: 1 } },
            ],
        });

        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: db,
            attemptId: 'attempt-1',
        });

        expect(resolution).toMatchObject({
            action: 'NONE',
            attemptId: 'attempt-1',
            matchingIncidentIds: ['incident-1', 'incident-2'],
        });
    });

    it('closes immediately on immediateCloseEventTypes', async () => {
        const db = createPolicyDb({
            attempt: {
                attempt_id: 'attempt-1',
                exam_id: 'exam-1',
                lifecycle_state: 'IN_PROGRESS',
                ai_rules: {
                    automaticClosePolicy: {
                        enabled: true,
                        immediateCloseEventTypes: ['tab_exit', 'gaze_away'],
                    },
                },
            },
            incidents: [],
        });

        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient: db,
            attemptId: 'attempt-1',
            triggeringEventType: 'tab_exit',
        });

        expect(resolution).toMatchObject({
            action: 'CLOSE_ATTEMPT',
            attemptId: 'attempt-1',
            examId: 'exam-1',
            reasonCode: 'AUTO_IMMEDIATE_CLOSE_EVENT',
            notes: 'Automatically closed immediately due to event type "tab_exit".',
            matchingIncidentIds: [],
        });
    });
});
