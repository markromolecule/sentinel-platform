export function extractErrorCode(error: unknown): string | undefined {
    const visited = new Set<unknown>();
    let current: any = error;

    while (current && typeof current === 'object' && !visited.has(current)) {
        visited.add(current);

        if (typeof current.code === 'string') {
            return current.code;
        }

        if (typeof current.errorCode === 'string') {
            return current.errorCode;
        }

        current = current.cause;
    }

    return undefined;
}

