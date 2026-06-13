export const DEFAULT_EXAM_DURATION_MINUTES = 60;

const DATE_TIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const padDatePart = (value: number) => value.toString().padStart(2, '0');

export const formatDateTimeLocal = (date: Date) =>
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(
        date.getHours(),
    )}:${padDatePart(date.getMinutes())}`;

export const parseDateTimeLocal = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const localDateTimeMatch = DATE_TIME_LOCAL_PATTERN.exec(value);

    if (localDateTimeMatch) {
        const [, year, month, day, hour, minute] = localDateTimeMatch;
        const parsedDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            0,
            0,
        );

        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const serializeDateTimeForApi = (value?: string | null) => {
    const parsedDate = parseDateTimeLocal(value);

    return parsedDate ? parsedDate.toISOString() : '';
};

export const toDateTimeLocal = (value?: string | null) => {
    const parsedDate = parseDateTimeLocal(value);

    return parsedDate ? formatDateTimeLocal(parsedDate) : '';
};

export const getDurationMinutes = (startDateTime?: string | null, endDateTime?: string | null) => {
    const start = parseDateTimeLocal(startDateTime);
    const end = parseDateTimeLocal(endDateTime);

    if (!start || !end) {
        return null;
    }

    const differenceInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    return differenceInMinutes > 0 ? differenceInMinutes : null;
};

export const getEndDateTimeFromDuration = (
    startDateTime: string,
    durationMinutes = DEFAULT_EXAM_DURATION_MINUTES,
) => {
    const start = parseDateTimeLocal(startDateTime);

    if (!start) {
        return '';
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    return formatDateTimeLocal(end);
};

export const getSchedulePreset = (offsetDays: number, hour: number) => {
    const start = new Date();

    start.setDate(start.getDate() + offsetDays);
    start.setHours(hour, 0, 0, 0);

    return {
        startDateTime: formatDateTimeLocal(start),
        endDateTime: getEndDateTimeFromDuration(formatDateTimeLocal(start)),
    };
};

export const formatDurationLabel = (durationMinutes?: number | null) => {
    if (!durationMinutes || durationMinutes < 1) {
        return 'Pick both start and end to calculate the exam length.';
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h`;
    }

    return `${minutes}m`;
};
