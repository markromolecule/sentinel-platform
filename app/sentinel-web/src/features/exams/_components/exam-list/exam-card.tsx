"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import Link from "next/link";
import {
    FileText,
    Calendar,
    MoreHorizontal,
    Monitor,
    Pencil,
    Eye,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { ExamCardProps } from '@sentinel/shared/types';
import { format } from "date-fns";

export function ExamCard({ exam }: ExamCardProps) {
    const primaryAction = getPrimaryAction(exam);
    const statusClass =
        exam.status === "active" || exam.status === "published" || exam.status === "in-progress"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : exam.status === "draft"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-border text-muted-foreground";

    return (
        <Card className="shadow-none border-border/60 bg-background">
            <CardHeader className="gap-3 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusClass}`}>
                        {exam.status}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Delete Exam</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardTitle className="text-base font-semibold tracking-tight line-clamp-1" title={exam.title}>
                    {exam.title}
                </CardTitle>
                {exam.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                        {exam.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {exam.scheduledDate
                                ? format(new Date(exam.scheduledDate), "MMM d, yyyy, h:mm a")
                                : "Not set"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{exam.questionCount || 0} Questions</span>
                    </div>
                </div>
            </CardContent>

            {primaryAction && (
                <CardFooter className="flex-col items-stretch gap-3 border-t pt-4">
                    <Button asChild className="w-full" variant={primaryAction.variant}>
                        <Link href={primaryAction.href}>
                            <primaryAction.icon className="w-4 h-4" />
                            {primaryAction.label}
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

type ExamPrimaryAction = {
    label: string;
    href: string;
    icon: typeof Monitor;
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
};

function getPrimaryAction(exam: ExamCardProps["exam"]): ExamPrimaryAction | null {
    const monitorStatuses = new Set(["published", "active", "in-progress"]);

    if (monitorStatuses.has(exam.status)) {
        return {
            label: "Monitor",
            href: `/exams/${exam.id}/monitoring`,
            icon: Monitor,
        };
    }

    if (exam.status === "draft") {
        return {
            label: "Edit",
            href: `/exams/${exam.id}/builder`,
            icon: Pencil,
            variant: "outline",
        };
    }

    if (exam.status === "archived") {
        return {
            label: "View",
            href: `/exams/${exam.id}/builder`,
            icon: Eye,
            variant: "outline",
        };
    }

    return {
        label: "View",
        href: `/exams/${exam.id}/builder`,
        icon: Eye,
        variant: "outline",
    };
}
