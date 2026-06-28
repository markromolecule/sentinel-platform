/**
 * Formats a date value into a localized human-readable string.
 *
 * @param value - The date string, date object, or null/undefined.
 * @returns The formatted date string or "Not available".
 */
export function formatDateTime(value?: string | Date | null): string {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return date.toLocaleString();
}

/**
 * Formats a numeric score percentage.
 *
 * @param value - The percentage value or null/undefined.
 * @returns The formatted percentage string (e.g. "95.0%") or "N/A".
 */
export function formatPercent(value?: number | null): string {
    if (typeof value !== 'number') {
        return 'N/A';
    }

    return `${value.toFixed(1)}%`;
}

/**
 * Paginates an array of items client-side.
 *
 * @param items - The full array of items.
 * @param page - The current active page (1-indexed).
 * @param pageSize - The number of items per page.
 * @returns The sliced items array and pagination metadata.
 */
export function paginateItems<T>(items: T[], page: number, pageSize: number) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
        items: items.slice(start, start + pageSize),
        pagination: {
            page: safePage,
            pageSize,
            total,
            totalPages,
            hasMore: safePage < totalPages,
        },
    };
}
