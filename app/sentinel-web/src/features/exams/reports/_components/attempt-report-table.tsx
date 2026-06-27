import {
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    cn,
} from '@sentinel/ui';
import { formatAnswerValue, formatCorrectAnswer } from '../attempt-report-utils';
import type { ReportCardType } from '../_hooks/use-attempt-report/_types';

export type AttemptReportTableProps = {
    reportCards: ReportCardType[];
    editable?: boolean;
    onRowClick?: (report: ReportCardType) => void;
};

/**
 * Renders a tabular list of question reports including student answers, correct answers, and scores.
 * Rows are clickable if the report is editable, triggering the onRowClick callback.
 *
 * @param props - AttemptReportTableProps
 */
export function AttemptReportTable({
    reportCards,
    editable = false,
    onRowClick,
}: AttemptReportTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="min-w-[240px]">Question</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="min-w-[160px]">Student Answer</TableHead>
                    <TableHead className="min-w-[160px]">Correct Answer</TableHead>
                    <TableHead className="w-28 text-right">Score</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reportCards.map((report, index) => {
                    const prompt = report.question?.content.prompt ?? report.prompt;
                    const truncatedPrompt =
                        prompt.length > 80 ? `${prompt.substring(0, 80).trim()}...` : prompt;

                    return (
                        <TableRow
                            key={report.questionId}
                            className={cn(
                                'align-top',
                                editable && 'hover:bg-muted/70 cursor-pointer transition-colors',
                            )}
                            onClick={() => {
                                if (editable && onRowClick) {
                                    onRowClick(report);
                                }
                            }}
                        >
                            <TableCell className="text-muted-foreground text-center font-medium">
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                <div className="text-foreground font-medium" title={prompt}>
                                    {truncatedPrompt}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {report.questionType.toLowerCase().replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="space-y-2">
                                <div className="text-sm break-words whitespace-pre-wrap text-slate-800">
                                    {formatAnswerValue(report.answer)}
                                </div>
                                {report.evaluation && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {Object.entries(report.evaluation.scores ?? {}).map(
                                            ([criterion, val]) => (
                                                <Badge
                                                    key={criterion}
                                                    variant="outline"
                                                    className="bg-slate-50 text-[10px] font-normal text-slate-600"
                                                >
                                                    {criterion}: {formatAnswerValue(val)}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm break-words whitespace-pre-wrap">
                                {formatCorrectAnswer(report.correctAnswer)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={report.isCorrect ? 'default' : 'secondary'}>
                                    {report.awardedScore ?? 0} / {report.maxScore} pts
                                </Badge>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
