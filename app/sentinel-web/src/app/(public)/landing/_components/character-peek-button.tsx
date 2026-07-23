'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@sentinel/ui';

type CharacterPeekButtonProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'dark' | 'light';
};

export function CharacterPeekButton({
    href,
    children,
    className,
    variant = 'dark',
}: CharacterPeekButtonProps) {
    const reduceMotion = useReducedMotion();

    return (
        <Link
            href={href}
            className={cn(
                'group relative inline-flex h-14 items-center overflow-visible rounded-full px-6 pr-5 text-sm font-semibold shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-0.5 md:h-16 md:px-8 md:pr-6 md:text-base',
                variant === 'dark'
                    ? 'bg-[#323d8f] text-white transition-colors hover:bg-[#2a34a4]'
                    : 'bg-[#101522] text-white',
                className,
            )}
        >
            <motion.span
                className="pointer-events-none absolute -top-16 -right-5 h-20 w-20 md:-top-[4.5rem] md:-right-7 md:h-24 md:w-24"
                initial={reduceMotion ? false : { y: 28, rotate: -8, opacity: 0 }}
                whileInView={reduceMotion ? undefined : { y: 16, rotate: -5, opacity: 1 }}
                whileHover={reduceMotion ? undefined : { y: -6, rotate: 8, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
                <Image
                    src="/images/sentinel-character.png"
                    alt=""
                    fill
                    sizes="96px"
                    className="object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.25)]"
                />
            </motion.span>
            <span className="relative z-10">{children}</span>
            <span className="relative z-10 ml-3 flex size-8 items-center justify-center rounded-full bg-white/70 text-[#111317] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-4" />
            </span>
        </Link>
    );
}
