'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LiveFeedMonitor } from './live-feed-monitor';

const { mockViewer } = vi.hoisted(() => ({
    mockViewer: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useLiveInspectionViewer: (args: unknown) => mockViewer(args),
}));

vi.mock('@sentinel/ui', () => ({
    LiveVideoMonitor: ({
        state,
        disabledExplanation,
    }: {
        state: string;
        disabledExplanation?: string | null;
    }) => (
        <div>
            <span>{state === 'live' ? 'LIVE' : 'not-live'}</span>
            {disabledExplanation ? <p>{disabledExplanation}</p> : null}
        </div>
    ),
}));

describe('core LiveFeedMonitor', () => {
    it('passes canonical identifiers to the shared viewer hook without showing false live', () => {
        mockViewer.mockReturnValue({
            state: 'idle',
            reason: null,
            connectionQuality: null,
            setVideoRef: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            retry: vi.fn(),
            disabledExplanation: null,
        });

        render(
            <LiveFeedMonitor
                examId="exam-1"
                studentId="student-record-1"
                attemptId="attempt-1"
                enabled={true}
            />,
        );

        expect(mockViewer).toHaveBeenCalledWith({
            examId: 'exam-1',
            studentId: 'student-record-1',
            attemptId: 'attempt-1',
            enabled: true,
        });
        expect(screen.queryByText('LIVE')).toBeNull();
    });
});
