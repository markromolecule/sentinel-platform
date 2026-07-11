import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { AttemptLifecycleBadge } from './attempt-lifecycle-badge';

describe('AttemptLifecycleBadge', () => {
    it('renders recovery and terminal lifecycle cues consistently', () => {
        const student = {
            id: 'student-1',
            attemptId: 'attempt-1',
            studentNo: '2026-001',
            firstName: 'Pat',
            lastName: 'Student',
            status: 'active',
            progress: 10,
            incidentCount: 0,
            openIncidentCount: 0,
            lastActivity: 'Now',
            lifecycleState: 'LOCKED',
            scoreState: 'FINALIZED',
        } as StudentSession;

        render(<AttemptLifecycleBadge student={student} />);

        expect(screen.getByText('LOCKED')).toBeTruthy();
        expect(screen.getByText('FINALIZED')).toBeTruthy();
    });

    it('renders closed and superseded states as explicit terminal badges', () => {
        render(
            <>
                <AttemptLifecycleBadge
                    student={
                        {
                            id: 'student-closed',
                            attemptId: 'attempt-closed',
                            studentNo: '2026-002',
                            firstName: 'Closed',
                            lastName: 'Student',
                            status: 'submitted',
                            progress: 100,
                            incidentCount: 0,
                            openIncidentCount: 0,
                            lastActivity: 'Earlier',
                            lifecycleState: 'CLOSED',
                            scoreState: 'REVISION_REQUIRED',
                        } as StudentSession
                    }
                />
                <AttemptLifecycleBadge
                    student={
                        {
                            id: 'student-superseded',
                            attemptId: 'attempt-superseded',
                            studentNo: '2026-003',
                            firstName: 'Reset',
                            lastName: 'Student',
                            status: 'submitted',
                            progress: 100,
                            incidentCount: 0,
                            openIncidentCount: 0,
                            lastActivity: 'Earlier',
                            lifecycleState: 'SUPERSEDED',
                            scoreState: 'DRAFT',
                        } as StudentSession
                    }
                />
            </>,
        );

        expect(screen.getByText('CLOSED')).toBeTruthy();
        expect(screen.getByText('SUPERSEDED')).toBeTruthy();
        expect(screen.getByText('REVISION REQUIRED')).toBeTruthy();
        expect(screen.getByText('DRAFT')).toBeTruthy();
    });
});
