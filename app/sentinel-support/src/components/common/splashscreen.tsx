'use client';

import Image from 'next/image';

interface SplashscreenProps {
    isVisible: boolean;
}

export function Splashscreen({ isVisible }: SplashscreenProps) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f10] transition-all duration-700 ease-in-out ${
                isVisible ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
            }`}
        >
            {/* Minimal Ambient Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-500/5 blur-[100px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Logo */}
                <div className="animate-fade-in relative">
                    <Image
                        src="/icons/sentinel-logo.svg"
                        alt="Sentinel Logo"
                        width={180}
                        height={60}
                        priority
                        className="object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Sleek Minimal Loader */}
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    );
}
