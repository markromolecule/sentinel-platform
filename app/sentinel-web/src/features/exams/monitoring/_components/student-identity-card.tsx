"use client";

import { StudentSession } from '@sentinel/shared/types';
import { Card, Badge, Separator } from "@sentinel/ui";
import { Activity, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@sentinel/ui";
import { statusConfig } from '@sentinel/shared/constants';

interface StudentIdentityCardProps {
    student: StudentSession;
}

export function StudentIdentityCard({ student }: StudentIdentityCardProps) {
    const status = statusConfig[student.status];

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm bg-card rounded-xl p-0 gap-0">
            <div className="h-1 bg-[#323d8f]" />
            <div className="p-5">
                <div className="flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow-sm ring-1 ring-border/20">
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-foreground truncate leading-tight">
                            {student.firstName} {student.lastName}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono opacity-70 mt-1">
                            {student.studentNo}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-70">Status</p>
                        <Badge className={cn("text-[11px] font-bold py-0.5 h-5 px-2", status.color)}>
                            <span className="truncate">{status.label}</span>
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-70">Progress</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">{student.progress}%</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#323d8f] rounded-full transition-all duration-1000"
                                    style={{ width: `${student.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-5 opacity-50" />

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Activity</span>
                        </div>
                        <span className="font-semibold text-foreground">{student.lastActivity}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Session Time</span>
                        </div>
                        <span className="font-semibold text-foreground">01:24:45</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span>Total Flags</span>
                        </div>
                        <span className={cn(
                            "font-bold text-foreground",
                            student.flags.length > 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                            {student.flags.length}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
