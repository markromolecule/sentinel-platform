'use client';

import { DialogDescription, DialogHeader, DialogTitle, Button } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import type { SubjectOffering } from '@sentinel/shared/types';

interface RequestOfferedSubjectBuilderDialogHeaderProps {
    mode: 'locked-offering' | 'pick-offering';
    activeOffering: SubjectOffering | null;
    onBack?: () => void;
}

export function RequestOfferedSubjectBuilderDialogHeader({
    mode,
    activeOffering,
    onBack,
}: RequestOfferedSubjectBuilderDialogHeaderProps) {
    const title = 'Request Offered Subject';
    const description =
        mode === 'locked-offering' && activeOffering
            ? `Select the department, course, year level, or section codes you want to request for ${activeOffering.subjectCode}.`
            : activeOffering
              ? `Configure your request for ${activeOffering.subjectCode}.`
              : 'Choose an offered subject to continue.';

    return (
        <DialogHeader className="mb-2">
            <div className="flex items-center gap-3">
                {mode === 'pick-offering' && activeOffering && onBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </div>
            </div>
        </DialogHeader>
    );
}
