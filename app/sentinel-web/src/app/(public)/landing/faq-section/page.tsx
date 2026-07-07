'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LandingSectionShell } from '@/app/(public)/landing/_components/landing-section-shell';
import { cn } from '@sentinel/ui';

const FAQ_ITEMS = [
    {
        question: 'What devices are supported by Sentinel?',
        answer: 'Sentinel is a cross-platform exam security system. It supports all modern web browsers (Chrome, Firefox, Safari, Edge) for web-based exams, and offers dedicated native applications for Android and iOS devices.',
    },
    {
        question: 'How does the gaze tracking and audio detection work?',
        answer: "Sentinel uses the student's device camera and microphone to perform automated monitoring. The system checks for gaze deviations (looking away from the screen for extended periods) and flags audio anomalies (human voices or sudden noises) in real-time, notifying the proctor panel.",
    },
    {
        question: 'Does Sentinel require any complex installation for students?',
        answer: 'No, students can take exams directly in their web browser without any installation for standard web proctoring. For enhanced mobile security, students can download the lightweight Sentinel app from the Google Play Store or iOS App Store, which guides them through a simple permission check.',
    },
    {
        question: 'How is student privacy protected during monitored sessions?',
        answer: 'Privacy is our top priority. Sentinel only accesses the camera, microphone, and device state during active exam sessions. No data is recorded or transmitted before the exam starts or after it is submitted. All data is securely processed in compliance with institutional privacy standards.',
    },
    {
        question: 'Can Sentinel prevent copy-pasting and window switching?',
        answer: 'Yes. On web browsers, Sentinel monitors focus state and alerts if the student switches tabs or windows. When using our native mobile apps, Sentinel locks the screen to the exam application, preventing unauthorized multitasking, screenshots, and screen sharing.',
    },
    {
        question: 'How do proctors monitor exams in real-time?',
        answer: 'Proctors access a centralized dashboard where they can see live status indicators, flagged alerts, and real-time activity logs for all active students. This allows proctors to address integrity flags immediately or review session logs post-exam.',
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const reduceMotion = useReducedMotion();

    return (
        <LandingSectionShell
            id="faq"
            tone="dark"
            className="py-24 md:py-32"
            innerClassName="relative"
        >
            <div className="relative z-10">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-14"
                >
                    <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
                        Here&apos;s what you need to consider before taking exams.
                    </h2>
                </motion.div>

                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-white/10"
                >
                    {FAQ_ITEMS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="border-b border-white/10 py-5">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="group flex w-full items-center justify-between gap-4 text-left transition-colors duration-200"
                                >
                                    <span className="text-base font-medium text-white/80 transition-colors duration-200 group-hover:text-white md:text-lg">
                                        {faq.question}
                                    </span>
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-200 group-hover:border-white/20 group-hover:text-white">
                                        <ChevronDown
                                            className={cn(
                                                'size-4 transition-transform duration-300',
                                                isOpen && 'rotate-180',
                                            )}
                                        />
                                    </span>
                                </button>
                                <div
                                    className={cn(
                                        'grid transition-all duration-300 ease-in-out',
                                        isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                                    )}
                                >
                                    <div className="overflow-hidden">
                                        <p className="max-w-3xl pb-2 text-sm leading-7 text-white/50">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </LandingSectionShell>
    );
}
