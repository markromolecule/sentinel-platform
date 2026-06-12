import {
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@sentinel/ui';
import { MoreHorizontal, Eye, Share2, Trash2, Pencil, ShieldAlert } from 'lucide-react';
import { ExamCardProps } from '@sentinel/shared/types';
import { useRouter } from 'next/navigation';

interface ExamCardHeaderProps {
    exam: ExamCardProps['exam'];
    statusClass: string;
    onDeleteClick: () => void;
    onPreviewClick: () => void;
    onEditClick: () => void;
}

export function ExamCardHeader({
    exam,
    statusClass,
    onDeleteClick,
    onPreviewClick,
    onEditClick,
}: ExamCardHeaderProps) {
    const router = useRouter();

    const handleShare = () => {
        router.push('/exams/assign');
    };

    return (
        <CardHeader className="gap-3 pb-2">
            <div className="flex items-start justify-between gap-3">
                <Badge
                    variant="outline"
                    className={`text-[10px] tracking-wider uppercase ${statusClass}`}
                >
                    {exam.status}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground h-8 w-8"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem
                            onClick={onPreviewClick}
                            className="cursor-pointer font-medium"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Exam
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share / Assign
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onEditClick}
                            className="cursor-pointer font-medium"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                        {exam.status !== 'draft' && (
                            <DropdownMenuItem
                                onClick={() => router.push(`/exams/logs?examId=${exam.id}`)}
                                className="cursor-pointer"
                            >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Incident Logs
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onSelect={onDeleteClick}
                            className="cursor-pointer text-red-500"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Exam
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardTitle
                className="line-clamp-1 text-base font-semibold tracking-tight"
                title={exam.title}
            >
                {exam.title}
            </CardTitle>
            {exam.description && (
                <CardDescription className="line-clamp-2 text-sm break-words">
                    {exam.description}
                </CardDescription>
            )}
        </CardHeader>
    );
}
