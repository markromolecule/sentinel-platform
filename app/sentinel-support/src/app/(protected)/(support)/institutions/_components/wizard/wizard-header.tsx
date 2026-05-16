import { DialogTitle, Separator, Button } from '@sentinel/ui';
import { Save } from 'lucide-react';
import { Institution } from '@sentinel/shared/types';
import { STEPS } from './_constants';

export type WizardHeaderProps = {
    institution?: Institution;
    activeStep: number;
    lastSavedAt: string | null;
    onSaveDraft: () => void;
};

export function WizardHeader({
    institution,
    activeStep,
    lastSavedAt,
    onSaveDraft,
}: WizardHeaderProps) {
    return (
        <header className="bg-card flex h-16 shrink-0 items-center justify-between border-b pl-6 pr-14">
            <div className="flex items-center gap-4">
                <DialogTitle className="text-xl font-bold tracking-tight text-[#323d8f]">
                    {institution ? `Edit ${institution.name}` : 'Institution Setup'}
                </DialogTitle>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Step {activeStep + 1}:</span>
                    <span className="font-medium">{STEPS[activeStep]}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {lastSavedAt && (
                    <p className="text-muted-foreground mr-2 text-xs">
                        Draft saved at {lastSavedAt}
                    </p>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSaveDraft}
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Draft
                </Button>
            </div>
        </header>
    );
}
