/**
 * Decides whether a browser signal starts a new accepted action burst.
 *
 * Boundary rule: a signal is suppressed only when it occurs strictly before the
 * configured `windowMs` has elapsed since the last accepted signal. A signal
 * exactly on the boundary is accepted as a new burst.
 *
 * @param lastAcceptedAt The timestamp of the last accepted signal in milliseconds.
 * @param candidateAt The current signal timestamp in milliseconds.
 * @param windowMs The suppression window in milliseconds.
 * @returns The acceptance result and the timestamp that should be stored next.
 */
export function evaluateActionBurst(args: {
    lastAcceptedAt: number;
    candidateAt: number;
    windowMs: number;
}): { accepted: boolean; nextAcceptedAt: number } {
    if (args.candidateAt - args.lastAcceptedAt < args.windowMs) {
        return {
            accepted: false,
            nextAcceptedAt: args.lastAcceptedAt,
        };
    }

    return {
        accepted: true,
        nextAcceptedAt: args.candidateAt,
    };
}
