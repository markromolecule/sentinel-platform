import { HTTPException } from 'hono/http-exception';

const MAX_EXAM_DURATION_MINUTES = 240;

function parseDateTime(value: string | Date | null | undefined) {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export function assertExamScheduleWindow(args: {
    startDateTime?: string | Date | null;
    endDateTime?: string | Date | null;
}) {
    const startDateTime = parseDateTime(args.startDateTime);
    const endDateTime = parseDateTime(args.endDateTime);

    if (!startDateTime && !endDateTime) {
        return;
    }

    if (!startDateTime) {
        throw new HTTPException(400, {
            message: 'A valid exam start date and time is required.',
        });
    }

    if (!endDateTime) {
        throw new HTTPException(400, {
            message: 'A valid exam end date and time is required.',
        });
    }

    const durationMinutes = Math.round(
        (endDateTime.getTime() - startDateTime.getTime()) / 60000,
    );

    if (durationMinutes <= 0) {
        throw new HTTPException(400, {
            message: 'Exam end date and time must be after the start date and time.',
        });
    }

    if (durationMinutes > MAX_EXAM_DURATION_MINUTES) {
        throw new HTTPException(400, {
            message: 'Exam duration cannot exceed 240 minutes.',
        });
    }
}
