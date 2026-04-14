import { Schema } from '@sentinel/shared';

/**
 * Parses incident details from a JSON string, validating against the shared schema.
 */
export function parseIncidentDetails(details: string | null) {
    if (!details) {
        return null;
    }

    try {
        const parsed = JSON.parse(details);
        return Schema.telemetryIncidentDetailsSchema.parse(parsed);
    } catch {
        return null;
    }
}

/**
 * Parses a structured value (JSON string or object) against a provided schema.
 */
export function parseStructuredValue<T>(
    value: unknown,
    schema: {
        parse: (input: unknown) => T;
    },
): T | null {
    if (value === null || value === undefined) {
        return null;
    }

    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return schema.parse(parsed);
    } catch {
        return null;
    }
}
