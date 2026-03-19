"use client";

import { Button } from "@sentinel/ui";
import { ChevronLeft, Camera, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

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
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Monitoring
            </Button>

            <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground mr-2 font-mono opacity-50 hidden sm:inline">
                    EXAM ID: {examId.slice(0, 8)}
                </span>
                <Button variant="outline" size="sm" className="h-9 border-border/50">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Frame
                </Button>
                <Button
                    className="h-9 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20"
                    size="sm"
                >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Force Submit
                </Button>
            </div>
        </div>
    );
}
