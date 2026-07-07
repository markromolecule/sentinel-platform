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
            <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                <h2 className="text-3xl font-black text-white tracking-tight">Flow</h2>
                <p className="text-zinc-400 max-w-md">Rebuilding from scratch. Content coming soon.</p>
            </div>
        </LandingSectionShell>
    );
}
