import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Smartphone, Mic, Camera } from 'lucide-react';

export const metadata = {
    title: 'Setup Guide',
    description:
        'Follow the Sentinel mobile setup guide for Android and iPhone before starting your exam.',
};

const setupSteps = [
    {
        step: '01',
        title: 'Install the mobile app',
        description:
            'Download Sentinel from Google Play or the App Store on the same phone you will use for the exam session.',
    },
    {
        step: '02',
        title: 'Sign in with your exam account',
        description:
            'Open the app and use the account provided by your school so Sentinel can load the correct exam flow and permissions.',
    },
    {
        step: '03',
        title: 'Allow required permissions',
        description:
            'Grant camera and microphone access when prompted so the device check can verify your setup before the exam begins.',
    },
    {
        step: '04',
        title: 'Complete the device check',
        description:
            'Stay in frame, confirm audio access, and finish the readiness checks until the app marks your device as ready.',
    },
] as const;

const checklist = [
    {
        title: 'Stable internet connection',
        description: 'Use Wi-Fi or mobile data strong enough to keep the exam session connected.',
        icon: Smartphone,
    },
    {
        title: 'Working camera access',
        description:
            'Make sure the front camera is available and not blocked by other apps or system settings.',
        icon: Camera,
    },
    {
        title: 'Working microphone access',
        description:
            'Check that microphone permission is enabled so Sentinel can complete the required audio checks.',
        icon: Mic,
    },
    {
        title: 'Quiet exam space',
        description:
            'Prepare a well-lit place with minimal interruptions before launching your scheduled exam.',
        icon: ShieldCheck,
    },
] as const;

export default function SetupGuidePage() {
    return (
        <main className="min-h-screen bg-[#080807] text-[#f6f4ee]">
            <section className="bg-[#080807] pt-36 pb-24 md:pt-44 md:pb-28">
                <div className="mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-[46rem]">
                            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-6xl lg:text-7xl">
                                Prepare your phone before the exam starts.
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
                                This quick guide helps students install Sentinel, allow the required
                                permissions, and complete the mobile readiness check before entering
                                an assessment.
                            </p>
                        </div>

                        <Link
                            href="/download"
                            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                        >
                            <ArrowLeft className="size-4" />
                            Back to downloads
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 border-b border-white/10 pb-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70">
                            Android
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70">
                            iPhone
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70">
                            Device check
                        </div>
                    </div>

                    <div className="pt-12">
                        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                            Setup steps
                        </h2>

                        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-0">
                            {setupSteps.map((item, index) => (
                                <div
                                    key={item.step}
                                    className={[
                                        'flex flex-col justify-between',
                                        index % 2 === 0
                                            ? 'lg:pr-8'
                                            : 'lg:border-l lg:border-white/10 lg:pl-8',
                                        index > 1 ? 'lg:mt-14' : '',
                                    ].join(' ')}
                                >
                                    <div className="border-t border-white/10 pt-8">
                                        <p className="text-sm font-medium text-[var(--sentinel-primary)]">
                                            Step {item.step}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                                            {item.title}
                                        </p>
                                        <p className="mt-4 max-w-[32rem] text-sm leading-7 text-white/60">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-white/6 py-24 text-[#f6f4ee] md:py-32">
                <div className="mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-8">
                    <h2 className="mb-14 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                        Before students tap start.
                    </h2>
                    <div className="grid gap-px border border-white/6 bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
                        {checklist.map(({ title, description, icon: Icon }) => (
                            <div key={title} className="flex flex-col gap-4 bg-[#080807] p-8">
                                <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#7c9bff]">
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="mb-2 font-semibold text-white">{title}</p>
                                    <p className="text-sm leading-6 text-white/50">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-[36rem]">
                            <p className="text-lg font-semibold text-white">Need the app first?</p>
                            <p className="mt-1 text-sm leading-6 text-white/50">
                                Return to the download page to choose the correct store for your
                                device.
                            </p>
                        </div>
                        <Link
                            href="/download"
                            className="inline-flex items-center gap-2 self-start rounded-full bg-[#111317] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#1f2430]"
                        >
                            Download Sentinel
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
