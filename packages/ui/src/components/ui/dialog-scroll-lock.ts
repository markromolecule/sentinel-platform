'use client';

import * as React from 'react';

const APP_SCROLL_CONTAINER_SELECTOR = '[data-app-scroll-container]';
const LOCK_COUNT_KEY = 'uiDialogScrollLockCount';
const PREVIOUS_OVERFLOW_KEY = 'uiDialogScrollLockOverflow';

function lockAppScrollContainer(element: HTMLElement) {
    const currentCount = Number(element.dataset[LOCK_COUNT_KEY] ?? '0');

    if (currentCount === 0) {
        element.dataset[PREVIOUS_OVERFLOW_KEY] = element.style.overflow;
        element.style.overflow = 'hidden';
    }

    element.dataset[LOCK_COUNT_KEY] = String(currentCount + 1);
}

function unlockAppScrollContainer(element: HTMLElement) {
    const currentCount = Number(element.dataset[LOCK_COUNT_KEY] ?? '0');

    if (currentCount <= 1) {
        element.style.overflow = element.dataset[PREVIOUS_OVERFLOW_KEY] ?? '';

        delete element.dataset[LOCK_COUNT_KEY];
        delete element.dataset[PREVIOUS_OVERFLOW_KEY];
        return;
    }

    element.dataset[LOCK_COUNT_KEY] = String(currentCount - 1);
}

export function useDialogAppScrollLock() {
    React.useEffect(() => {
        const appScrollContainers = Array.from(
            document.querySelectorAll<HTMLElement>(APP_SCROLL_CONTAINER_SELECTOR),
        );
        const lockTargets = [document.documentElement, document.body, ...appScrollContainers];

        lockTargets.forEach(lockAppScrollContainer);

        return () => {
            lockTargets.forEach(unlockAppScrollContainer);
        };
    }, []);
}
