import { Card, CardContent } from '@sentinel/ui';

export function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}
