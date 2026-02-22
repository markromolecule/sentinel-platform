"use client";

import { useState } from "react";
import { ProctorExam } from "@sentinel/shared/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { ExamAssignDialog } from "@/app/(protected)/proctor/exams/_components/exam-assign-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExamActionCellProps {
    exam: ProctorExam;
}

export function ExamActionCell({ exam }: ExamActionCellProps) {
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-end gap-2 pr-4">
                {exam.status === "active" && (
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 border-emerald-500/50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                        <Link href={`/proctor/exams/${exam.id}/monitoring`}>
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Monitor
                        </Link>
                    </Button>
                )}
                {exam.status === "draft" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-blue-500/50 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setIsAssignOpen(true)}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        {exam.status !== "draft" && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setIsAssignOpen(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Assign to Students
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ExamAssignDialog
                open={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                examTitle={exam.title}
            />
        </>
    );
}
