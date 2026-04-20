'use client';

import { Card, Button } from '@sentinel/ui';
import { Badge } from '@sentinel/ui';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { StudentCardProps } from '@sentinel/shared/types';
import { statusConfig } from '@sentinel/shared/constants';
import { useRouter, usePathname } from 'next/navigation';

export function StudentCard({ student, isSelected, onClick }: StudentCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const status = statusConfig[student.status];
    const incidentCount = student.incidentCount ?? student.flags?.length ?? 0;

    return (
        <Card
            className={cn(
                'border-border/50 cursor-pointer p-4 transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-[#323d8f]',
            )}
            onClick={onClick}
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] text-sm font-bold text-white">
                        {student.firstName[0]}
                        {student.lastName[0]}
                    </div>
                    <div>
                        <p className="text-foreground font-medium">
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                            {student.studentNo}
                        </p>
                    </div>
                </div>
                <Badge className={cn('text-xs', status.color)}>
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                </Badge>
            </div>

            {/* Progress */}
            <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{student.progress}%</span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                        className="h-full rounded-full bg-[#323d8f] transition-all"
                        style={{ width: `${student.progress}%` }}
                    />
                </div>
            </div>

            {/* Flags Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {incidentCount > 0 ? (
                        <>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">
                                {incidentCount} flag{incidentCount !== 1 ? 's' : ''}
                            </span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-emerald-600">No flags</span>
                        </>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 px-2 text-[10px] hover:text-[#323d8f]"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        router.push(`${pathname}/${student.id}`);
                    }}
                >
                    View Details
                </Button>
            </div>
        </Card>
    );
}
