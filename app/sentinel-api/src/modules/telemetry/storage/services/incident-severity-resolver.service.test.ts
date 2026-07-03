import { describe, expect, it } from 'vitest';
import type { TelemetryRuleKey } from '@sentinel/shared';
import { incidentSeverityResolverService } from './incident-severity-resolver.service';

describe('IncidentSeverityResolverService', () => {
    const now = new Date('2026-04-22T08:00:00.000Z');

    function buildMatchingIncidents(totalOccurrenceCount: number) {
        if (totalOccurrenceCount <= 1) {
            return [];
        }

        return [
            {
                timestamp: new Date('2026-04-22T07:59:10.000Z'),
                details: JSON.stringify({ occurrenceCount: totalOccurrenceCount - 1 }),
            },
        ];
    }

    function expectCalibratedSeverity(args: {
        ruleKey: TelemetryRuleKey;
        count: number;
        expectedSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
        baseSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
        currentMetadata?: Record<string, unknown>;
    }) {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: args.ruleKey,
            baseSeverity: args.baseSeverity ?? 'LOW',
            matchingIncidents: buildMatchingIncidents(args.count),
            now,
            currentMetadata: args.currentMetadata,
        });

        expect(resolution).toMatchObject({
            finalSeverity: args.expectedSeverity,
            severityReason: args.expectedSeverity === 'LOW' ? 'default-ladder' : 'repeat-escalated',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: args.count,
                matchingWindowSeconds: 600,
                repeatThreshold: 3,
                overrideSeverity: null,
            },
        });
    }

    it.each([
        ['webSecurity.clipboard_control', 'MEDIUM'],
        ['webSecurity.tab_switching_monitor', 'MEDIUM'],
        ['webSecurity.right_click_disable', 'LOW'],
        ['aiRules.gaze_tracking', 'LOW'],
        ['aiRules.audio_anomaly_detection', 'LOW'],
    ] as const)('calibrates %s severity from occurrence counts', (ruleKey, baseSeverity) => {
        for (const count of [1, 2]) {
            expectCalibratedSeverity({
                ruleKey,
                count,
                expectedSeverity: 'LOW',
                baseSeverity,
            });
        }

        for (const count of [3, 5]) {
            expectCalibratedSeverity({
                ruleKey,
                count,
                expectedSeverity: 'MEDIUM',
                baseSeverity,
            });
        }

        expectCalibratedSeverity({
            ruleKey,
            count: 6,
            expectedSeverity: 'HIGH',
            baseSeverity,
        });
    });

    it('honors a forced severity override over the organic ladder', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'webSecurity.right_click_disable',
            baseSeverity: 'LOW',
            matchingIncidents: [],
            now,
            runtimeOverride: {
                severity: 'HIGH',
            },
        });

        expect(resolution).toEqual({
            finalSeverity: 'HIGH',
            severityReason: 'forced-override',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 1,
                matchingWindowSeconds: 600,
                repeatThreshold: 3,
                overrideSeverity: 'HIGH',
            },
        });
    });

    it('uses a support-tuned repeat threshold for repeat-sensitive rules', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'webSecurity.right_click_disable',
            baseSeverity: 'LOW',
            matchingIncidents: [
                {
                    timestamp: new Date('2026-04-22T07:59:10.000Z'),
                    details: JSON.stringify({ occurrenceCount: 2 }),
                },
            ],
            now,
            runtimeOverride: {
                repeatThreshold: 4,
            },
        });

        expect(resolution).toEqual({
            finalSeverity: 'LOW',
            severityReason: 'default-ladder',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 3,
                matchingWindowSeconds: 600,
                repeatThreshold: 4,
                overrideSeverity: null,
            },
        });
    });

    it('keeps silence audio anomalies at low severity with fewer repeats than generic audio anomalies', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'aiRules.audio_anomaly_detection',
            baseSeverity: 'LOW',
            matchingIncidents: [
                {
                    timestamp: new Date('2026-04-22T07:59:10.000Z'),
                    details: JSON.stringify({
                        metadata: {
                            anomalyType: 'SILENCE_DETECTED',
                        },
                        occurrenceCount: 1,
                    }),
                },
            ],
            now,
            currentMetadata: {
                anomalyType: 'SILENCE_DETECTED',
            },
        });

        expect(resolution).toEqual({
            finalSeverity: 'LOW',
            severityReason: 'default-ladder',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 2,
                matchingWindowSeconds: 600,
                repeatThreshold: 3,
                overrideSeverity: null,
            },
        });
    });

    it('escalates silence audio anomalies only after repeated matching silence incidents', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'aiRules.audio_anomaly_detection',
            baseSeverity: 'LOW',
            matchingIncidents: [
                {
                    timestamp: new Date('2026-04-22T07:59:10.000Z'),
                    details: JSON.stringify({
                        metadata: {
                            anomalyType: 'SILENCE_DETECTED',
                        },
                        occurrenceCount: 1,
                    }),
                },
                {
                    timestamp: new Date('2026-04-22T07:58:50.000Z'),
                    details: JSON.stringify({
                        metadata: {
                            anomalyType: 'SILENCE_DETECTED',
                        },
                        occurrenceCount: 1,
                    }),
                },
                {
                    timestamp: new Date('2026-04-22T07:58:30.000Z'),
                    details: JSON.stringify({
                        metadata: {
                            anomalyType: 'BACKGROUND_NOISE',
                        },
                        occurrenceCount: 3,
                    }),
                },
            ],
            now,
            currentMetadata: {
                anomalyType: 'SILENCE_DETECTED',
            },
        });

        expect(resolution).toEqual({
            finalSeverity: 'MEDIUM',
            severityReason: 'repeat-escalated',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 3,
                matchingWindowSeconds: 600,
                repeatThreshold: 3,
                overrideSeverity: null,
            },
        });
    });

    it('keeps immediate runtime-boundary events high on first occurrence', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'webSecurity.print_screen_disable',
            baseSeverity: 'HIGH',
            matchingIncidents: [],
            now,
        });

        expect(resolution).toMatchObject({
            finalSeverity: 'HIGH',
            severityReason: 'immediate-high',
            severityInputs: {
                baseSeverity: 'HIGH',
                ladder: ['HIGH'],
                matchingCount: 1,
                matchingWindowSeconds: null,
                repeatThreshold: null,
                overrideSeverity: null,
            },
        });
    });
});
