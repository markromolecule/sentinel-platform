'use client';

import { Button } from '@sentinel/ui';
import { ChevronLeft, Camera, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentDetailHeaderProps {
    examId: string;
}

export function StudentDetailHeader({ examId }: StudentDetailHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground h-9"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Monitoring
            </Button>

            <div className="flex items-center gap-2">
                <span className="text-muted-foreground mr-2 hidden font-mono text-[10px] opacity-50 sm:inline">
                    EXAM ID: {examId.slice(0, 8)}
                </span>
                <Button variant="outline" size="sm" className="border-border/50 h-9">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Frame
                </Button>
                <Button
                    className="h-9 border-none bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
                    size="sm"
                >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Force Submit
                </Button>
            </div>
        </div>
    );
}
