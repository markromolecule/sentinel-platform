import { CalendarClock } from 'lucide-react';
import { HistoryCard } from './history-card';
import type { ExamHistory } from '@sentinel/shared/types';
import type { DateGroup } from '@/app/(protected)/student/_lib/student-exam-listing';

type HistoryDateGroupsProps = {
    groups: DateGroup<ExamHistory>[];
    emptyMessage: string;
};

export function HistoryDateGroups({ groups, emptyMessage }: HistoryDateGroupsProps) {
    if (groups.length === 0) {
        return (
            <div className="border-border flex flex-col items-center justify-center border border-dashed px-6 py-16 text-center">
                <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center">
                    <CalendarClock className="text-muted-foreground h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">No exams found</h3>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <section key={group.key} className="space-y-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/40 pb-2">
                        <h2 className="text-foreground text-sm font-bold tracking-wide uppercase">
                            {group.heading}
                        </h2>
                        <p className="text-muted-foreground text-[11px] font-medium italic">
                            {group.subheading}
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {group.items.map((item) => (
                            <HistoryCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

