import { Button } from '@sentinel/ui';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export type WizardFooterProps = {
    activeStep: number;
    isLastStep: boolean;
    isPublishing: boolean;
    isEditMode: boolean;
    onBack: () => void;
    onNext: () => void;
    onPublish: () => void;
};

export function WizardFooter({
    activeStep,
    isLastStep,
    isPublishing,
    isEditMode,
    onBack,
    onNext,
    onPublish,
}: WizardFooterProps) {
    return (
        <footer className="bg-card mt-auto border-t p-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={activeStep === 0 || isPublishing}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex gap-3">
                    {isLastStep ? (
                        <Button
                            onClick={onPublish}
                            disabled={isPublishing}
                            className="min-w-[140px] gap-2 bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            <Send className="h-4 w-4" />
                            {isPublishing
                                ? 'Saving...'
                                : isEditMode
                                    ? 'Save Changes'
                                    : 'Publish Setup'}
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            className="min-w-[120px] gap-2 bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            Next Step
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </footer>
    );
}
