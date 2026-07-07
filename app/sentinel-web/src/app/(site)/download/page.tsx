import Link from 'next/link';
import {
    ArrowRight,
} from 'lucide-react';

function GooglePlayIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path d="M3.2 2.8L13.9 12 3.2 21.2c-.3-.3-.5-.7-.5-1.2V4c0-.5.2-.9.5-1.2z" fill="#34A853" />
            <path d="M16.7 14.4L6.1 23.6c.5.2 1 .2 1.5-.1l12.5-7.1-3.4-2z" fill="#FBBC04" />
            <path d="M20.1 7.6L7.6.5c-.5-.3-1-.3-1.5-.1l10.6 9.2 3.4-2z" fill="#EA4335" />
            <path d="M20.1 7.6L16.7 9.6 13.9 12l2.8 2.4 3.4 2c.8-.4 1.3-1.1 1.3-2V9c0-.9-.5-1.6-1.3-2z" fill="#4285F4" />
        </svg>
    );
}

function AppStoreIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path
                d="M8.6 4.5c.6-.8 1.6-1.4 2.6-1.5.1 1-.2 2-.8 2.8-.6.8-1.5 1.4-2.5 1.3-.1-1 .2-1.9.7-2.6zm6.7 12.2c-.6 1-1.2 2-2.2 2-.9 0-1.2-.6-2.3-.6-1.1 0-1.5.6-2.3.6-1 0-1.7-.9-2.3-1.9-1.2-1.8-2-5.1-.9-7 .5-.9 1.4-1.5 2.4-1.5.9 0 1.7.6 2.3.6.6 0 1.6-.7 2.7-.6.5 0 1.8.2 2.7 1.6-.1.1-1.6.9-1.6 2.7 0 2.1 1.9 2.8 1.9 2.8-.1.3-.4.8-.8 1.3z"
                fill="currentColor"
            />
        </svg>
    );
}

export const metadata = {
    title: 'Download Sentinel — Secure Your Exam Experience',
    description:
        'Download the Sentinel mobile app for Android or iOS and start your exam with confidence. Device check, guided permissions, and real-time monitoring built in.',
};

const platformCards = [
    {
        platform: 'Android',
        icon: GooglePlayIcon,
        title: 'Download on Google Play',
        description:
            'Best for students using Android phones for secure mobile exam check-in and monitoring.',
        href: 'https://play.google.com/store',
        primaryLabel: 'Download for Android',
        secondaryLabel: 'Open Play Store',
        storeLabel: 'Google Play Store',
    },
    {
        platform: 'iOS',
        icon: AppStoreIcon,
        title: 'Download on the App Store',
        description:
            'Built for iPhone users who need guided permissions, quick setup, and monitored sessions.',
        href: 'https://apps.apple.com',
        primaryLabel: 'Download for iPhone',
        secondaryLabel: 'Open App Store',
        storeLabel: 'App Store',
    },
] as const;

const features = [
    {
        title: 'Device Readiness Check',
        description: 'Automatically verifies camera, microphone, and storage before every exam.',
    },
    {
        title: 'Live Gaze & Audio Monitoring',
        description: 'Flags focus shifts and suspicious audio patterns in real-time.',
    },
    {
        title: 'Instant Session Launch',
        description: 'Guided onboarding gets students into their exam in under 60 seconds.',
    },
    {
        title: 'Guided Permission Check',
        description: 'Walks students through camera and microphone access before they enter the exam.',
    },
];

export default function DownloadPage() {
    return (
        <main className="min-h-screen bg-[#080807] text-[#f6f4ee]">
            <section className="bg-[#080807] pt-36 pb-24 md:pt-44 md:pb-28">
                <div className="mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-[44rem]">
                            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-6xl lg:text-7xl">
                                Sentinel for Mobile.
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
                                Choose the operating system for your students. Android and iOS
                                both lead into the same Sentinel experience with guided setup,
                                device checks, and real-time monitoring.
                            </p>
                        </div>

                        <Link
                            href="/setup-guide"
                            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                        >
                            View setup guide
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 border-b border-white/10 pb-5">
                        {platformCards.map(({ storeLabel, icon: Icon }) => (
                            <div
                                key={storeLabel}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70"
                            >
                                <Icon className="size-4 shrink-0" />
                                {storeLabel}
                            </div>
                        ))}
                    </div>

                    <div className="pt-12">
                        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                            Mobile downloads
                        </h2>

                        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-0">
                            {platformCards.map(
                                (
                                    {
                                        platform,
                                        icon: Icon,
                                        title,
                                        description,
                                        href,
                                        primaryLabel,
                                        secondaryLabel,
                                        storeLabel,
                                    },
                                    index,
                                ) => (
                                    <div
                                        key={platform}
                                        className={[
                                            'flex flex-col justify-between',
                                            index === 0 ? 'lg:pr-8' : 'lg:border-l lg:border-white/10 lg:pl-8',
                                        ].join(' ')}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Icon className="size-5 shrink-0" />
                                                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                                                    {platform}
                                                </p>
                                            </div>

                                            <p className="mt-6 text-lg font-medium text-white">{title}</p>
                                            <p className="mt-2 text-sm font-medium text-[var(--sentinel-primary)]">
                                                {storeLabel}
                                            </p>
                                            <p className="mt-3 max-w-[32rem] text-sm leading-7 text-white/60">
                                                {description}
                                            </p>

                                            <div className="mt-8 flex flex-col gap-3">
                                                <Link
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#111317] px-6 text-base font-medium text-white transition-colors hover:bg-[#1f2430]"
                                                >
                                                    {primaryLabel}
                                                </Link>
                                                <Link
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-base font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                                                >
                                                    {secondaryLabel}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="mt-16 border-t border-white/10 pt-8">
                                            <p className="text-sm font-semibold text-white">
                                                Minimum requirements
                                            </p>
                                            <p className="mt-3 max-w-[32rem] text-sm leading-7 text-white/60">
                                                {platform === 'Android'
                                                    ? 'Android 10 or newer with camera, microphone, and stable internet access for monitored exam sessions.'
                                                    : 'iOS 16 or newer on iPhone with camera, microphone, and standard App Store access enabled.'}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-white/6 py-24 text-[#f6f4ee] md:py-32">
                <div className="mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-8">
                    <h2 className="mb-14 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                        What students get inside the app.
                    </h2>
                    <div className="grid gap-px border border-white/6 bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(({ title, description }) => (
                            <div key={title} className="flex flex-col gap-4 bg-[#080807] p-8">
                                <div>
                                    <p className="mb-2 font-semibold text-white">{title}</p>
                                    <p className="text-sm leading-6 text-white/50">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
