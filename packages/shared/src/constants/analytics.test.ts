import { describe, expect, it } from 'vitest';
import { ANALYTICS_QUERY_KEYS, ANALYTICS_MUTATION_KEYS } from './analytics';

describe('Analytics Constants', () => {
    describe('ANALYTICS_QUERY_KEYS', () => {
        it('should have correct root and all key', () => {
            expect(ANALYTICS_QUERY_KEYS.all).toEqual(['analytics']);
        });

        it('should generate correct kpis key with and without institutionId', () => {
            expect(ANALYTICS_QUERY_KEYS.kpis()).toEqual(['analytics', 'kpis', '']);
            expect(ANALYTICS_QUERY_KEYS.kpis('inst-123')).toEqual([
                'analytics',
                'kpis',
                'inst-123',
            ]);
        });

        it('should generate correct incidentSeverity key with and without institutionId', () => {
            expect(ANALYTICS_QUERY_KEYS.incidentSeverity()).toEqual([
                'analytics',
                'incidentSeverity',
                '',
            ]);
            expect(ANALYTICS_QUERY_KEYS.incidentSeverity('inst-123')).toEqual([
                'analytics',
                'incidentSeverity',
                'inst-123',
            ]);
        });

        it('should generate correct incidentType key with and without institutionId', () => {
            expect(ANALYTICS_QUERY_KEYS.incidentType()).toEqual(['analytics', 'incidentType', '']);
            expect(ANALYTICS_QUERY_KEYS.incidentType('inst-123')).toEqual([
                'analytics',
                'incidentType',
                'inst-123',
            ]);
        });

        it('should generate correct departmentIntegrity key with and without institutionId', () => {
            expect(ANALYTICS_QUERY_KEYS.departmentIntegrity()).toEqual([
                'analytics',
                'departmentIntegrity',
                '',
            ]);
            expect(ANALYTICS_QUERY_KEYS.departmentIntegrity('inst-123')).toEqual([
                'analytics',
                'departmentIntegrity',
                'inst-123',
            ]);
        });

        it('should generate correct reports key with and without institutionId', () => {
            expect(ANALYTICS_QUERY_KEYS.reports()).toEqual([
                'analytics',
                'reports',
                { institutionId: '', page: undefined, limit: undefined, status: undefined },
            ]);
            expect(ANALYTICS_QUERY_KEYS.reports('inst-123')).toEqual([
                'analytics',
                'reports',
                { institutionId: 'inst-123', page: undefined, limit: undefined, status: undefined },
            ]);
        });
    });

    describe('ANALYTICS_MUTATION_KEYS', () => {
        it('should generate correct generateReport key', () => {
            expect(ANALYTICS_MUTATION_KEYS.generateReport()).toEqual([
                'analytics',
                'generateReport',
            ]);
        });
    });
});
