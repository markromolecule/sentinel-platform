'use client';

import Link from 'next/link';
import { Apple, ArrowUpRight, ScanFace, Smartphone, Waves } from 'lucide-react';
import { LandingSectionShell } from '@/app/(public)/landing/_components/landing-section-shell';

const platformCards = [
    {
        platform: 'Android',
        title: 'Student app for exam day',
        description: 'Launch secure sessions, verify device readiness, and stay monitored from check-in to submit.',
        icon: Smartphone,
        accent: 'bg-[#5e8bff] text-[#071019]',
        href: '#download',
    },
    {
        platform: 'iPhone',
        title: 'iOS download for mobile proctoring',
        description: 'Give students the same monitored experience on iPhone with guided setup and cleaner onboarding.',
        icon: Apple,
        accent: 'border border-white/14 bg-white/[0.04] text-white',
        href: '#download',
    },
] as const;

export default function DownloadSection() {
    return (
        <LandingSectionShell
            id="download"
            tone="dark"
            className="py-24 md:py-32"
            innerClassName="relative"
            background={
                <div className="pointer-events-none absolute inset-x-0 top-10 h-40 bg-[radial-gradient(circle_at_top,rgba(94,139,255,0.18),transparent_58%)]" />
            }
        >

            <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.32em] text-white/60">
                        <Waves className="size-3.5 text-[#7c9bff]" />
                        Downloads
                    </div>

                    <div className="space-y-4">
                        <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                            Choose the mobile setup your students already use
                        </h2>
                        <p className="max-w-lg text-base leading-7 text-white/[0.6] md:text-lg">
                            Keep the hero’s momentum going with direct platform choices. Android and iOS both lead into
                            the same Sentinel exam experience.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 text-white/[0.74]">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                            <ScanFace className="size-4 text-[#7c9bff]" />
                            What students get
                        </div>
                        <p className="text-sm leading-6">
                            Device check, guided permissions, gaze monitoring, audio anomaly checks, and a smoother path
                            into every protected assessment.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {platformCards.map(({ platform, title, description, icon: Icon, accent, href }) => (
                        <Link
                            key={platform}
                            href={href}
                            className="group grid gap-5 rounded-[32px] border border-white/10 bg-[#0b0b0c] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
                        >
                            <div className={`flex size-14 items-center justify-center rounded-2xl ${accent}`}>
                                <Icon className="size-6" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.32em] text-white/[0.45]">{platform}</p>
                                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{title}</h3>
                                <p className="max-w-xl text-sm leading-6 text-white/[0.58]">{description}</p>
                            </div>

                            <div className="inline-flex items-center gap-2 text-sm font-medium text-white/[0.78]">
                                Download
                                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </LandingSectionShell>
    );
}
