'use client';

/**
 * Clones the current MediaPipe-owned camera track for LiveKit publication.
 * The caller owns only the clone; the original track must remain owned by the
 * student exam media provider.
 */
export function cloneCameraTrackForLiveInspection(track: MediaStreamTrack | null) {
    if (!track || track.readyState !== 'live') {
        return null;
    }

    return track.clone();
}

/**
 * Stops only the LiveKit-owned clone during inspection cleanup.
 */
export function stopClonedInspectionTrack(track: MediaStreamTrack | null | undefined) {
    if (!track || track.readyState === 'ended') {
        return;
    }

    track.stop();
}
