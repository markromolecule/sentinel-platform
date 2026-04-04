"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface TrueFalsePreviewProps {
    content: {
        correctBoolean?: boolean;
    };
}

export function TrueFalsePreview({ content }: TrueFalsePreviewProps) {
    return (
        <div className="flex gap-4">
            <div className={`flex-1 flex items-center gap-2 p-3 rounded-md border ${content.correctBoolean ? "border-green-500 bg-green-50/50" : "border-border/60"}`}>
                {content.correctBoolean ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                <span className="text-sm font-medium">True</span>
            </div>
            <div className={`flex-1 flex items-center gap-2 p-3 rounded-md border ${!content.correctBoolean ? "border-green-500 bg-green-50/50" : "border-border/60"}`}>
                {!content.correctBoolean ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                <span className="text-sm font-medium">False</span>
            </div>
        </div>
    );
}
