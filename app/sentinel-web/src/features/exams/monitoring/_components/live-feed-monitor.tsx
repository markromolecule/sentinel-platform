'use client';

import { Card, Badge } from '@sentinel/ui';
import { Video, Camera } from 'lucide-react';

export function LiveFeedMonitor() {
    return (
        <Card className="border-border/50 flex flex-col gap-0 rounded-xl bg-black/5 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Video className="h-4 w-4 animate-pulse text-red-500" />
                    Live Feed Monitor
                </h3>
                <Badge
                    variant="outline"
                    className="h-5 animate-pulse border-red-200 bg-red-50 py-0.5 text-[11px] text-red-600"
                >
                    LIVE
                </Badge>
            </div>
            <div className="border-border/40 group relative flex aspect-video flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-neutral-900 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="z-10 text-center transition-transform duration-500 group-hover:scale-110">
                    <Camera className="mx-auto mb-2 h-8 w-8 text-white/30" />
                    <p className="text-xs font-medium tracking-tight text-white/60">
                        Accessing Webcam Feed...
                    </p>
                </div>
                {/* Visual Noise Pattern for effect */}
                <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>
        </Card>
    );
}
