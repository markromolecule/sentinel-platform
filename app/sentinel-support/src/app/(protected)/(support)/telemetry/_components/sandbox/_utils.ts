export function formatDuration(value?: number | null) {
    if (!value) {
        return 'Immediate';
    }

    return `${Math.round(value / 1000)}s`;
}

export function formatJson(value: unknown) {
    return JSON.stringify(value, null, 2);
}
