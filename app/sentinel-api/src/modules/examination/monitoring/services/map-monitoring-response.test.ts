import { describe, expect, it, vi } from 'vitest';
import { mapMonitoringIncident, mapMonitoringStudentSummary } from './map-monitoring-response';

describe('map monitoring response', () => {
    it('marks stale in-progress attempts as disconnected when there are no open incidents', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-20T10:00:00.000Z'));

        const student = mapMonitoringStudentSummary(
            {
                student_user_id: '11111111-1111-4111-8111-111111111111',
                student_record_id: '22222222-2222-4222-8222-222222222222',
                student_number: '2024-0001',
                first_name: 'Maria',
                last_name: 'Garcia',
                last_seen_at: '2026-04-20T09:53:00.000Z',
                attempt_id: '33333333-3333-4333-8333-333333333333',
                attempt_status: 'IN_PROGRESS',
                started_at: '2026-04-20T09:00:00.000Z',
                completed_at: null,
                time_spent_minutes: 30,
                score: null,
                total_score: null,
                incident_count: 0,
                open_incident_count: 0,
                has_high_severity: false,
                latest_incident_type: null,
                latest_incident_at: null,
            },
            60,
        );

        expect(student.status).toBe('disconnected');
        expect(student.progress).toBe(50);

        vi.useRealTimers();
    });

    it('marks attempts with unresolved incidents as flagged before submitted', () => {
        const student = mapMonitoringStudentSummary(
            {
                student_user_id: '11111111-1111-4111-8111-111111111111',
                student_record_id: '22222222-2222-4222-8222-222222222222',
                student_number: '2024-0001',
                first_name: 'Juan',
                last_name: 'Dela Cruz',
                last_seen_at: '2026-04-20T09:59:00.000Z',
                attempt_id: '33333333-3333-4333-8333-333333333333',
                attempt_status: 'COMPLETED',
                started_at: '2026-04-20T09:00:00.000Z',
                completed_at: '2026-04-20T09:45:00.000Z',
                time_spent_minutes: 45,
                score: 85,
                total_score: 100,
                incident_count: 2,
                open_incident_count: 1,
                has_high_severity: false,
                latest_incident_type: 'TAB_SWITCH',
                latest_incident_at: '2026-04-20T09:40:00.000Z',
            },
            60,
        );

        expect(student.status).toBe('flagged');
        expect(student.progress).toBe(100);
    });

    it('maps telemetry incidents into the frontend flag shape', () => {
        const incident = mapMonitoringIncident({
            incidentId: '11111111-1111-4111-8111-111111111111',
            attemptId: '22222222-2222-4222-8222-222222222222',
            examId: '33333333-3333-4333-8333-333333333333',
            examTitle: 'Algorithms Final',
            institutionId: '44444444-4444-4444-8444-444444444444',
            studentId: '55555555-5555-4555-8555-555555555555',
            studentRecordId: '66666666-6666-4666-8666-666666666666',
            studentName: 'Ana Santos',
            platform: 'WEB',
            source: 'CLIENT',
            ruleKey: 'webSecurity.tab_switching_monitor',
            incidentType: 'TAB_SWITCH',
            severity: 'HIGH',
            status: 'PENDING',
            timestamp: '2026-04-20T09:40:00.000Z',
            evidenceUrl: 'https://example.com/frame.png',
            reviewedBy: null,
            reviewedAt: null,
            reviewNotes: null,
            configurationSnapshot: null,
            sessionContext: null,
            details: {
                occurrenceCount: 3,
                severityReason: 'repeat-escalated',
                severityInputs: {
                    baseSeverity: 'MEDIUM',
                    ladder: ['MEDIUM', 'HIGH'],
                    matchingCount: 3,
                    matchingWindowSeconds: 300,
                    repeatThreshold: 2,
                    overrideSeverity: null,
                },
                metadata: {
                    aggregation: {
                        trigger: 'repeat-threshold',
                    },
                },
            },
        });

        expect(incident.description).toBe('Tab Switch Detected');
        expect(incident.severity).toBe('high');
        expect(incident.snapshotUrl).toBe('https://example.com/frame.png');
        expect(incident.occurrenceCount).toBe(3);
        expect(incident.severityReason).toBe('repeat-escalated');
        expect(incident.persistenceTrigger).toBe('repeat-threshold');
        expect(incident.matchingWindowSeconds).toBe(300);
        expect(incident.wasSeverityForced).toBe(false);
    });

    it('uses live elapsed time when an active attempt has not been submitted yet', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-20T10:45:00.000Z'));

        const student = mapMonitoringStudentSummary(
            {
                student_user_id: '11111111-1111-4111-8111-111111111111',
                student_record_id: '22222222-2222-4222-8222-222222222222',
                student_number: '2024-0002',
                first_name: 'Lia',
                last_name: 'Reyes',
                last_seen_at: '2026-04-20T10:44:00.000Z',
                attempt_id: '33333333-3333-4333-8333-333333333333',
                attempt_status: 'IN_PROGRESS',
                started_at: '2026-04-20T10:15:00.000Z',
                completed_at: null,
                time_spent_minutes: 0,
                score: null,
                total_score: null,
                incident_count: 0,
                open_incident_count: 0,
                has_high_severity: false,
                latest_incident_type: null,
                latest_incident_at: null,
            },
            60,
        );

        expect(student.progress).toBe(50);

        vi.useRealTimers();
    });
});
