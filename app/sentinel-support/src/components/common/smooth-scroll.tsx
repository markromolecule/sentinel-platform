'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            allowNestedScroll: true,
        });

        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
}
