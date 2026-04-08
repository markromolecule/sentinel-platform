'use client';

import Image from 'next/image';
import { Fragment } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { STEPS } from '@/app/(public)/landing/how-it-works-section/_constants';

export default function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0f0f10] py-24 md:py-32"
        >
            {/* Background Grid */}
            <div className="bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"></div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                {/* Section Header */}
                <div className="mb-12 flex flex-col items-start text-left md:mb-16 md:items-center md:text-center">
                    <div className="mb-6 inline-flex items-center gap-2">
                        <Image
                            src="/icons/icon0.svg"
                            alt="Sentinel"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                        />
                        <span className="text-base font-medium text-gray-400">How it works</span>
                    </div>
                    <h2 className="max-w-3xl text-3xl leading-tight font-normal tracking-tight text-blue-100 md:text-5xl">
                        A modular flow from setup to review.
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                        Each step is short, deliberate, and easy to manage for both proctors and
                        students.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-4">
                    {STEPS.map((step, index) => (
                        <Fragment key={step.number}>
                            <div className="xl:min-w-0 xl:flex-1">
                                <StepCard {...step} />
                            </div>
                            {index !== STEPS.length - 1 ? <StepConnector /> : null}
                        </Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
    return (
        <article className="group flex h-full flex-col rounded-[28px] border border-white/8 bg-[#131315]/80 p-6 transition-colors duration-200 hover:border-white/12 hover:bg-[#151519] md:p-7">
            <div className="mb-6">
                <span className="text-sm font-medium tracking-[0.18em] text-gray-500 uppercase">
                    Step {number}
                </span>
            </div>
            <h3 className="mb-3 font-sans text-[1.35rem] font-semibold tracking-tight text-white transition-colors group-hover:text-blue-200">
                {title}
            </h3>
            <p className="text-[15px] leading-7 text-gray-400">{description}</p>
        </article>
    );
}

function StepConnector() {
    return (
        <>
            <div className="pointer-events-none flex items-center justify-center gap-3 md:hidden">
                <span className="h-px w-10 bg-white/10" />
                <ArrowDown className="h-4 w-4 text-blue-200/70" strokeWidth={1.6} />
                <span className="h-px w-10 bg-white/10" />
            </div>

            <div className="pointer-events-none hidden shrink-0 items-center justify-center xl:flex xl:w-10">
                <span className="h-px w-8 bg-white/10" />
                <ArrowRight className="h-4 w-4 text-blue-200/70" strokeWidth={1.6} />
            </div>
        </>
    );
}
