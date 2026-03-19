"use client";

import { Card, Badge } from "@sentinel/ui";
import { Video, Camera } from "lucide-react";

export function LiveFeedMonitor() {
    return (
        <Card className="p-4 border-border/50 shadow-sm bg-black/5 flex flex-col rounded-xl gap-0">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500 animate-pulse" />
                    Live Feed Monitor
                </h3>
                <Badge variant="outline" className="text-[11px] animate-pulse bg-red-50 text-red-600 border-red-200 py-0.5 h-5">
                    LIVE
                </Badge>
            </div>
            <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center border border-border/40 relative group cursor-pointer overflow-hidden shadow-inner flex-1">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="text-center z-10 transition-transform duration-500 group-hover:scale-110">
                    <Camera className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-xs text-white/60 font-medium tracking-tight">Accessing Webcam Feed...</p>
                </div>
                {/* Visual Noise Pattern for effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
        </Card>
    );
}
