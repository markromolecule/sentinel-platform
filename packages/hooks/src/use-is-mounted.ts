'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );
}
