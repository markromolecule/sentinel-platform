'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';

export function LandingExperience({ children }: { children: ReactNode }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 28,
        restDelta: 0.001,
    });

    return (
        <main className="relative isolate overflow-hidden bg-[#080807] text-[#f6f4ee]">
            <motion.div
                className="fixed top-0 right-0 left-0 z-[80] h-1 origin-left bg-[#323d8f]"
                style={{ scaleX }}
            />
            <div className="pointer-events-none fixed inset-0 z-[-1] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.08]" />
            <div className="pointer-events-none fixed inset-0 z-[-1] bg-[linear-gradient(110deg,rgba(255,255,255,0.04),transparent_35%,rgba(50,61,143,0.08)_75%,transparent)]" />
            {children}
        </main>
    );
}
