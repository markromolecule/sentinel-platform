'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface TrueFalsePreviewProps {
    content: {
        correctBoolean?: boolean;
    };
}

export function TrueFalsePreview({ content }: TrueFalsePreviewProps) {
    return (
        <div className="flex gap-4">
            <div
                className={`flex flex-1 items-center gap-2 rounded-md border p-3 ${content.correctBoolean ? 'border-green-500 bg-green-50/50' : 'border-border/60'}`}
            >
                {content.correctBoolean ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                    <XCircle className="text-muted-foreground/30 h-4 w-4" />
                )}
                <span className="text-sm font-medium">True</span>
            </div>
            <div
                className={`flex flex-1 items-center gap-2 rounded-md border p-3 ${!content.correctBoolean ? 'border-green-500 bg-green-50/50' : 'border-border/60'}`}
            >
                {!content.correctBoolean ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                    <XCircle className="text-muted-foreground/30 h-4 w-4" />
                )}
                <span className="text-sm font-medium">False</span>
            </div>
        </div>
    );
}
