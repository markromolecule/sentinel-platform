'use client';

import { useEffect } from 'react';

export function useQuestionBankImportScrollLock(args: {
    open: boolean;
    dialogContentRef: React.RefObject<HTMLDivElement | null>;
    questionsScrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
    useEffect(() => {
        if (!args.open) {
            return;
        }

        const appScrollContainer = document.querySelector<HTMLElement>(
            '[data-app-scroll-container="instructor"]',
        );
        const previousAppOverflow = appScrollContainer?.style.overflow;
        const previousAppPointerEvents = appScrollContainer?.style.pointerEvents;
        const hadAppInertAttribute = appScrollContainer?.hasAttribute('inert') ?? false;

        if (appScrollContainer) {
            appScrollContainer.style.overflow = 'hidden';
            appScrollContainer.style.pointerEvents = 'none';
            appScrollContainer.setAttribute('inert', '');
        }

        return () => {
            if (appScrollContainer) {
                appScrollContainer.style.overflow = previousAppOverflow ?? '';
                appScrollContainer.style.pointerEvents = previousAppPointerEvents ?? '';
                if (!hadAppInertAttribute) {
                    appScrollContainer.removeAttribute('inert');
                }
            }
        };
    }, [args.open]);

}

