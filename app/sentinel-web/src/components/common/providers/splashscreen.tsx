'use client';

import Image from 'next/image';

interface SplashscreenProps {
    isVisible: boolean;
}

export function Splashscreen({ isVisible }: SplashscreenProps) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f10] transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
        >
            {/* Minimal Ambient Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Logo */}
                <div className="relative animate-fade-in">
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
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
}
