"use client";

import { Card, Button } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@sentinel/ui";
import { StudentCardProps } from '@sentinel/shared/types';;
import { statusConfig } from '@sentinel/shared/constants';;
import { useRouter, usePathname } from "next/navigation";

export function StudentCard({ student, isSelected, onClick }: StudentCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const status = statusConfig[student.status];

    return (
        <Card
            className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md border-border/50",
                isSelected && "ring-2 ring-[#323d8f]"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] flex items-center justify-center text-white text-sm font-bold">
                        {student.firstName[0]}
                        {student.lastName[0]}
                    </div>
                    <div>
                        <p className="font-medium text-foreground">
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{student.studentNo}</p>
                    </div>
                </div>
                <Badge className={cn("text-xs", status.color)}>
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                </Badge>
            </div>

            {/* Progress */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{student.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#323d8f] rounded-full transition-all"
                        style={{ width: `${student.progress}%` }}
                    />
                </div>
            </div>

            {/* Flags Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {student.flags.length > 0 ? (
                        <>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">
                                {student.flags.length} flag{student.flags.length !== 1 ? "s" : ""}
                            </span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-emerald-600">No flags</span>
                        </>
                    )}
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] px-2 text-muted-foreground hover:text-[#323d8f]"
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
