/**
 * Resolves a naming pattern with dynamic placeholders and optional modifiers.
 *
 * Supported placeholders:
 * - {COURSE}: Full course code (or title if specified)
 * - {COURSE:n}: First n characters of the course code
 * - {YEAR}: Full academic year (e.g. 2023)
 * - {YEAR:n}: Last n digits of the year (e.g. 23)
 * - {SECTION}: Section identifier (e.g. 1, A, 1A)
 *
 * @example
 * resolveNamingPattern('{COURSE:3}{YEAR:2}{SECTION}', { course: 'BSIT', year: '2023', section: '1' })
 * // Returns: "BSI231"
 */
export function resolveNamingPattern(
    pattern: string,
    values: {
        course?: string;
        year?: string | number;
        section?: string | number;
    },
): string {
    let resolved = pattern;

    // Resolve COURSE
    resolved = resolved.replace(/\{COURSE(?::(\d+))?\}/g, (_, length) => {
        const val = values.course || '';
        if (length) {
            return val.substring(0, parseInt(length, 10));
        }
        return val;
    });

    // Resolve YEAR
    resolved = resolved.replace(/\{YEAR(?::(\d+))?\}/g, (_, length) => {
        const val = String(values.year || '');
        if (length) {
            const l = parseInt(length, 10);
            return val.slice(-l);
        }
        return val;
    });

    // Resolve SECTION
    resolved = resolved.replace(/\{SECTION\}/g, String(values.section || ''));

    // Backward compatibility for {SEC} if used
    resolved = resolved.replace(/\{SEC\}/g, String(values.section || ''));

    return resolved;
}
