import type { Metadata } from "next";
import NextImage from "next/image";

export const metadata: Metadata = {
    title: "Administrator",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#0f0f10] relative font-sans overflow-hidden">
            {/* Left Column - Premium Branding */}
            <div className="hidden lg:flex flex-col justify-between items-start p-16 relative overflow-hidden bg-[#0f0f10]">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#323d8f] blur-[120px] opacity-40 animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#4654e9] blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#3b49df] blur-[80px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px]"></div>
                </div>

                {/* Top - Small Logo */}
                <div className="relative z-10 animate-fade-in group">
                    <div className="relative w-15 h-15 transition-all duration-500">
                        <NextImage
                            src="/icons/icon0.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Bottom - Text Content */}
                <div className="relative z-10 flex flex-col items-start text-left max-w-lg mb-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-medium text-white mb-6 animate-slide-up leading-tight tracking-tight font-sans">
                            Secure your next <br />
                            <span className="text-blue-200">Examination</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-50/70 leading-relaxed max-w-md animate-slide-up font-sans font-light" style={{ animationDelay: '0.1s' }}>
                            Ensure integrity in every assessment with our gaze tracking and audio analysis technology.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex flex-col justify-start lg:justify-center items-center w-full p-4 sm:p-12 lg:p-24 overflow-y-auto lg:h-screen">
                <div className="w-full max-w-[440px] mx-auto py-12 lg:py-0 flex flex-col items-center">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 flex justify-center w-full">
                        <div className="relative w-[min(260px,80vw)] h-[min(90px,28vw)]">
                            <NextImage
                                src="/icons/sentinel-logo.svg"
                                alt="Sentinel Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
