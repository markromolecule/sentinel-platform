import type { Metadata } from 'next';
import NextImage from 'next/image';

export const metadata: Metadata = {
    title: 'Administrator',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative grid min-h-screen overflow-hidden bg-[#0f0f10] font-sans lg:grid-cols-2">
            {/* Left Column - Premium Branding */}
            <div className="relative hidden flex-col items-start justify-between overflow-hidden bg-[#0f0f10] p-16 lg:flex">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] h-[70%] w-[70%] animate-pulse rounded-full bg-[#323d8f] opacity-40 blur-[120px]"></div>
                    <div
                        className="absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-[#4654e9] opacity-30 blur-[100px]"
                        style={{ animationDelay: '2s' }}
                    ></div>
                    <div
                        className="absolute top-[20%] right-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-[#3b49df] opacity-20 blur-[80px]"
                        style={{ animationDelay: '1s' }}
                    ></div>
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px]"></div>
                </div>

                {/* Top - Small Logo */}
                <div className="animate-fade-in group relative z-10">
                    <div className="relative h-15 w-15 transition-all duration-500">
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
                <div className="relative z-10 mb-8 flex max-w-lg flex-col items-start text-left">
                    <div className="space-y-4">
                        <h1 className="animate-slide-up mb-6 font-sans text-5xl leading-tight font-medium tracking-tight text-white md:text-6xl">
                            Secure your next <br />
                            <span className="text-blue-200">Examination</span>
                        </h1>
                        <p
                            className="animate-slide-up max-w-md font-sans text-lg leading-relaxed font-light text-blue-50/70 md:text-xl"
                            style={{ animationDelay: '0.1s' }}
                        >
                            Ensure integrity in every assessment with our gaze tracking and audio
                            analysis technology.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex w-full flex-col items-center justify-start overflow-y-auto p-4 sm:p-12 lg:h-screen lg:justify-center lg:p-24">
                <div className="mx-auto flex w-full max-w-[440px] flex-col items-center py-12 lg:py-0">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex w-full justify-center lg:hidden">
                        <div className="relative h-[min(90px,28vw)] w-[min(260px,80vw)]">
                            <NextImage
                                src="/icons/sentinel-logo.svg"
                                alt="Sentinel Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
