import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamInterruption } from './use-exam-interruption';
import {
    writeStoredReconnectIntent,
    readStoredReconnectIntent,
} from '../_lib/exam-session-storage';

const mockRouterReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('../_lib/exam-session-storage', () => ({
    writeStoredReconnectIntent: vi.fn(),
    readStoredReconnectIntent: vi.fn(),
}));

describe('useExamInterruption', () => {
    const examId = 'exam-123';
    const sessionId = 'session-456';

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window location pathname
        Object.defineProperty(window, 'location', {
            value: {
                pathname: `/student/exam/${examId}/attempt`,
            },
            writable: true,
        });
    });

    it('registers event listeners and writes reconnect intent on interruption events', () => {
        const { unmount } = renderHook(() =>
            useExamInterruption({
                examId,
                sessionId,
                isEnabled: true,
            }),
        );

        // Trigger pagehide
        const pagehideEvent = new Event('pagehide');
        window.dispatchEvent(pagehideEvent);
        expect(writeStoredReconnectIntent).toHaveBeenCalledWith(examId, sessionId, 'close');

        // Trigger beforeunload
        const beforeunloadEvent = new Event('beforeunload');
        window.dispatchEvent(beforeunloadEvent);
        expect(writeStoredReconnectIntent).toHaveBeenCalledWith(examId, sessionId, 'reload');

        // Trigger offline
        const offlineEvent = new Event('offline');
        window.dispatchEvent(offlineEvent);
        expect(writeStoredReconnectIntent).toHaveBeenCalledWith(examId, sessionId, 'offline');

        unmount();
    });

    it('redirects to lobby on online event if reconnect intent exists and on attempt page', () => {
        vi.mocked(readStoredReconnectIntent).mockReturnValue({
            version: 1,
            examId,
            sessionId,
            reason: 'offline',
            resumeRequestId: '55555555-5555-4555-8555-555555555555',
            createdAt: new Date().toISOString(),
        });

        const { unmount } = renderHook(() =>
            useExamInterruption({
                examId,
                sessionId,
                isEnabled: true,
            }),
        );

        const onlineEvent = new Event('online');
        window.dispatchEvent(onlineEvent);

        expect(readStoredReconnectIntent).toHaveBeenCalledWith(examId);
        expect(mockRouterReplace).toHaveBeenCalledWith(`/student/exam/${examId}/lobby`);

        unmount();
    });

    it('does not write intent or redirect if disabled', () => {
        const { unmount } = renderHook(() =>
            useExamInterruption({
                examId,
                sessionId,
                isEnabled: false,
            }),
        );

        const pagehideEvent = new Event('pagehide');
        window.dispatchEvent(pagehideEvent);
        expect(writeStoredReconnectIntent).not.toHaveBeenCalled();

        const onlineEvent = new Event('online');
        window.dispatchEvent(onlineEvent);
        expect(mockRouterReplace).not.toHaveBeenCalled();

        unmount();
    });

    it('persists the local draft before interruption and suppresses intent after navigation commits', () => {
        const onBeforeInterruption = vi.fn();
        const { rerender, unmount } = renderHook(
            ({ isNavigationCommitted }) =>
                useExamInterruption({
                    examId,
                    sessionId,
                    isEnabled: true,
                    isNavigationCommitted,
                    onBeforeInterruption,
                }),
            { initialProps: { isNavigationCommitted: false } },
        );

        window.dispatchEvent(new Event('pagehide'));
        expect(onBeforeInterruption).toHaveBeenCalledOnce();
        expect(writeStoredReconnectIntent).toHaveBeenCalledWith(examId, sessionId, 'close');

        vi.clearAllMocks();
        rerender({ isNavigationCommitted: true });
        window.dispatchEvent(new Event('beforeunload'));

        expect(onBeforeInterruption).not.toHaveBeenCalled();
        expect(writeStoredReconnectIntent).not.toHaveBeenCalled();
        unmount();
    });

    it('does not redirect on online when there is no valid reconnect intent', () => {
        vi.mocked(readStoredReconnectIntent).mockReturnValue(null);

        const { unmount } = renderHook(() =>
            useExamInterruption({
                examId,
                sessionId,
                isEnabled: true,
            }),
        );

        window.dispatchEvent(new Event('online'));
        expect(mockRouterReplace).not.toHaveBeenCalled();
        unmount();
    });
});
