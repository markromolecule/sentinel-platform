import { cn } from '@sentinel/ui';
import { type ExamTabsProps } from '@sentinel/shared/types';

export function ExamTabs({ activeTab, onTabChange }: ExamTabsProps) {
    return (
        <div className="bg-muted/50 flex w-fit rounded-xl p-1">
            <button
                onClick={() => onTabChange('available')}
                className={cn(
                    'rounded-lg px-8 py-2.5 text-sm font-medium transition-all duration-200',
                    activeTab === 'available'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
            >
                Available
            </button>
            <button
                onClick={() => onTabChange('history')}
                className={cn(
                    'rounded-lg px-8 py-2.5 text-sm font-medium transition-all duration-200',
                    activeTab === 'history'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
            >
                History
            </button>
        </div>
    );
}
