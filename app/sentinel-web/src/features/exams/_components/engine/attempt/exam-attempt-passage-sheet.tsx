'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@sentinel/ui';

type ExamAttemptPassageSheetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    body: string;
};

export function ExamAttemptPassageSheet({
    isOpen,
    onOpenChange,
    title,
    description,
    body,
}: ExamAttemptPassageSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex h-full w-[85vw] max-w-lg flex-col p-6">
                <SheetHeader className="border-b px-0 pb-4">
                    <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
                    {description ? (
                        <SheetDescription className="mt-1 text-sm">{description}</SheetDescription>
                    ) : null}
                </SheetHeader>
                <div className="mt-4 flex-1 overflow-y-auto pr-1">
                    {body ? (
                        <div
                            data-testid="sheet-passage-body"
                            className="text-foreground [&_blockquote]:border-border/60 [&_code]:bg-muted [&_img]:border-border/60 [&_pre]:bg-muted min-w-0 text-sm leading-7 break-words sm:text-[15px] sm:leading-8 [&_a]:break-all [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:px-1.5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:object-contain [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:pl-5"
                            dangerouslySetInnerHTML={{ __html: body }}
                        />
                    ) : (
                        <div className="text-muted-foreground text-sm">
                            No passage is attached to this question.
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
