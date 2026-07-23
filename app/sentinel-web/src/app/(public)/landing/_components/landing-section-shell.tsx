'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@sentinel/ui';
import { LiquidTransition } from './liquid-transition';

type LandingSectionShellProps = {
    id?: string;
    children: ReactNode;
    className?: string;
    innerClassName?: string;
    tone?: 'dark' | 'paper' | 'blue' | 'ink';
    transitionTo?: 'dark' | 'paper' | 'blue' | 'ink';
    background?: ReactNode;
};

const TONE_CLASSES = {
    dark: 'bg-[#080807] text-[#f6f4ee]',
    paper: 'bg-[#f4f6fb] text-[#111317]',
    blue: 'bg-[#eef3ff] text-[#111317]',
    ink: 'bg-[#162038] text-[#f6f4ee]',
};

const TONE_COLORS = {
    dark: '#080807',
    paper: '#f4f6fb',
    blue: '#eef3ff',
    ink: '#162038',
};

export function LandingSectionShell({
    id,
    children,
    className,
    innerClassName,
    tone = 'dark',
    transitionTo,
    background,
}: LandingSectionShellProps) {
    const reduceMotion = useReducedMotion();

    return (
        <section
            id={id}
            className={cn(
                'relative isolate scroll-mt-28 overflow-hidden',
                TONE_CLASSES[tone],
                className,
            )}
        >
            {background}
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 52 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    'relative z-10 mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-8',
                    innerClassName,
                )}
            >
                {children}
            </motion.div>
            {transitionTo ? (
                <LiquidTransition from={TONE_COLORS[tone]} to={TONE_COLORS[transitionTo]} />
            ) : null}
        </section>
    );
}
