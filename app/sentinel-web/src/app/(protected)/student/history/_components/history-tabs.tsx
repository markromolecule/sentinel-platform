import { cn } from '@sentinel/ui';
import { type HistoryFilterStatus } from '@sentinel/shared/types';

type HistoryTabsProps = {
    activeTab: HistoryFilterStatus;
    onTabChange: (status: HistoryFilterStatus) => void;
};

const TAB_LABELS: Record<HistoryFilterStatus, string> = {
    past_due: 'Past due',
    turned_in: 'Turned in',
};

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
    return (
        <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
            {(Object.keys(TAB_LABELS) as HistoryFilterStatus[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                >
                    {TAB_LABELS[tab]}
                </button>
            ))}
        </div>
    );
}
