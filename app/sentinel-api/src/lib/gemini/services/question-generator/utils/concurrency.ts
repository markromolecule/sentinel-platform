/**
 * Runs an array of Promises with a maximum concurrency limit.
 * Works like Promise.allSettled but caps simultaneous in-flight calls.
 */
export async function runWithConcurrencyLimit<T>(
    promises: Promise<T>[],
    limit: number,
): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(promises.length);
    let nextIndex = 0;

    async function runNext(): Promise<void> {
        const index = nextIndex++;
        if (index >= promises.length) return;

        try {
            results[index] = { status: 'fulfilled', value: await promises[index] };
        } catch (reason) {
            results[index] = { status: 'rejected', reason };
        }

        await runNext();
    }

    const workers = Array.from({ length: Math.min(limit, promises.length) }, () => runNext());
    await Promise.all(workers);

    return results;
}
