import { ScrollArea } from '@sentinel/ui';
import { STEPS } from './_constants';
import { StepStatus } from './step-status';

export type WizardSidebarProps = {
    activeStep: number;
};

export function WizardSidebar({ activeStep }: WizardSidebarProps) {
    return (
        <aside className="flex min-h-0 w-64 shrink-0 flex-col border-r bg-slate-50/30">
            <ScrollArea className="h-full">
                <nav className="space-y-1 p-4">
                    {STEPS.map((step, index) => (
                        <div
                            key={step}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left"
                        >
                            <StepStatus step={index} activeStep={activeStep} />
                            <span
                                className={
                                    index === activeStep
                                        ? 'text-sm font-semibold text-[#323d8f]'
                                        : 'text-muted-foreground text-sm font-medium'
                                }
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </nav>
            </ScrollArea>
        </aside>
    );
}
