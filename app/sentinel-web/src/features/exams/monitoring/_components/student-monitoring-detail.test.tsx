'use client';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { StudentMonitoringDetail } from './student-monitoring-detail';

const { mockLiveFeedMonitor } = vi.hoisted(() => ({
    mockLiveFeedMonitor: vi.fn(),
}));

vi.mock('@/features/exams/monitoring/_components', () => ({
    StudentDetailHeader: () => <div data-testid="student-detail-header" />,
    StudentIdentityCard: () => <div data-testid="student-identity-card" />,
    IntegrityTimelineCard: () => <div data-testid="integrity-timeline-card" />,
    LiveFeedMonitor: (props: unknown) => {
        mockLiveFeedMonitor(props);
        return <div data-testid="live-feed-monitor" />;
    },
}));

function createStudent(status: StudentSession['status']): StudentSession {
    return {
        id: 'user-1',
        studentRecordId: 'student-record-1',
        attemptId: 'attempt-1',
        studentNo: '2023-0001',
        firstName: 'Mark',
        lastName: 'Livado',
        status,
        progress: 0,
        incidentCount: status === 'flagged' ? 1 : 0,
        openIncidentCount: status === 'flagged' ? 1 : 0,
        lastActivity: 'Just now',
    };
}

describe('web StudentMonitoringDetail live inspection eligibility', () => {
    it('keeps live inspection enabled for flagged in-progress students', () => {
        render(<StudentMonitoringDetail student={createStudent('flagged')} examId="exam-1" />);

        expect(mockLiveFeedMonitor).toHaveBeenCalledWith(
            expect.objectContaining({
                examId: 'exam-1',
                studentId: 'student-record-1',
                attemptId: 'attempt-1',
                enabled: true,
            }),
        );
    });

    it('keeps live inspection disabled for submitted students', () => {
        render(<StudentMonitoringDetail student={createStudent('submitted')} examId="exam-1" />);

        expect(mockLiveFeedMonitor).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        );
    });
});
