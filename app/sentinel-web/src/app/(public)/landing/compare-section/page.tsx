'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { LandingSectionShell } from '@/app/(public)/landing/_components/landing-section-shell';
import { FEATURES } from './_constants';

type Column = {
    readonly key: 'sentinel' | 'proctorU' | 'seb' | 'examSoft' | 'respondus';
    readonly label: string;
    readonly accent?: boolean;
};

const COLUMNS: readonly Column[] = [
    { key: 'sentinel', label: 'Sentinel', accent: true },
    { key: 'proctorU', label: 'ProctorU' },
    { key: 'seb', label: 'SEB' },
    { key: 'examSoft', label: 'ExamSoft' },
    { key: 'respondus', label: 'Respondus' },
];

function CompareCell({
    value,
    highlight = false,
}: {
    value: string | boolean;
    highlight?: boolean;
}) {
    if (typeof value === 'boolean') {
        return value ? (
            <span
                className={[
                    'inline-flex size-7 items-center justify-center rounded-full text-sm transition-transform duration-200 hover:scale-105',
                    highlight
                        ? 'bg-[rgba(70,84,233,0.12)] text-[#323d8f] shadow-[0_2px_8px_rgba(70,84,233,0.08)]'
                        : 'bg-slate-100 text-slate-500',
                ].join(' ')}
            >
                <Check className="size-3.5 stroke-[3]" />
            </span>
        ) : (
            <span className="inline-flex size-7 items-center justify-center rounded-full text-slate-300 transition-colors duration-200">
                <Minus className="size-4 stroke-[2]" />
            </span>
        );
    }

    return (
        <span
            className={[
                'text-sm font-medium transition-transform duration-200',
                highlight
                    ? 'inline-flex items-center justify-center rounded-full border border-[rgba(70,84,233,0.18)] bg-[rgba(70,84,233,0.08)] px-4 py-1.5 font-semibold text-[#323d8f] shadow-[0_2px_6px_rgba(70,84,233,0.04)]'
                    : 'text-slate-500',
            ].join(' ')}
        >
            {value}
        </span>
    );
}

export default function CompareSection() {
    const reduceMotion = useReducedMotion();

    return (
        <LandingSectionShell
            id="compare"
            tone="paper"
            transitionTo="dark"
            className="-mt-2 bg-[#f4f6fb] py-24 md:-mt-4 md:py-32"
            innerClassName="relative overflow-visible"
            background={
                <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f4f6fb_0%,#f7f9fd_42%,#eef3fa_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(70,84,233,0.04),transparent_24%),radial-gradient(circle_at_84%_82%,rgba(50,61,143,0.035),transparent_26%)]" />
                </>
            }
        >
            <div className="relative z-10 pt-20 pb-20 md:pt-28 md:pb-28 lg:pt-32 lg:pb-32">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.38 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12 max-w-[96rem]"
                >
                    <h2 className="max-w-[72rem] text-4xl font-semibold tracking-[-0.06em] text-[#111317] md:text-6xl">
                        Compare the essentials at a glance.
                    </h2>
                </motion.div>

                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden rounded-none border border-slate-200/80 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-md"
                >
                    <div className="grid grid-cols-[minmax(260px,1.35fr)_repeat(5,minmax(120px,1fr))] border-b border-slate-100/80 bg-slate-50/50">
                        <div className="px-6 py-6 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase"></div>
                        {COLUMNS.map((column) => (
                            <div
                                key={column.key}
                                className={[
                                    'px-5 py-6 text-center text-xs font-bold tracking-[0.2em] uppercase',
                                    column.accent
                                        ? 'border-x border-[rgba(70,84,233,0.12)] bg-[rgba(70,84,233,0.06)] font-extrabold text-[#323d8f]'
                                        : 'text-slate-400',
                                ].join(' ')}
                            >
                                {column.label}
                            </div>
                        ))}
                    </div>

                    {FEATURES.map((feature, index) => (
                        <div
                            key={feature.name}
                            className={[
                                'group grid grid-cols-[minmax(260px,1.35fr)_repeat(5,minmax(120px,1fr))] items-stretch transition-colors duration-200 hover:bg-slate-50/40',
                                index !== FEATURES.length - 1 ? 'border-b border-slate-100/80' : '',
                            ].join(' ')}
                        >
                            <div className="flex flex-col justify-center px-6 py-6">
                                <p className="text-[1.05rem] font-bold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900">
                                    {feature.name}
                                </p>
                                <p className="mt-1.5 max-w-md text-xs leading-5 font-normal text-slate-400 transition-colors group-hover:text-slate-500">
                                    {feature.description}
                                </p>
                            </div>

                            {COLUMNS.map((column) => (
                                <div
                                    key={column.key}
                                    className={[
                                        'flex items-center justify-center px-5 py-6 text-center text-sm transition-colors duration-200',
                                        column.accent
                                            ? 'border-x border-[rgba(70,84,233,0.06)] bg-[rgba(70,84,233,0.03)] group-hover:bg-[rgba(70,84,233,0.055)]'
                                            : '',
                                    ].join(' ')}
                                >
                                    <CompareCell
                                        value={feature[column.key]}
                                        highlight={Boolean(column.accent)}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </LandingSectionShell>
    );
}
