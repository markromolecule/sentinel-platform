'use client';

import { RefObject } from 'react';
import { Button, cn } from '@sentinel/ui';
import { Camera, Info } from 'lucide-react';

interface DevicePreviewPanelProps {
    videoRef: RefObject<HTMLVideoElement | null>;
    overlayCanvasRef?: RefObject<HTMLCanvasElement | null>;
    streamActive: boolean;
    isRequesting: boolean;
    errorMessage: string | null;
    onRequestAccess: () => void;
    className?: string;
}

export function DevicePreviewPanel({
    videoRef,
    overlayCanvasRef,
    streamActive,
    isRequesting,
    errorMessage,
    onRequestAccess,
    className,
}: DevicePreviewPanelProps) {
    return (
        <div className={cn('flex flex-col gap-6', className)}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-slate-950 shadow-md">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                />
                <canvas
                    ref={overlayCanvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                />

                {!streamActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/40 ring-1 ring-white/10 mb-4">
                            <Camera className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Camera Preview</h3>
                        <p className="mt-2 max-w-xs text-sm text-white/60 leading-6">
                            Allow camera and microphone access to verify your setup before continuing.
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col items-center gap-4">
                <Button
                    type="button"
                    onClick={onRequestAccess}
                    disabled={isRequesting}
                    className="h-12 w-full justify-center rounded-xl px-8 text-sm font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                >
                    {isRequesting
                        ? 'Requesting permissions...'
                        : streamActive
                          ? 'Reset Device Access'
                          : 'Grant Device Permissions'}
                </Button>

                {errorMessage ? (
                    <p className="text-destructive text-center text-sm font-medium animate-in fade-in slide-in-from-top-1">
                        {errorMessage}
                    </p>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                        <span>Grant access once, then verify your status below</span>
                    </div>
                )}
            </div>
        </div>
    );
}
