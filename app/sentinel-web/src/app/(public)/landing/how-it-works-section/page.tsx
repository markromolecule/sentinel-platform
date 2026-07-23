'use client';

import { LandingSectionShell } from '@/app/(public)/landing/_components/landing-section-shell';

export default function HowItWorksSection() {
    return (
        <LandingSectionShell
            id="how-it-works"
            tone="ink"
            transitionTo="blue"
            className="min-h-[50vh] py-24 md:py-32"
        >
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <h2 className="text-3xl font-black tracking-tight text-white">Flow</h2>
                <p className="max-w-md text-zinc-400">
                    Rebuilding from scratch. Content coming soon.
                </p>
            </div>
        </LandingSectionShell>
    );
}
