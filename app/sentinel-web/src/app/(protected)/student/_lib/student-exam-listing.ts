import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export type DateGroup<T> = {
    key: string;
    heading: string;
    subheading: string;
    items: T[];
};

function getOrdinalSuffix(day: number) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }

    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function toDateOrNull(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatGroupHeading(date: Date) {
    return `${format(date, 'MMM d')}${getOrdinalSuffix(date.getDate())}`;
}

export function formatGroupSubheading(date: Date) {
    if (isToday(date)) {
        return 'Today';
    }

    if (isTomorrow(date)) {
        return 'Tomorrow';
    }

    if (isYesterday(date)) {
        return 'Yesterday';
    }

    return format(date, 'EEEE');
}

export function formatDateTimeLabel(value?: string | Date | null) {
    const date = toDateOrNull(value);

    if (!date) {
        return 'Unavailable';
    }

    return format(date, 'MMM d, yyyy h:mm a');
}

export function groupItemsByDate<T>(args: {
    items: T[];
    getDate: (item: T) => string | Date | null | undefined;
    sortDirection?: 'asc' | 'desc';
}): DateGroup<T>[] {
    const { items, getDate, sortDirection = 'asc' } = args;
    const entries = items
        .map((item) => ({
            item,
            date: toDateOrNull(getDate(item)),
        }))
        .filter((entry): entry is { item: T; date: Date } => Boolean(entry.date));

    const sortedEntries = entries.sort((left, right) => {
        const delta = left.date.getTime() - right.date.getTime();
        return sortDirection === 'asc' ? delta : -delta;
    });

    const groups = new Map<string, DateGroup<T>>();

    for (const entry of sortedEntries) {
        const key = format(entry.date, 'yyyy-MM-dd');

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                heading: formatGroupHeading(entry.date),
                subheading: formatGroupSubheading(entry.date),
                items: [],
            });
        }

        groups.get(key)?.items.push(entry.item);
    }

    return Array.from(groups.values());
}
