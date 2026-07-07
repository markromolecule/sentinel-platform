'use client';

type LiquidTransitionProps = {
    from: string;
    to: string;
};

export function LiquidTransition({ from, to }: LiquidTransitionProps) {
    return (
        <div className="pointer-events-none absolute right-0 bottom-[-1px] left-0 z-20 h-24 overflow-hidden md:h-32">
            <svg
                viewBox="0 0 1440 160"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden="true"
            >
                <path
                    d="M0,96 C180,150 346,28 548,78 C744,126 890,168 1074,94 C1245,26 1328,58 1440,24 L1440,160 L0,160 Z"
                    fill={to}
                />
                <path
                    d="M0,120 C216,72 352,132 532,106 C732,78 806,18 1028,72 C1212,116 1328,98 1440,68"
                    fill="none"
                    stroke={from}
                    strokeOpacity="0.36"
                    strokeWidth="2"
                />
            </svg>
        </div>
    );
}
