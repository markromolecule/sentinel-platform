'use client';

export function GazeTrackingVisual() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Abstract Eye Viz */}
            <div className="relative flex h-20 w-32 items-center justify-center overflow-hidden rounded-full border border-blue-500/20 bg-blue-500/10">
                <div className="animate-scan absolute inset-0 bg-linear-to-r from-transparent via-blue-500/10 to-transparent"></div>
                <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            </div>
            {/* Scanning Lines */}
            <div className="absolute top-1/2 left-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-lg border-x border-blue-500/10"></div>
            <div className="absolute top-8 right-12 h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
        </div>
    );
}

export function AudioAnalysisVisual() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Waveforms */}
            <div className="flex h-12 items-center gap-1">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-wave w-2 rounded-full bg-linear-to-t from-blue-500/50 to-cyan-500/50"
                        style={{
                            height: '40%',
                            animationDelay: `${i * 0.1}s`,
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsVisual() {
    return (
        <div className="relative flex h-full w-full items-center justify-center px-8">
            {/* Chart Line */}
            <div className="absolute inset-0 flex items-center px-12">
                <svg
                    className="h-24 w-full fill-none stroke-blue-500/50 stroke-2"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,40 Q25,40 35,20 T70,30 T100,5"
                        className="animate-draw-path"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                    />
                </svg>
            </div>
        </div>
    );
}

export function MobileAppVisual() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Phone Body */}
            <div className="relative flex h-40 w-24 flex-col items-center rounded-3xl border-2 border-blue-500/30 bg-[#0f0f10] p-2 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                {/* Notch */}
                <div className="mb-2 h-1 w-8 rounded-full bg-blue-500/20"></div>
                {/* Screen Content */}
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/5">
                    {/* Header Bar */}
                    <div className="mb-2 h-3 w-full bg-blue-500/10"></div>

                    {/* Scanning Line Animation */}
                    <div className="animate-scan-vertical absolute top-0 left-0 h-1 w-full bg-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>

                    {/* Mock Content */}
                    <div className="space-y-2 px-2">
                        <div className="h-2 w-3/4 rounded bg-blue-500/10"></div>
                        <div className="flex h-16 w-full items-center justify-center rounded border border-blue-500/10 bg-blue-500/5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500/30">
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></div>
                            </div>
                        </div>
                        <div className="h-2 w-1/2 rounded bg-blue-500/10"></div>
                    </div>
                </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/5 blur-2xl"></div>
        </div>
    );
}
