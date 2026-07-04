import { Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';

interface SummaryCardProps {
    title: string;
    value: string;
    hint: string;
}

export function SummaryCard({ title, value, hint }: SummaryCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
            </CardContent>
        </Card>
    );
}
