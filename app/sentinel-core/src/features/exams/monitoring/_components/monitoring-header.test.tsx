import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MonitoringHeader } from './monitoring-header';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('MonitoringHeader', () => {
    it('keeps runtime access actions and refresh available without top tabs', () => {
        const onRefresh = vi.fn();
        const onLock = vi.fn();
        const onReopen = vi.fn();
        const onReset = vi.fn();
        const onClose = vi.fn();

        render(
            <MonitoringHeader
                examTitle="Biology Midterm"
                examSubject="Biology"
                runtimeAccess={{
                    state: 'locked',
                    reasonCode: 'LOCKED',
                    message: 'Locked',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                }}
                onRefresh={onRefresh}
                onLock={onLock}
                onReopen={onReopen}
                onReset={onReset}
                onClose={onClose}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Biology Midterm' })).toBeTruthy();
        expect(screen.getByText('Locked')).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Lobby' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Monitoring' })).toBeNull();
        expect(screen.queryByRole('link')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Lock' }));
        fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
        fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh Data' }));

        expect(onLock).toHaveBeenCalledTimes(1);
        expect(onReopen).toHaveBeenCalledTimes(1);
        expect(onReset).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onRefresh).toHaveBeenCalledTimes(1);
    });
});
