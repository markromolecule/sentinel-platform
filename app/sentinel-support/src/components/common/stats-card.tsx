import { Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string | number;
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="text-muted-foreground flex items-center pt-1 text-xs">
                        {trend && (
                            <span
                                className={cn(
                                    'mr-2 flex items-center',
                                    trend === 'up' && 'text-green-500',
                                    trend === 'down' && 'text-red-500',
                                    trend === 'neutral' && 'text-muted-foreground',
                                )}
                            >
                                {trend === 'up' && <ArrowUp className="mr-1 h-3 w-3" />}
                                {trend === 'down' && <ArrowDown className="mr-1 h-3 w-3" />}
                                {trend === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
                                {trendValue}
                            </span>
                        )}
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
