'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative flex min-h-screen justify-center overflow-hidden bg-[#0f0f10] pt-20 pb-20 md:pt-48 lg:items-center lg:pt-36">
            {/* Abstract Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Static Gradient Circle 1 */}
                <div className="absolute top-0 -left-20 h-[600px] w-[600px] rounded-full bg-(--sentinel-primary)/10 mix-blend-screen blur-[120px]"></div>
                {/* Static Gradient Circle 2 */}
                <div className="absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-600/10 mix-blend-screen blur-[100px]"></div>
                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 h-[500px] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sentinel-primary)/5 opacity-30 blur-[100px]"></div>

                {/* Grid Pattern */}
                <div className="bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="mx-auto mt-8 max-w-5xl text-center md:mt-0">
                    {/* Headline */}
                    <h1 className="animate-slide-up mb-8 bg-linear-to-b from-gray-400 to-blue-200 bg-clip-text font-sans text-4xl leading-tight font-medium tracking-tight text-transparent md:text-6xl lg:text-7xl">
                        Secure your next <br className="hidden md:block" />
                        Examination
                    </h1>

                    {/* Subtext */}
                    <p
                        className="animate-slide-up mx-auto mb-16 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
                        style={{ animationDelay: '0.1s' }}
                    >
                        A mobile and web-based examination security system with gaze and audio
                        monitoring.
                        <span className="relative mx-2 inline-block font-medium text-gray-300">
                            Built for educators,
                            <svg
                                className="absolute -bottom-2 left-0 h-3 w-full text-blue-400/60"
                                viewBox="0 0 100 12"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M2,9 C20,-2 35,15 60,3 C75,-5 85,12 98,4"
                                    vectorEffect="non-scaling-stroke"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                        ensuring fair testing everywhere.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="animate-slide-up flex flex-col items-center justify-center gap-6 sm:flex-row"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <Button
                            asChild
                            size="lg"
                            variant="premium-3d"
                            className="group h-14 px-8 text-base font-semibold"
                        >
                            <Link href="#download" className="flex items-center gap-2">
                                Download Sentinel
                                <ArrowUpRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="premium-outline"
                            className="group h-14 px-8 text-base font-medium backdrop-blur-sm"
                        >
                            <Link href="#features" className="flex items-center gap-2">
                                View Features
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div
                        className="animate-fade-in mt-16 border-t border-white/5 pt-8"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <p className="text-sm font-medium text-gray-500">
                            Trusted by educational institutions • Real-time monitoring • Secure
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-[#0f0f10] to-transparent"></div>
        </section>
    );
}
