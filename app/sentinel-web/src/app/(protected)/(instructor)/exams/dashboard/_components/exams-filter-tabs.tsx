'use client';

import { TabsList, TabsTrigger } from '@sentinel/ui';
import { TAB_CONFIG, type ExamTabKey } from '../_constants';

type ExamsFilterTabsProps = {
    activeTab: ExamTabKey;
    counts: Record<ExamTabKey, number>;
    onValueChange: (value: ExamTabKey) => void;
};

/**
 * Renders the compact exams dashboard tab selector.
 */
export function ExamsFilterTabs({ activeTab, counts, onValueChange }: ExamsFilterTabsProps) {
    return (
        <TabsList className="border-border/40 bg-background/70 h-9 w-full justify-start gap-1 overflow-x-auto rounded-full border p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] lg:w-auto [&::-webkit-scrollbar]:hidden">
            {TAB_CONFIG.map(({ value, label }) => (
                <TabsTrigger
                    key={value}
                    value={value}
                    onClick={() => onValueChange(value)}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground min-h-7 shrink-0 rounded-full px-3 py-1.5 text-sm font-medium shadow-none transition hover:bg-black/5 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:hover:bg-white/5"
                    data-state={activeTab === value ? 'active' : 'inactive'}
                >
                    <span>{label}</span>
                    <span className="text-muted-foreground/80 bg-background/80 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        {counts[value]}
                    </span>
                </TabsTrigger>
            ))}
        </TabsList>
    );
}
