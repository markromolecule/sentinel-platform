import { Check } from 'lucide-react';
import { cn } from '@sentinel/ui';

export function StepStatus({ step, activeStep }: { step: number; activeStep: number }) {
    const isComplete = step < activeStep;
    const isActive = step === activeStep;

    return (
        <span
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                isComplete && 'border-[#323d8f] bg-[#323d8f] text-white',
                isActive && 'border-[#323d8f] text-[#323d8f]',
                !isComplete && !isActive && 'border-border text-muted-foreground',
            )}
        >
            {isComplete ? <Check className="h-3.5 w-3.5" /> : step + 1}
        </span>
    );
}
