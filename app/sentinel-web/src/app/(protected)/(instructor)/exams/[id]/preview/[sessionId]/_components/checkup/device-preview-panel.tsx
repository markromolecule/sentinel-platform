'use client';

import { RefObject } from 'react';
import { Button } from '@sentinel/ui';
import { Info } from 'lucide-react';

interface DevicePreviewPanelProps {
    videoRef: RefObject<HTMLVideoElement | null>;
    overlayCanvasRef?: RefObject<HTMLCanvasElement | null>;
    streamActive: boolean;
    isRequesting: boolean;
    errorMessage: string | null;
    onRequestAccess: () => void;
}

export function DevicePreviewPanel({
    videoRef,
    overlayCanvasRef,
    streamActive,
    isRequesting,
    errorMessage,
    onRequestAccess,
}: DevicePreviewPanelProps) {
    return (
        <div className="space-y-4 lg:pr-1">
            <div className="space-y-2.5">
                <h2 className="text-base font-semibold sm:text-lg">Device access</h2>
                <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-[15px]">
                    Use the button below to open the browser prompt for camera and microphone
                    access.
                </p>
            </div>

            <div className="border-border/60 relative aspect-[16/9] overflow-hidden border bg-slate-950 shadow-sm">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 p-6 text-center text-white">
                        <div>
                            <p className="text-base font-medium">Camera preview will appear here</p>
                            <p className="mt-2 text-sm text-white/75 sm:text-[15px]">
                                Allow camera and microphone access to continue.
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    onClick={onRequestAccess}
                    disabled={isRequesting}
                    className="h-10 w-full justify-center rounded-lg px-4 text-sm font-medium shadow-none sm:w-auto"
                >
                    {isRequesting
                        ? 'Requesting permissions...'
                        : streamActive
                          ? 'Retry permissions'
                          : 'Allow Camera and Microphone'}
                </Button>

                <p className="text-muted-foreground text-sm leading-6">
                    Grant access once, then continue when the required checks show ready.
                </p>
            </div>

            {errorMessage ? (
                <p className="text-destructive text-sm leading-6">{errorMessage}</p>
            ) : null}

            <div className="flex items-start gap-3 text-sm leading-6 text-blue-900 dark:text-blue-200">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
                <p className="text-blue-800/80 dark:text-blue-200/80">
                    This preview requests real browser permissions so you can verify the device flow
                    before moving forward.
                </p>
            </div>
        </div>
    );
}
