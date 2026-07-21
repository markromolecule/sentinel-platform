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

    it('shares one pending promise across concurrent ensureAudioAccess calls', async () => {
        const liveTrack = {
            kind: 'audio',
            readyState: 'live',
            stop: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const activeStream = {
            getTracks: () => [liveTrack],
            getAudioTracks: () => [liveTrack],
        } as any;

        mockGetUserMedia.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(activeStream), 10)),
        );

        let apiSnapshot: ReturnType<typeof useCheckupAudio> | null = null;

        render(
            <StudentExamAudioProvider>
                <TestConsumer onReady={(api) => (apiSnapshot = api)} />
            </StudentExamAudioProvider>,
        );

        await waitFor(() => {
            expect(apiSnapshot?.ensureAudioAccess).toBeDefined();
        });

        const promise1 = apiSnapshot!.ensureAudioAccess({ micRequired: true } as any);
        const promise2 = apiSnapshot!.ensureAudioAccess({ micRequired: true } as any);

        await Promise.all([promise1, promise2]);

        expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
    });

    it('evaluates isAudioReady based on micRequired and anomaly detection worker', async () => {
        let apiSnapshot: ReturnType<typeof useCheckupAudio> | null = null;

        render(
            <StudentExamAudioProvider>
                <TestConsumer onReady={(api) => (apiSnapshot = api)} />
            </StudentExamAudioProvider>,
        );

        await waitFor(() => {
            expect(apiSnapshot?.isAudioReady).toBeDefined();
        });

        // Optional mic is ready by default
        expect(apiSnapshot!.isAudioReady({ micRequired: false } as any)).toBe(true);

        // Required mic without stream is not ready
        expect(
            apiSnapshot!.isAudioReady({
                micRequired: true,
                aiRules: { audio_anomaly_detection: false },
            } as any),
        ).toBe(false);
    });
});
