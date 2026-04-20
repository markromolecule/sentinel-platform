import { cn } from '@sentinel/ui';
import { type HistoryFilterStatus } from '@sentinel/shared/types';

type HistoryTabsProps = {
    activeTab: HistoryFilterStatus;
    onTabChange: (status: HistoryFilterStatus) => void;
};

const TAB_LABELS: Record<HistoryFilterStatus, string> = {
    available: 'Available',
    past_due: 'Past due',
    turned_in: 'Turned in',
};

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
    return (
        <div className="inline-flex w-full flex-wrap gap-1 border border-border/60 p-1 rounded-none sm:w-auto">
            {(Object.keys(TAB_LABELS) as HistoryFilterStatus[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={cn(
                        'px-3 py-1.5 text-sm font-medium transition-colors sm:px-4',
                        activeTab === tab
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                >
                    {TAB_LABELS[tab]}
                </button>
            ))}
        </div>
    );
}
