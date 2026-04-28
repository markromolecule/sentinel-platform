'use client';

import { useCallback, useState } from 'react';
import type { MediaPipeAttemptIncident } from '../_types';

export type UseMediapipeIncidentStateResult = {
    /** The currently active monitoring incident, or `null` when none is active. */
    activeIncident: MediaPipeAttemptIncident | null;
    /** Set or clear the active incident. Used internally by the camera runtime. */
    setActiveIncident: (incident: MediaPipeAttemptIncident | null) => void;
    /** Clears the active incident. Exposed to the consumer. */
    dismissIncident: () => void;
};

/**
 * Manages the lifecycle of a MediaPipe monitoring incident during an exam attempt.
 *
 * Incidents are raised by the camera runtime when a signal threshold is
 * exceeded (e.g. gaze off-screen, no face detected). The consumer dismisses
 * them via `dismissIncident`.
 */
export function useMediapipeIncidentState(): UseMediapipeIncidentStateResult {
    const [activeIncident, setActiveIncident] = useState<MediaPipeAttemptIncident | null>(null);

    const dismissIncident = useCallback(() => setActiveIncident(null), []);

    return { activeIncident, setActiveIncident, dismissIncident };
}
