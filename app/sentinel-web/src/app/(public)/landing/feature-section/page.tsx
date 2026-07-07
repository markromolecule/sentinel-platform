'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LandingSectionShell } from '@/app/(public)/landing/_components/landing-section-shell';
import { FEATURE_ITEMS } from './_constants';

export default function FeatureSection() {
    const reduceMotion = useReducedMotion();

    return (
        <LandingSectionShell
            id="features"
            tone="ink"
            transitionTo="paper"
            className="py-0"
            innerClassName="relative"
            background={
                <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#11182a_0%,#141c31_50%,#162038_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(70,84,233,0.08),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(97,113,255,0.06),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_42%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
                </>
            }
        >

            <div className="relative z-10 min-h-[100svh] pt-28 pb-36 md:pt-32 md:pb-48 lg:pt-36 lg:pb-56">
                <div className="flex w-full flex-col">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 mb-14 max-w-4xl"
                >
                    <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
                        Monitoring essentials, designed to stay out of the way.
                    </h2>
                </motion.div>

                <div className="relative z-10 grid gap-4 lg:grid-cols-3">
                    {FEATURE_ITEMS.map((feature, index) => (
                        <motion.article
                            key={feature.id}
                            initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.98 }}
                            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{
                                duration: 0.8,
                                delay: reduceMotion ? 0 : index * 0.1,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={reduceMotion ? undefined : { y: -6 }}
                            className="group relative flex min-h-[38rem] flex-col justify-between border border-[rgba(108,125,255,0.14)] bg-[rgba(10,14,26,0.58)] px-9 py-8 backdrop-blur-[2px]"
                        >
                            <motion.div
                                initial={reduceMotion ? false : { scaleX: 0 }}
                                whileInView={reduceMotion ? undefined : { scaleX: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{
                                    duration: 0.75,
                                    delay: reduceMotion ? 0 : 0.12 + index * 0.1,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="absolute top-0 left-0 h-[2px] w-full origin-left bg-[linear-gradient(90deg,rgba(70,84,233,0.82),rgba(70,84,233,0.24),transparent_86%)]"
                            />

                            <div>
                                <p className="mb-8 text-[0.9rem] font-medium uppercase tracking-[0.26em] text-white/28">
                                    {String(index + 1).padStart(2, '0')}
                                </p>
                                <h3 className="max-w-[12rem] text-[2.7rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
                                    {feature.title}
                                </h3>
                            </div>

                            <div className="space-y-7">
                                <p className="max-w-[17rem] text-[1rem] leading-7 text-white/68">{feature.description}</p>
                                <div className="h-px w-full bg-[linear-gradient(90deg,rgba(70,84,233,0.26),rgba(255,255,255,0.04),transparent)]" />
                                <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/48">
                                    {feature.stat}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
                </div>
            </div>
        </LandingSectionShell>
    );
}
