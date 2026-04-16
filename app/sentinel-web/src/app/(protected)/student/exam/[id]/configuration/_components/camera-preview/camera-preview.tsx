import { RefObject } from 'react';
import { Camera, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardFooter } from '@sentinel/ui';
import { cn } from '@sentinel/ui';

interface CameraPreviewProps {
    hasCameraPermission: boolean | null;
    videoRef: RefObject<HTMLVideoElement | null>;
}

export function CameraPreview({ hasCameraPermission, videoRef }: CameraPreviewProps) {
    return (
        <Card className="border-border/50 bg-card/50 ring-border/50 flex h-full flex-col overflow-hidden shadow-sm ring-1">
            <div className="relative min-h-[200px] flex-1 bg-black sm:min-h-[280px] lg:min-h-0">
                {hasCameraPermission === null ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin sm:h-8 sm:w-8" />
                    </div>
                ) : hasCameraPermission ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full scale-x-[-1] transform object-cover"
                    />
                ) : (
                    <div className="text-destructive flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                        <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10" />
                        <p className="text-sm">Camera access denied</p>
                    </div>
                )}

                {/* Status Overlays */}
                <div className="absolute top-2 right-2 left-2 z-10 flex items-start justify-between sm:top-3 sm:right-3 sm:left-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                        <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>Live Feed</span>
                    </div>

                    {hasCameraPermission ? (
                        <div className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-[10px] font-medium text-green-400 shadow-lg backdrop-blur-md sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                            Online
                        </div>
                    ) : hasCameraPermission === false ? (
                        <div className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-500 backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-xs">
                            Offline
                        </div>
                    ) : null}
                </div>
            </div>
            <CardFooter className="bg-muted/40 border-border/50 text-muted-foreground flex items-center justify-between gap-2 border-t px-2 py-1.5 text-[9px] sm:px-3 sm:py-2 sm:text-[10px]">
                <span>• Face visible</span>
                <span>• Good lighting</span>
                <span className="xs:inline hidden">• No other people</span>
            </CardFooter>
        </Card>
    );
}
