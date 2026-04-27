import { useEffect, useState } from 'react';

export function useExamTimer(examDurationMinutes?: number) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!examDurationMinutes) {
            return;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [examDurationMinutes]);

    const secondsRemaining = Math.max((examDurationMinutes ?? 0) * 60 - elapsedSeconds, 0);

    return {
        elapsedSeconds,
        setElapsedSeconds,
        secondsRemaining,
    };
}
