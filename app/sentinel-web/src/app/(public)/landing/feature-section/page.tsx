'use client';

import Image from 'next/image';
import {
    GazeTrackingVisual,
    AudioAnalysisVisual,
    MobileAppVisual,
} from '@/app/(public)/landing/feature-section/_components/visuals';
import { FEATURE_ITEMS } from '@/app/(public)/landing/feature-section/_constants';
import type { FEATURE } from '@/app/(public)/landing/feature-section/_constants';

// Main Component
export default function FeatureSection() {
    return (
        <section
            id="features"
            className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0f0f10] py-24 md:py-32"
        >
            <BackgroundGrid />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                <FeatureHeader />
                <FeatureGrid />
            </div>
        </section>
    );
}

// Sub Components
function FeatureHeader() {
    return (
        <div className="mb-12 flex flex-col items-start text-left md:mb-16 md:items-center md:text-center">
            <div className="mb-6 inline-flex items-center gap-2">
                <Image
                    src="/icons/icon0.svg"
                    alt="Sentinel"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                />
                <span className="text-base font-medium text-gray-400">What you&apos;ll get</span>
            </div>
            <h2 className="max-w-3xl text-3xl leading-tight font-normal tracking-tight text-blue-100 md:text-5xl">
                Monitoring essentials, designed to stay out of the way.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                Three focused tools give proctors a cleaner view of what matters during every
                session.
            </p>
        </div>
    );
}

const VISUALS: Record<string, React.ReactNode> = {
    gaze: <GazeTrackingVisual />,
    audio: <AudioAnalysisVisual />,
    mobile: <MobileAppVisual />,
};

function FeatureGrid() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {FEATURE_ITEMS.map((feature, index) => (
                <FeatureCard key={index} {...feature} visual={VISUALS[feature.id]} />
            ))}
        </div>
    );
}

interface FeatureCardProps extends Omit<FEATURE, 'id'> {
    visual: React.ReactNode;
}

function FeatureCard({ title, description, visual }: FeatureCardProps) {
    return (
        <article className="group flex h-full flex-col rounded-[30px] border border-white/8 bg-[#131315]/90 p-2.5 transition-colors duration-200 hover:border-white/12 hover:bg-[#151519]">
            <div className="relative h-64 overflow-hidden rounded-[24px] border border-white/6 bg-[#101012] md:h-72">
                <InnerGrid />
                {visual}
            </div>
            <div className="flex flex-1 flex-col px-5 py-6 md:px-6 md:py-7">
                <h3 className="mb-3 font-sans text-[1.35rem] font-semibold tracking-tight text-white transition-colors group-hover:text-blue-200">
                    {title}
                </h3>
                <p className="text-[15px] leading-7 text-gray-400">{description}</p>
            </div>
        </article>
    );
}

// --- Background Components ---
function BackgroundGrid() {
    return (
        <div className="bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"></div>
    );
}

function InnerGrid() {
    return (
        <div className="bg-size:20px_20px absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] opacity-10"></div>
    );
}
