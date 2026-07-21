import { describe, expect, it, vi } from 'vitest';
import {
    cloneCameraTrackForLiveInspection,
    stopClonedInspectionTrack,
} from './live-inspection-room.utils';

describe('live inspection room utilities', () => {
    it('clones only a live camera track', () => {
        const clone = { readyState: 'live', stop: vi.fn() };
        const original = {
            readyState: 'live',
            clone: vi.fn(() => clone),
            stop: vi.fn(),
        } as unknown as MediaStreamTrack;

        expect(cloneCameraTrackForLiveInspection(original)).toBe(clone);
        expect(original.clone).toHaveBeenCalledTimes(1);
        expect(original.stop).not.toHaveBeenCalled();
    });

    it('returns null for an ended original track', () => {
        const original = {
            readyState: 'ended',
            clone: vi.fn(),
            stop: vi.fn(),
        } as unknown as MediaStreamTrack;

        expect(cloneCameraTrackForLiveInspection(original)).toBeNull();
        expect(original.clone).not.toHaveBeenCalled();
        expect(original.stop).not.toHaveBeenCalled();
    });

    it('stops only the cloned track during cleanup', () => {
        const original = { readyState: 'live', stop: vi.fn() };
        const clone = { readyState: 'live', stop: vi.fn() } as unknown as MediaStreamTrack;

        stopClonedInspectionTrack(clone);

        expect(clone.stop).toHaveBeenCalledTimes(1);
        expect(original.stop).not.toHaveBeenCalled();
    });
});
