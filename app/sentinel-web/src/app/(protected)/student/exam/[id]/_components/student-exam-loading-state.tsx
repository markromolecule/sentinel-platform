import { Loader2 } from 'lucide-react';

export function StudentExamLoadingState() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="relative flex items-center justify-center">
                {/* Outer glowing pulsing ring */}
                <div className="absolute h-14 w-14 animate-ping rounded-full bg-primary/10 duration-1000" />
                
                {/* Inner rotating gradient arc spinner */}
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[2.5]" />
                    <div className="absolute h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-base font-semibold tracking-tight text-foreground">
                    Loading exam flow...
                </p>
                <p className="text-xs text-muted-foreground">
                    Preparing the current exam state.
                </p>
            </div>
        </div>
    );
}

