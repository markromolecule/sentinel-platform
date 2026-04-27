import { useState, useEffect, useMemo } from 'react';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { formatLobbyCountdown } from '../_utils';
import { LOBBY_TIMER_REFRESH_INTERVAL } from '../_constants';

export function useLobbyTimer(runtimeAccess?: ExamRuntimeAccess | null) {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, LOBBY_TIMER_REFRESH_INTERVAL);

        return () => window.clearInterval(timerId);
    }, []);

    const startsAt = useMemo(() => {
        return runtimeAccess?.startsAt ? new Date(runtimeAccess.startsAt) : null;
    }, [runtimeAccess]);

    const hasCountdown = useMemo(() => {
        return (
            runtimeAccess?.state === 'before_start' &&
            startsAt &&
            !Number.isNaN(startsAt.getTime()) &&
            startsAt.getTime() > currentTime
        );
    }, [currentTime, runtimeAccess, startsAt]);

    const countdownLabel = useMemo(() => {
        return hasCountdown && startsAt
            ? formatLobbyCountdown(startsAt.getTime() - currentTime)
            : null;
    }, [hasCountdown, startsAt, currentTime]);

    return {
        currentTime,
        hasCountdown,
        countdownLabel,
    };
}
