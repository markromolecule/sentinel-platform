import { StatsCard } from "@/components/common/stats-card";
import { SystemStat } from "@/app/(protected)/admin/_types";

interface AdminStatsCardsProps {
    stats: SystemStat[];
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <StatsCard
                    key={index}
                    title={stat.label}
                    value={stat.value}
                    description={stat.description}
                    trend={stat.trend}
                    trendValue={stat.change !== undefined ? `${Math.abs(stat.change)}%` : undefined}
                />
            ))}
        </div>
    );
}

