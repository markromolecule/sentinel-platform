import { describe, expect, it } from 'vitest';
import { incidentSeverityResolverService } from './incident-severity-resolver.service';

describe('IncidentSeverityResolverService', () => {
    const now = new Date('2026-04-22T08:00:00.000Z');

    it('keeps a first right-click attempt at low severity', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'webSecurity.right_click_disable',
            baseSeverity: 'LOW',
            matchingIncidents: [],
            now,
        });

        expect(resolution).toEqual({
            finalSeverity: 'LOW',
            severityReason: 'default-ladder',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 1,
                matchingWindowSeconds: null,
                repeatThreshold: 2,
                overrideSeverity: null,
            },
        });
    });

    it('escalates repeated same-rule behavior based on occurrence history', () => {
        const resolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: 'webSecurity.right_click_disable',
            baseSeverity: 'LOW',
            matchingIncidents: [
                {
                    timestamp: new Date('2026-04-22T07:59:10.000Z'),
                    details: JSON.stringify({ occurrenceCount: 1 }),
                },
            ],
            now,
        });

        expect(resolution).toEqual({
            finalSeverity: 'MEDIUM',
            severityReason: 'repeat-escalated',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 2,
                matchingWindowSeconds: 120,
                repeatThreshold: 2,
                overrideSeverity: null,
            },
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
                matchingWindowSeconds: null,
                repeatThreshold: 2,
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
                    details: JSON.stringify({ occurrenceCount: 1 }),
                },
            ],
            now,
            runtimeOverride: {
                repeatThreshold: 3,
            },
        });

        expect(resolution).toEqual({
            finalSeverity: 'LOW',
            severityReason: 'default-ladder',
            severityInputs: {
                baseSeverity: 'LOW',
                ladder: ['LOW', 'MEDIUM', 'HIGH'],
                matchingCount: 1,
                matchingWindowSeconds: null,
                repeatThreshold: 3,
                overrideSeverity: null,
            },
        });
    });
});
