import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    StudentExamAudioProvider,
    isLiveAudioStream,
    useCheckupAudio,
} from './student-exam-audio-provider';

const mockGetUserMedia = vi.fn();

vi.mock('@sentinel/shared/types', () => ({}));

function TestConsumer({ onReady }: { onReady: (api: ReturnType<typeof useCheckupAudio>) => void }) {
    const api = useCheckupAudio();

    useEffect(() => {
        onReady(api);
    }, [api, onReady]);

    return null;
}

describe('StudentExamAudioProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(global.navigator, 'mediaDevices', {
            configurable: true,
            value: {
                getUserMedia: mockGetUserMedia,
            },
        });
    });

    it('treats ended tracks as inactive audio streams', () => {
        const deadTrack = { kind: 'audio', readyState: 'ended' };
        const liveTrack = { kind: 'audio', readyState: 'live' };

        expect(isLiveAudioStream(null)).toBe(false);
        expect(isLiveAudioStream({ getTracks: () => [deadTrack] } as any)).toBe(false);
        expect(isLiveAudioStream({ getTracks: () => [liveTrack] } as any)).toBe(true);
    });

    it('re-requests audio access when the stored stream is no longer live', async () => {
        const liveTrack = {
            kind: 'audio',
            readyState: 'live',
            stop: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const endedTrack = {
            kind: 'audio',
            readyState: 'ended',
            stop: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const activeStream = {
            getTracks: () => [liveTrack],
            getAudioTracks: () => [liveTrack],
        } as any;
        const deadStream = {
            getTracks: () => [endedTrack],
            getAudioTracks: () => [endedTrack],
        } as any;

        mockGetUserMedia.mockResolvedValueOnce(activeStream);
        mockGetUserMedia.mockResolvedValueOnce(deadStream);

        let apiSnapshot: ReturnType<typeof useCheckupAudio> | null = null;

        const { rerender } = render(
            <StudentExamAudioProvider>
                <TestConsumer onReady={(api) => (apiSnapshot = api)} />
            </StudentExamAudioProvider>,
        );

        await waitFor(() => {
            expect(apiSnapshot?.requestAudioAccess).toBeDefined();
        });

        await apiSnapshot!.requestAudioAccess({
            micRequired: true,
        } as any);

        expect(mockGetUserMedia).toHaveBeenCalledTimes(1);

        apiSnapshot!.stopAudioStream();

        rerender(
            <StudentExamAudioProvider>
                <TestConsumer onReady={(api) => (apiSnapshot = api)} />
            </StudentExamAudioProvider>,
        );

        await apiSnapshot!.ensureAudioAccess({
            micRequired: true,
        } as any);

        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    });
});
