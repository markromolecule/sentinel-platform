'use client';

import { QrCode } from 'lucide-react';
import Image from 'next/image';

export default function DownloadSection() {
    return (
        <section
            id="download"
            className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0f0f10] py-24 md:py-32"
        >
            {/* Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Gradient Glow */}
                <div className="absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sentinel-primary)/15 blur-[150px]"></div>
                {/* Grid Pattern */}
                <div className="bg-size:40px_40px absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] opacity-50"></div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2">
                        <Image
                            src="/icons/icon0.svg"
                            alt="Sentinel"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                        />
                        <span className="text-base font-medium text-gray-400">
                            Available on Android Devices Only
                        </span>
                    </div>
                    {/* Headline */}
                    <h2 className="animate-slide-up mb-6 bg-linear-to-b from-gray-300 to-blue-200 bg-clip-text text-4xl leading-tight font-medium tracking-tight text-transparent md:text-5xl lg:text-6xl">
                        Download Sentinel
                    </h2>

                    {/* Description */}
                    <p
                        className="animate-slide-up mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
                        style={{ animationDelay: '0.1s' }}
                    >
                        Get started with secure exam monitoring. Scan the QR code below to download
                        the app directly to your device.
                    </p>

                    {/* QR Code Container */}
                    <div
                        className="animate-slide-up flex flex-col items-center justify-center gap-6"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="group relative rounded-3xl bg-white p-4 shadow-2xl transition-transform duration-300 hover:scale-105">
                            <div className="absolute inset-0 rounded-3xl bg-blue-500/20 opacity-50 blur-xl transition-all group-hover:blur-2xl"></div>
                            <div className="relative rounded-2xl border border-gray-100 bg-white p-4">
                                <QrCode className="h-48 w-48 text-[#0f0f10]" strokeWidth={1.5} />
                            </div>

                            {/* Scanning Animation overlay */}
                            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                                <div className="animate-scan absolute top-0 right-0 left-0 h-1 bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-gray-400">Scan to install</p>
                    </div>

                    {/* Trust Note */}
                    <p
                        className="animate-fade-in mt-10 text-sm text-gray-500"
                        style={{ animationDelay: '0.3s' }}
                    >
                        Free to download • Secure installation
                    </p>
                </div>
            </div>
        </section>
    );
}
