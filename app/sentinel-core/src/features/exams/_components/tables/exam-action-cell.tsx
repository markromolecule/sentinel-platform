'use client';

import * as React from 'react';
import { ProctorExam } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    UserPlus,
    FileText,
    ShieldAlert,
    School,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { AssignRoomDialog } from '../dialogs/assign-room-dialog';

export type ExamActionCellProps = {
    exam: ProctorExam;
};

export function ExamActionCell({ exam }: ExamActionCellProps) {
    const router = useRouter();
    const [isAssignRoomOpen, setIsAssignRoomOpen] = React.useState(false);
    const handleAssign = () => {
        router.push('/exams?view=assign');
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2 pr-4">
                {exam.status === 'active' && (
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                        <Link href={`/exams/${exam.id}/lobby`}>
                            <span className="relative mr-2 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Monitor
                        </Link>
                    </Button>
                )}
                {exam.status === 'draft' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-blue-500/50 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={handleAssign}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        {exam.status !== 'draft' && (
                            <DropdownMenuItem className="cursor-pointer" onClick={handleAssign}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign to Students
                            </DropdownMenuItem>
                        )}
                        {exam.status !== 'draft' && (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href={`/exams/${exam.id}/report`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Report
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {exam.status !== 'draft' && (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href={`/exams/logs?examId=${exam.id}`}>
                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                    Incident Logs
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {exam.examCategory === 'MAJOR' && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setIsAssignRoomOpen(true)}
                            >
                                <School className="mr-2 h-4 w-4" />
                                Assign Room
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <AssignRoomDialog
                open={isAssignRoomOpen}
                onOpenChange={setIsAssignRoomOpen}
                examId={exam.id}
                initialRoomId={exam.roomId}
            />
        </>
    );
}
