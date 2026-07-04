import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { AttemptLifecycleBadge } from './attempt-lifecycle-badge';

describe('AttemptLifecycleBadge', () => {
    it('renders lifecycle and score-state cues', () => {
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
});
