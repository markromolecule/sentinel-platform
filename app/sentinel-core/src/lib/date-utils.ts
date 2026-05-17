/**
 * Formats a date for an HTML date input (YYYY-MM-DD).
 * Handles Date objects, ISO strings, and other valid date strings.
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';

    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}
